const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase');
const CustomGeminiEmbeddings = require('../utils/geminiEmbeddings');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const client = createClient(supabaseUrl, supabaseKey);

    const apiKey = process.env.GEMINI_API_KEY;
    const embeddings = new CustomGeminiEmbeddings(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);

    const queryAnalyzerModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const query = "I want a hackathon that is NOT online";
    console.log(`[Chatbot] Received Raw Query: "${query}"`);

    const prompt = `
      You are an AI query analyzer for a tech event aggregator (hackathons, conferences, meetups).
      A user is searching for events. Analyze their natural language query and extract any strict constraints as metadata filters.
      
      Available metadata fields for filtering:
      - mode: Can only be exactly "Online" or "In-Person". 
        (Rule: If they say "NOT online", mode must be "In-Person". If they say "remote", mode is "Online".)
      
      Return a JSON object with:
      - "semantic_query": The core meaning of their search without the strict constraints (e.g. "artificial intelligence hackathon").
      - "metadata_filters": A JSON object containing strict matches. If no strict constraints are found, return {}.
      
      User Query: "${query}"
    `;

    const llmResult = await queryAnalyzerModel.generateContent(prompt);
    let analysis = JSON.parse(llmResult.response.text());

    const semanticQuery = analysis.semantic_query || query;
    const filter = analysis.metadata_filters || {};

    console.log(`[Chatbot] Semantic Query: "${semanticQuery}"`);
    console.log(`[Chatbot] Extracted Filters:`, filter);

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client,
      tableName: "event_embeddings",
      queryName: "match_event_embeddings",
    });

    const rawResults = await vectorStore.similaritySearchWithScore(semanticQuery, 5, filter);
    console.log("Raw results:", rawResults.length);
    if(rawResults.length > 0) {
        console.log("First match score:", rawResults[0][1], "metadata:", rawResults[0][0].metadata);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
