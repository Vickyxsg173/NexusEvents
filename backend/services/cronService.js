const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const supabase = require('../config/supabase');

const startCronJobs = () => {
    console.log("🕒 Cron Service Initialized. Background tasks are running.");

    // Note: The Data Harvester (Scrapers) has been moved to GitHub Actions to run on a free isolated container.
    // It will ping the /api/events endpoint every 12 hours.

    // 2. Database Janitor: Cleanup events older than 10 days, every night at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        console.log("🧹 [CRON] Starting Database Janitor Cleanup...");
        try {
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
            const cutoffISO = tenDaysAgo.toISOString();

            // Supabase delete where:
            // end_date is older than 10 days OR (end_date is null AND start_date is older than 10 days)
            const { error } = await supabase
                .from('events')
                .delete()
                .or(`end_date.lt.${cutoffISO},and(end_date.is.null,start_date.lt.${cutoffISO})`);
                
            if (error) throw error;
            
            console.log(`[CRON SUCCESS] Janitor successfully cleaned up expired events older than 10 days.`);
        } catch (error) {
            console.error(`[CRON ERROR] Janitor Cleanup Failed:`, error);
        }
    });
};

module.exports = startCronJobs;
