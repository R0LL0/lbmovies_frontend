# Social Features Setup Guide

This guide will help you set up the social interaction features for your movie app.

## Features Added

1. **Comments System** - Users can comment on movies and series
2. **User Following** - Users can follow each other
3. **Activity Feed** - See what users you follow are doing
4. **Similar Users** - Find users with similar movie preferences
5. **Social Profile** - View followers, following, and recommendations

## Step 1: Run the Social Schema SQL

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `SUPABASE_SOCIAL_SCHEMA.sql`
4. Copy and paste the entire SQL script
5. Click **Run** to execute

This will create:
- `user_follows` table - for following relationships
- `comments` table - for user comments on movies/series
- `user_activities` table - for activity feed
- `user_recommendations` table - for personalized recommendations
- All necessary indexes and triggers
- Row Level Security (RLS) policies

## Step 2: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. You should see these new tables:
   - `user_follows`
   - `comments`
   - `user_activities`
   - `user_recommendations`

## Step 3: Test the Features

### Comments
1. Navigate to any movie or series detail page
2. Scroll down to the "Comments" section
3. Sign in if not already
4. Write a comment and click "Post Comment"
5. Your comment will appear with your username and avatar

### Following Users
1. Go to your Profile page
2. Click on the "Social" tab
3. View "Similar Users" section
4. Click "Follow" on any user card
5. They will appear in your "Following" list

### Activity Feed
1. Click on "Activity" in the navigation menu
2. You'll see activities from users you follow:
   - When they favorite a movie
   - When they add to watchlist
   - When they write reviews
   - When they comment
   - When they follow someone

## How It Works

### Automatic Activity Tracking
The database triggers automatically create activity entries when:
- A user favorites a movie/series
- A user adds to watchlist
- A user creates a review
- A user comments on a movie/series
- A user follows another user

### Activity Feed Algorithm
The activity feed shows:
- Activities from users you follow
- Sorted by most recent first
- Limited to 20 items by default

### Similar Users Algorithm
Finds users with:
- Overlapping favorite movies/series
- Sorted by number of common favorites
- Limited to 5 users by default

## API Functions Available

### Social Service (`src/services/socialService.js`)

**Following:**
- `followUser(followerId, followingId)` - Follow a user
- `unfollowUser(followerId, followingId)` - Unfollow a user
- `isFollowing(followerId, followingId)` - Check if following
- `getFollowers(userId)` - Get user's followers
- `getFollowing(userId)` - Get users a user is following

**Comments:**
- `addComment(userId, movieId, movieType, content)` - Add comment
- `getComments(movieId, movieType)` - Get all comments
- `updateComment(commentId, userId, content)` - Update comment
- `deleteComment(commentId, userId)` - Delete comment

**Activity:**
- `getActivityFeed(userId, limit)` - Get activity feed
- `getSimilarUsers(userId, limit)` - Get similar users
- `getUserRecommendations(userId, limit)` - Get recommendations

## Components Added

1. **Comments Component** (`src/components/Comments.js`)
   - Displays comments for a movie/series
   - Allows adding, editing, deleting comments
   - Shows user avatars and timestamps

2. **UserCard Component** (`src/components/UserCard.js`)
   - Displays user information
   - Follow/unfollow button
   - Used in profile and activity feed

3. **ActivityFeed Page** (`src/pages/ActivityFeed.js`)
   - Shows activities from followed users
   - Clickable activities that navigate to movies/series

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only see activities from users they follow
- Users can only edit/delete their own comments
- Users can only follow/unfollow as themselves
- All operations require authentication

## Troubleshooting

### Comments not showing
- Make sure the `comments` table exists
- Check that RLS policies are set up correctly
- Verify user is signed in

### Activity feed is empty
- Make sure you're following some users
- Check that `user_activities` table exists
- Verify triggers are working (check if activities are created when you favorite something)

### Follow button not working
- Ensure `user_follows` table exists
- Check RLS policies allow INSERT
- Verify user is signed in

### 406 errors
- Run the SQL schema again
- Check that all tables are created
- Verify RLS policies are enabled

## Next Steps

You can extend these features by:
1. Adding notifications when someone follows you
2. Creating user profile pages
3. Adding likes/reactions to comments
4. Implementing comment threads/replies
5. Adding user search functionality
6. Creating groups or communities
7. Adding private messaging

## Notes

- All social features use the existing Supabase client configuration
- No additional API keys needed
- Activities are automatically created via database triggers
- The system gracefully handles missing tables (returns empty arrays)

