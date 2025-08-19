# Activities API Documentation

## Overview

Activities API adalah endpoint untuk mengelola data aktivitas dalam sistem MSF Production. API ini mendukung operasi CRUD lengkap dengan fitur pagination, filtering, dan sorting.

**Base URL:** `http://localhost:3000/api/activities`

## Authentication

Semua endpoint memerlukan JWT token yang valid. Token harus dikirim dalam header Authorization:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All Activities

**GET** `/api/activities`

Mendapatkan semua data aktivitas dengan pagination, filtering, dan sorting.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | string | No | "1" | Nomor halaman |
| `limit` | string | No | "10" | Jumlah data per halaman (max: 100) |
| `search` | string | No | - | Pencarian umum di semua field |
| `name` | string | No | - | Filter berdasarkan nama aktivitas |
| `status` | string | No | - | Filter berdasarkan status aktivitas |
| `sortBy` | string | No | "id" | Field untuk sorting |
| `sortOrder` | string | No | "DESC" | Urutan sorting (ASC/DESC) |

#### Valid Values

**Status:**
- `active` - Aktivitas aktif
- `inactive` - Aktivitas tidak aktif  
- `pending` - Aktivitas dalam status pending

**Sort By Fields:**
- `id` - ID aktivitas
- `name` - Nama aktivitas
- `status` - Status aktivitas
- `createdAt` - Waktu pembuatan
- `updatedAt` - Waktu update terakhir

**Sort Order:**
- `ASC` - Ascending (A-Z, 0-9)
- `DESC` - Descending (Z-A, 9-0)

#### Example Request

```bash
GET /api/activities?page=1&limit=10&search=loading&status=active&sortBy=name&sortOrder=ASC
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Data aktivitas berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Loading Barge",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Unloading Barge",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

### 2. Get Activity by ID

**GET** `/api/activities/:id`

Mendapatkan data aktivitas berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID aktivitas |

#### Example Request

```bash
GET /api/activities/1
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Retrieve data success",
  "data": {
    "id": 1,
    "name": "Loading Barge",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Create Activity

**POST** `/api/activities`

Membuat aktivitas baru dengan validasi duplikasi name.

#### Request Body

```json
{
  "name": "Loading Barge",
  "status": "active"
}
```

#### Field Validation

| Field | Type | Required | Max Length | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `name` | string | Yes | 255 | - | Nama aktivitas (harus unik) |
| `status` | enum | Yes | - | "active" | Status aktivitas |

#### Response Success (201)

```json
{
  "statusCode": 201,
  "message": "Aktivitas berhasil dibuat",
  "data": {
    "id": 1,
    "name": "Loading Barge",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Activity

**PUT** `/api/activities/:id`

Mengupdate data aktivitas dengan validasi duplikasi name.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID aktivitas yang akan diupdate |

#### Request Body

```json
{
  "name": "Loading Barge Updated",
  "status": "inactive"
}
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Aktivitas berhasil diupdate",
  "data": {
    "id": 1,
    "name": "Loading Barge Updated",
    "status": "inactive",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete Activity

**DELETE** `/api/activities/:id`

Menghapus data aktivitas berdasarkan ID (soft delete).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID aktivitas yang akan dihapus |

#### Example Request

```bash
DELETE /api/activities/1
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Aktivitas berhasil dihapus",
  "data": null
}
```

## Error Responses

### Bad Request (400)

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": "name should not be empty",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Invalid ID:**
```json
{
  "statusCode": 400,
  "message": "ID harus berupa angka",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Limit Exceeded:**
```json
{
  "statusCode": 400,
  "message": "Limit tidak boleh lebih dari 100",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Unauthorized (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Not Found (404)

```json
{
  "statusCode": 404,
  "message": "Aktivitas tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)

**Duplicate Name:**
```json
{
  "statusCode": 409,
  "message": "Nama aktivitas sudah terdaftar",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Name Used by Other Activity:**
```json
{
  "statusCode": 409,
  "message": "Nama aktivitas Loading Barge Updated sudah digunakan oleh aktivitas lain",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Internal Server Error (500)

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Data Models

### CreateActivitiesDto

```typescript
{
  name: string;           // Required, max 255 chars
  status: ActivityStatus; // Required, enum: active, inactive, pending
}
```

### UpdateActivitiesDto

```typescript
{
  name: string;           // Required, max 255 chars
  status: ActivityStatus; // Required, enum: active, inactive, pending
}
```

### ActivitiesResponseDto

```typescript
{
  id: number;             // Primary key
  name: string;           // Nama aktivitas
  status: ActivityStatus; // Status aktivitas
  createdAt: Date;        // Waktu pembuatan
  updatedAt: Date;        // Waktu update terakhir
}
```

### GetActivitiesQueryDto

```typescript
{
  page?: string;          // Optional, default: "1"
  limit?: string;         // Optional, default: "10", max: "100"
  search?: string;        // Optional, search in all fields
  name?: string;          // Optional, filter by name
  status?: ActivityStatus; // Optional, filter by status
  sortBy?: string;        // Optional, default: "id"
  sortOrder?: 'ASC' | 'DESC'; // Optional, default: "DESC"
}
```

## Business Rules

1. **Nama Unik**: Nama aktivitas harus unik dalam sistem
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
3. **Default Status**: Status default untuk aktivitas baru adalah 'active'
4. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
5. **Pagination**: Limit maksimal adalah 100 data per halaman
6. **Search**: Pencarian dilakukan di field name dan status
7. **Filtering**: Filter berdasarkan name (partial match) dan status (exact match)
8. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi

## Examples

### Create Multiple Activities

```bash
# Create first activity
curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Loading Barge", "status": "active"}'

# Create second activity
curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Unloading Barge", "status": "active"}'
```

### Search and Filter

```bash
# Search for activities containing "barge"
curl "http://localhost:3000/api/activities?search=barge" \
  -H "Authorization: Bearer <jwt_token>"

# Filter by status and sort by name
curl "http://localhost:3000/api/activities?status=active&sortBy=name&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Activity

```bash
curl -X PUT http://localhost:3000/api/activities/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Loading Barge Updated", "status": "inactive"}'
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `activities.controller.spec.ts`
- `activities.service.spec.ts`

## Dependencies

- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - Swagger documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation

## Notes

- Semua endpoint menggunakan JWT authentication
- Data yang di-soft delete tidak akan muncul di query findAll
- Timestamp menggunakan format ISO 8601
- Response format konsisten untuk semua endpoint
- Error handling terstandarisasi dengan format yang sama
