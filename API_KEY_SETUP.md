# API Key Security Setup Guide

This guide explains how to secure your TMDB API key by using Netlify Functions as a proxy.

## Why This Matters

Previously, the API key was visible in the browser's network tab and in the JavaScript bundle. By using Netlify Functions, the API key is stored securely on the server side and never exposed to the client.

## Setup Instructions

### Step 1: Add API Key to Netlify Environment Variables

1. Go to your **Netlify Dashboard**
2. Select your site (lbmovies)
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Add:
   - **Key**: `TMDB_API_KEY`
   - **Value**: `5003d23dedc1001d745759e4c7ffe979`
6. Click **Save**

### Step 2: Redeploy Your Site

After adding the environment variable, you need to trigger a new deployment:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger automatic deployment

### Step 3: Verify It's Working

1. Open your deployed site
2. Open browser DevTools → Network tab
3. Look for requests to `/.netlify/functions/tmdb-proxy`
4. Verify that the API key is **NOT** visible in the request URL or headers
5. The API should still work normally

## How It Works

### Before (Insecure)
```
Frontend → Direct TMDB API call
URL: https://api.themoviedb.org/3/discover/movie?api_key=5003d23dedc1001d745759e4c7ffe979
❌ API key visible in browser
```

### After (Secure)
```
Frontend → Netlify Function → TMDB API
URL: /.netlify/functions/tmdb-proxy?endpoint=discover/movie&sort_by=popularity.desc
✅ API key stored server-side only
```

## Files Changed

1. **`netlify/functions/tmdb-proxy.js`** - Serverless function that proxies API calls
2. **`src/utils/api.js`** - New utility functions for making API calls
3. **`src/App.js`** - Updated to use new API functions
4. **`src/pages/MovieDetail.js`** - Updated to use new API functions
5. **`src/pages/SeriesDetail.js`** - Updated to use new API functions

## Testing Locally

To test locally with Netlify Functions:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create `.env` file in project root:
   ```
   TMDB_API_KEY=5003d23dedc1001d745759e4c7ffe979
   ```

3. Run Netlify Dev:
   ```bash
   netlify dev
   ```

4. The site will run at `http://localhost:8888` with functions working

## Troubleshooting

### Function returns 500 error
- Check that `TMDB_API_KEY` is set in Netlify environment variables
- Verify the API key is correct
- Check Netlify function logs in the dashboard

### Function returns 400 error
- Check that the `endpoint` parameter is being passed correctly
- Verify the endpoint path is valid (e.g., `discover/movie`, not `/discover/movie`)

### CORS errors
- The function already includes CORS headers
- If you see CORS errors, check the function logs

### API calls not working
- Make sure you've redeployed after adding the environment variable
- Check browser console for errors
- Verify the function is accessible at `/.netlify/functions/tmdb-proxy`

## Security Benefits

✅ API key never exposed to client
✅ API key stored securely in Netlify environment variables
✅ Can add rate limiting in the future
✅ Can add authentication/authorization if needed
✅ Can monitor API usage through function logs

## Additional Security Recommendations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **API Key Rotation**: Rotate your API key periodically
3. **Monitoring**: Set up alerts for unusual API usage
4. **Caching**: Consider adding caching to reduce API calls

