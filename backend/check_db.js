require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data } = await supabase.from('events').select('title, description, cover_image, source_url, event_type').limit(10);
    console.log(JSON.stringify(data, null, 2));
}

check();
