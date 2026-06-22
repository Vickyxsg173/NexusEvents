require('dotenv').config();
const { processEventReminders } = require('./services/cronService');

async function runTest() {
    console.log("🚀 Starting Event Reminder Test Run...");
    await processEventReminders();
    console.log("✅ Test complete. Exiting...");
    process.exit(0);
}

runTest();
