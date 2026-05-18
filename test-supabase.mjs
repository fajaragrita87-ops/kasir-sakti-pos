import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdbcnspoygwowsytqrlf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYmNuc3BveWd3b3dzeXRxcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTQxMDgsImV4cCI6MjA5MzU3MDEwOH0.DIVe_tp1Ao1uY0f0u7YAuKveREkxBNdevhLwN2YltOk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('ERROR OCCURRED:', error);
  } else {
    console.log('SUCCESS! Profiles found:', data?.length);
    console.log('Data:', data);
  }
}

test();
