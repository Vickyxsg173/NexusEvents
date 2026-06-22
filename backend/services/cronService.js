const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const { supabase } = require('../config/supabase');

const { sendNewsletter } = require('./emailService');

// Helper to calculate match score exactly like the frontend
const getMatchScore = (event, interestKeywords) => {
    let score = 0;
    const title = (event.title || '').toLowerCase();
    const desc = (event.description || '').toLowerCase();
    const tags = (event.tags || []).map(t => typeof t === 'string' ? t.toLowerCase() : '');
    
    interestKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 3;
        if (tags.some(t => t.includes(keyword) || keyword.includes(t))) score += 2;
        if (desc.includes(keyword)) score += 1;
    });
    return score;
};

// Main function to process digests for a given frequency
const processNewsletter = async (frequency) => {
    console.log(`✉️ [NEWSLETTER] Starting ${frequency} newsletter processing...`);
    try {
        // 1. Get all users subscribed to this frequency
        // Ensure you have added the 'newsletter_frequency' column to public.users!
        const { data: users, error: userError } = await supabase.from('users').select('id, name, newsletter_frequency').eq('newsletter_frequency', frequency);
        
        if (userError) {
            console.error(`[NEWSLETTER ERROR] Failed to fetch users for ${frequency}:`, userError);
            return;
        }

        if (!users || users.length === 0) {
            console.log(`[NEWSLETTER] No users subscribed to ${frequency} updates.`);
            return;
        }

        // 2. Fetch all upcoming events
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(100);

        if (eventsError || !events) {
            console.error(`[NEWSLETTER ERROR] Failed to fetch events:`, eventsError);
            return;
        }

        let sentCount = 0;

        // 3. Process each user
        for (const user of users) {
            // Get user interests
            const { data: uiData } = await supabase
                .from('user_interests')
                .select('interests(name)')
                .eq('user_id', user.id);

            const userInterests = (uiData || [])
                .map(ui => ui.interests?.name)
                .filter(i => typeof i === 'string' && i.trim() !== '')
                .map(i => i.toLowerCase());

            // If userInterests is empty, they will just get generic top events.
            // 3. Score events and filter only highly relevant ones
            let scoredEvents = events.map(event => {
                const score = getMatchScore(event, userInterests);
                return { ...event, matchScore: score };
            });

            // Filter out events with 0 score ONLY IF the user actually has interests/skills set
            if (userInterests.length > 0) {
                const matchedOnly = scoredEvents.filter(e => e.matchScore > 0);
                if (matchedOnly.length > 0) {
                    scoredEvents = matchedOnly;
                }
            }
            
            scoredEvents.sort((a, b) => b.matchScore - a.matchScore);

            const recommendations = scoredEvents.slice(0, 3);

            if (recommendations.length > 0) {
                // Fetch the user's real email from Supabase internal Auth system using Admin API
                let userEmail = user.email;
                if (!userEmail) {
                    try {
                        const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
                        if (authUser && authUser.user) {
                            userEmail = authUser.user.email;
                        }
                    } catch (err) {
                        console.error(`[NEWSLETTER ERROR] Could not fetch auth email for user ${user.id}`, err.message);
                    }
                } // <--- This was the missing brace!

                if (!userEmail) {
                    console.error(`[NEWSLETTER ERROR] Could not determine email for user ${user.id}. Skipping.`);
                    continue;
                }
                
                user.email = userEmail;
                
                const success = await sendNewsletter(user, recommendations, frequency);
                if (success) sentCount++;
            }
        }

        console.log(`✅ [NEWSLETTER] Successfully sent ${sentCount} ${frequency} emails.`);

    } catch (error) {
        console.error(`[NEWSLETTER ERROR] Crash during ${frequency} processing:`, error);
    }
};

const processEventReminders = async () => {
    console.log(`✉️ [REMINDERS] Starting daily event reminders processing...`);
    try {
        // Fetch reminders that haven't been sent yet
        const { data: reminders, error } = await supabase
            .from('event_reminders')
            .select('id, reminder_days, reminder_time, custom_start_date, users!inner(id, name), events!inner(*)')
            .eq('reminder_sent', false);

        if (error) {
            console.error(`[REMINDERS ERROR] Failed to fetch reminders:`, error);
            return;
        }

        if (!reminders || reminders.length === 0) {
            console.log(`[REMINDERS] No pending reminders.`);
            return;
        }

        let sentCount = 0;
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        // Convert current time to a numeric value for easy comparison (e.g. 14:30 = 14.5)
        const currentTimeVal = currentHours + (currentMinutes / 60);

        for (const reminder of reminders) {
            const dateToUse = reminder.custom_start_date || reminder.events?.start_date;
            if (!dateToUse || !reminder.users) continue;
            
            const eventDate = new Date(dateToUse);
            const timeDiff = eventDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysLeft <= reminder.reminder_days && daysLeft > 0) {
                // If it is the correct day, check the time
                const rTime = reminder.reminder_time || '08:00:00';
                const [rHours, rMins] = rTime.split(':').map(Number);
                const reminderTimeVal = rHours + (rMins / 60);

                if (currentTimeVal >= reminderTimeVal) {
                    // Send email
                const { sendEventReminderEmail } = require('./emailService');
                
                let userEmail = reminder.users.email || process.env.TEST_USER_EMAIL;
                if (!userEmail) {
                    try {
                        const { data: authUser } = await supabase.auth.admin.getUserById(reminder.users.id);
                        if (authUser && authUser.user) {
                            userEmail = authUser.user.email;
                        }
                    } catch (e) {}
                }

                if (!userEmail) continue;

                const success = await sendEventReminderEmail(userEmail, reminder.events, daysLeft);
                
                if (success) {
                    await supabase.from('event_reminders').update({ reminder_sent: true }).eq('id', reminder.id);
                    sentCount++;
                }
                }
            }
        }
        
        console.log(`✅ [REMINDERS] Successfully sent ${sentCount} reminders.`);
    } catch (err) {
        console.error(`[REMINDERS ERROR] Fatal error processing reminders:`, err);
    }
};

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

    // 3. Newsletters
    // Daily digest at 9:00 AM
    cron.schedule('0 9 * * *', () => processNewsletter('daily'));
    
    // Weekly digest every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', () => processNewsletter('weekly'));

    // Monthly digest on the 1st of every month at 9:00 AM
    cron.schedule('0 9 1 * *', () => processNewsletter('monthly'));

    // Event Reminders every 15 minutes
    cron.schedule('*/15 * * * *', processEventReminders);
};

module.exports = { startCronJobs, processNewsletter, processEventReminders };
