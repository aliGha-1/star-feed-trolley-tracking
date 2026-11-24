import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihjgsvuxwjhktracmjwx.supabase.co';

const supabaseAnonKey = 'sb_publishable_-iclDqVewk6s8v6Ro1G2Bw_wQVaqK74';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;
