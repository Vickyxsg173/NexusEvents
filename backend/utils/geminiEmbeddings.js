const { Embeddings } = require('@langchain/core/embeddings');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class CustomGeminiEmbeddings extends Embeddings {
  constructor(apiKey) {
    super({});
    if (!apiKey) {
      throw new Error("API Key is required for Gemini Embeddings");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-embedding-2 which is available for this API key and returns 768 dimensions
    this.model = this.genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  }

  async embedDocuments(texts) {
    const embeddings = [];
    // Process sequentially to respect rate limits
    for (const text of texts) {
      const result = await this.model.embedContent(text);
      embeddings.push(result.embedding.values);
    }
    return embeddings;
  }

  async embedQuery(text) {
    const result = await this.model.embedContent(text);
    return result.embedding.values;
  }
}

module.exports = CustomGeminiEmbeddings;
