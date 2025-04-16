import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzpqxeuyyjwyljhgiksn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6cHF4ZXV5eWp3eWxqaGdpa3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NjExMDUsImV4cCI6MjA2MDMzNzEwNX0.bgoyzjyLX6jFN5_L8a9wnhbXp1eWeO92eVOQuYBddas';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);