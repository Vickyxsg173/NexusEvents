const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase');
const CustomGeminiEmbeddings = require('../utils/geminiEmbeddings');
const { Document } = require('@langchain/core/documents');

// Initialize Supabase using Service Role to bypass RLS for ingestion
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini Embeddings
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

const embeddings = new CustomGeminiEmbeddings(process.env.GEMINI_API_KEY);

async function ingestEvents() {
  console.log("📥 Fetching events from main 'events' table...");
  const { data: events, error } = await client.from('events').select('*');
  
  if (error) {
    console.error("❌ Error fetching events:", error);
    process.exit(1);
  }

  if (!events || events.length === 0) {
    console.log("⚠️ No events found in database.");
    return;
  }

  console.log(`🧠 Found ${events.length} events. Formatting using Document-Per-Event strategy...`);

  // Document-Per-Event Chunking Strategy
  const documents = events.map(event => {
    // 1. Dense Content Concatenation (Only descriptive text for vector math)
    const pageContent = `
Event Title: ${event.title || 'Unknown'}
Organization: ${event.organization || 'Unknown'}
Domain: ${event.domain || 'Tech'}
Location/Mode: ${event.mode || 'Online'}
Description: ${event.description || ''}
    `.trim();

    // 2. Metadata Isolation (Structural data for retrieval hydration)
    const metadata = {
      event_id: event.id,
      mode: event.mode || 'Online',
      start_date: event.start_date,
      tags: event.tags
    };

    return new Document({ pageContent, metadata });
  });

  console.log("🚀 Vectorizing and pushing to isolated 'event_embeddings' table...");
  
  try {
    // SupabaseVectorStore handles generating the embeddings and inserting them into Postgres
    await SupabaseVectorStore.fromDocuments(
      documents,
      embeddings,
      {
        client,
        tableName: "event_embeddings",
        queryName: "match_event_embeddings",
      }
    );
    console.log("✅ Successfully ingested all events into vector store!");
  } catch (err) {
    console.error("❌ Failed to ingest events:", err);
  }
  
  process.exit(0);
}

ingestEvents();
