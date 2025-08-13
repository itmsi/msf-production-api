# Unit Type Module

Module ini menangani operasi CRUD untuk unit type yang terkait dengan brand.

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete unit type
- **Pagination**: Mendukung pagination dengan parameter `page` dan `limit`
- **Search**: Pencarian umum di semua field yang relevan
- **Filtering**: Filter berdasarkan `brand_id`, `unit_name`, `type_name`, `model_name`
- **Sorting**: Sorting berdasarkan field tertentu dengan urutan ASC/DESC
- **Soft Delete**: Data tidak benar-benar dihapus dari database
- **Validation**: Validasi duplikasi kombinasi brand_id, unit_name, type_name, dan model_name

## Endpoints

### GET /unit-types
Mendapatkan semua data unit type dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Pencarian umum di semua field
- `brand_id` (optional): Filter berdasarkan brand ID
- `unit_name` (optional): Filter berdasarkan nama unit
- `type_name` (optional): Filter berdasarkan tipe unit
- `model_name` (optional): Filter berdasarkan model unit
- `sortBy` (optional): Field untuk sorting
- `sortOrder` (optional): Urutan sorting (ASC/DESC)

### GET /unit-types/:id
Mendapatkan data unit type berdasarkan ID.

### POST /unit-types
Membuat unit type baru.

**Request Body:**
```json
{
  "brand_id": 1,
  "unit_name": "Excavator",
  "type_name": "Heavy Equipment",
  "model_name": "PC200-8"
}
```

### PUT /unit-types/:id
Mengupdate data unit type berdasarkan ID.

**Request Body:**
```json
{
  "unit_name": "Excavator",
  "type_name": "Heavy Equipment",
  "model_name": "PC200-8M"
}
```

### DELETE /unit-types/:id
Menghapus data unit type berdasarkan ID (soft delete).

## Struktur Data

### UnitType Entity
- `id`: Primary key (auto-generated)
- `brand_id`: Foreign key ke tabel brand
- `unit_name`: Nama unit
- `type_name`: Tipe unit
- `model_name`: Model unit
- `createdAt`: Timestamp pembuatan
- `updatedAt`: Timestamp update
- `deletedAt`: Timestamp soft delete

### Relasi
- `brand`: Many-to-One dengan Brand entity

## Validasi

- Kombinasi `brand_id`, `unit_name`, `type_name`, dan `model_name` harus unik
- Semua field wajib diisi saat create
- Field `brand_id` harus valid (ada di tabel brand)

## Response Format

Semua response menggunakan format standar dengan struktur:
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {...},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

## Error Handling

- `400`: Bad Request - Data tidak valid
- `401`: Unauthorized - JWT token tidak valid
- `404`: Not Found - Unit type tidak ditemukan
- `409`: Conflict - Duplikasi data
- `500`: Internal Server Error - Kesalahan server

## Authentication

Semua endpoint memerlukan JWT authentication dengan header:
```
Authorization: Bearer <jwt_token>
```
