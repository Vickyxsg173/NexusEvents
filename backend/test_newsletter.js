require('dotenv').config();
const { processNewsletter } = require('./services/cronService');

// HACK: Since public.users doesn't have an email column yet,
// we will inject your Resend email globally so the test works!
// CHANGE THIS to the exact email you used to sign up for Resend:
process.env.TEST_USER_EMAIL = 'projectsusedev@gmail.com';

async function runTest() {
    console.log("🚀 Starting Newsletter Test Run...");
    console.log("Processing all frequencies to ensure we catch your account...");
    
    await processNewsletter('daily');
    await processNewsletter('weekly');
    await processNewsletter('monthly');
    await processNewsletter('yearly');
    
    console.log("✅ Test complete. Exiting...");
    process.exit(0);
}

runTest();
