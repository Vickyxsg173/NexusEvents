import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly since dotenv defaults to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultInterests = [
  'AI/ML', 'Data Science', 'Web Development', 'Mobile Development',
  'Cybersecurity', 'Cloud', 'DevOps', 'Blockchain', 'Open Source',
  'Competitive Programming', 'Robotics', 'Startup', 'Research'
].map(name => ({ name, category: 'General' }));

async function seed() {
  console.log("Seeding default interests...");
  // Use upsert to avoid duplicate errors if run multiple times
  const { data, error } = await supabase
    .from('interests')
    .upsert(defaultInterests, { onConflict: 'name' })
    .select();

  if (error) {
    console.error("Error seeding interests:", error);
  } else {
    console.log(`Successfully seeded ${data.length} interests!`);
  }
}

seed();
