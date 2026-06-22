require('dotenv').config();
const { supabase } = require('./config/supabase');
async function run() {
  const { data, error } = await supabase.from('saved_events').select('*').limit(1);
  console.log("saved_events sample:", data);
}
run();
