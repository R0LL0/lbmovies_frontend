import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table structure suggestions:
// users table: id, email, username, avatar_url, created_at, updated_at
// favorites table: id, user_id, movie_id, movie_type, created_at
// watchlist table: id, user_id, movie_id, movie_type, created_at
// reviews table: id, user_id, movie_id, movie_type, rating, content, created_at

