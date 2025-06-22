# Bible Reader Deployment Fix Guide

## Problem Identified
The reading page works on localhost but is empty on the hosted version because the API files weren't being served correctly in production.

## Root Cause
The `api` folder was in the project root instead of the `public` directory. Vite only serves files from the `public` directory in production builds.

## Solution Applied

### 1. Moved API Files to Public Directory
- ✅ Moved all API files from `/api/` to `/public/api/`
- ✅ Updated Vite configuration for better static file handling
- ✅ Removed old `/api/` directory

### 2. Updated Vite Configuration
The `vite.config.ts` file has been updated with:
```typescript
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    fs: {
      allow: ['..', '.']
    }
  }
})
```

## For Your Hosting Platform

### If using Vercel:
1. Make sure your build script in `package.json` includes:
   ```json
   {
     "scripts": {
       "build": "tsc && vite build",
       "preview": "vite preview"
     }
   }
   ```

2. Add a `vercel.json` file if needed:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       }
     ]
   }
   ```

### If using Netlify:
1. Make sure the `public` folder is included in your build
2. Add a `_redirects` file in `public` if needed:
   ```
   /api/* /api/:splat 200
   ```

### If using other platforms:
- Ensure the `public` directory is served as static files
- Make sure `/api/*` routes serve files from `public/api/`

## To Deploy the Fix:

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Fix: Move API files to public directory for production deployment"
   ```

2. **Push to your hosting platform:**
   ```bash
   git push origin main
   ```

3. **Verify the fix:**
   - Check that `/api/available_translations.json` is accessible on your hosted domain
   - Test the Bible reader functionality
   - Use browser dev tools to check for any remaining 404 errors

## Test URLs to Verify:
After deployment, these should be accessible:
- `https://yourdomain.com/api/available_translations.json`
- `https://yourdomain.com/api/eng_kjv/GEN/1.json`
- `https://yourdomain.com/api/available_commentaries.json`

## Debugging in Production:
If issues persist, check:
1. Browser dev tools Network tab for 404 errors
2. Console errors in browser dev tools
3. Build output logs on your hosting platform
4. Whether the `public/api` folder is included in the deployment

## Files Changed:
- `vite.config.ts` - Updated configuration
- `public/api/` - All API files moved here
- `api/` - Directory removed from root

The application should now work correctly on both localhost and your hosted version!
