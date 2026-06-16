import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@click-india/shared-types';

let supabaseInstance: SupabaseClient<Database> | null = null;

export const initSupabase = (
  _supabaseUrl: string,
  _supabaseKey: string,
  _options?: any
): SupabaseClient<Database> => {
  throw new Error('initSupabase is deprecated in shared-services. Initialize Supabase directly in the app and call setSupabase.');
};

export const setSupabase = (client: SupabaseClient<Database>) => {
  supabaseInstance = client;
};

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    throw new Error('Supabase has not been initialized. Call setSupabase first.');
  }
  return supabaseInstance;
};
