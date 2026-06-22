require('dotenv').config();
const { supabase } = require('./config/supabase');

async function check() {
    const { data, error } = await supabase.from('users').select('id, name, newsletter_frequency');
    console.log("Users in DB:", data);
    process.exit(0);
}
check();
