require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function wipe() {
    console.log("Wiping existing events to allow fresh re-scrape with images...");
    // Fetch all IDs
    const { data } = await supabase.from('events').select('id');
    if (data && data.length > 0) {
        const ids = data.map(d => d.id);
        // Delete in batches of 100
        for (let i = 0; i < ids.length; i += 100) {
            const batch = ids.slice(i, i + 100);
            await supabase.from('events').delete().in('id', batch);
        }
        console.log(`Wiped ${ids.length} old events without images.`);
    } else {
        console.log("No events to wipe.");
    }
}

wipe();
