const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createClient(supabaseUrl, supabaseKey);

  const { data } = await client.from('events').select('mode');
  const counts = data.reduce((acc, row) => {
    acc[row.mode] = (acc[row.mode] || 0) + 1;
    return acc;
  }, {});
  console.log("Event modes in database:", counts);
}
check();
