-- Social Interactions Database Schema
-- Run this SQL in Supabase SQL Editor after the main setup

-- User Follows Table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Comments Table (for movies/series)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_type TEXT NOT NULL CHECK (movie_type IN ('movie', 'series')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Feed
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('favorite', 'watchlist', 'review', 'comment', 'follow')),
  movie_id INTEGER,
  movie_type TEXT CHECK (movie_type IN ('movie', 'series')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Recommendations (based on similar users)
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_type TEXT NOT NULL CHECK (movie_type IN ('movie', 'series')),
  score DECIMAL(5,2),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id, movie_type)
);

-- Enable Row Level Security
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for user_follows
CREATE POLICY "Users can view all follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can create own follows"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Policies for comments
CREATE POLICY "Users can view all comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_activities
CREATE POLICY "Users can view activities of users they follow"
  ON user_activities FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_follows
      WHERE follower_id = auth.uid() AND following_id = user_activities.user_id
    )
  );

CREATE POLICY "Users can create own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_recommendations
CREATE POLICY "Users can view own recommendations"
  ON user_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recommendations"
  ON user_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_comments_movie ON comments(movie_id, movie_type);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON user_recommendations(user_id);

-- Function to automatically create activity when user favorites something
CREATE OR REPLACE FUNCTION create_favorite_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, movie_id, movie_type, metadata)
  VALUES (
    NEW.user_id,
    'favorite',
    NEW.movie_id,
    NEW.movie_type,
    jsonb_build_object('movie_data', NEW.movie_data)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for favorites
CREATE TRIGGER on_favorite_created
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION create_favorite_activity();

-- Function to automatically create activity when user adds to watchlist
CREATE OR REPLACE FUNCTION create_watchlist_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, movie_id, movie_type, metadata)
  VALUES (
    NEW.user_id,
    'watchlist',
    NEW.movie_id,
    NEW.movie_type,
    jsonb_build_object('movie_data', NEW.movie_data)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for watchlist
CREATE TRIGGER on_watchlist_created
  AFTER INSERT ON watchlist
  FOR EACH ROW
  EXECUTE FUNCTION create_watchlist_activity();

-- Function to automatically create activity when user creates review
CREATE OR REPLACE FUNCTION create_review_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, movie_id, movie_type, metadata)
  VALUES (
    NEW.user_id,
    'review',
    NEW.movie_id,
    NEW.movie_type,
    jsonb_build_object('rating', NEW.rating, 'content', NEW.content)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reviews
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION create_review_activity();

