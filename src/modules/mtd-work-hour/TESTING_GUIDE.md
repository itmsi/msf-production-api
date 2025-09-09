# MTD Work Hour Module Testing Guide

## Overview
Panduan ini menjelaskan cara melakukan testing untuk module MTD Work Hour yang telah dibuat.

## Prerequisites
1. Pastikan aplikasi sudah berjalan
2. Pastikan database sudah terhubung
3. Pastikan JWT token sudah tersedia untuk authentication

## Testing Endpoints

### 1. Test Get MTD Work Hour Data

#### Test Case 1: Get All Data
```bash
curl -X GET "http://localhost:3000/mtd-work-hour" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Array of MTD Work Hour data
- Meta: Pagination information

#### Test Case 2: Get Data with Date Filter
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Filtered data based on date range
- Meta: Pagination information

#### Test Case 3: Get Data with Unit Filter
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?unit=DT-001" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Filtered data for specific unit
- Meta: Pagination information

#### Test Case 4: Get Data with Problem Type Filter
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?problemType=P5M" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Filtered data for specific problem type
- Meta: Pagination information

#### Test Case 5: Get Data with Pagination
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?page=1&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Limited data based on pagination
- Meta: Correct pagination information

### 2. Test Get MTD Work Hour by Problem Type

#### Test Case 1: Get P5M Data
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/by-problem-type?problemType=P5M" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Array of P5M data
- Meta: Pagination information

#### Test Case 2: Get GST Data with Date Filter
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/by-problem-type?problemType=GST&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: GST data filtered by date range
- Meta: Pagination information

#### Test Case 3: Missing Problem Type (Error Case)
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/by-problem-type" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 400
- Message: "Gagal mendapatkan data: Problem type harus diisi"

### 3. Test Get MTD Work Hour Summary

#### Test Case 1: Get Summary All Data
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/summary" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Summary data grouped by problem type
- Message: "Summary data berhasil diambil"

#### Test Case 2: Get Summary with Date Filter
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Summary data filtered by date range
- Message: "Summary data berhasil diambil"

#### Test Case 3: Get Summary with Unit Filter
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/summary?unit=DT-001" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Summary data for specific unit
- Message: "Summary data berhasil diambil"

### 4. Test Get Problem Types

#### Test Case 1: Get Available Problem Types
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/problem-types" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Data: Array of available problem types
- Message: "Daftar jenis problem berhasil diambil"

## Error Testing

### 1. Test Unauthorized Access
```bash
curl -X GET "http://localhost:3000/mtd-work-hour" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 401
- Message: "Unauthorized"

### 2. Test Invalid Date Format
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?startDate=invalid-date" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 400
- Message: Error related to invalid date format

### 3. Test Invalid Problem Type
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/by-problem-type?problemType=INVALID" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 400
- Message: Error related to invalid problem type

## Performance Testing

### 1. Test Large Dataset
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?limit=100" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Response time: < 2 seconds
- Data: Up to 100 records

### 2. Test Date Range Performance
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?startDate=2023-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Status: 200
- Response time: < 5 seconds
- Data: All data within date range

## Data Validation Testing

### 1. Test Response Structure
Pastikan setiap response memiliki struktur yang benar:
- `statusCode`: number
- `message`: string
- `data`: array atau object
- `meta`: object (untuk paginated responses)

### 2. Test Data Types
Pastikan data types sesuai dengan yang diharapkan:
- `unit`: string
- `activityDate`: string (YYYY-MM-DD format)
- `problemType`: string
- `duration`: number
- `description`: string atau null

### 3. Test Pagination
Pastikan pagination bekerja dengan benar:
- `total`: number
- `page`: number
- `limit`: number
- `totalPages`: number

## Integration Testing

### 1. Test with Real Database
Pastikan module dapat mengambil data dari database yang sebenarnya:
- Data dari tabel `m_population`
- Data dari tabel `r_loss_time`
- Data dari tabel `m_activities`

### 2. Test Data Relationships
Pastikan relasi antar tabel bekerja dengan benar:
- Population → Effective Working Hours
- Activities → Effective Working Hours

## Monitoring and Logging

### 1. Check Application Logs
Pastikan tidak ada error dalam aplikasi logs saat testing.

### 2. Check Database Performance
Monitor query performance untuk memastikan tidak ada query yang lambat.

### 3. Check Memory Usage
Monitor memory usage saat melakukan testing dengan dataset besar.

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Pastikan JWT token valid
2. **400 Bad Request**: Periksa format parameter
3. **500 Internal Server Error**: Periksa database connection
4. **Empty Data**: Periksa apakah ada data di database

### Debug Steps
1. Check database connection
2. Verify table existence
3. Check data availability
4. Review application logs
5. Test with smaller dataset
