# Supabase Redirect URL Configuration

## Problem

Email confirmation links are going to `localhost:3000` instead of your production URL, causing "otp_expired" errors.

## Solution: Configure Redirect URLs in Supabase

### Step 1: Go to Supabase Dashboard

1. Open your Supabase project
2. Go to **Authentication** → **URL Configuration**

### Step 2: Add Site URL

In the **Site URL** field, add your production URL:

```
https://lbmovies.netlify.app
```

### Step 3: Add Redirect URLs

In the **Redirect URLs** section, add these URLs (one per line):

**For Production:**

```
https://lbmovies.netlify.app
https://lbmovies.netlify.app/
https://lbmovies.netlify.app/auth/callback
```

**For Local Development (optional):**

```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/auth/callback
```

### Step 4: Save Changes

Click **Save** at the bottom of the page.

## How It Works

1. **Sign Up Flow:**

   - User signs up → Supabase sends confirmation email
   - Email contains link with token
   - Link redirects to your site URL + `/auth/callback`
   - App verifies token and creates user session

2. **Email Confirmation:**
   - User clicks link in email
   - Redirected to your app's `/auth/callback` route
   - App extracts token from URL
   - Verifies and confirms email
   - Creates user profile
   - Redirects to home page

## Testing

1. **Test Sign Up:**

   - Sign up with a new email
   - Check email inbox
   - Click confirmation link
   - Should redirect to your site and confirm

2. **If Link Expires:**
   - User can request new confirmation email
   - Or sign in page can have "Resend confirmation" option

## Important Notes

- ⚠️ **Always use HTTPS** for production URLs
- ⚠️ **Don't use localhost** in production redirect URLs
- ⚠️ **Wildcards** are not supported - list each URL explicitly
- ✅ **Multiple URLs** are allowed (for dev + production)

## Troubleshooting

**"otp_expired" error:**

- Link was clicked after expiration (usually 1 hour)
- Solution: Request new confirmation email

**"Invalid redirect URL":**

- URL not in Supabase redirect list
- Solution: Add exact URL to redirect list

**Link goes to localhost:**

- Site URL not configured correctly
- Solution: Update Site URL in Supabase settings
