# Activities Module

Modul ini menangani manajemen aktivitas dalam sistem MSF Production.

## Endpoints

### 1. GET /api/activities

Mendapatkan semua data aktivitas dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Pencarian umum di semua field (name dan status)
- `name` (optional): Filter berdasarkan nama aktivitas (partial match)
- `status` (optional): Filter berdasarkan status aktivitas (active, inactive, pending)
- `sortBy` (optional): Field untuk sorting (id, name, status, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/activities?page=1&limit=10&search=loading&status=active&sortBy=name&sortOrder=ASC
```

**Response Success (200):**
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
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 2. GET /api/activities/:id

Mendapatkan data aktivitas berdasarkan ID.

**Path Parameters:**
- `id`: ID aktivitas (number)

**Contoh Request:**
```bash
GET /api/activities/1
```

**Response Success (200):**
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

### 3. POST /api/activities

Membuat aktivitas baru.

**Request Body:**
```json
{
  "name": "Loading Barge",
  "status": "active"
}
```

**Field Validation:**
- `name`: String, required, max 255 karakter
- `status`: Enum (active, inactive, pending), default: active

**Response Success (201):**
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

### 4. PUT /api/activities/:id

Mengupdate data aktivitas berdasarkan ID.

**Path Parameters:**
- `id`: ID aktivitas (number)

**Request Body:**
```json
{
  "name": "Loading Barge Updated",
  "status": "inactive"
}
```

**Response Success (200):**
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

### 5. DELETE /api/activities/:id

Menghapus data aktivitas berdasarkan ID (soft delete).

**Path Parameters:**
- `id`: ID aktivitas (number)

**Contoh Request:**
```bash
DELETE /api/activities/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Aktivitas berhasil dihapus",
  "data": null
}
```

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
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
```json
{
  "statusCode": 409,
  "message": "Nama aktivitas sudah terdaftar",
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

## Authentication

Semua endpoint memerlukan JWT token yang valid. Token harus dikirim dalam header Authorization:

```
Authorization: Bearer <jwt_token>
```

## Data Model

### Activities Entity
```typescript
{
  id: number;           // Primary key, auto increment
  name: string;         // Nama aktivitas (max 255 karakter)
  status: string;       // Status aktivitas (active, inactive, pending)
  createdAt: Date;      // Timestamp pembuatan
  updatedAt: Date;      // Timestamp update terakhir
  deletedAt: Date;      // Timestamp soft delete (nullable)
}
```

### Status Values
- `active`: Aktivitas aktif
- `inactive`: Aktivitas tidak aktif
- `pending`: Aktivitas dalam status pending

## Business Rules

1. **Nama Unik**: Nama aktivitas harus unik dalam sistem
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
3. **Default Status**: Status default untuk aktivitas baru adalah 'active'
4. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
5. **Pagination**: Limit maksimal adalah 100 data per halaman

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `activities.controller.spec.ts`
- `activities.service.spec.ts`

## Dependencies

- `@nestjs/common`
- `@nestjs/typeorm`
- `@nestjs/swagger`
- `class-validator`
- `class-transformer`
