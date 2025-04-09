
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types-override';

const SUPABASE_URL = "https://mdwifkqdnqdvmgowwssz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kd2lma3FkbnFkdm1nb3d3c3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTAxNDMsImV4cCI6MjA1OTYyNjE0M30.xuREdnfAUvug-WEbg8FgPGVJwMVQid4RaKVDc_24d9I";

// Export the Supabase client with our modified types
export const supabaseWithAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Re-export the original client for compatibility
export { supabase } from './client';
