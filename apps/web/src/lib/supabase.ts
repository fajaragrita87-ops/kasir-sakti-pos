/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ybjtvxrvwzkcczvwsyhy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_B85OS7stBwSrYeWQSQ5EGg_dD2f39t8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
