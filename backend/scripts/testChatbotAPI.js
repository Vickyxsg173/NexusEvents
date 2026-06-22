
async function testSearch(query) {
  console.log(`\n============================`);
  console.log(`🔍 Testing: "${query}"`);
  
  const res = await fetch('http://localhost:5000/api/chatbot/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const data = await res.json();
  if (data.error) {
    console.log(`⚠️ API Error:`, data.error);
    return;
  }
  if (data.events && data.events.length > 0) {
    console.log(`✅ Found ${data.events.length} results:`);
    data.events.forEach((e, i) => {
      console.log(`  ${i+1}. [${e._matchScore}% Match] ${e.title} (Mode: ${e.mode})`);
    });
  } else {
    console.log(`❌ No events found.`);
  }
}

async function run() {
  await testSearch("I want a hackathon that is NOT online");
  await testSearch("Blockchain for agriculture");
  await testSearch("Machine learning conference");
}

run();
