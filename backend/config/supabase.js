const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Note: In production for admin tasks, you should use a SUPABASE_SERVICE_ROLE_KEY
// We use ANON_KEY for basic operations or development
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in backend environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
