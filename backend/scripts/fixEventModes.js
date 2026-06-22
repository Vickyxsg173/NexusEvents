const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function fixDB() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseKey);

  const { data: events } = await client.from('events').select('id, description, venue, mode');
  
  console.log(`Found ${events.length} events to process.`);
  
  let offlineCount = 0;
  let onlineCount = 0;

  for (const event of events) {
    const desc = (event.description || '').toLowerCase();
    
    // Determine if it's offline based on description text
    const isOffline = desc.includes('in-person') || desc.includes('in person') || desc.includes('offline');
    const correctMode = isOffline ? 'Offline' : 'Online';
    const correctVenue = isOffline ? 'In-Person' : 'Online';

    if (isOffline) offlineCount++;
    else onlineCount++;

    await client.from('events').update({
      mode: correctMode,
      venue: correctVenue
    }).eq('id', event.id);
  }

  console.log(`Done! Marked ${offlineCount} as Offline and ${onlineCount} as Online.`);
}

fixDB();
