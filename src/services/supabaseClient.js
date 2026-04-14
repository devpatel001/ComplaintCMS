import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;
