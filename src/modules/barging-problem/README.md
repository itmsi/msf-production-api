# Barging Problem Module

Modul ini menangani manajemen data problem yang terjadi pada aktivitas barging dalam sistem MSF Production.

## Overview

Barging Problem Module adalah modul yang digunakan untuk mencatat dan mengelola berbagai masalah yang terjadi selama aktivitas barging. Modul ini menyimpan informasi tentang:

- Tanggal dan shift kejadian
- Barge yang mengalami problem
- Jenis aktivitas yang bermasalah
- Lokasi kejadian (site)
- Waktu mulai dan selesai problem
- Durasi problem (otomatis dihitung)
- Catatan tambahan tentang problem

## Fitur Utama

### 1. CRUD Operations
- **Create**: Membuat data barging problem baru
- **Read**: Membaca data barging problem dengan pagination dan filtering
- **Update**: Mengupdate data barging problem yang sudah ada
- **Delete**: Menghapus data barging problem (soft delete)

### 2. Validasi Data
- Validasi FK ke tabel `m_barge` (barge_id)
- Validasi FK ke tabel `m_activities` (activities_id)
- Validasi FK ke tabel `m_sites` (site_id, nullable)
- Validasi waktu start dan finish
- Validasi format data input

### 3. Auto Calculation
- Field `duration` otomatis dihitung dari `start - finish`
- Durasi dalam format jam dengan 2 desimal

### 4. Advanced Query Features
- Pagination dengan limit maksimal 100
- Search di multiple field (remark, barge name, activities name, site name)
- Filter berdasarkan shift, barge_id, activities_id, site_id
- Sorting berdasarkan field tertentu dengan urutan ASC/DESC

### 5. Data Integrity
- Soft delete untuk menjaga integritas data
- Relasi dengan tabel master menggunakan eager loading
- Validasi referential integrity

## Struktur Database

### Tabel: r_ccr_barging_problem

| Kolom | Tipe Data | Keterangan | Constraint |
|-------|-----------|------------|------------|
| id | INT | Primary Key | Auto Increment |
| activity_date | TIMESTAMP | Tanggal aktivitas | NOT NULL |
| shift | ENUM | Shift kerja | NOT NULL, ('ds', 'ns') |
| barge_id | INT | FK ke m_barge | NOT NULL |
| activities_id | INT | FK ke m_activities | NOT NULL |
| site_id | INT | FK ke m_sites | NULLABLE |
| start | TIMESTAMP | Waktu mulai problem | NOT NULL |
| finish | TIMESTAMP | Waktu selesai problem | NOT NULL |
| duration | FLOAT | Durasi dalam jam | NULLABLE, Auto |
| remark | TEXT | Catatan tambahan | NULLABLE |
| createdAt | TIMESTAMP | Waktu pembuatan | Auto |
| createdBy | INT | ID user pembuat | NULLABLE |
| updatedAt | TIMESTAMP | Waktu update | Auto |
| updatedBy | INT | ID user update | NULLABLE |
| deletedAt | TIMESTAMP | Waktu soft delete | NULLABLE |
| deletedBy | INT | ID user delete | NULLABLE |

### Relasi Database

```sql
-- Foreign Key ke tabel m_barge
ALTER TABLE r_ccr_barging_problem 
ADD CONSTRAINT FK_barging_problem_barge_id 
FOREIGN KEY (barge_id) REFERENCES m_barge(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Key ke tabel m_activities
ALTER TABLE r_ccr_barging_problem 
ADD CONSTRAINT FK_barging_problem_activities_id 
FOREIGN KEY (activities_id) REFERENCES m_activities(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Key ke tabel m_sites
ALTER TABLE r_ccr_barging_problem 
ADD CONSTRAINT FK_barging_problem_site_id 
FOREIGN KEY (site_id) REFERENCES m_sites(id) 
ON DELETE CASCADE ON UPDATE CASCADE;
```

## API Endpoints

### Base URL
```
/api/barging-problem
```

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create barging problem | ✅ JWT |
| GET | `/` | Get all barging problems | ✅ JWT |
| GET | `/:id` | Get barging problem by ID | ✅ JWT |
| PATCH | `/:id` | Update barging problem | ✅ JWT |
| DELETE | `/:id` | Delete barging problem | ✅ JWT |

## Data Flow

### 1. Create Process
```
Request → Validation → FK Check → Duration Calculation → Save → Response
```

### 2. Read Process
```
Query → Filtering → Pagination → Join Relations → Transform → Response
```

### 3. Update Process
```
Request → Validation → FK Check → Duration Recalculation → Update → Response
```

### 4. Delete Process
```
Request → Soft Delete → Update deletedAt → Response
```

## Business Rules

### 1. Validasi Referential Integrity
- `barge_id` harus ada di tabel `m_barge`
- `activities_id` harus ada di tabel `m_activities`
- `site_id` harus ada di tabel `m_sites` jika diisi

### 2. Validasi Waktu
- Waktu `start` harus lebih awal dari waktu `finish`
- Durasi minimal 0.01 jam
- Format waktu menggunakan ISO 8601

### 3. Validasi Shift
- Hanya menerima nilai 'ds' (day shift) atau 'ns' (night shift)
- Case sensitive

### 4. Pagination Rules
- Default page: 1
- Default limit: 10
- Maximum limit: 100
- Jika limit > 100, akan error

### 5. Search Rules
- Search dilakukan di field: remark, barge name, activities name, site name
- Case insensitive (ILIKE)
- Partial match (menggunakan %)

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": { ... },
  "pagination": { ... } // Optional, hanya untuk list
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Dependencies

### Internal Dependencies
- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - API documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation

### External Dependencies
- `typeorm` - Database ORM
- `pg` - PostgreSQL driver

### Module Dependencies
- `BargeModule` - Untuk validasi barge_id
- `ActivitiesModule` - Untuk validasi activities_id
- `SitesModule` - Untuk validasi site_id

## Security

### Authentication
- Semua endpoint dilindungi dengan JWT authentication
- Menggunakan `JwtAuthGuard` untuk proteksi endpoint

### Authorization
- User harus memiliki JWT token yang valid
- Token dikirim melalui header `Authorization: Bearer <token>`

### Input Validation
- Semua input divalidasi menggunakan class-validator
- SQL injection protection melalui parameterized queries
- XSS protection melalui input sanitization

## Performance Considerations

### Database Optimization
- Eager loading untuk relasi yang sering digunakan
- Index pada kolom yang sering di-filter
- Soft delete untuk menjaga performance query

### Query Optimization
- Pagination untuk data yang banyak
- Efficient filtering dengan proper WHERE clauses
- Sorting dengan indexed columns

## Monitoring & Logging

### Error Handling
- Comprehensive error handling untuk semua operasi
- Detailed error messages untuk debugging
- Proper HTTP status codes

### Logging
- Service level logging untuk operasi penting
- Error logging dengan stack trace
- Performance monitoring untuk slow queries

## Testing

### Unit Tests
- Service method testing
- DTO validation testing
- Entity testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Authentication testing

### E2E Tests
- Complete workflow testing
- Error scenario testing
- Performance testing

## Deployment

### Requirements
- Node.js 18+
- PostgreSQL 12+
- NestJS framework
- TypeORM configuration

### Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=msf_production
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
JWT_SECRET=your_jwt_secret
```

## Maintenance

### Database Maintenance
- Regular backup untuk data penting
- Index optimization
- Query performance monitoring

### Code Maintenance
- Regular dependency updates
- Security patches
- Performance improvements

## Support

### Documentation
- API documentation tersedia di Swagger UI
- Code documentation dengan JSDoc
- README files untuk setiap komponen

### Troubleshooting
- Common error solutions
- Performance tuning guide
- Debugging tips

## Future Enhancements

### Planned Features
- Bulk import/export functionality
- Advanced reporting
- Real-time notifications
- Mobile app integration

### Technical Improvements
- Caching layer
- GraphQL support
- Microservices architecture
- Containerization
