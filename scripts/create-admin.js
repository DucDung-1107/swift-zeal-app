import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.join(process.cwd(), '.env');
let envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.charCodeAt(0) === 0xFEFF) {
  envContent = envContent.substring(1);
}

const envParams = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    envParams[key] = val;
  }
});

const supabaseUrl = envParams['VITE_SUPABASE_URL'];
const supabaseKey = envParams['VITE_SUPABASE_ANON_KEY'] || envParams['VITE_SUPABASE_PUBLISHABLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Could not parse Supabase URL or Key from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpAdmin() {
  console.log(`Connecting to: ${supabaseUrl}`);
  console.log('Signing up admin...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@phucvinhsolar.vn',
    password: 'PVSolar@2026',
    options: {
      data: {
        full_name: 'Super Admin'
      }
    }
  });

  if (error) {
    console.error('Sign up error:', error.message);
  } else {
    console.log('Success! User ID:', data.user?.id);
  }
}

signUpAdmin();
