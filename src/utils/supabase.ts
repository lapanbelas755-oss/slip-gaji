import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bdyqurtzanturwgaxzwi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeXF1cnR6YW50dXJ3Z2F4endpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Mjc0OTUsImV4cCI6MjA5NzIwMzQ5NX0.E9pvc5OMKISbe1fYThLiL-WDUh_uK-KpvrJiHw0_8lk';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
