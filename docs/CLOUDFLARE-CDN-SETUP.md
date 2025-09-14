# Cloudflare CDN Setup for SideDecked TCG Marketplace

## Overview

This guide walks you through setting up Cloudflare CDN for your SideDecked marketplace to achieve global image delivery, improved performance, and reduced bandwidth costs.

**Expected Performance Improvements:**
- 80%+ reduction in image load times globally
- 60%+ improvement in Largest Contentful Paint (LCP)
- 60-80% reduction in Railway bandwidth costs
- Global edge caching with 200+ data centers

## Prerequisites

- Active Cloudflare account
- Domain registered and accessible
- Railway deployments for all SideDecked services
- MinIO storage configured and operational

## Phase 1: Domain & DNS Setup (30 minutes)

### 1.1 Add Domain to Cloudflare

1. **Login to Cloudflare Dashboard**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Click "Add a Site"
   - Enter your domain (e.g., `sidedecked.com`)

2. **Import DNS Records**
   - Cloudflare will scan and import existing DNS records
   - Review and verify all records are correct

3. **Update Nameservers**
   - Copy the Cloudflare nameservers provided
   - Update nameservers at your domain registrar
   - Wait for DNS propagation (can take up to 24 hours)

### 1.2 Configure DNS Records

Add the following DNS records in Cloudflare:

```dns
# Main services (ensure these point to your Railway deployment URLs)
A     @           → [Railway Storefront IP]     # Main site
A     api         → [Railway Backend IP]       # Commerce API  
A     customer    → [Railway Customer-Backend IP]  # Customer API
A     vendor      → [Railway Vendor Panel IP]  # Vendor portal

# CDN endpoint for images
CNAME cdn         → bucket-production-672e.up.railway.app

# Optional: Staging environments
A     staging     → [Railway Staging IP]
A     api-staging → [Railway Backend Staging IP]
```

**Important:** Ensure all main service records have the orange cloud (proxied) enabled.

## Phase 2: CDN Configuration (45 minutes)

### 2.1 Enable Page Rules

Go to **Rules** → **Page Rules** and create the following rules in order:

#### Rule 1: Image CDN Caching
```
URL Pattern: cdn.yourdomain.com/cards/*

Settings:
- Cache Level: Cache Everything
- Browser Cache TTL: 1 year  
- Edge Cache TTL: 30 days
- Always Online: On
- Disable Security: Off
- Disable Performance: Off
```

#### Rule 2: API Response Caching  
```
URL Pattern: customer.yourdomain.com/api/cards/*

Settings:
- Cache Level: Cache Everything
- Browser Cache TTL: 5 minutes
- Edge Cache TTL: 5 minutes
- Origin Cache Control: On
```

#### Rule 3: Static Assets Caching
```
URL Pattern: *.yourdomain.com/static/*

Settings:
- Cache Level: Cache Everything
- Browser Cache TTL: 1 month
- Edge Cache TTL: 7 days
```

### 2.2 Configure Transform Rules

Go to **Rules** → **Transform Rules** → **URL Rewrite**:

#### CDN Image Rewrite Rule
```
Rule Name: CDN Image Rewrite
When incoming requests match: cdn.yourdomain.com/cards/*
Then rewrite to: bucket-production-672e.up.railway.app/sidedecked-card-images/${uri_path_2}
```

This rule redirects CDN requests to your MinIO storage.

### 2.3 Enable Performance Features

Go to **Speed** → **Optimization**:

#### Auto Minify
- ✅ JavaScript
- ✅ CSS  
- ✅ HTML

#### Brotli Compression
- ✅ Enable

#### Polish (Image Optimization)
- ✅ Lossless (recommended for card images)
- Alternative: Lossy (smaller files, slight quality loss)

#### Mirage (Mobile Optimization)
- ✅ Enable for mobile image optimization

#### Rocket Loader
- ⚠️ Disable (can interfere with Next.js)

## Phase 3: Security Configuration (15 minutes)

### 3.1 SSL/TLS Settings

Go to **SSL/TLS** → **Overview**:
- Set to **Full (strict)** for end-to-end encryption

### 3.2 Security Level

Go to **Security** → **Settings**:
- Set Security Level to **Medium**
- Enable Browser Integrity Check
- Challenge Passage: 30 minutes

### 3.3 Bot Fight Mode

- ✅ Enable Bot Fight Mode for automated protection

## Phase 4: Application Configuration (20 minutes)

### 4.1 Update Environment Variables

Update your Railway environment variables for customer-backend:

```env
# CDN Configuration  
CDN_ENABLED=true
CDN_BASE_URL=https://cdn.yourdomain.com
CDN_CACHE_TTL=31536000
CDN_BROWSER_CACHE_TTL=86400
CDN_EDGE_CACHE_TTL=2592000
CDN_FAILOVER_ENABLED=true
```

### 4.2 Update Storefront Configuration

Update storefront environment variables:

```env
# Update API endpoints to use custom domains
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_CUSTOMER_BACKEND_URL=https://customer.yourdomain.com
```

### 4.3 Update Vendor Panel Configuration

```env
# Update backend URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
```

### 4.4 Update Backend CORS

Update backend environment variables:

```env
# Update CORS origins
STORE_CORS=https://yourdomain.com,https://www.yourdomain.com
ADMIN_CORS=https://vendor.yourdomain.com
```

## Phase 5: Testing & Validation (15 minutes)

### 5.1 DNS Propagation Test

```bash
# Test DNS resolution
nslookup yourdomain.com
nslookup cdn.yourdomain.com
nslookup api.yourdomain.com
nslookup customer.yourdomain.com
```

### 5.2 CDN Cache Testing

1. **Test Image Loading**
   - Visit: `https://yourdomain.com/cards`
   - Open browser dev tools → Network tab
   - Look for `CF-Cache-Status: HIT` in response headers

2. **Test CDN Direct Access**
   - Visit: `https://cdn.yourdomain.com/cards/[some-card-id]/normal/normal.webp`
   - Should redirect to MinIO and serve the image

3. **Performance Testing**
   ```bash
   # Test from multiple locations
   curl -w "@curl-format.txt" https://yourdomain.com/cards
   curl -w "@curl-format.txt" https://cdn.yourdomain.com/cards/test.webp
   ```

### 5.3 Application Testing

1. **Test Card Search**
   - Search for cards in `/cards` route
   - Verify images load quickly
   - Check browser console for errors

2. **Test Card Details**  
   - Visit individual card pages `/cards/[id]`
   - Verify high-resolution images load
   - Test mobile responsiveness

3. **Test API Performance**
   - Monitor API response times in dev tools
   - Verify proper caching headers
   - Test from different geographic locations

## Phase 6: Monitoring & Optimization (Ongoing)

### 6.1 Cloudflare Analytics

Monitor these metrics in **Analytics** → **Web Analytics**:
- **Page Load Time**: Should improve by 60%+
- **Time to First Byte**: Should be <100ms globally  
- **Cache Hit Rate**: Target >85% for static assets
- **Bandwidth Saved**: Track cost reduction

### 6.2 Performance Monitoring

Track Core Web Vitals improvements:
- **Largest Contentful Paint (LCP)**: Target <2.5s
- **First Input Delay (FID)**: Target <100ms
- **Cumulative Layout Shift (CLS)**: Target <0.1

### 6.3 Cost Monitoring

Monitor bandwidth usage in Railway:
- Track reduction in data transfer costs
- Expected 60-80% reduction in bandwidth charges
- Monitor MinIO storage costs vs. CDN costs

## Advanced Optimizations (Optional)

### Cloudflare Workers (Pro Plan)

Create a Worker for advanced image processing:

```javascript
// worker.js - Dynamic image resizing
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Extract image parameters from URL
  const pathParts = url.pathname.split('/')
  const size = pathParts[3] // thumbnail, small, normal, large
  
  // Implement dynamic resizing logic
  if (url.pathname.startsWith('/cards/')) {
    return fetch(request, {
      cf: {
        image: {
          width: getSizeWidth(size),
          height: getSizeHeight(size),
          format: 'webp',
          quality: 85
        }
      }
    })
  }
  
  return fetch(request)
}

function getSizeWidth(size) {
  const sizes = {
    thumbnail: 100,
    small: 200,
    normal: 400,
    large: 800
  }
  return sizes[size] || 400
}
```

### Cache Purging Strategy

Set up automated cache purging when images are updated:

```typescript
// In your image processing worker
const purgeCloudflareCache = async (imageUrls: string[]) => {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: imageUrls
    })
  })
  
  return response.json()
}
```

## Troubleshooting

### Common Issues

**1. Images not loading from CDN**
- Check DNS propagation: `dig cdn.yourdomain.com`
- Verify Transform Rules are active
- Check MinIO bucket permissions

**2. Cache not hitting**
- Verify Page Rules order and patterns
- Check for cache-busting parameters
- Review Browser Cache TTL settings

**3. SSL/TLS errors**
- Ensure SSL mode is "Full (strict)"
- Verify origin server has valid SSL certificate
- Check for mixed content issues

**4. API calls failing**
- Update CORS settings in backend
- Verify API endpoints are proxied correctly
- Check security level settings

### Performance Issues

**1. Slow TTFB**
- Check origin server performance
- Verify Cloudflare cache hit rate
- Consider enabling Argo Smart Routing

**2. Large image sizes**
- Enable Polish image optimization
- Consider using WebP format
- Implement responsive images

### Monitoring Commands

```bash
# Check cache status
curl -I https://cdn.yourdomain.com/cards/test.webp | grep CF-Cache-Status

# Test global performance  
curl -w "@curl-format.txt" https://yourdomain.com

# Monitor DNS
dig +trace yourdomain.com
```

## Cost Optimization

### Expected Savings

**Before CDN:**
- Railway bandwidth: ~$50-200/month
- Image delivery latency: 500-2000ms globally

**After CDN:**
- Railway bandwidth: ~$10-40/month (60-80% reduction)
- Cloudflare Pro: $20/month
- Image delivery latency: 50-200ms globally

**Net Savings:** $20-140/month + significant performance improvements

### Monitoring Costs

1. **Railway Usage**
   - Monitor bandwidth charts in Railway dashboard
   - Track before/after implementation

2. **Cloudflare Usage**
   - Monitor requests and bandwidth in Analytics
   - Consider upgrading to Business plan for larger traffic

This comprehensive setup will significantly improve your SideDecked marketplace performance while reducing costs and providing a better user experience globally.