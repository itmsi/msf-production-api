# Modul Department

Modul ini menyediakan fungsionalitas untuk mengelola data department dalam sistem.

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete data department
- **Soft Delete**: Data tidak benar-benar dihapus dari database
- **Pagination**: Mendukung pagination untuk data yang banyak
- **Filtering**: Filter berdasarkan nama department
- **Search**: Pencarian berdasarkan nama department
- **Sorting**: Sorting berdasarkan field tertentu dengan urutan ASC/DESC
- **Validation**: Validasi input data dengan class-validator
- **Swagger Documentation**: Dokumentasi API yang lengkap

## Struktur Database

Tabel `m_departments` memiliki field berikut:

- `id`: Primary key auto increment
- `name`: Nama department (varchar 255, not null)
- `createdAt`: Waktu pembuatan (timestamp)
- `updatedAt`: Waktu update (timestamp)
- `deletedAt`: Waktu soft delete (timestamp, nullable)

## Endpoint API

### 1. GET /departments
Mendapatkan semua data department dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian berdasarkan nama department
- `sortBy`: Field untuk sorting (id, name, createdAt, updatedAt)
- `sortOrder`: Urutan sorting (ASC, DESC)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data department berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Human Resources",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### 2. GET /departments/:id
Mendapatkan data department berdasarkan ID.

**Path Parameters:**
- `id`: ID department (number)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Department berhasil diambil",
  "data": {
    "id": 1,
    "name": "Human Resources",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
}
```

### 3. POST /departments
Membuat data department baru.

**Request Body:**
```json
{
  "name": "Human Resources"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Department berhasil dibuat",
  "data": {
    "id": 1,
    "name": "Human Resources",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z"
  }
}
```

### 4. PATCH /departments/:id
Memperbarui data department yang sudah ada.

**Path Parameters:**
- `id`: ID department (number)

**Request Body:**
```json
{
  "name": "Human Resources Updated"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Department berhasil diperbarui",
  "data": {
    "id": 1,
    "name": "Human Resources Updated",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. DELETE /departments/:id
Menghapus data department (soft delete).

**Path Parameters:**
- `id`: ID department (number)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Department berhasil dihapus",
  "data": null
}
```

## Validasi

- **name**: Wajib diisi, maksimal 255 karakter, harus berupa string
- **page**: Minimal 1, harus berupa angka
- **limit**: Minimal 1, maksimal 100, harus berupa angka
- **sortBy**: Hanya boleh field yang diizinkan (id, name, createdAt, updatedAt)
- **sortOrder**: Hanya boleh ASC atau DESC

## Error Handling

- **400**: Bad Request - Validasi error
- **401**: Unauthorized - Token tidak valid
- **404**: Not Found - Department tidak ditemukan
- **409**: Conflict - Department dengan nama tersebut sudah ada
- **500**: Internal Server Error - Error server

## Contoh Penggunaan

### Membuat Department Baru
```bash
curl -X POST 'http://localhost:9526/api/departments' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name": "IT Department"}'
```

### Mengambil Semua Department
```bash
curl -X GET 'http://localhost:9526/api/departments?page=1&limit=10&search=IT' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Mengambil Department Berdasarkan ID
```bash
curl -X GET 'http://localhost:9526/api/departments/1' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Memperbarui Department
```bash
curl -X PATCH 'http://localhost:9526/api/departments/1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"name": "IT Department Updated"}'
```

### Menghapus Department
```bash
curl -X DELETE 'http://localhost:9526/api/departments/1' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```
