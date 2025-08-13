# Brand Module

Module ini menangani operasi CRUD untuk entitas Brand yang tersimpan di tabel `m_brand`.

## Fitur

- **Create**: Membuat brand baru dengan validasi duplikasi
- **Read**: Mengambil data brand dengan pagination, filtering, dan sorting
- **Update**: Mengupdate data brand dengan validasi duplikasi
- **Delete**: Soft delete data brand

## Endpoints

### GET /brands
Mendapatkan semua data brand dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page`: Halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian umum di semua field
- `brand_name`: Filter berdasarkan nama brand (partial match)
- `sortBy`: Field untuk sorting (id, brand_name, createdAt, updatedAt) (default: id)
- `sortOrder`: Urutan sorting (ASC/DESC) (default: DESC)

**Contoh Curl:**
```bash
curl -X 'GET' \
  'http://localhost:9526/api/brands?page=1&limit=10&search=toyota&brand_name=toyota&sortBy=brand_name&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <jwt_token>'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data brand berhasil diambil",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  }
}
```

### GET /brands/:id
Mendapatkan data brand berdasarkan ID.

**Response:**
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

### POST /brands
Membuat brand baru.

**Request Body:**
```json
{
  "brand_name": "Toyota"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Brand berhasil dibuat",
  "data": {
    "id": 1,
    "brand_name": "Toyota",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /brands/:id
Mengupdate data brand berdasarkan ID.

**Request Body:**
```json
{
  "brand_name": "Toyota Motor"
}
```

**Response:**
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

### DELETE /brands/:id
Menghapus data brand berdasarkan ID (soft delete).

**Response:**
```json
{
  "statusCode": 200,
  "message": "Brand berhasil dihapus",
  "data": null
}
```

## Validasi

- Brand name tidak boleh kosong
- Brand name harus berupa string
- Brand name tidak boleh duplikat
- Semua endpoint memerlukan JWT authentication

## Response Status Codes

### Success Responses:
- **200**: OK - Data berhasil diambil/diupdate/dihapus
- **201**: Created - Brand berhasil dibuat

### Error Responses:
- **400**: Bad Request - Parameter tidak valid atau data tidak lengkap
- **401**: Unauthorized - JWT token tidak valid atau tidak ada
- **404**: Not Found - Brand tidak ditemukan
- **409**: Conflict - Brand name sudah terdaftar atau digunakan
- **500**: Internal Server Error - Terjadi kesalahan pada server

## Contoh Response untuk Setiap Status Code

### 200 OK - Get All Brands
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
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 201 Created - Create Brand
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

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "brand_name should not be empty",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Brand tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Brand name sudah terdaftar",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Database

Data disimpan di tabel `m_brand` dengan struktur:
- `id`: Primary key (auto increment)
- `brand_name`: Nama brand (varchar 100, not null)
- `createdAt`: Timestamp pembuatan
- `updatedAt`: Timestamp update
- `deletedAt`: Timestamp soft delete
