# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env.production` file (or set in your deployment platform):

```env
# Required
VITE_API_BASE_URL=https://your-api-domain.com

# Optional - Error Tracking
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=your-sentry-dsn-here
# OR
VITE_LOGROCKET_APP_ID=your-logrocket-app-id-here
```

**Important**: Never commit `.env.production` to git. It should only exist in your deployment environment.

### 2. Build the Application

```bash
npm run build
```

This will create an optimized production build in the `dist/` folder.

### 3. Test Production Build Locally

```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build.

### 4. Security Headers Configuration

Configure these headers in your web server (nginx, Apache, or CDN):

#### Nginx Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-api-domain.com;" always;

    # HTTPS Redirect (if using SSL)
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # SPA Routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Example

Add to `.htaccess` in the `dist/` folder:

```apache
<IfModule mod_headers.c>
    Header set X-Frame-Options "DENY"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-api-domain.com;"
</IfModule>

# SPA Routing
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### 5. CDN/Cloud Platform Configuration

#### Vercel
- Set environment variables in Vercel dashboard
- Add `vercel.json` for routing:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Netlify
- Set environment variables in Netlify dashboard
- Add `_redirects` file in `public/`:
```
/*    /index.html   200
```

#### AWS S3 + CloudFront
- Upload `dist/` contents to S3 bucket
- Configure CloudFront with security headers
- Set up error pages (404 → /index.html)

### 6. Error Monitoring Setup

#### Option 1: Sentry (Recommended)

1. Create account at [sentry.io](https://sentry.io)
2. Create a new project (React)
3. Get your DSN
4. Install Sentry:
```bash
npm install @sentry/react
```
5. Update `src/utils/errorTracking.js` to uncomment Sentry code
6. Set `VITE_SENTRY_DSN` in environment variables

#### Option 2: LogRocket

1. Create account at [logrocket.com](https://logrocket.com)
2. Create a new project
3. Get your App ID
4. Install LogRocket:
```bash
npm install logrocket
```
5. Update `src/utils/errorTracking.js` to uncomment LogRocket code
6. Set `VITE_LOGROCKET_APP_ID` in environment variables

### 7. Performance Monitoring

Consider adding:
- **Google Analytics** for user analytics
- **Web Vitals** for performance metrics
- **Lighthouse CI** for automated performance testing

## Build Optimization

The project is configured with:
- ✅ Code minification (Terser)
- ✅ Console.log removal in production
- ✅ Code splitting (vendor chunks)
- ✅ Dependency optimization

## Testing Production Build

1. Build: `npm run build`
2. Preview: `npm run preview`
3. Test:
   - [ ] All pages load correctly
   - [ ] Authentication works
   - [ ] API calls work (check network tab)
   - [ ] Error boundaries catch errors
   - [ ] Forms validate correctly
   - [ ] Responsive design works
   - [ ] No console errors

## Common Issues

### Issue: API calls fail in production
**Solution**: Ensure `VITE_API_BASE_URL` is set correctly in production environment

### Issue: Routes return 404
**Solution**: Configure SPA routing in your web server (see Security Headers section)

### Issue: Assets not loading
**Solution**: Check that `base` path in `vite.config.js` matches your deployment path

### Issue: CORS errors
**Solution**: Ensure your API server allows requests from your production domain

## Post-Deployment

1. Monitor error tracking dashboard
2. Check application logs
3. Monitor performance metrics
4. Test critical user flows
5. Set up alerts for errors

## Rollback Plan

1. Keep previous build artifacts
2. Have database backup strategy
3. Document rollback procedure
4. Test rollback process

