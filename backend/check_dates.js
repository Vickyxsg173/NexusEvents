require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: events, error } = await supabase.from('events').select('id, title, start_date').order('created_at', { ascending: false });
    
    if (error) {
        console.error("DB Error:", error);
        return;
    }

    if (!events || events.length === 0) {
        console.log("No events found in DB.");
        return;
    }

    console.log(`Total events in DB: ${events.length}`);
    console.log("Sample of 20 most recently scraped events:");
    for (let i = 0; i < Math.min(20, events.length); i++) {
        console.log(` - ${events[i].start_date} | ${events[i].title}`);
    }

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    const valid_count = events.filter(e => {
        if (!e.start_date) return true;
        const d = new Date(e.start_date);
        return d >= tenDaysAgo;
    }).length;
    
    console.log(`\nEvents passing strict 10-day filter: ${valid_count} / ${events.length}`);
}

check();
