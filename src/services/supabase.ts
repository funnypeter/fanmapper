import 'react-native-url-polyfill/dist/URLSearchParams';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://lngdmrccrcsarpjqddir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_35xSLRm0qi7xmwMMj7oCIg_wQWevWz6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
