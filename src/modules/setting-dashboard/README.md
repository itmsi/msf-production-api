# Setting Dashboard Module

Module ini menangani pengaturan dashboard dengan menyimpan konfigurasi cycle_time, fuel_ratio, dan speed.

## Struktur Database

### Tabel: m_setting_dashboard

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | int | Primary key, auto increment |
| cycle_time | float | Cycle time dalam menit (nullable) |
| fuel_ratio | float | Fuel ratio (0-1) (nullable) |
| speed | float | Speed dalam km/h (nullable) |
| createdAt | timestamp | Tanggal dibuat |
| createdBy | int | ID user yang membuat (nullable) |
| updatedAt | timestamp | Tanggal diupdate |
| updatedBy | int | ID user yang mengupdate (nullable) |
| deletedAt | timestamp | Tanggal dihapus (soft delete) |
| deletedBy | int | ID user yang menghapus (nullable) |

## Endpoints

### 1. POST /setting-dashboard
Membuat setting dashboard baru.

**Request Body:**
```json
{
  "cycle_time": 10.5,
  "fuel_ratio": 0.85,
  "speed": 25.0
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Setting dashboard berhasil dibuat",
  "data": {
    "id": 1,
    "cycle_time": 10.5,
    "fuel_ratio": 0.85,
    "speed": 25.0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. GET /setting-dashboard
Mendapatkan semua data setting dashboard dengan pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data setting dashboard berhasil diambil",
  "data": [
    {
      "id": 1,
      "cycle_time": 10.5,
      "fuel_ratio": 0.85,
      "speed": 25.0,
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

### 3. GET /setting-dashboard/:id
Mendapatkan data setting dashboard berdasarkan ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data setting dashboard berhasil diambil",
  "data": {
    "id": 1,
    "cycle_time": 10.5,
    "fuel_ratio": 0.85,
    "speed": 25.0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. PATCH /setting-dashboard/:id
Mengupdate data setting dashboard berdasarkan ID.

**Request Body:**
```json
{
  "cycle_time": 12.0,
  "fuel_ratio": 0.90
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Setting dashboard berhasil diupdate",
  "data": {
    "id": 1,
    "cycle_time": 12.0,
    "fuel_ratio": 0.90,
    "speed": 25.0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. DELETE /setting-dashboard/:id
Menghapus data setting dashboard berdasarkan ID (soft delete).

**Response:**
```json
{
  "statusCode": 200,
  "message": "Setting dashboard berhasil dihapus",
  "data": null
}
```

## Validasi

- Semua field bersifat optional
- Jika nilai diberikan, harus berupa angka positif
- cycle_time: float positif (dalam menit)
- fuel_ratio: float positif (0-1)
- speed: float positif (dalam km/h)

## Authentication

Semua endpoint memerlukan authentication dengan JWT token menggunakan `@ApiBearerAuth('jwt')`.

## Error Handling

- 400: Bad Request - Data tidak valid
- 401: Unauthorized - Token tidak valid
- 404: Not Found - Setting dashboard tidak ditemukan

## Contoh Penggunaan

### Membuat setting dashboard baru
```bash
curl -X POST http://localhost:3000/setting-dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cycle_time": 10.5,
    "fuel_ratio": 0.85,
    "speed": 25.0
  }'
```

### Mengambil semua data dengan pagination
```bash
curl -X GET "http://localhost:3000/setting-dashboard?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mengupdate data
```bash
curl -X PATCH http://localhost:3000/setting-dashboard/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cycle_time": 12.0
  }'
```

### Menghapus data
```bash
curl -X DELETE http://localhost:3000/setting-dashboard/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
