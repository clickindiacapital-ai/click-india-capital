import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@click-india/shared-types';

let supabaseInstance: SupabaseClient<Database> | null = null;

export const initSupabase = (
  supabaseUrl: string,
  supabaseKey: string,
  options?: any
): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, options);
  }
  return supabaseInstance;
};

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    throw new Error('Supabase has not been initialized. Call initSupabase first.');
  }
  return supabaseInstance;
};
