# Deployment Guide - Barging Problem Module

## Overview
Panduan ini menjelaskan proses deployment module Barging Problem ke berbagai environment (Development, Staging, Production).

## Prerequisites

### 1. Environment Setup
- Node.js 18+ terinstall
- PostgreSQL 12+ terinstall
- Redis (jika diperlukan untuk caching)
- PM2 atau Docker (untuk production)

### 2. Dependencies
- Semua package dependencies terinstall
- Environment variables dikonfigurasi
- Database connection string tersedia

### 3. Security
- JWT secret key dikonfigurasi
- Database credentials aman
- Firewall dan network security dikonfigurasi

## Environment Configuration

### Development Environment

#### 1. Environment Variables
Buat file `.env.development`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=msf_production_dev

# JWT
JWT_SECRET=your_jwt_secret_dev
JWT_EXPIRES_IN=24h

# Application
PORT=9526
NODE_ENV=development
LOG_LEVEL=debug

# External Services
S3_BUCKET=msf-dev-bucket
RABBITMQ_URL=amqp://localhost:5672
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=dev@example.com
MAIL_PASS=dev_password
```

#### 2. Database Setup
```bash
# Create database
createdb msf_production_dev

# Run migrations
npm run migration:run

# Seed data (optional)
npm run seed:run
```

#### 3. Start Application
```bash
# Development mode dengan hot reload
npm run dev

# Atau build dan start
npm run build
npm run start:dev
```

### Staging Environment

#### 1. Environment Variables
Buat file `.env.staging`:
```env
# Database
DB_HOST=staging-db.example.com
DB_PORT=5432
DB_USERNAME=staging_user
DB_PASSWORD=staging_password
DB_DATABASE=msf_production_staging

# JWT
JWT_SECRET=your_jwt_secret_staging
JWT_EXPIRES_IN=24h

# Application
PORT=9526
NODE_ENV=staging
LOG_LEVEL=info

# External Services
S3_BUCKET=msf-staging-bucket
RABBITMQ_URL=amqp://staging-rabbitmq:5672
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=staging@example.com
MAIL_PASS=staging_password
```

#### 2. Database Setup
```bash
# Connect ke staging database
psql -h staging-db.example.com -U staging_user -d msf_production_staging

# Run migrations
npm run migration:run:staging

# Seed data (jika diperlukan)
npm run seed:run:staging
```

#### 3. Deployment
```bash
# Build aplikasi
npm run build:staging

# Start dengan PM2
pm2 start ecosystem.config.js --env staging

# Atau dengan Docker
docker build -t msf-api:staging .
docker run -d --name msf-api-staging -p 9526:9526 msf-api:staging
```

### Production Environment

#### 1. Environment Variables
Buat file `.env.production`:
```env
# Database
DB_HOST=production-db.example.com
DB_PORT=5432
DB_USERNAME=production_user
DB_PASSWORD=production_password
DB_DATABASE=msf_production

# JWT
JWT_SECRET=your_jwt_secret_production
JWT_EXPIRES_IN=24h

# Application
PORT=9526
NODE_ENV=production
LOG_LEVEL=warn

# External Services
S3_BUCKET=msf-production-bucket
RABBITMQ_URL=amqp://production-rabbitmq:5672
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=production@example.com
MAIL_PASS=production_password
```

#### 2. Database Setup
```bash
# Connect ke production database
psql -h production-db.example.com -U production_user -d msf_production

# Run migrations (dengan backup terlebih dahulu)
pg_dump -h production-db.example.com -U production_user -d msf_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npm run migration:run:production
```

#### 3. Deployment
```bash
# Build aplikasi
npm run build:production

# Start dengan PM2
pm2 start ecosystem.config.js --env production

# Atau dengan Docker
docker build -t msf-api:production .
docker run -d --name msf-api-production -p 9526:9526 msf-api:production
```

## Docker Deployment

### 1. Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 9526

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9526/health || exit 1

# Start application
CMD ["node", "dist/main"]
```

### 2. Docker Compose
```yaml
version: '3.8'

services:
  msf-api:
    build: .
    ports:
      - "9526:9526"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - msf-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - msf-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - msf-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - msf-api
    restart: unless-stopped
    networks:
      - msf-network

volumes:
  postgres_data:

networks:
  msf-network:
    driver: bridge
```

### 3. Nginx Configuration
```nginx
events {
    worker_connections 1024;
}

http {
    upstream msf_api {
        server msf-api:9526;
    }

    server {
        listen 80;
        server_name api.example.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.example.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://msf_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            proxy_pass http://msf_api/health;
            access_log off;
        }
    }
}
```

## PM2 Deployment

### 1. Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'msf-api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 9526,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 9526,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 9526,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
```

### 2. PM2 Commands
```bash
# Start application
pm2 start ecosystem.config.js

# Start dengan environment tertentu
pm2 start ecosystem.config.js --env production

# Restart application
pm2 restart msf-api

# Stop application
pm2 stop msf-api

# Delete application
pm2 delete msf-api

# View logs
pm2 logs msf-api

# Monitor application
pm2 monit

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## CI/CD Pipeline

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy MSF API

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        DB_HOST: localhost
        DB_PORT: 5432
        DB_USERNAME: postgres
        DB_PASSWORD: postgres
        DB_DATABASE: test_db

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging..."
        # Add your staging deployment commands here

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add your production deployment commands here
```

### 2. GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy-staging
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2

test:
  stage: test
  image: node:18
  services:
    - postgres:15
  variables:
    DB_HOST: postgres
    DB_USERNAME: postgres
    DB_PASSWORD: postgres
    DB_DATABASE: test_db
  script:
    - npm ci
    - npm test
  only:
    - main
    - develop

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main
    - develop

deploy-staging:
  stage: deploy-staging
  image: alpine:latest
  script:
    - echo "Deploying to staging..."
  only:
    - develop

deploy-production:
  stage: deploy-production
  image: alpine:latest
  script:
    - echo "Deploying to production..."
  only:
    - main
  when: manual
```

## Monitoring & Health Checks

### 1. Health Check Endpoint
```typescript
// src/main.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  });
});
```

### 2. Prometheus Metrics
```typescript
// src/common/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import * as prometheus from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestDuration: prometheus.Histogram;
  private httpRequestTotal: prometheus.Counter;
  private httpRequestErrors: prometheus.Counter;

  constructor() {
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestErrors = new prometheus.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
    });
  }

  recordRequestDuration(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.labels(method, route, statusCode).observe(duration);
  }

  recordRequestTotal(method: string, route: string, statusCode: number) {
    this.httpRequestTotal.labels(method, route, statusCode).inc();
  }

  recordRequestError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.labels(method, route, errorType).inc();
  }

  getMetrics() {
    return prometheus.register.metrics();
  }
}
```

### 3. Logging Configuration
```typescript
// src/common/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'msf-api' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
```

## Backup & Recovery

### 1. Database Backup
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="msf_production"
DB_HOST="localhost"
DB_USER="postgres"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### 2. Application Backup
```bash
#!/bin/bash
# app-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/app"
APP_DIR="/var/www/msf-api"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Backup environment files
cp $APP_DIR/.env* $BACKUP_DIR/

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +30 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

## Security Considerations

### 1. Environment Variables
- Jangan commit file `.env` ke repository
- Gunakan secret management service
- Rotate secrets secara berkala

### 2. Database Security
- Gunakan connection pooling
- Implement rate limiting
- Monitor suspicious activities

### 3. Network Security
- Gunakan HTTPS/SSL
- Implement firewall rules
- Monitor network traffic

### 4. Application Security
- Update dependencies secara berkala
- Implement input validation
- Monitor error logs

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :9526

# Kill the process
kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d msf_production
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h

# Check Node.js memory
node --max-old-space-size=4096 dist/main.js
```

#### 4. Log Analysis
```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View PM2 logs
pm2 logs msf-api
```

## Performance Optimization

### 1. Database Optimization
- Implement database indexing
- Use connection pooling
- Optimize queries

### 2. Application Optimization
- Implement caching
- Use compression
- Optimize bundle size

### 3. Infrastructure Optimization
- Use load balancer
- Implement auto-scaling
- Monitor resource usage
