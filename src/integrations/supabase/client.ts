// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://biucqqazxodciarktqfc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpdWNxcWF6eG9kY2lhcmt0cWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxMjIzNDYsImV4cCI6MjAzMzY5ODM0Nn0.Jx_H-v0U7DRuR-l1TMhvA35QqEFD-wPqhDaoqpGLQRA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);