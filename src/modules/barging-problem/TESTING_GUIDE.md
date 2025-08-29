# Testing Guide - Barging Problem Module

## Overview
Panduan ini menjelaskan cara melakukan testing terhadap module Barging Problem yang telah dibuat.

## Prerequisites

### 1. Aplikasi Berjalan
Pastikan aplikasi NestJS sudah berjalan di port 9526:
```bash
npm run dev
```

### 2. Database Ready
Pastikan database PostgreSQL sudah berjalan dan migration sudah dijalankan:
```bash
npm run migration:run
```

### 3. JWT Token
Untuk testing endpoint yang memerlukan authentication, Anda perlu JWT token yang valid.

## Testing Tools

### 1. Swagger UI
Akses Swagger UI di browser:
```
http://localhost:9526/api-docs
```

### 2. cURL
Gunakan cURL untuk testing via command line.

### 3. Postman/Insomnia
Gunakan tools API testing seperti Postman atau Insomnia.

## Testing Scenarios

### Scenario 1: Create Barging Problem

#### Test Case 1.1: Create dengan Data Lengkap
**Endpoint**: `POST /api/barging-problem`

**Request Body**:
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ds",
  "barge_id": 1,
  "activities_id": 1,
  "site_id": 1,
  "start": "2024-01-01T08:00:00.000Z",
  "finish": "2024-01-01T16:00:00.000Z",
  "remark": "Problem pada unit excavator"
}
```

**Expected Response**: 201 Created
**Validation**:
- Data berhasil disimpan ke database
- Duration otomatis terhitung (8.0)
- Relasi dengan barge, activities, dan site berhasil

#### Test Case 1.2: Create tanpa Site ID
**Request Body**:
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ns",
  "barge_id": 1,
  "activities_id": 1,
  "start": "2024-01-01T20:00:00.000Z",
  "finish": "2024-01-02T04:00:00.000Z",
  "remark": "Problem pada unit loader"
}
```

**Expected Response**: 201 Created
**Validation**:
- Data berhasil disimpan dengan site_id = null
- Duration otomatis terhitung (8.0)

#### Test Case 1.3: Create dengan Invalid Barge ID
**Request Body**:
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ds",
  "barge_id": 999,
  "activities_id": 1,
  "start": "2024-01-01T08:00:00.000Z",
  "finish": "2024-01-01T16:00:00.000Z",
  "remark": "Test invalid barge"
}
```

**Expected Response**: 400 Bad Request
**Validation**:
- Error message: "Barge dengan ID tersebut tidak ditemukan"
- Data tidak tersimpan ke database

#### Test Case 1.4: Create dengan Invalid Time
**Request Body**:
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ds",
  "barge_id": 1,
  "activities_id": 1,
  "start": "2024-01-01T16:00:00.000Z",
  "finish": "2024-01-01T08:00:00.000Z",
  "remark": "Test invalid time"
}
```

**Expected Response**: 400 Bad Request
**Validation**:
- Error message: "Waktu start harus lebih awal dari waktu finish"
- Data tidak tersimpan ke database

### Scenario 2: Get All Barging Problems

#### Test Case 2.1: Get dengan Pagination Basic
**Endpoint**: `GET /api/barging-problem?page=1&limit=5`

**Expected Response**: 200 OK
**Validation**:
- Response berisi array data
- Pagination info tersedia
- Limit data sesuai (5 items)

#### Test Case 2.2: Get dengan Search
**Endpoint**: `GET /api/barging-problem?search=excavator&page=1&limit=10`

**Expected Response**: 200 OK
**Validation**:
- Data yang di-return sesuai dengan keyword "excavator"
- Search dilakukan di field remark, barge name, activities name, dan site name

#### Test Case 2.3: Get dengan Filter
**Endpoint**: `GET /api/barging-problem?shift=ds&barge_id=1&page=1&limit=10`

**Expected Response**: 200 OK
**Validation**:
- Data yang di-return hanya shift "ds"
- Data yang di-return hanya barge_id = 1

#### Test Case 2.4: Get dengan Sorting
**Endpoint**: `GET /api/barging-problem?sortBy=createdAt&sortOrder=DESC&page=1&limit=10`

**Expected Response**: 200 OK
**Validation**:
- Data terurut berdasarkan createdAt descending
- Data terbaru muncul di awal

### Scenario 3: Get Barging Problem by ID

#### Test Case 3.1: Get dengan Valid ID
**Endpoint**: `GET /api/barging-problem/1`

**Expected Response**: 200 OK
**Validation**:
- Data barging problem dengan ID 1 berhasil di-return
- Relasi dengan barge, activities, dan site berhasil di-load

#### Test Case 3.2: Get dengan Invalid ID
**Endpoint**: `GET /api/barging-problem/999`

**Expected Response**: 200 OK dengan data null
**Validation**:
- Message: "Data tidak ditemukan"
- Data: null

### Scenario 4: Update Barging Problem

#### Test Case 4.1: Update Semua Field (Full Update)
**Endpoint**: `PATCH /api/barging-problem/1`

**Request Body**:
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ds",
  "barge_id": 1,
  "activities_id": 1,
  "site_id": 1,
  "start": "2024-01-01T08:00:00.000Z",
  "finish": "2024-01-01T16:00:00.000Z",
  "remark": "Problem pada unit excavator"
}
```

**Expected Response**: 200 OK
**Validation**:
- Semua field berhasil diupdate
- Duration otomatis ter-recalculate
- updatedAt berubah

#### Test Case 4.2: Update Shift Saja
**Request Body**:
```json
{
  "shift": "ns"
}
```

**Expected Response**: 200 OK
**Validation**:
- Shift berhasil diupdate dari "ds" ke "ns"
- Field lain tidak berubah
- updatedAt berubah

#### Test Case 4.3: Update Multiple Fields
**Request Body**:
```json
{
  "shift": "ds",
  "remark": "Updated remark for testing"
}
```

**Expected Response**: 200 OK
**Validation**:
- Shift dan remark berhasil diupdate
- Field lain tidak berubah

#### Test Case 4.3: Update dengan Invalid Time
**Request Body**:
```json
{
  "start": "2024-01-01T16:00:00.000Z",
  "finish": "2024-01-01T08:00:00.000Z"
}
```

**Expected Response**: 400 Bad Request
**Validation**:
- Error message: "Waktu start harus lebih awal dari waktu finish"
- Data tidak terupdate

### Scenario 5: Delete Barging Problem

#### Test Case 5.1: Delete dengan Valid ID
**Endpoint**: `DELETE /api/barging-problem/1`

**Expected Response**: 200 OK
**Validation**:
- Message: "Barging problem berhasil dihapus"
- Data: null
- Data di database tidak benar-benar dihapus (soft delete)

#### Test Case 5.2: Delete dengan Invalid ID
**Endpoint**: `DELETE /api/barging-problem/999`

**Expected Response**: 404 Not Found
**Validation**:
- Error message: "Barging problem tidak ditemukan"

## Performance Testing

### Load Testing
Test dengan jumlah request yang banyak untuk memastikan:
- Response time tetap konsisten
- Memory usage tidak membengkak
- Database connection pool berfungsi dengan baik

### Concurrent Testing
Test dengan multiple concurrent requests untuk memastikan:
- Tidak ada race condition
- Database transaction berfungsi dengan baik
- Lock mechanism berfungsi

## Security Testing

### Authentication Testing
- Test endpoint tanpa JWT token → 401 Unauthorized
- Test endpoint dengan invalid JWT token → 401 Unauthorized
- Test endpoint dengan expired JWT token → 401 Unauthorized

### Authorization Testing
- Test dengan user yang memiliki permission berbeda
- Test dengan user yang tidak memiliki permission

### Input Validation Testing
- Test dengan SQL injection attempts
- Test dengan XSS attempts
- Test dengan malformed JSON
- Test dengan oversized payload

## Database Testing

### Transaction Testing
- Test rollback ketika ada error
- Test commit ketika semua operasi berhasil
- Test dengan concurrent transactions

### Constraint Testing
- Test foreign key constraints
- Test unique constraints
- Test check constraints

## Error Handling Testing

### Network Error
- Test ketika database connection terputus
- Test ketika network timeout
- Test ketika service dependencies down

### Business Logic Error
- Test dengan data yang tidak valid
- Test dengan business rule violations
- Test dengan edge cases

## Monitoring & Logging

### Log Testing
- Pastikan semua operasi CRUD ter-log
- Pastikan error ter-log dengan detail yang cukup
- Pastikan performance metrics ter-log

### Metrics Testing
- Response time metrics
- Error rate metrics
- Database connection metrics

## Test Data Management

### Test Data Setup
```sql
-- Insert test data untuk barge
INSERT INTO m_barge (id, name, created_at, updated_at) VALUES 
(1, 'Barge Test 1', NOW(), NOW()),
(2, 'Barge Test 2', NOW(), NOW());

-- Insert test data untuk activities
INSERT INTO m_activities (id, name, created_at, updated_at) VALUES 
(1, 'Activity Test 1', NOW(), NOW()),
(2, 'Activity Test 2', NOW(), NOW());

-- Insert test data untuk sites
INSERT INTO m_sites (id, name, created_at, updated_at) VALUES 
(1, 'Site Test 1', NOW(), NOW()),
(2, 'Site Test 2', NOW(), NOW());
```

### Test Data Cleanup
```sql
-- Cleanup test data
DELETE FROM r_ccr_barging_problem WHERE remark LIKE '%Test%';
DELETE FROM m_barge WHERE name LIKE '%Test%';
DELETE FROM m_activities WHERE name LIKE '%Test%';
DELETE FROM m_sites WHERE name LIKE '%Test%';
```

## Automated Testing

### Unit Tests
```bash
npm run test src/modules/barging-problem
```

### E2E Tests
```bash
npm run test:e2e
```

### Integration Tests
```bash
npm run test:integration
```

## Reporting

### Test Results
- Test coverage report
- Performance metrics report
- Error rate report
- Security vulnerability report

### Documentation
- Test cases documentation
- Test results documentation
- Bug reports
- Performance analysis

## Continuous Testing

### CI/CD Pipeline
- Automated testing pada setiap commit
- Automated testing pada setiap deployment
- Automated security scanning
- Automated performance testing

### Monitoring
- Real-time monitoring aplikasi
- Real-time monitoring database
- Real-time monitoring performance
- Real-time monitoring errors
