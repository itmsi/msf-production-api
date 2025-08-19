# Brand Module

Modul ini menangani manajemen brand dalam sistem MSF Production. Brand adalah merek atau nama perusahaan yang memproduksi unit atau peralatan.

## Endpoints

### 1. GET /api/brands

Mendapatkan semua data brand dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Pencarian umum di field brand_name
- `brand_name` (optional): Filter berdasarkan nama brand (partial match)
- `sortBy` (optional): Field untuk sorting (id, brand_name, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/brands?page=1&limit=10&search=toyota&sortBy=brand_name&sortOrder=ASC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Data brand berhasil diambil",
  "data": [
    {
      "id": 1,
      "brand_name": "Toyota",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "brand_name": "Honda",
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

### 2. GET /api/brands/:id

Mendapatkan data brand berdasarkan ID.

**Path Parameters:**
- `id`: ID brand (number)

**Contoh Request:**
```bash
GET /api/brands/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Retrieve data success",
  "data": {
    "id": 1,
    "brand_name": "Toyota",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. POST /api/brands

Membuat brand baru dengan validasi duplikasi brand_name.

**Request Body:**
```json
{
  "brand_name": "Toyota"
}
```

**Field Validation:**
- `brand_name`: String, required, min: 1, max: 100 karakter

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Brand berhasil dibuat",
  "data": {
    "id": 1,
    "brand_name": "Toyota",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. PUT /api/brands/:id

Mengupdate data brand berdasarkan ID.

**Path Parameters:**
- `id`: ID brand yang akan diupdate (number)

**Request Body:**
```json
{
  "brand_name": "Toyota Motor"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Brand berhasil diupdate",
  "data": {
    "id": 1,
    "brand_name": "Toyota Motor",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. DELETE /api/brands/:id

Menghapus data brand berdasarkan ID (soft delete).

**Path Parameters:**
- `id`: ID brand yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/brands/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Brand berhasil dihapus",
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
  "message": "Brand tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Brand name sudah terdaftar",
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

### Brand Entity
```typescript
{
  id: number;           // Primary key, auto increment
  brand_name: string;   // Nama brand (max 100 karakter)
  createdAt: Date;      // Timestamp pembuatan
  updatedAt: Date;      // Timestamp update terakhir
  deletedAt: Date;      // Timestamp soft delete (nullable)
}
```

## Business Rules

1. **Nama Unik**: Nama brand harus unik dalam sistem
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Search**: Pencarian dilakukan di field brand_name
6. **Filtering**: Filter berdasarkan brand_name dengan partial match
7. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi

## Examples

### Create Multiple Brands

```bash
# Create first brand
curl -X POST http://localhost:3000/api/brands \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"brand_name": "Toyota"}'

# Create second brand
curl -X POST http://localhost:3000/api/brands \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"brand_name": "Honda"}'
```

### Search and Filter

```bash
# Search for brands containing "toyota"
curl "http://localhost:3000/api/brands?search=toyota" \
  -H "Authorization: Bearer <jwt_token>"

# Filter by brand name and sort by name
curl "http://localhost:3000/api/brands?brand_name=toyota&sortBy=brand_name&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Brand

```bash
curl -X PUT http://localhost:3000/api/brands/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"brand_name": "Toyota Motor"}'
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `brand.controller.spec.ts`
- `brand.service.spec.ts`

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
- Brand name harus unik untuk menghindari duplikasi
