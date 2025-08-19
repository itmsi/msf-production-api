# Unit Types API Documentation

## Overview

Unit Types API adalah endpoint untuk mengelola data unit type dalam sistem MSF Production. Unit type adalah kombinasi dari brand, unit, type, dan model yang membentuk identitas unik dari suatu unit. API ini mendukung operasi CRUD lengkap dengan fitur pagination, filtering, dan sorting.

**Base URL:** `http://localhost:3000/api/unit-types`

## Authentication

Semua endpoint memerlukan JWT token yang valid. Token harus dikirim dalam header Authorization:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All Unit Types

**GET** `/api/unit-types`

Mendapatkan semua data unit type dengan pagination, filtering, dan sorting.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | string | No | "1" | Nomor halaman |
| `limit` | string | No | "10" | Jumlah data per halaman (max: 100) |
| `search` | string | No | - | Pencarian umum di semua field |
| `brand_id` | string | No | - | Filter berdasarkan brand ID |
| `unit_name` | string | No | - | Filter berdasarkan nama unit |
| `type_name` | string | No | - | Filter berdasarkan tipe unit |
| `model_name` | string | No | - | Filter berdasarkan model unit |
| `sortBy` | string | No | "id" | Field untuk sorting |
| `sortOrder` | string | No | "DESC" | Urutan sorting (ASC/DESC) |

#### Valid Values

**Sort By Fields:**
- `id` - ID unit type
- `brand_id` - ID brand
- `unit_name` - Nama unit
- `type_name` - Tipe unit
- `model_name` - Model unit
- `createdAt` - Waktu pembuatan
- `updatedAt` - Waktu update terakhir

**Sort Order:**
- `ASC` - Ascending (A-Z, 0-9)
- `DESC` - Descending (Z-A, 9-0)

#### Example Request

```bash
GET /api/unit-types?page=1&limit=10&search=excavator&brand_id=1&sortBy=unit_name&sortOrder=ASC
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Data unit type berhasil diambil",
  "data": [
    {
      "id": 1,
      "brand_id": 1,
      "unit_name": "Excavator",
      "type_name": "Heavy Equipment",
      "model_name": "PC200-8",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "brand": {
        "id": 1,
        "brand_name": "Komatsu"
      }
    },
    {
      "id": 2,
      "brand_id": 1,
      "unit_name": "Excavator",
      "type_name": "Heavy Equipment",
      "model_name": "PC300-8",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "brand": {
        "id": 1,
        "brand_name": "Komatsu"
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

### 2. Get Unit Type by ID

**GET** `/api/unit-types/:id`

Mendapatkan data unit type berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID unit type |

#### Example Request

```bash
GET /api/unit-types/1
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Retrieve data success",
  "data": {
    "id": 1,
    "brand_id": 1,
    "unit_name": "Excavator",
    "type_name": "Heavy Equipment",
    "model_name": "PC200-8",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "brand": {
      "id": 1,
      "brand_name": "Komatsu"
    }
  }
}
```

### 3. Create Unit Type

**POST** `/api/unit-types`

Membuat unit type baru dengan validasi duplikasi kombinasi.

#### Request Body

```json
{
  "brand_id": 1,
  "unit_name": "Excavator",
  "type_name": "Heavy Equipment",
  "model_name": "PC200-8"
}
```

#### Field Validation

| Field | Type | Required | Min Length | Max Length | Min Value | Description |
|-------|------|----------|------------|------------|-----------|-------------|
| `brand_id` | number | Yes | - | - | 1 | ID dari brand yang terkait |
| `unit_name` | string | Yes | 1 | 100 | - | Nama unit yang akan dibuat |
| `type_name` | string | Yes | 1 | 100 | - | Tipe unit yang akan dibuat |
| `model_name` | string | Yes | 1 | 100 | - | Model unit yang akan dibuat |

#### Response Success (201)

```json
{
  "statusCode": 201,
  "message": "Unit type berhasil dibuat",
  "data": {
    "id": 1,
    "brand_id": 1,
    "unit_name": "Excavator",
    "type_name": "Heavy Equipment",
    "model_name": "PC200-8",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "brand": {
      "id": 1,
      "brand_name": "Komatsu"
    }
  }
}
```

### 4. Update Unit Type

**PUT** `/api/unit-types/:id`

Mengupdate data unit type berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID unit type yang akan diupdate |

#### Request Body

```json
{
  "unit_name": "Excavator Updated",
  "model_name": "PC200-8M"
}
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Unit type berhasil diupdate",
  "data": {
    "id": 1,
    "brand_id": 1,
    "unit_name": "Excavator Updated",
    "type_name": "Heavy Equipment",
    "model_name": "PC200-8M",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "brand": {
      "id": 1,
      "brand_name": "Komatsu"
    }
  }
}
```

### 5. Delete Unit Type

**DELETE** `/api/unit-types/:id`

Menghapus data unit type berdasarkan ID (soft delete).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID unit type yang akan dihapus |

#### Example Request

```bash
DELETE /api/unit-types/1
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Unit type berhasil dihapus",
  "data": null
}
```

## Error Responses

### Bad Request (400)

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": "brand_id should not be empty",
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
  "message": "Unit type tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)

**Duplicate Combination:**
```json
{
  "statusCode": 409,
  "message": "Unit type dengan kombinasi brand, unit, type, dan model yang sama sudah terdaftar",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Combination Used by Other Unit Type:**
```json
{
  "statusCode": 409,
  "message": "Unit type dengan kombinasi brand, unit, type, dan model yang sama sudah digunakan oleh unit type lain",
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

### CreateUnitTypeDto

```typescript
{
  brand_id: number;     // Required, min: 1
  unit_name: string;    // Required, min: 1, max: 100 chars
  type_name: string;    // Required, min: 1, max: 100 chars
  model_name: string;   // Required, min: 1, max: 100 chars
}
```

### UpdateUnitTypeDto

```typescript
{
  brand_id?: number;    // Optional, min: 1
  unit_name?: string;   // Optional, min: 1, max: 100 chars
  type_name?: string;   // Optional, min: 1, max: 100 chars
  model_name?: string;  // Optional, min: 1, max: 100 chars
}
```

### UnitTypeResponseDto

```typescript
{
  id: number;             // Primary key
  brand_id: number;       // Foreign key ke brand
  unit_name: string;      // Nama unit
  type_name: string;      // Tipe unit
  model_name: string;     // Model unit
  createdAt: Date;        // Waktu pembuatan
  updatedAt: Date;        // Waktu update terakhir
  brand?: BrandDto;       // Data brand yang terkait
}
```

### BrandDto

```typescript
{
  id: number;           // Primary key brand
  brand_name: string;   // Nama brand
}
```

### GetUnitTypesQueryDto

```typescript
{
  page?: string;          // Optional, default: "1"
  limit?: string;         // Optional, default: "10", max: "100"
  search?: string;        // Optional, search in all fields
  brand_id?: string;      // Optional, filter by brand ID
  unit_name?: string;     // Optional, filter by unit name
  type_name?: string;     // Optional, filter by type name
  model_name?: string;    // Optional, filter by model name
  sortBy?: string;        // Optional, default: "id"
  sortOrder?: 'ASC' | 'DESC'; // Optional, default: "DESC"
}
```

## Business Rules

1. **Kombinasi Unik**: Kombinasi brand_id, unit_name, type_name, dan model_name harus unik dalam sistem
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
3. **Brand Validation**: brand_id harus valid dan ada di tabel brand
4. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
5. **Pagination**: Limit maksimal adalah 100 data per halaman
6. **Search**: Pencarian dilakukan di field unit_name, type_name, model_name, dan brand_name
7. **Filtering**: Filter berdasarkan field tertentu dengan partial match
8. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi

## Examples

### Create Multiple Unit Types

```bash
# Create first unit type
curl -X POST http://localhost:3000/api/unit-types \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": 1, "unit_name": "Excavator", "type_name": "Heavy Equipment", "model_name": "PC200-8"}'

# Create second unit type
curl -X POST http://localhost:3000/api/unit-types \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": 1, "unit_name": "Excavator", "type_name": "Heavy Equipment", "model_name": "PC300-8"}'
```

### Search and Filter

```bash
# Search for unit types containing "excavator"
curl "http://localhost:3000/api/unit-types?search=excavator" \
  -H "Authorization: Bearer <jwt_token>"

# Filter by brand and sort by unit name
curl "http://localhost:3000/api/unit-types?brand_id=1&sortBy=unit_name&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Unit Type

```bash
curl -X PUT http://localhost:3000/api/unit-types/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"unit_name": "Excavator Updated", "model_name": "PC200-8M"}'
```

### Delete Unit Type

```bash
curl -X DELETE http://localhost:3000/api/unit-types/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `unit-type.controller.spec.ts`
- `unit-type.service.spec.ts`

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
- Relasi dengan brand menggunakan eager loading untuk performa
- Kombinasi brand_id, unit_name, type_name, dan model_name harus unik
- Validasi input menggunakan class-validator dengan constraint yang ketat
