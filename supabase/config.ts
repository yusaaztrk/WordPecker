import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Supabase yapılandırma bilgileri
const supabaseUrl = 'https://wqxfvjcaqmjllpvexgve.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGZ2amNhcW1qbGxwdmV4Z3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzgzNDgsImV4cCI6MjA2MDMxNDM0OH0.B3CTfVornkTxwf5pSSTThjOfCKHoF2glifj6HiLShto';

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
