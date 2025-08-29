# Swagger Examples - Barging Problem Module

## Overview
Dokumen ini berisi contoh-contoh penggunaan API Barging Problem melalui Swagger UI.

## Base URL
```
http://localhost:9526/api/barging-problem
```

## Authentication
Semua endpoint memerlukan JWT token yang valid. Gunakan header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. POST /api/barging-problem - Create Barging Problem

#### Request Body Examples

**Example 1: Data Lengkap dengan Site**
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

**Example 2: Data Tanpa Site (Nullable)**
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ns",
  "barge_id": 2,
  "activities_id": 2,
  "start": "2024-01-01T20:00:00.000Z",
  "finish": "2024-01-02T04:00:00.000Z",
  "remark": "Problem pada unit loader"
}
```

#### Response Examples

**Success (201)**
```json
{
  "statusCode": 201,
  "message": "Barging problem berhasil dibuat",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "barge_name": "Barge Kalimantan",
    "activities_id": 1,
    "activities_name": "Excavation",
    "site_id": 1,
    "site_name": "Site Jakarta",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "remark": "Problem pada unit excavator",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error (400) - Barge Not Found**
```json
{
  "statusCode": 400,
  "message": "Barge dengan ID tersebut tidak ditemukan"
}
```

### 2. GET /api/barging-problem - Get All Barging Problems

#### Query Parameters

**Basic Pagination**
```
GET /api/barging-problem?page=1&limit=10
```

**With Search**
```
GET /api/barging-problem?search=excavator&page=1&limit=5
```

**With Filters**
```
GET /api/barging-problem?shift=ds&barge_id=1&page=1&limit=10
```

**With Sorting**
```
GET /api/barging-problem?sortBy=createdAt&sortOrder=DESC&page=1&limit=10
```

**Complete Example**
```
GET /api/barging-problem?page=1&limit=20&search=problem&shift=ds&barge_id=1&activities_id=1&site_id=1&sortBy=activity_date&sortOrder=DESC
```

#### Response Example

**Success (200)**
```json
{
  "statusCode": 200,
  "message": "Data barging problem berhasil diambil",
  "data": [
    {
      "id": 1,
      "activity_date": "2024-01-01T00:00:00.000Z",
      "shift": "ds",
      "barge_id": 1,
      "barge_name": "Barge Kalimantan",
      "activities_id": 1,
      "activities_name": "Excavation",
      "site_id": 1,
      "site_name": "Site Jakarta",
      "start": "2024-01-01T08:00:00.000Z",
      "finish": "2024-01-01T16:00:00.000Z",
      "duration": 8.0,
      "remark": "Problem pada unit excavator",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "lastPage": 3
  }
}
```

### 3. GET /api/barging-problem/:id - Get Barging Problem by ID

#### Path Parameters
```
GET /api/barging-problem/1
```

#### Response Examples

**Success (200)**
```json
{
  "statusCode": 200,
  "message": "Data barging problem berhasil diambil",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "barge_name": "Barge Kalimantan",
    "activities_id": 1,
    "activities_name": "Excavation",
    "site_id": 1,
    "site_name": "Site Jakarta",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "remark": "Problem pada unit excavator",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Not Found (200)**
```json
{
  "statusCode": 200,
  "message": "Data tidak ditemukan",
  "data": null
}
```

### 4. PATCH /api/barging-problem/:id - Update Barging Problem

#### Path Parameters
```
PATCH /api/barging-problem/1
```

#### Request Body Examples

**Update Semua Field (Full Update)**
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

**Update Shift dan Remark Saja**
```json
{
  "shift": "ns",
  "remark": "Problem pada unit excavator - updated"
}
```

**Update Waktu Start dan Finish**
```json
{
  "start": "2024-01-01T09:00:00.000Z",
  "finish": "2024-01-01T17:00:00.000Z"
}
```

**Update Site ID dan Remark**
```json
{
  "site_id": 2,
  "remark": "Problem dipindah ke site lain"
}
```

#### Response Examples

**Success (200)**
```json
{
  "statusCode": 200,
  "message": "Barging problem berhasil diupdate",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ns",
    "barge_id": 1,
    "barge_name": "Barge Kalimantan",
    "activities_id": 1,
    "activities_name": "Excavation",
    "site_id": 1,
    "site_name": "Site Jakarta",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "remark": "Problem pada unit excavator - updated",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

**Error (400) - Invalid Time**
```json
{
  "statusCode": 400,
  "message": "Waktu start harus lebih awal dari waktu finish"
}
```

### 5. DELETE /api/barging-problem/:id - Delete Barging Problem

#### Path Parameters
```
DELETE /api/barging-problem/1
```

#### Response Examples

**Success (200)**
```json
{
  "statusCode": 200,
  "message": "Barging problem berhasil dihapus",
  "data": null
}
```

**Not Found (404)**
```json
{
  "statusCode": 404,
  "message": "Barging problem tidak ditemukan"
}
```

## Error Responses

### Common Error Patterns

**Validation Error (400)**
```json
{
  "statusCode": 400,
  "message": "Detail error message",
  "error": "Bad Request"
}
```

**Unauthorized (401)**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Not Found (404)**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

**Internal Server Error (500)**
```json
{
  "statusCode": 500,
  "message": "Internal server error message",
  "error": "Internal Server Error"
}
```

## Testing with cURL

### Create Barging Problem
```bash
curl -X POST "http://localhost:9526/api/barging-problem" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "activities_id": 1,
    "site_id": 1,
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "remark": "Problem pada unit excavator"
  }'
```

### Get All Barging Problems
```bash
curl -X GET "http://localhost:9526/api/barging-problem?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get by ID
```bash
curl -X GET "http://localhost:9526/api/barging-problem/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Barging Problem

**Update Semua Field (Full Update)**
```bash
curl -X PATCH "http://localhost:9526/api/barging-problem/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "activities_id": 1,
    "site_id": 1,
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "remark": "Problem pada unit excavator"
  }'
```

**Update Partial (Shift dan Remark saja)**
```bash
curl -X PATCH "http://localhost:9526/api/barging-problem/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift": "ns",
    "remark": "Updated remark"
  }'
```

### Delete Barging Problem
```bash
curl -X DELETE "http://localhost:9526/api/barging-problem/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

1. **Duration Calculation**: Field `duration` dihitung otomatis dari `start - finish` dan tidak bisa di-set manual
2. **Soft Delete**: Delete operation menggunakan soft delete (tidak menghapus data dari database)
3. **Validation**: Semua FK (barge_id, activities_id, site_id) divalidasi keberadaannya
4. **Time Validation**: Waktu `start` harus lebih awal dari waktu `finish`
5. **Pagination**: Limit maksimal adalah 100 data per halaman
6. **Search**: Pencarian dilakukan di field remark, barge name, activities name, dan site name
