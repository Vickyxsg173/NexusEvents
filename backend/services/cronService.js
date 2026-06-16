const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const supabase = require('../config/supabase');

const startCronJobs = () => {
    console.log("🕒 Cron Service Initialized. Background tasks are running.");

    // 1. Data Harvester: Run scrapers every 12 hours (00:00 and 12:00)
    cron.schedule('0 0,12 * * *', () => {
        console.log("🤖 [CRON] Starting Automated Data Harvester...");
        const scraperDir = path.resolve(__dirname, '../../scraper');
        
        // Execute the python script using bash to source the venv properly
        const command = `cd ${scraperDir} && source venv/bin/activate && python run_all.py`;
        
        exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[CRON ERROR] Harvester Failed: ${error.message}`);
                return;
            }
            console.log(`[CRON SUCCESS] Harvester Completed.\n${stdout}`);
        });
    });

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
