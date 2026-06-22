const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const CustomGeminiEmbeddings = require('../utils/geminiEmbeddings');

const embeddings = new CustomGeminiEmbeddings(process.env.GEMINI_API_KEY);

async function run() {
  try {
    console.log("Generating embedding for a test string...");
    const res = await embeddings.embedDocuments(["Test event description"]);
    console.log("Embedding result:", res.length > 0 ? `Array of length ${res.length}, first embedding has ${res[0].length} dimensions` : res);
  } catch(e) {
    console.error("Error generating embeddings:", e);
  }
}
run();
