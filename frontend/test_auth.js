import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Sign Up...');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test User',
      }
    }
  });

  if (signUpError) {
    console.error('Sign Up Error:', signUpError.message);
    return;
  }
  
  console.log('Sign Up Success! User ID:', signUpData.user?.id);

  console.log('Testing Sign In immediately...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('Sign In Error:', signInError.message);
    return;
  }

  console.log('Sign In Success! Session:', signInData.session?.access_token ? 'Exists' : 'None');
}

testAuth();
