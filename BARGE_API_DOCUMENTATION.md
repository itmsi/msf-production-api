# Barge API Documentation

## Overview

Modul Barge menyediakan API untuk mengelola data barge (kapal tongkang) dalam sistem. Semua endpoint dilindungi dengan JWT Authentication dan mendukung operasi CRUD lengkap.

## Base URL

```
http://localhost:3000/barges
```

## Authentication

Semua endpoint memerlukan JWT token yang valid. Gunakan header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Barges

**GET** `/barges`

Mendapatkan semua data barge dengan pagination, filtering, dan sorting.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | string | No | "1" | Nomor halaman |
| `limit` | string | No | "10" | Jumlah data per halaman (max: 100) |
| `search` | string | No | - | Pencarian umum di field shipment, name, dan remarks |
| `shipment` | string | No | - | Filter berdasarkan nomor shipment |
| `name` | string | No | - | Filter berdasarkan nama barge |
| `minCapacity` | string | No | - | Filter berdasarkan kapasitas minimum |
| `maxCapacity` | string | No | - | Filter berdasarkan kapasitas maksimum |
| `sortBy` | string | No | "id" | Field untuk sorting |
| `sortOrder` | string | No | "DESC" | Urutan sorting (ASC/DESC) |

#### Allowed Sort Fields

- `id`
- `shipment`
- `name`
- `capacity`
- `createdAt`
- `updatedAt`

#### Example Request

```bash
GET /barges?page=1&limit=10&search=barge&sortBy=name&sortOrder=ASC
```

#### Response

**200 OK**

```json
{
  "statusCode": 200,
  "message": "Data barge berhasil diambil",
  "data": [
    {
      "id": 1,
      "shipment": "Barge-001",
      "name": "Barge Kalimantan",
      "capacity": 1000,
      "remarks": "Barge untuk pengangkutan batu bara",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1
    },
    {
      "id": 2,
      "shipment": "Barge-002",
      "name": "Barge Sumatra",
      "capacity": 1500,
      "remarks": "Barge untuk pengangkutan CPO",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**500 Internal Server Error**
```json
{
  "statusCode": 500,
  "message": "Gagal mengambil data barge",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get Barge by ID

**GET** `/barges/:id`

Mendapatkan data barge berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID barge |

#### Example Request

```bash
GET /barges/1
```

#### Response

**200 OK**

```json
{
  "statusCode": 200,
  "message": "Data barge berhasil diambil",
  "data": {
    "id": 1,
    "shipment": "Barge-001",
    "name": "Barge Kalimantan",
    "capacity": 1000,
    "remarks": "Barge untuk pengangkutan batu bara",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "ID harus berupa angka",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Barge tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Create Barge

**POST** `/barges`

Membuat data barge baru.

#### Request Body

```json
{
  "shipment": "Barge-001",
  "name": "Barge Kalimantan",
  "capacity": 1000,
  "remarks": "Barge untuk pengangkutan batu bara"
}
```

#### Field Validation

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `shipment` | string | No | Min length: 1, Max length: 255 |
| `name` | string | No | Min length: 1, Max length: 255 |
| `capacity` | number | No | Min: 1, Max: 999999 |
| `remarks` | string | No | No length restriction |

#### Example Request

```bash
POST /barges
Content-Type: application/json

{
  "shipment": "Barge-001",
  "name": "Barge Kalimantan",
  "capacity": 1000,
  "remarks": "Barge untuk pengangkutan batu bara"
}
```

#### Response

**201 Created**

```json
{
  "statusCode": 201,
  "message": "Barge berhasil dibuat",
  "data": {
    "id": 1,
    "shipment": "Barge-001",
    "name": "Barge Kalimantan",
    "capacity": 1000,
    "remarks": "Barge untuk pengangkutan batu bara",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Barge dengan shipment tersebut sudah ada",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 4. Update Barge

**PUT** `/barges/:id`

Mengupdate data barge yang sudah ada.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID barge |

#### Request Body

```json
{
  "name": "Barge Kalimantan Updated",
  "capacity": 1500,
  "remarks": "Barge untuk pengangkutan batu bara - Updated"
}
```

#### Example Request

```bash
PUT /barges/1
Content-Type: application/json

{
  "name": "Barge Kalimantan Updated",
  "capacity": 1500
}
```

#### Response

**200 OK**

```json
{
  "statusCode": 200,
  "message": "Barge berhasil diupdate",
  "data": {
    "id": 1,
    "shipment": "Barge-001",
    "name": "Barge Kalimantan Updated",
    "capacity": 1500,
    "remarks": "Barge untuk pengangkutan batu bara",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Barge dengan shipment tersebut sudah ada",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Barge tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Delete Barge

**DELETE** `/barges/:id`

Menghapus data barge secara soft delete.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID barge |

#### Example Request

```bash
DELETE /barges/1
```

#### Response

**200 OK**

```json
{
  "statusCode": 200,
  "message": "Barge berhasil dihapus",
  "data": null
}
```

#### Error Responses

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Barge tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 6. Restore Barge

**POST** `/barges/:id/restore`

Memulihkan data barge yang sudah di-soft delete.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID barge |

#### Example Request

```bash
POST /barges/1/restore
```

#### Response

**200 OK**

```json
{
  "statusCode": 200,
  "message": "Barge berhasil dipulihkan",
  "data": {
    "id": 1,
    "shipment": "Barge-001",
    "name": "Barge Kalimantan",
    "capacity": 1000,
    "remarks": "Barge untuk pengangkutan batu bara",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Barge tidak ditemukan atau tidak dalam status deleted",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Data Models

### Barge Entity

```typescript
interface Barge {
  id: number;
  shipment: string;
  name: string;
  capacity: number;
  remarks: string;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  deletedAt: Date | null;
  deletedBy: number | null;
}
```

### Create Barge DTO

```typescript
interface CreateBargeDto {
  shipment?: string;
  name?: string;
  capacity?: number;
  remarks?: string;
}
```

### Update Barge DTO

```typescript
interface UpdateBargeDto {
  shipment?: string;
  name?: string;
  capacity?: number;
  remarks?: string;
}
```

### Query DTO

```typescript
interface GetBargesQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  shipment?: string;
  name?: string;
  minCapacity?: string;
  maxCapacity?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

## Business Rules

1. **Shipment Uniqueness**: Shipment harus unik untuk barge yang aktif (tidak di-soft delete)
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya ditandai sebagai deleted
3. **Audit Trail**: Semua operasi mencatat user yang melakukan dan waktu operasi
4. **Capacity Validation**: Kapasitas harus dalam range 1-999999 ton
5. **String Validation**: String fields memiliki batasan panjang untuk konsistensi data

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error atau business rule violation |
| 401 | Unauthorized - JWT token tidak valid atau tidak ada |
| 404 | Not Found - Data tidak ditemukan |
| 500 | Internal Server Error - Kesalahan server |

## Rate Limiting

Tidak ada rate limiting khusus untuk endpoint ini. Rate limiting diatur di level aplikasi.

## Caching

Tidak ada caching khusus untuk endpoint ini. Caching diatur di level aplikasi atau database.

## Testing

Untuk testing, gunakan endpoint yang sama dengan menambahkan environment variable yang sesuai atau menggunakan test database.

## Support

Jika ada pertanyaan atau masalah dengan API ini, silakan hubungi tim development atau buat issue di repository.
