# Fix for Comments Profile Relationship Error

## Problem

When fetching comments, you may see this error:
```
Could not find a relationship between 'comments' and 'profiles' in the schema cache
```

This happens because Supabase PostgREST needs explicit foreign key relationships to automatically join tables.

## Solution

You have two options:

### Option 1: Run the Fix SQL (Recommended)

If you've already run `SUPABASE_SOCIAL_SCHEMA.sql`, run this fix:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `SUPABASE_SOCIAL_SCHEMA_FIX.sql`
3. Copy and paste the SQL
4. Click **Run**

This adds the foreign key relationships needed for PostgREST to join `comments` with `profiles`.

### Option 2: Re-run Updated Schema

If you haven't set up the social tables yet, or don't mind recreating them:

1. Drop the existing social tables (if they exist):
   ```sql
   DROP TABLE IF EXISTS comments CASCADE;
   DROP TABLE IF EXISTS user_follows CASCADE;
   DROP TABLE IF EXISTS user_activities CASCADE;
   DROP TABLE IF EXISTS user_recommendations CASCADE;
   ```

2. Run the updated `SUPABASE_SOCIAL_SCHEMA.sql` which now includes the foreign key relationships.

### Option 3: Use Fallback (Already Implemented)

The code has been updated to automatically fall back to fetching profiles separately if the relationship doesn't exist. This means comments will still work, but may be slightly slower.

## What Changed

The updated schema now includes foreign key constraints from:
- `comments.user_id` → `profiles.id`
- `user_follows.follower_id` → `profiles.id`
- `user_follows.following_id` → `profiles.id`
- `user_activities.user_id` → `profiles.id`
- `user_activities.target_user_id` → `profiles.id`
- `user_recommendations.user_id` → `profiles.id`

These relationships allow Supabase PostgREST to automatically join the tables when you use `.select("*, profiles(*)")`.

## Verify It's Working

After running the fix:

1. Try adding a comment on a movie/series
2. Check that the comment appears with the user's profile information
3. Verify in the browser console that there are no relationship errors

## Notes

- The foreign keys reference both `auth.users(id)` (for data integrity) and `profiles(id)` (for PostgREST relationships)
- Both constraints are needed because:
  - `auth.users` is the source of truth for user IDs
  - `profiles` is what PostgREST uses for joins
- The `ON DELETE CASCADE` ensures that if a profile is deleted, related comments are also deleted

