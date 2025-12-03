# Website Development Password Protection

## Overview

The website now includes password protection to limit access during development. Users must enter a password before they can access any pages on the site.

## Features

- **Password-protected access**: All pages require authentication
- **Cookie-based session**: Once authenticated, users stay logged in for 30 days
- **Clean access page**: Professional-looking password entry page
- **Easy to disable**: Can be turned off with a single environment variable
- **API routes exempted**: Health checks and API endpoints remain accessible

## Configuration

### Environment Variables

Add these to your `.env.development` or `.env.local` file:

```bash
# Enable or disable password protection
ENABLE_PASSWORD_PROTECTION=true

# Set your desired password
DEV_ACCESS_PASSWORD=dev2024
```

### Default Password

The default password is: **`dev2024`**

## How It Works

1. When a user visits any page on the site, they are redirected to `/dev-access`
2. They must enter the correct password
3. Upon successful authentication, a cookie (`dev_access`) is set for 30 days
4. The user can now access all pages on the site
5. API routes and health checks are not affected

## Disabling Password Protection

To disable password protection (e.g., for local development):

```bash
# In your .env file
ENABLE_PASSWORD_PROTECTION=false
```

Or simply remove/comment out the environment variable entirely.

## Accessing the Site

1. Navigate to `http://localhost:3200`
2. You will be redirected to the password page
3. Enter the password (default: `dev2024`)
4. Click "Access Site"
5. You will be redirected to the homepage

## Changing the Password

To change the password:

1. Update `DEV_ACCESS_PASSWORD` in your `.env` file
2. Restart the website container: `docker-compose restart website`
3. Users will need to re-authenticate with the new password

## Files Modified

- `website/src/middleware.ts` - Main middleware logic
- `website/src/app/dev-access/page.tsx` - Password entry page
- `website/src/app/api/dev-access/route.ts` - API route for password verification
- `.env.development` - Environment configuration

## Security Notes

- This is for **development only** - not intended for production security
- Password is stored in plain text in environment variables
- Cookie is not encrypted (uses plain text comparison)
- For production, use proper authentication systems (OAuth, JWT, etc.)
