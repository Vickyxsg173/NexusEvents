const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  if (data.models) {
    const embedModels = data.models.filter(m => m.name.includes('embed'));
    console.log("Available embedding models:", embedModels.map(m => m.name));
  } else {
    console.log("Error or no models:", data);
  }
}
listModels();
