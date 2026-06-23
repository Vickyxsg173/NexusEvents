require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmbeddings() {
  console.log("Fetching events to update embeddings metadata...");
  
  // Get all events
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, source_platform, mode, organizer');

  if (eventError) {
    console.error("Error fetching events:", eventError);
    return;
  }
  
  console.log(`Found ${events.length} events. Updating embeddings...`);
  
  // We'll update the metadata in event_embeddings for each
  let updatedCount = 0;
  for (const event of events) {
    // Get current embedding metadata
    const { data: embeddings, error: embedError } = await supabase
      .from('event_embeddings')
      .select('id, metadata')
      .eq('metadata->>event_id', event.id);

    if (embedError) {
      console.error(`Error fetching embedding for event ${event.id}:`, embedError);
      continue;
    }
    
    if (embeddings && embeddings.length > 0) {
      for (const embed of embeddings) {
        // Only update if organizer or source_platform is missing or different
        const currentMeta = embed.metadata || {};
        if (currentMeta.source_platform !== event.source_platform || currentMeta.organizer !== event.organizer) {
          const newMeta = {
            ...currentMeta,
            source_platform: event.source_platform || 'Unknown',
            organizer: event.organizer || 'Unknown',
            mode: event.mode || 'Online'
          };
          
          const { error: updateError } = await supabase
            .from('event_embeddings')
            .update({ metadata: newMeta })
            .eq('id', embed.id);
            
          if (updateError) {
            console.error(`Failed to update embedding ${embed.id}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCount} embedding metadatas!`);
}

fixEmbeddings();
