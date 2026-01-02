
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twvqdiexsstlzdbocrgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnFkaWV4c3N0bHpkYm9jcmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2NjksImV4cCI6MjA4MjQ2MjY2OX0.l7QMM2Vf3VSLoHwUUORnGagidrDyfZj8nd0c__KwQXs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
