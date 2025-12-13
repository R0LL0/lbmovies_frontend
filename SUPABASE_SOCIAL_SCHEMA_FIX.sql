-- Fix for Comments to Profiles relationship
-- Run this SQL in Supabase SQL Editor after running SUPABASE_SOCIAL_SCHEMA.sql
-- This script is idempotent - safe to run multiple times

-- Drop existing foreign key constraints if they exist (to avoid errors on re-run)
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_profiles_fkey;
ALTER TABLE user_activities DROP CONSTRAINT IF EXISTS user_activities_user_id_profiles_fkey;
ALTER TABLE user_activities DROP CONSTRAINT IF EXISTS user_activities_target_user_id_profiles_fkey;
ALTER TABLE user_follows DROP CONSTRAINT IF EXISTS user_follows_follower_id_profiles_fkey;
ALTER TABLE user_follows DROP CONSTRAINT IF EXISTS user_follows_following_id_profiles_fkey;
ALTER TABLE user_recommendations DROP CONSTRAINT IF EXISTS user_recommendations_user_id_profiles_fkey;

-- Add foreign key relationship from comments.user_id to profiles.id
-- This allows Supabase PostgREST to automatically join profiles when querying comments
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add the same relationship for user_activities
ALTER TABLE user_activities 
ADD CONSTRAINT user_activities_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add relationship for target_user_id in user_activities
ALTER TABLE user_activities 
ADD CONSTRAINT user_activities_target_user_id_fkey 
FOREIGN KEY (target_user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add relationship for user_follows
ALTER TABLE user_follows 
ADD CONSTRAINT user_follows_follower_id_fkey 
FOREIGN KEY (follower_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE user_follows 
ADD CONSTRAINT user_follows_following_id_fkey 
FOREIGN KEY (following_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add relationship for user_recommendations
ALTER TABLE user_recommendations 
ADD CONSTRAINT user_recommendations_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

