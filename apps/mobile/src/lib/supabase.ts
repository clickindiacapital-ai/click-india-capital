import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initSupabase, getSupabase } from '@click-india/shared-services';

// TODO: Use environment variables (process.env)
const supabaseUrl = 'https://pftnogxzbsbruvjprwfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdG5vZ3h6YnNicnV2anByd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTIxMjQsImV4cCI6MjA5MTYyODEyNH0.vUn1bZkOn3KHrCGZI7ZNDk8kX5SnJ6jxgi-oSC1Vuu8';

export const supabase = initSupabase(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export shared services
export { authService, leadService, assetService } from '@click-india/shared-services';

export default supabase;
