import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
let envContent = fs.readFileSync('.env', 'utf8');
if (envContent.charCodeAt(0) === 0xFEFF) envContent = envContent.substring(1);

const env = Object.fromEntries(
  envContent.split(/\r?\n/)
    .map(l => l.split('='))
    .filter(p => p.length === 2)
    .map(p => [p[0].trim(), p[1].replace(/"/g, '').trim()])
);

console.log('URL:', env.VITE_SUPABASE_URL);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testLogin() {
  console.log('Testing login...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@phucvinhsolar.vn',
    password: 'PVSolar@2026'
  });
  
  if (error) {
    console.log('Login Failed:', error.message, error.status);
  } else {
    console.log('Login Success! User ID:', data.user.id);
  }
}

testLogin();
