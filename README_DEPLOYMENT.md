# 🚀 Complete Deployment Guide: Netlify + Supabase

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Account
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Copy your project URL and anon key

### 3. Setup Database
1. In Supabase, go to SQL Editor
2. Copy and paste the SQL from `SUPABASE_SETUP.md`
3. Run the SQL to create tables

### 4. Add Environment Variables

**Local (.env file):**
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Add both variables

### 5. Deploy to Netlify

**Option A: GitHub (Recommended)**
1. Push code to GitHub
2. Go to https://app.netlify.com
3. "Add new site" → "Import from Git"
4. Connect GitHub
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables
7. Deploy!

**Option B: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Features Included

✅ **User Authentication**
- Sign up / Sign in
- Email/password authentication
- Secure session management

✅ **User Profiles**
- Customizable username
- Profile page with stats
- Avatar support

✅ **Database Integration**
- Favorites (synced to database)
- Watchlist (synced to database)
- Reviews system
- User data persistence

✅ **Security**
- Row Level Security (RLS) policies
- Secure API keys
- Protected routes

## File Structure

```
src/
├── config/
│   └── supabase.js          # Supabase client setup
├── services/
│   ├── authService.js       # Authentication functions
│   └── userService.js       # User data functions
├── pages/
│   ├── Login.js             # Sign in/up page
│   └── Profile.js           # User profile page
└── components/
    └── Navigation.js         # Updated with auth buttons
```

## Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `REACT_APP_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API |

## Database Schema

- **profiles**: User profile information
- **favorites**: User's favorite movies/series
- **watchlist**: User's watchlist items
- **reviews**: User reviews/ratings

## Troubleshooting

### "Module not found: @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### "Invalid API key"
- Check environment variables in Netlify
- Make sure you're using the anon key (not service role key)

### "Table doesn't exist"
- Run the SQL from `SUPABASE_SETUP.md` in Supabase SQL Editor

### Build fails on Netlify
- Check build logs
- Ensure all dependencies are in package.json
- Verify environment variables are set

## Next Steps

1. **Customize Authentication**
   - Add social login (Google, GitHub)
   - Email verification
   - Password reset

2. **Add More Features**
   - User reviews/ratings
   - Social features (follow users)
   - Recommendations based on favorites

3. **Optimize**
   - Add loading states
   - Error boundaries
   - Performance monitoring

## Support

- Supabase Docs: https://supabase.com/docs
- Netlify Docs: https://docs.netlify.com
- React Router: https://reactrouter.com

## Cost

- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)

Perfect for getting started! 🎉

