# Effective Working Hours - Swagger Documentation

## Overview
Module ini menyediakan API untuk mengelola data effective working hours yang disimpan dalam tabel `r_loss_time`. Data ini mencakup informasi tentang waktu kerja efektif, termasuk standby time dan breakdown time.

## Base URL
```
/api/effective-working-hours
```

## Authentication
Semua endpoint memerlukan JWT Bearer token yang dikirim melalui header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Create Effective Working Hours

### Endpoint
```
POST /api/effective-working-hours
```

### Description
Membuat record baru effective working hours dengan perhitungan durasi otomatis.

### Request Body
```json
{
  "dateActivity": "2024-01-15",
  "lossType": "STB",
  "shift": "DS",
  "populationId": 1,
  "activitiesId": 1,
  "description": "Standby karena hujan",
  "start": "2024-01-15T08:00:00Z",
  "end": "2024-01-15T10:00:00Z"
}
```

### Field Descriptions
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `dateActivity` | string | ✅ | Tanggal aktivitas (YYYY-MM-DD) | "2024-01-15" |
| `lossType` | enum | ✅ | Tipe loss: STB (StandBy) atau BD (BreakDown) | "STB" |
| `shift` | enum | ✅ | Shift: DS (Day Shift) atau NS (Night Shift) | "DS" |
| `populationId` | integer | ✅ | ID population/unit | 1 |
| `activitiesId` | integer | ✅ | ID aktivitas | 1 |
| `description` | string | ❌ | Deskripsi loss time | "Standby karena hujan" |
| `start` | string | ❌ | Waktu mulai (ISO 8601) | "2024-01-15T08:00:00Z" |
| `end` | string | ❌ | Waktu selesai (ISO 8601) | "2024-01-15T10:00:00Z" |

### Response (201 Created)
```json
{
  "statusCode": 201,
  "message": "Effective working hours created successfully",
  "data": {
    "id": 1,
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T10:00:00Z",
    "duration": 120,
    "createdAt": "2024-01-15T08:00:00Z",
    "updatedAt": "2024-01-15T08:00:00Z"
  }
}
```

### Example Requests

#### Standby Time
```bash
curl -X POST http://localhost:3000/api/effective-working-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T10:00:00Z"
  }'
```

#### Breakdown Time
```bash
curl -X POST http://localhost:3000/api/effective-working-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dateActivity": "2024-01-15",
    "lossType": "BD",
    "shift": "NS",
    "populationId": 2,
    "activitiesId": 2,
    "description": "Breakdown mesin",
    "start": "2024-01-15T20:00:00Z",
    "end": "2024-01-15T22:00:00Z"
  }'
```

---

## 2. Get All Effective Working Hours

### Endpoint
```
GET /api/effective-working-hours
```

### Description
Mengambil semua data effective working hours dengan fitur filtering, searching, dan pagination.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | string | ❌ | Tanggal mulai filter (YYYY-MM-DD) | "2024-01-01" |
| `endDate` | string | ❌ | Tanggal akhir filter (YYYY-MM-DD) | "2024-01-31" |
| `lossType` | enum | ❌ | Filter berdasarkan tipe loss | "STB" |
| `keyword` | string | ❌ | Keyword pencarian | "standby" |
| `page` | integer | ❌ | Nomor halaman (default: 1) | 1 |
| `limit` | integer | ❌ | Item per halaman (default: 10) | 10 |

### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "dateActivity": "2024-01-15",
      "lossType": "StandBy",
      "shift": "DS",
      "unit": "EXCAVATOR-HITACHI-EX1200",
      "activity": "Loading",
      "description": "Standby karena hujan",
      "start": "2024-01-15T08:00:00Z",
      "end": "2024-01-15T10:00:00Z",
      "duration": 120
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### Example Requests

#### Get All with Pagination
```bash
curl -X GET "http://localhost:3000/api/effective-working-hours?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Filter by Date Range
```bash
curl -X GET "http://localhost:3000/api/effective-working-hours?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Filter by Loss Type
```bash
curl -X GET "http://localhost:3000/api/effective-working-hours?lossType=STB" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Search by Keyword
```bash
curl -X GET "http://localhost:3000/api/effective-working-hours?keyword=standby" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Combined Filters
```bash
curl -X GET "http://localhost:3000/api/effective-working-hours?startDate=2024-01-01&endDate=2024-01-31&lossType=STB&keyword=standby&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Get Effective Working Hours by ID

### Endpoint
```
GET /api/effective-working-hours/{id}
```

### Description
Mengambil data effective working hours berdasarkan ID.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | integer | ✅ | ID effective working hours | 1 |

### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Effective working hours retrieved successfully",
  "data": {
    "id": 1,
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T10:00:00Z",
    "duration": 120,
    "createdAt": "2024-01-15T08:00:00Z",
    "updatedAt": "2024-01-15T08:00:00Z"
  }
}
```

### Example Request
```bash
curl -X GET http://localhost:3000/api/effective-working-hours/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Update Effective Working Hours

### Endpoint
```
PATCH /api/effective-working-hours/{id}
```

### Description
Mengupdate data effective working hours yang sudah ada. Durasi akan otomatis dihitung ulang jika start/end time diubah.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | integer | ✅ | ID effective working hours yang akan diupdate | 1 |

### Request Body
```json
{
  "description": "Standby karena hujan lebat",
  "end": "2024-01-15T11:00:00Z"
}
```

### Field Descriptions
Semua field bersifat optional dan hanya field yang diubah yang perlu dikirim.

### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Effective working hours updated successfully",
  "data": {
    "id": 1,
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan lebat",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T11:00:00Z",
    "duration": 180,
    "createdAt": "2024-01-15T08:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### Example Requests

#### Partial Update
```bash
curl -X PATCH http://localhost:3000/api/effective-working-hours/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Standby karena hujan lebat",
    "end": "2024-01-15T11:00:00Z"
  }'
```

#### Full Update
```bash
curl -X PATCH http://localhost:3000/api/effective-working-hours/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dateActivity": "2024-01-16",
    "lossType": "BD",
    "shift": "NS",
    "populationId": 3,
    "activitiesId": 3,
    "description": "Breakdown mesin baru",
    "start": "2024-01-16T18:00:00Z",
    "end": "2024-01-16T20:00:00Z"
  }'
```

---

## 5. Delete Effective Working Hours

### Endpoint
```
DELETE /api/effective-working-hours/{id}
```

### Description
Melakukan soft delete pada data effective working hours. Data tidak benar-benar dihapus dari database.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | integer | ✅ | ID effective working hours yang akan dihapus | 1 |

### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Effective working hours deleted successfully",
  "data": null
}
```

### Example Request
```bash
curl -X DELETE http://localhost:3000/api/effective-working-hours/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Data Models

### Enums

#### LossType
- `STB`: StandBy - Unit dalam keadaan standby
- `BD`: BreakDown - Unit dalam keadaan breakdown

#### Shift
- `DS`: Day Shift - Shift pagi/siang
- `NS`: Night Shift - Shift malam

### Response Format
Semua response mengikuti format standar:
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {...},
  "meta": {...} // Optional, untuk pagination
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Validation error message"],
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Effective working hours with ID 1 not found",
  "error": "Not Found"
}
```

---

## Features

### Auto Calculation
- Field `duration` otomatis dihitung dari selisih waktu `start` dan `end` dalam menit
- Perhitungan dilakukan saat create dan update

### Advanced Filtering
- Filter berdasarkan date range
- Filter berdasarkan loss type
- Keyword search di semua kolom relevan

### Pagination
- Default: 10 item per halaman
- Configurable limit
- Meta information dengan total, page, dan limit

### Soft Delete
- Data tidak benar-benar dihapus
- Menggunakan `deletedAt` timestamp

### Data Relations
- Join dengan tabel `m_population` untuk data unit
- Join dengan tabel `m_unit_type` untuk nama unit, type, dan model
- Join dengan tabel `m_activities` untuk nama aktivitas

---

## Notes

1. **Authentication**: Semua endpoint memerlukan JWT Bearer token
2. **Validation**: Input validation menggunakan class-validator
3. **Date Format**: Gunakan format ISO 8601 untuk datetime fields
4. **Duration**: Durasi otomatis dihitung dalam menit
5. **Soft Delete**: Data yang dihapus tetap tersimpan dengan flag `deletedAt`
6. **Relations**: Response include data dari tabel terkait untuk informasi lengkap
