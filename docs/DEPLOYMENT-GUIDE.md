# SideDecked TCG Catalog System - Deployment Guide

> ⚠️ DEPRECATED — see [production-deployment-guide.md](production-deployment-guide.md)

## Overview

This guide covers the complete deployment of the SideDecked TCG Catalog System, including infrastructure setup, configuration, monitoring, and production readiness.

## Infrastructure Requirements

### Minimum Production Requirements

#### Database Server (PostgreSQL 14+)
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 200 GB SSD (with expansion capability)
- **Network**: 1 Gbps
- **Extensions**: uuid-ossp, pg_trgm, unaccent

#### Application Server
- **CPU**: 4 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **Network**: 1 Gbps
- **Node.js**: 18.x LTS

#### Redis Cache/Queue Server
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB SSD
- **Network**: 1 Gbps
- **Redis**: 7.x

#### Object Storage (MinIO)
- **CPU**: 2 cores
- **RAM**: 2 GB
- **Storage**: 500 GB (expandable)
- **Network**: 1 Gbps

#### External Services
- **Algolia**: Search Plus plan or higher
- **Monitoring**: DataDog, New Relic, or equivalent
- **CDN**: CloudFlare, AWS CloudFront, or equivalent

### Recommended Production Setup

#### High Availability Configuration
```yaml
# PostgreSQL Master-Slave Setup
postgresql:
  master:
    instance_type: "c5.2xlarge"
    storage: "500GB gp3"
    backup_retention: "7 days"
  
  read_replicas:
    count: 2
    instance_type: "c5.xlarge"
    storage: "500GB gp3"

# Application Cluster
application:
  instances: 3
  instance_type: "c5.large"
  auto_scaling:
    min: 2
    max: 10
    cpu_target: 70%

# Redis Cluster
redis:
  cluster_mode: true
  nodes: 3
  instance_type: "r6g.large"
  backup_enabled: true

# MinIO Distributed
minio:
  nodes: 4
  instance_type: "c5.large"
  storage_per_node: "1TB gp3"
```

## Pre-deployment Setup

### 1. Domain & SSL Configuration
```bash
# Setup domains
api.sidedecked.com      → Application API
images.sidedecked.com   → MinIO/CDN
admin.sidedecked.com    → Admin interface

# SSL certificates (Let's Encrypt or commercial)
certbot certonly --dns-route53 -d api.sidedecked.com
certbot certonly --dns-route53 -d images.sidedecked.com
```

### 2. External Service Setup

#### Algolia Configuration
```bash
# Create Algolia account and application
# Create indexes:
sidedecked_cards_catalog
sidedecked_marketplace_products

# Configure index settings (see algolia-config.json)
```

#### MinIO Bucket Setup
```bash
# Create buckets
mc mb minio/sidedecked-images
mc mb minio/sidedecked-backups

# Set bucket policies
mc policy set public minio/sidedecked-images/public/
mc policy set private minio/sidedecked-images/private/
```

### 3. Database Preparation
```sql
-- Create database
CREATE DATABASE sidedecked_catalog;
CREATE USER sidedecked_api WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sidedecked_catalog TO sidedecked_api;

-- Create required extensions
\c sidedecked_catalog;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create read-only user for read replicas
CREATE USER sidedecked_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE sidedecked_catalog TO sidedecked_readonly;
GRANT USAGE ON SCHEMA public TO sidedecked_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sidedecked_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sidedecked_readonly;
```

## Deployment Methods

## Database Migration & Initialization

### Initial Setup Script
```bash
#!/bin/bash
# init-production-db.sh

set -e

echo "Setting up SideDecked Catalog Database..."

# Wait for database to be ready
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "Waiting for database..."
  sleep 2
done

# Run migrations
echo "Running database migrations..."
npm run migration:run

# Verify schema
echo "Verifying database schema..."
npm run migration:show

# Create initial data
echo "Creating initial game data..."
npm run seed:games

echo "Database setup complete!"
```

### Migration Verification
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify extensions
SELECT extname 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'unaccent');

-- Check initial data
SELECT code, name FROM games ORDER BY code;
```

## Monitoring & Observability

### Health Check Endpoints
```typescript
// Health check configuration
const healthChecks = {
  '/health': 'Basic health status',
  '/health/detailed': 'Detailed system health',
  '/health/database': 'Database connectivity',
  '/health/redis': 'Redis connectivity',
  '/health/algolia': 'Search service health',
  '/health/minio': 'Storage service health',
  '/health/etl': 'ETL system health'
}
```

### Prometheus Metrics
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sidedecked-catalog-api'
    static_configs:
      - targets: ['api.sidedecked.com:9090']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:9121']
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "SideDecked Catalog System",
    "panels": [
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "ETL Job Status",
        "targets": [
          {
            "expr": "sum(rate(etl_jobs_total[5m])) by (status)"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends"
          }
        ]
      }
    ]
  }
}
```

### Log Aggregation (ELK Stack)
```yaml
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "catalog-api" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "sidedecked-catalog-%{+YYYY.MM.dd}"
  }
}
```

## Security Configuration

### SSL/TLS Setup
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.sidedecked.com;
    
    ssl_certificate /etc/ssl/certs/api.sidedecked.com.pem;
    ssl_certificate_key /etc/ssl/private/api.sidedecked.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://catalog-api:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database Security
```sql
-- Create application-specific users
CREATE USER catalog_api WITH PASSWORD 'secure_password';
CREATE USER catalog_readonly WITH PASSWORD 'readonly_password';
CREATE USER catalog_etl WITH PASSWORD 'etl_password';

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE sidedecked_catalog TO catalog_api;
GRANT USAGE ON SCHEMA public TO catalog_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO catalog_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO catalog_api;

-- Read-only access for analytics
GRANT CONNECT ON DATABASE sidedecked_catalog TO catalog_readonly;
GRANT USAGE ON SCHEMA public TO catalog_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO catalog_readonly;

-- ETL user permissions
GRANT CONNECT ON DATABASE sidedecked_catalog TO catalog_etl;
GRANT USAGE ON SCHEMA public TO catalog_etl;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO catalog_etl;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO catalog_etl;
```

### API Security
```typescript
// Security middleware configuration
const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
    standardHeaders: true,
    legacyHeaders: false
  },
  
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://images.sidedecked.com"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  }
}
```

## Backup & Disaster Recovery

### Database Backup Strategy
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
BACKUP_FILE="sidedecked_catalog_${DATE}.sql.gz"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d sidedecked_catalog | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://sidedecked-backups/database/"

# Clean up local files older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Verify backup
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
else
    echo "Backup failed!" >&2
    exit 1
fi
```

### Automated Backup Schedule
```yaml
# kubernetes cron job for backups
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: sidedecked-catalog
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: pg-backup
            image: postgres:14-alpine
            command:
            - /bin/bash
            - -c
            - |
              pg_dump $DATABASE_URL | gzip | aws s3 cp - s3://sidedecked-backups/database/backup-$(date +%Y%m%d_%H%M%S).sql.gz
            envFrom:
            - secretRef:
                name: catalog-secrets
          restartPolicy: OnFailure
```

### Disaster Recovery Procedure
```bash
#!/bin/bash
# disaster-recovery.sh

echo "Starting disaster recovery process..."

# 1. Stop all services
kubectl scale deployment catalog-api --replicas=0

# 2. Restore database from latest backup
LATEST_BACKUP=$(aws s3 ls s3://sidedecked-backups/database/ --recursive | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://sidedecked-backups/${LATEST_BACKUP}" ./restore.sql.gz
gunzip restore.sql.gz

# Drop and recreate database
psql -h $DB_HOST -U postgres -c "DROP DATABASE IF EXISTS sidedecked_catalog;"
psql -h $DB_HOST -U postgres -c "CREATE DATABASE sidedecked_catalog;"
psql -h $DB_HOST -U postgres -d sidedecked_catalog < restore.sql

# 3. Restart services
kubectl scale deployment catalog-api --replicas=3

# 4. Verify system health
sleep 30
curl -f https://api.sidedecked.com/health

echo "Disaster recovery completed!"
```

## Performance Tuning

### PostgreSQL Configuration
```conf
# postgresql.conf optimizations
shared_buffers = 1GB                    # 25% of total RAM
effective_cache_size = 3GB              # 75% of total RAM
work_mem = 16MB                         # Per query memory
maintenance_work_mem = 256MB            # Maintenance operations
wal_buffers = 16MB                      # WAL buffer size
checkpoint_completion_target = 0.9      # Checkpoint target
random_page_cost = 1.1                  # SSD optimization
effective_io_concurrency = 200          # SSD optimization

# Connection settings
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# Query optimization
default_statistics_target = 100
constraint_exclusion = partition
```

### Redis Configuration
```conf
# redis.conf optimizations
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### Application-Level Optimizations
```typescript
// Connection pooling
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  type: 'postgres' as const,
  pool: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 900000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
}

// Redis connection optimization
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
  keepAlive: 30000,
  maxmemoryPolicy: 'allkeys-lru'
}
```

## Troubleshooting

### Common Issues & Solutions

#### High Memory Usage
```bash
# Check application memory usage
kubectl top pods -n sidedecked-catalog

# Check for memory leaks
curl https://api.sidedecked.com/health/detailed | jq '.memory'

# Restart pods if necessary
kubectl rollout restart deployment/catalog-api -n sidedecked-catalog
```

#### Database Connection Issues
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill problematic queries
SELECT pg_terminate_backend(pid);
```

#### ETL Pipeline Problems
```bash
# Check ETL queue status
curl https://api.sidedecked.com/api/catalog/etl/health

# View ETL logs
kubectl logs -l app=catalog-api -n sidedecked-catalog | grep "etl"

# Reset circuit breaker
curl -X POST https://api.sidedecked.com/api/catalog/etl/circuit-breaker/reset \
  -H "Content-Type: application/json" \
  -d '{"gameCode": "MTG"}'
```

#### Search Performance Issues
```bash
# Check Algolia index status
curl -X GET "https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes" \
  -H "X-Algolia-API-Key: ${ALGOLIA_API_KEY}" \
  -H "X-Algolia-Application-Id: ${ALGOLIA_APP_ID}"

# Rebuild search index
curl -X POST https://api.sidedecked.com/api/catalog/search/rebuild \
  -H "Content-Type: application/json" \
  -d '{"indexName": "sidedecked_cards_catalog"}'
```

## Production Readiness Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database migrations applied and verified
- [ ] SSL certificates installed and tested
- [ ] External services (Algolia, MinIO) configured
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Load testing completed
- [ ] Security scan performed
- [ ] Documentation complete

### Launch
- [ ] DNS records updated
- [ ] CDN configured (if applicable)
- [ ] Load balancer configured
- [ ] Auto-scaling policies enabled
- [ ] Monitoring dashboards active
- [ ] Alert notifications configured
- [ ] Support team notified

### Post-Launch
- [ ] System performance monitoring
- [ ] Error rate monitoring
- [ ] User feedback collection
- [ ] Database performance optimization
- [ ] Cache hit rate optimization
- [ ] Regular security updates
- [ ] Backup verification

This comprehensive deployment guide ensures a robust, scalable, and maintainable production deployment of the SideDecked TCG Catalog System.