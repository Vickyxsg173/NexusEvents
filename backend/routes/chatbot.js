const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase');
const CustomGeminiEmbeddings = require('../utils/geminiEmbeddings');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini Embeddings & Text Generation Models
const apiKey = process.env.GEMINI_API_KEY;
const embeddings = new CustomGeminiEmbeddings(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

// We use gemini-2.5-flash for extremely fast query analysis, and force JSON output
const queryAnalyzerModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

router.post('/search', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    console.log(`[Chatbot] Received Raw Query: "${query}"`);

    // ==========================================
    // STEP 1: AGENTIC LLM QUERY ANALYSIS
    // ==========================================
    const prompt = `
      You are an AI query analyzer for a tech event aggregator (hackathons, conferences, meetups).
      A user is searching for events. Analyze their natural language query and extract any strict constraints as metadata filters.
      
      Available metadata fields for filtering:
      - mode: Can only be exactly "Online" or "Offline". 
        (Rule: If they ask for events that are NOT online, or specifically "Offline" or "In-Person", set mode to "Offline".)
      - organizer: Can only be an exact match for one of these organizers: "Alibaba Cloud", "UiPath", "Major League Hacking (MLH)", "arm", "Amazon", "XPRIZE", "Y Combinator", "Salesforce", "Unstop", "Microsoft Reactor", "HackerEarth", "Devfolio", "reddit", "GitHub Internships (Simplify)", "Google Developer Groups (GDG)", "GitLab", "GitHub Internships", "AWS Events", "GenAI Fund", "CNCF", "Meetup".
      
      Return a JSON object with:
      - "semantic_query": The core meaning of their search without the strict constraints (e.g. "artificial intelligence hackathon").
      - "metadata_filters": A JSON object containing strict matches. If no strict constraints are found, return {}.
      
      User Query: "${query}"
    `;

    const llmResult = await queryAnalyzerModel.generateContent(prompt);
    let analysis;
    try {
      analysis = JSON.parse(llmResult.response.text());
    } catch (e) {
      console.warn("[Chatbot] LLM did not return valid JSON, falling back to raw query.");
      analysis = { semantic_query: query, metadata_filters: {} };
    }

    const semanticQuery = analysis.semantic_query || query;
    const filter = analysis.metadata_filters || {};

    console.log(`[Chatbot] Agentic Analysis Complete.`);
    console.log(`[Chatbot] Semantic Query: "${semanticQuery}"`);
    console.log(`[Chatbot] Extracted Filters:`, filter);

    // ==========================================
    // STEP 2: HYBRID VECTOR SEARCH
    // ==========================================
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client,
      tableName: "event_embeddings",
      queryName: "match_event_embeddings",
    });

    // similaritySearchWithScore returns an array of [Document, score]
    // The filter is passed directly to the Supabase RPC "where metadata @> filter"
    const rawResults = await vectorStore.similaritySearchWithScore(semanticQuery, 5, filter);
    
    if (rawResults.length === 0) {
      return res.json({ events: [] });
    }

    // Extract IDs and scores
    const eventDataList = rawResults.map(([doc, score]) => ({
      event_id: doc.metadata.event_id,
      score: score
    }));

    const eventIds = eventDataList.map(e => e.event_id);
    console.log(`[Chatbot] Found top matches: ${eventIds.join(', ')}. Hydrating...`);

    // ==========================================
    // STEP 3: HYDRATION & SCORING
    // ==========================================
    const { data: hydratedEvents, error } = await client
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (error) throw error;

    // Sort to maintain vector exact order and attach the raw Similarity Score
    const sortedEvents = eventDataList.map(item => {
      const e = hydratedEvents.find(ev => ev.id === item.event_id);
      if (e) {
        // Convert score to a percentage (0.0 - 1.0) -> (0 - 100%)
        e._matchScore = Math.round(item.score * 100);
        return e;
      }
      return null;
    }).filter(Boolean);

    res.json({ events: sortedEvents });

  } catch (error) {
    console.error('[Chatbot Error]:', error);
    res.status(500).json({ error: 'Failed to search events via Agentic RAG pipeline' });
  }
});

module.exports = router;
