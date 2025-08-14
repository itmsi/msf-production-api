# Activities Module

Module ini menangani operasi CRUD untuk entitas Activities yang tersimpan di tabel `m_activities`.

## Fitur

- **Create**: Membuat aktivitas baru dengan validasi duplikasi nama
- **Read**: Mengambil data aktivitas dengan pagination, filtering, dan sorting
- **Update**: Mengupdate data aktivitas dengan validasi duplikasi nama
- **Delete**: Soft delete aktivitas (data tidak benar-benar dihapus)

## Endpoints

### GET /activities
Mendapatkan semua data aktivitas dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian umum di semua field
- `name`: Filter berdasarkan nama aktivitas
- `status`: Filter berdasarkan status aktivitas
- `sortBy`: Field untuk sorting (id, name, status, createdAt, updatedAt)
- `sortOrder`: Urutan sorting (ASC atau DESC)

### GET /activities/:id
Mendapatkan data aktivitas berdasarkan ID.

### POST /activities
Membuat aktivitas baru.

**Request Body:**
```json
{
  "name": "Loading Barge",
  "status": "active"
}
```

### PUT /activities/:id
Mengupdate data aktivitas berdasarkan ID.

**Request Body:**
```json
{
  "name": "Loading Barge Updated",
  "status": "inactive"
}
```

### DELETE /activities/:id
Menghapus aktivitas berdasarkan ID (soft delete).

## Validasi

- Nama aktivitas tidak boleh kosong
- Status aktivitas tidak boleh kosong
- Nama aktivitas harus unik (tidak boleh duplikat)

## Response Format

Semua endpoint mengembalikan response dalam format yang konsisten:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

## Error Handling

- **400**: Bad Request - Data tidak valid
- **401**: Unauthorized - JWT token tidak valid
- **404**: Not Found - Aktivitas tidak ditemukan
- **409**: Conflict - Nama aktivitas sudah terdaftar
- **500**: Internal Server Error - Kesalahan server

## Authentication

Semua endpoint memerlukan JWT authentication melalui `JwtAuthGuard`.
