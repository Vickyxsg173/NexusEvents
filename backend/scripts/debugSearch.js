const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { SupabaseVectorStore } = require('@langchain/community/vectorstores/supabase');
const CustomGeminiEmbeddings = require('../utils/geminiEmbeddings');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(supabaseUrl, supabaseKey);

const embeddings = new CustomGeminiEmbeddings(process.env.GEMINI_API_KEY);

async function testSearch() {
  try {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client,
      tableName: "event_embeddings",
      queryName: "match_event_embeddings",
    });

    console.log("Running similarity search...");
    const results = await vectorStore.similaritySearch("hackathon", 5);
    
    console.log(`Found ${results.length} results.`);
    if (results.length > 0) {
      console.log("First result metadata:", results[0].metadata);
    }
  } catch (e) {
    console.error(e);
  }
}
testSearch();
