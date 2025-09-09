# MTD Work Hour Module Deployment Guide

## Overview
Panduan ini menjelaskan cara melakukan deployment untuk module MTD Work Hour yang telah dibuat.

## Prerequisites
1. Node.js dan npm terinstall
2. PostgreSQL database terhubung
3. Environment variables sudah dikonfigurasi
4. JWT authentication sudah setup

## Environment Variables
Pastikan environment variables berikut sudah dikonfigurasi:

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=falaqmsi
POSTGRES_PASSWORD=Rubysa179596
POSTGRES_DB=msf_production_api

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=production
```

## Database Setup

### 1. Run Migration
Jalankan migration untuk membuat tabel `mtd_work_hour`:

```bash
npm run migration:run
```

Atau jika menggunakan TypeORM CLI:
```bash
npx typeorm migration:run
```

### 2. Verify Database Tables
Pastikan tabel-tabel berikut sudah ada:
- `m_population` - Data master population/unit
- `r_loss_time` - Data effective working hours
- `m_activities` - Data master activities
- `mtd_work_hour` - Tabel baru untuk MTD Work Hour (opsional)

### 3. Check Data Availability
Pastikan ada data di tabel-tabel yang diperlukan:
```sql
-- Check population data
SELECT COUNT(*) FROM m_population WHERE status = 'active';

-- Check effective working hours data
SELECT COUNT(*) FROM r_loss_time;

-- Check activities data
SELECT COUNT(*) FROM m_activities;
```

## Application Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
npm run build
```

### 3. Start Application
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### 4. Verify Module Registration
Pastikan module sudah terdaftar di `app.module.ts`:
```typescript
import { MtdWorkHourModule } from './modules/mtd-work-hour/mtd-work-hour.module';

@Module({
  imports: [
    // ... other modules
    MtdWorkHourModule,
  ],
})
export class AppModule {}
```

## API Testing

### 1. Test Basic Endpoint
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/problem-types" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2. Test Data Endpoint
```bash
curl -X GET "http://localhost:3000/mtd-work-hour" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 3. Test Summary Endpoint
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/summary" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - POSTGRES_HOST=db
      - POSTGRES_PORT=5432
      - POSTGRES_USER=falaqmsi
      - POSTGRES_PASSWORD=Rubysa179596
      - POSTGRES_DB=msf_production_api
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=falaqmsi
      - POSTGRES_PASSWORD=Rubysa179596
      - POSTGRES_DB=msf_production_api
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. Deploy with Docker
```bash
docker-compose up -d
```

## Production Considerations

### 1. Database Optimization
- Pastikan index sudah dibuat untuk kolom yang sering digunakan
- Monitor query performance
- Setup database connection pooling

### 2. Caching
- Implement Redis untuk caching jika diperlukan
- Cache frequently accessed data

### 3. Monitoring
- Setup application monitoring (e.g., New Relic, DataDog)
- Monitor database performance
- Setup logging (e.g., Winston, Morgan)

### 4. Security
- Pastikan JWT secret kuat
- Implement rate limiting
- Setup CORS properly
- Use HTTPS in production

## Health Checks

### 1. Application Health
```bash
curl -X GET "http://localhost:3000/health"
```

### 2. Database Health
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/problem-types"
```

### 3. API Health
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/summary"
```

## Troubleshooting

### Common Issues

#### 1. Module Not Found
**Error**: `Cannot find module './modules/mtd-work-hour/mtd-work-hour.module'`

**Solution**: 
- Pastikan file module sudah dibuat
- Pastikan import path benar
- Restart aplikasi

#### 2. Database Connection Error
**Error**: `Connection to database failed`

**Solution**:
- Periksa environment variables
- Pastikan database server berjalan
- Periksa network connectivity

#### 3. JWT Authentication Error
**Error**: `Unauthorized`

**Solution**:
- Pastikan JWT token valid
- Periksa JWT secret configuration
- Pastikan token belum expired

#### 4. Empty Data Response
**Error**: Data kosong meskipun ada data di database

**Solution**:
- Periksa query conditions
- Pastikan data sesuai dengan filter
- Periksa relasi antar tabel

### Debug Steps

1. **Check Application Logs**
   ```bash
   tail -f logs/application.log
   ```

2. **Check Database Logs**
   ```bash
   tail -f /var/log/postgresql/postgresql.log
   ```

3. **Test Database Connection**
   ```bash
   psql -h localhost -U falaqmsi -d msf_production_api
   ```

4. **Check Environment Variables**
   ```bash
   printenv | grep POSTGRES
   ```

## Rollback Plan

### 1. Database Rollback
```bash
npx typeorm migration:revert
```

### 2. Application Rollback
```bash
git checkout previous-version
npm install
npm run build
npm run start:prod
```

### 3. Docker Rollback
```bash
docker-compose down
docker-compose up -d --scale app=0
# Deploy previous version
docker-compose up -d
```

## Performance Optimization

### 1. Database Indexes
```sql
-- Index untuk population
CREATE INDEX idx_population_status ON m_population(status);
CREATE INDEX idx_population_no_unit ON m_population(no_unit);

-- Index untuk effective working hours
CREATE INDEX idx_loss_time_date ON r_loss_time(date_activity);
CREATE INDEX idx_loss_time_population ON r_loss_time(population_id);
CREATE INDEX idx_loss_time_activities ON r_loss_time(activities_id);
```

### 2. Query Optimization
- Gunakan pagination untuk data besar
- Implement proper WHERE clauses
- Use appropriate JOIN strategies

### 3. Caching Strategy
- Cache static data (problem types)
- Cache frequently accessed data
- Implement cache invalidation

## Monitoring and Alerting

### 1. Application Metrics
- Response time
- Error rate
- Throughput
- Memory usage

### 2. Database Metrics
- Connection count
- Query performance
- Disk usage
- CPU usage

### 3. Business Metrics
- API usage
- Data volume
- User activity

## Backup and Recovery

### 1. Database Backup
```bash
pg_dump -h localhost -U falaqmsi -d msf_production_api > backup.sql
```

### 2. Application Backup
```bash
tar -czf app-backup.tar.gz /path/to/app
```

### 3. Recovery Process
```bash
# Database recovery
psql -h localhost -U falaqmsi -d msf_production_api < backup.sql

# Application recovery
tar -xzf app-backup.tar.gz
npm install
npm run start:prod
```
