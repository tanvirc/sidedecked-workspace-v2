# SideDecked Troubleshooting Guide

This guide covers common issues and solutions for the SideDecked TCG marketplace platform.

## Table of Contents

- [Development Environment Issues](#development-environment-issues)
- [Backend Issues](#backend-issues)
- [Customer Backend Issues](#customer-backend-issues)
- [Storefront Issues](#storefront-issues)
- [Vendor Panel Issues](#vendor-panel-issues)
- [Database Issues](#database-issues)
- [Authentication & Authorization](#authentication--authorization)
- [Payment Integration Issues](#payment-integration-issues)
- [Image Processing Issues](#image-processing-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

## Development Environment Issues

### Node.js Version Compatibility

**Issue**: Build or runtime errors related to Node.js version

**Solution**:
```bash
# Check Node.js version
node --version

# SideDecked requires Node.js v20+
# Use nvm to manage Node versions
nvm install 20
nvm use 20
```

### Port Conflicts

**Issue**: "Port already in use" errors

**Solution**:
```bash
# Check what's using the port
lsof -i :9000  # Backend
lsof -i :7000  # Customer backend  
lsof -i :3000  # Storefront
lsof -i :5173  # Vendor panel

# Kill process using port
kill -9 <PID>

# Or change port in environment variables
```

### Package Installation Issues

**Issue**: npm install failures or dependency conflicts

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install

# For workspace issues
npm install --workspaces

# Check for peer dependency warnings
npm ls
```

## Backend Issues

### MedusaJS Admin Panel Build Failures

**Issue**: Admin panel won't build due to Rollup/Zod compatibility issues

**Solution**:
```bash
# Use development mode instead
npm run dev --workspace=apps/backend

# API endpoints work even if admin UI fails
# Check API health at http://localhost:9000/health
```

### Database Migration Failures

**Issue**: Migration errors or database schema issues

**Solution**:
```bash
cd backend

# Check migration status
npm run migration:show --workspace=apps/backend

# Revert problematic migration
npm run migration:revert --workspace=apps/backend

# Re-run migrations
npm run migration:run --workspace=apps/backend

# Create new migration if needed
npm run migration:create --workspace=apps/backend AddFeature
```

### OAuth Configuration Issues

**Issue**: Social login not working

**Solution**:
1. **Check OAuth Provider Settings**:
   - Google: Verify redirect URIs in Google Console
   - GitHub: Check callback URLs in GitHub App settings

2. **Environment Variables**:
```bash
# Ensure these are set in backend/.env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

3. **CORS Settings**:
```bash
# Check CORS configuration
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:5173
```

### Stripe Connect Issues

**Issue**: Payment processing or seller onboarding failures

**Solution**:
1. **Check Stripe Configuration**:
```bash
# Verify Stripe keys in environment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

2. **Webhook Configuration**:
   - Ensure webhook endpoints are accessible
   - Check webhook signing secret
   - Verify event types are subscribed

3. **Connect Account Issues**:
   - Complete onboarding process fully
   - Check account verification status
   - Ensure business information is complete

## Customer Backend Issues

### Service Integration Failures

**Issue**: Services can't connect to commerce backend

**Solution**:
```bash
# Test inventory sync service
curl http://localhost:7000/api/inventory/health

# Check publishable API key
echo $COMMERCE_PUBLISHABLE_KEY

# Verify backend accessibility  
curl http://localhost:9000/health
```

### Authentication Service Issues

**Issue**: Cross-system authentication problems

**Solution**:
1. **Session Token Issues**:
   - Check token format and expiration
   - Verify session cookies are being sent
   - Ensure CORS allows credentials

2. **User Context Problems**:
   - Verify user exists in both systems
   - Check role mapping between systems
   - Ensure customer data is synchronized

### ETL Pipeline Issues

**Issue**: Card data import failures

**Solution**:
```bash
# Check ETL job status
npm run etl:status

# Re-run specific game ETL
npm run etl -- --game=MTG --limit=100

# Check external API connectivity
curl https://api.scryfall.com/cards
curl https://api.pokemontcg.io/v2/cards
```

### Trust Score Calculation Errors

**Issue**: Seller ratings not calculating correctly

**Solution**:
1. **Check Data Sources**:
   - Verify seller reviews exist
   - Check order completion rates
   - Ensure rating aggregation queries work

2. **Database Queries**:
```sql
-- Check seller performance data
SELECT * FROM seller_ratings WHERE seller_id = 'seller_123';

-- Verify aggregation functions
SELECT AVG(overall_rating), COUNT(*) 
FROM seller_ratings 
WHERE seller_id = 'seller_123';
```

## Storefront Issues

### Build Errors

**Issue**: Next.js build failures

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check TypeScript errors
npm run typecheck

# Check for missing environment variables
cat .env.local
```

### Authentication Flow Issues

**Issue**: Login/logout not working properly

**Solution**:
1. **Check Backend URLs**:
```bash
# Verify environment variables
echo $NEXT_PUBLIC_MEDUSA_BACKEND_URL
echo $NEXT_PUBLIC_CUSTOMER_BACKEND_URL
```

2. **CORS Configuration**:
   - Ensure backend allows storefront domain
   - Check credentials are included in requests
   - Verify cookie settings

3. **Session Management**:
   - Check browser cookies
   - Verify session timeout settings
   - Test with different browsers

### Search Not Working

**Issue**: Card search returns no results

**Solution**:
1. **Algolia Configuration**:
```bash
# Check Algolia credentials
echo $NEXT_PUBLIC_ALGOLIA_APP_ID
echo $NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
```

2. **Index Configuration**:
   - Verify search index exists and is populated
   - Check facet configuration matches code
   - Import algolia-config.json if needed

3. **Data Synchronization**:
   - Ensure card data is indexed in Algolia
   - Check index update triggers
   - Verify search attributes are set

### Performance Issues

**Issue**: Slow page loads or high memory usage

**Solution**:
1. **Check Performance Monitoring**:
   - Visit `/debug` page for metrics
   - Review Core Web Vitals in browser tools
   - Check memory usage in dev tools

2. **Image Optimization Issues**:
   - Verify images are being processed
   - Check MinIO/CDN connectivity  
   - Ensure lazy loading is working

3. **Virtualization Problems**:
   - Check list rendering performance
   - Verify infinite scroll is working
   - Review data caching effectiveness

## Vendor Panel Issues

### Login Problems

**Issue**: Can't access vendor dashboard

**Solution**:
```bash
# Check backend connectivity
curl http://localhost:9000/health

# Verify vendor credentials
# Check user role in database

# Ensure CORS allows vendor panel
ADMIN_CORS=http://localhost:5173
```

### CSV Import Failures

**Issue**: Bulk product import not working

**Solution**:
1. **Template Issues**:
   - Use provided CSV templates
   - Check required field mappings
   - Verify SKU format matches catalog

2. **File Processing**:
   - Check file size limits
   - Verify CSV encoding (UTF-8)
   - Ensure no special characters in headers

3. **Catalog Matching**:
   - Verify TCG catalog is populated
   - Check SKU generation logic
   - Review failed matches in logs

## Database Issues

### Connection Problems

**Issue**: Database connection failures

**Solution**:
```bash
# Test database connectivity
pg_isready -d $DATABASE_URL

# Check connection string format
echo $DATABASE_URL

# Verify database exists and user has permissions
psql $DATABASE_URL -c "SELECT NOW();"
```

### Migration Issues

**Issue**: Database schema out of sync

**Solution**:
```bash
# Check migration status
npm run migration:show

# Compare schemas between environments
pg_dump --schema-only production_db > prod_schema.sql
pg_dump --schema-only local_db > local_schema.sql
diff prod_schema.sql local_schema.sql
```

### Performance Issues

**Issue**: Slow database queries

**Solution**:
1. **Check Indexes**:
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public';

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards (name);
CREATE INDEX IF NOT EXISTS idx_cards_game_id ON cards (game_id);
```

2. **Query Optimization**:
   - Use EXPLAIN ANALYZE for slow queries
   - Check for N+1 query problems
   - Review ORM query generation

## Authentication & Authorization

### JWT Token Issues

**Issue**: Authentication tokens expired or invalid

**Solution**:
```bash
# Check JWT secret configuration
echo $JWT_SECRET

# Verify token expiration settings
# Check clock synchronization between services

# Clear browser cookies and re-authenticate
```

---

## Additional Known Issues

### Customer Backend: Database connection refused (ECONNREFUSED)

**Issue**: `connect ECONNREFUSED 127.0.0.1:5432` during startup, or repeated database connection failures in `customer-backend.log`.

**Solution**:
1. Verify PostgreSQL is running and `DATABASE_URL` is correct.
2. Run pending migrations if tables are missing.
3. For development without a database, enable degraded mode:
```bash
# customer-backend/.env
ALLOW_DEGRADED_START=true
```
The server starts with limited functionality and reports a degraded `/health` until the database is available.

### Vendor Panel: Dev server tries to open a browser (xdg-open ENOENT)

**Issue**: Error `spawn xdg-open ENOENT` in `vendorpanel.log` on headless/CI environments.

**Solution**:
- Auto-open is disabled by default in CI and Codespaces.
- To force-enable locally, set:
```bash
# vendorpanel/.env (or environment)
VITE_OPEN_BROWSER=true
```

### Permission Denied Errors

**Issue**: Users can't access certain features

**Solution**:
1. **Check User Roles**:
```sql
-- Verify user permissions
SELECT * FROM users WHERE id = 'user_123';
SELECT * FROM user_roles WHERE user_id = 'user_123';
```

2. **Role-Based Access Control**:
   - Check middleware configuration
   - Verify role assignments
   - Test with different user types

## Payment Integration Issues

### Stripe Connect Problems

**Issue**: Seller payouts or payment processing failures

**Solution**:
1. **Account Verification**:
   - Complete Stripe Connect onboarding
   - Verify business information
   - Check account restrictions

2. **Webhook Configuration**:
```bash
# Check webhook endpoints are accessible
curl -X POST https://your-domain.com/api/stripe/webhooks

# Verify webhook signatures
# Check event handling logic
```

3. **Payment Flow Issues**:
   - Test with Stripe test cards
   - Check payment method validation
   - Verify 3D Secure handling

## Image Processing Issues

### MinIO Storage Problems

**Issue**: Images not uploading or displaying

**Solution**:
```bash
# Check MinIO connectivity
curl -s http://your-minio-endpoint/minio/health/live

# Verify credentials
echo $MINIO_ACCESS_KEY
echo $MINIO_SECRET_KEY

# Test bucket permissions
```

### Image Worker Issues

**Issue**: Card images not being processed

**Solution**:
```bash
# Check worker status
npm run worker:images:status

# Restart image worker
npm run worker:images

# Check processing queue
redis-cli LLEN image_processing_queue

# Force reprocess failed images
npm run sync:images -- --force-reprocess
```

## Performance Issues

### Memory Leaks

**Issue**: Application memory usage keeps growing

**Solution**:
1. **Node.js Memory Issues**:
```bash
# Start with increased memory
node --max-old-space-size=4096 server.js

# Check for memory leaks
node --inspect server.js
# Then use Chrome DevTools
```

2. **Database Connection Pooling**:
   - Check connection pool settings
   - Verify connections are being closed
   - Monitor active connections

### High CPU Usage

**Issue**: Server CPU usage consistently high

**Solution**:
1. **Profile Application**:
```bash
# Use Node.js profiler
node --prof server.js

# Analyze profile
node --prof-process isolate-*-v8.log > profile.txt
```

2. **Check for Inefficient Queries**:
   - Enable database query logging
   - Look for expensive operations
   - Review background job processing

## Deployment Issues

### Railway Deployment Problems

**Issue**: Deployment failures or service crashes

**Solution**:
```bash
# Check Railway logs
railway logs --service backend

# Verify environment variables
railway variables --service backend

# Check service status
railway status
```

### Environment Configuration

**Issue**: Production environment not working correctly

**Solution**:
1. **Environment Variables**:
   - Compare development vs production configs
   - Ensure all required variables are set
   - Check sensitive data is properly secured

2. **Database URLs**:
   - Verify production database connectivity
   - Check connection pooling settings
   - Ensure SSL is configured correctly

3. **CDN Configuration**:
   - Check Cloudflare settings
   - Verify DNS configuration
   - Test asset loading from CDN

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Logs**:
   - Application logs for error details
   - Browser console for frontend issues
   - Database logs for query problems

2. **Documentation**:
   - Review project documentation in `/docs`
   - Check MedusaJS documentation for backend issues
   - Consult Next.js docs for frontend problems

3. **Community Support**:
   - Search existing GitHub issues
   - Create new issue with detailed error information
   - Include environment details and reproduction steps

4. **Debug Tools**:
   - Use storefront debug dashboard at `/debug`
   - Enable verbose logging in development
   - Use browser developer tools for frontend debugging

## Monitoring & Alerting

### Setting Up Monitoring

```bash
# Enable error monitoring
NEXT_PUBLIC_ERROR_MONITORING_ENABLED=true

# Enable performance monitoring  
NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true

# Check monitoring dashboard
# Visit http://localhost:3000/debug
```

### Health Checks

```bash
# Backend health
curl http://localhost:9000/health

# Customer backend health  
curl http://localhost:7000/api/health

# Database health
npm run db:health

# Redis health
redis-cli ping
```

Regular monitoring of these endpoints can help identify issues before they impact users.
