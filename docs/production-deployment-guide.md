# Production Deployment Guide - Critical Fixes

## Authentication Configuration

### JWT_SECRET Synchronization (CRITICAL)

The JWT_SECRET **MUST BE IDENTICAL** across all services for authentication to work correctly.

#### Current Issue
- Backend (MedusaJS) and Customer-Backend are using different JWT secrets
- This causes "invalid signature" errors when tokens are validated
- Results in authentication failures across the platform

#### Solution

**1. Set Environment Variables on Railway**

For both `backend` and `customer-backend` services, ensure they use the same JWT_SECRET:

```bash
# Use the Railway CLI or web interface to set:
railway variables set JWT_SECRET="MCF+5JkqSvQJTV58cQWEZOpVEWrrk4q3DI7EbxGf+Wk="
railway variables set COOKIE_SECRET="P2trBj2CnPtr0I9AoRPBPYVLbNx7IK0KSGE16tCr5mk="
```

**2. Verify Configuration**

Check that both services have the same JWT_SECRET:

```bash
# For backend service
railway run --service backend env | grep JWT_SECRET

# For customer-backend service  
railway run --service customer-backend env | grep JWT_SECRET
```

**3. Restart Services**

After updating environment variables, restart both services:

```bash
railway redeploy --service backend
railway redeploy --service customer-backend
```

## Database Connection Fixes

### Enhanced Connection Handling

The customer-backend now includes:

- **Extended timeouts**: 60-second connection timeout for Railway network latency
- **Reduced connection pool**: Maximum 10 connections to stay within Railway limits  
- **Automatic retry logic**: Exponential backoff with up to 5 retry attempts
- **Health checking**: Connection verification before queries
- **Error recovery**: Automatic reconnection on connection loss

### Connection Pool Configuration

```typescript
extra: {
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 10, // Reduced for Railway limits
  min: 2,
  acquireTimeoutMillis: 60000,
  ssl: { rejectUnauthorized: false, sslmode: 'require' }
}
```

## UUID Validation

### Endpoints with UUID Validation

All endpoints that accept UUID parameters now validate format before database queries:

- `GET /api/cards/:id`
- `GET /api/cards/:id/details`  
- `GET /api/games/:id`
- `GET /api/decks/:deckId`
- `GET /api/decks/user/:userId`
- `POST /api/decks/:deckId/cards`
- `DELETE /api/decks/:deckId/cards/:cardId`
- `DELETE /api/decks/:deckId`

### Error Response Format

Invalid UUIDs now return 400 Bad Request instead of 500 Internal Server Error:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_UUID_FORMAT",
    "message": "Invalid UUID format for parameter 'id'",
    "parameter": "id",
    "provided": "cme1t1wj4003mj32kh8ugi5ty",
    "timestamp": "2025-08-24T05:49:08.807Z"
  }
}
```

## Error Handling Improvements

### Standardized Error Responses

All endpoints now use consistent error response format with:

- **Error codes**: Standardized codes for different error types
- **Request IDs**: Unique identifiers for tracking errors
- **Detailed messages**: Clear explanations for debugging
- **Development details**: Additional context in development mode
- **Structured format**: Consistent JSON structure across all errors

### Authentication Error Examples

```json
{
  "success": false,
  "error": {
    "code": "AUTH_SIGNATURE_INVALID", 
    "message": "Token signature validation failed",
    "timestamp": "2025-08-24T05:49:08.807Z",
    "requestId": "req_1724481648807_abc123"
  }
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] Set identical JWT_SECRET on both backend and customer-backend services
- [ ] Set identical COOKIE_SECRET on both services  
- [ ] Verify DATABASE_URL is correct for customer-backend
- [ ] Check Railway PostgreSQL service status

### Post-Deployment

- [ ] Test authentication flow (login/logout)
- [ ] Test card details API with valid UUIDs
- [ ] Test card details API with invalid UUIDs (should return 400)
- [ ] Test deck creation and management
- [ ] Monitor error logs for JWT signature issues
- [ ] Verify database connection stability

### Monitoring Commands

```bash
# Check authentication endpoints
curl -X POST https://api.sidedecked.com/auth/customer/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Check card details with valid UUID
curl https://api.sidedecked.com/api/cards/550e8400-e29b-41d4-a716-446655440000/details

# Check card details with invalid UUID (should return 400)
curl https://api.sidedecked.com/api/cards/invalid-uuid/details

# Check database connection
curl https://api.sidedecked.com/api/health
```

## Recovery Procedures

### If JWT Authentication Still Fails

1. **Verify secrets match exactly:**
   ```bash
   railway run --service backend node -e "console.log(process.env.JWT_SECRET)"
   railway run --service customer-backend node -e "console.log(process.env.JWT_SECRET)"
   ```

2. **Generate new shared secret:**
   ```bash
   # Generate a new secret
   openssl rand -base64 32
   
   # Set on both services
   railway variables set JWT_SECRET="NEW_SECRET_HERE" --service backend
   railway variables set JWT_SECRET="NEW_SECRET_HERE" --service customer-backend
   ```

3. **Clear user sessions:**
   - Users may need to log out and log back in
   - Consider clearing Redis session storage if applicable

### If Database Errors Persist

1. **Check Railway PostgreSQL status**
2. **Verify DATABASE_URL format**
3. **Test connection manually:**
   ```bash
   railway run --service customer-backend node -e "
   const { AppDataSource } = require('./dist/src/config/database.js');
   AppDataSource.initialize().then(() => console.log('✅ Connected'))
   .catch(err => console.error('❌ Failed:', err.message))
   "
   ```

### If UUID Errors Continue

1. **Check client-side code** - ensure UUIDs are generated correctly
2. **Verify route parameters** - make sure :id parameters are actually UUIDs
3. **Check database schema** - ensure UUID columns are properly configured

## Success Metrics

After deployment, monitor these metrics:

- **JWT Authentication Success Rate**: >95%
- **Database Connection Errors**: <1% 
- **Card API Error Rate**: <5%
- **UUID Validation Success**: >99%
- **Overall API Availability**: >99.9%