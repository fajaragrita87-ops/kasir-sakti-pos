/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hdbcnspoygwowsytqrlf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYmNuc3BveWd3b3dzeXRxcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTQxMDgsImV4cCI6MjA5MzU3MDEwOH0.DIVe_tp1Ao1uY0f0u7YAuKveREkxBNdevhLwN2YltOk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
