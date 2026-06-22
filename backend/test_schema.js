require('dotenv').config();
const { supabase } = require('./config/supabase');

async function checkSchema() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("No data in users table to infer schema, fetching without data isn't directly possible via postgrest. Trying to insert a test record and rollback.");
        }
    }
    process.exit(0);
}
checkSchema();
