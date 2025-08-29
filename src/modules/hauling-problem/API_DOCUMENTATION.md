# Hauling Problem Module API Documentation

Modul ini menangani operasi CRUD untuk data hauling problem yang tersimpan di tabel `r_ccr_hauling_problem`.

## Fitur

- **Create**: Membuat data hauling problem baru
- **Read**: Mengambil data hauling problem dengan pagination dan filter
- **Update**: Mengupdate data hauling problem yang ada
- **Delete**: Menghapus data hauling problem (soft delete)
- **Authentication**: Menggunakan JWT Bearer Token
- **Validation**: Validasi lengkap untuk semua input
- **Auto Calculation**: Durasi otomatis dihitung dari start - finish

## Struktur Data

### Input (POST/PATCH)
- `activity_date`: Tanggal aktivitas (date format: YYYY-MM-DD)
- `shift`: Shift kerja (enum: 'ds' atau 'ns')
- `activities_id`: FK ke tabel m_activities (validasi: harus ada di tabel m_activities)
- `start`: Waktu mulai (timestamp format: ISO 8601)
- `finish`: Waktu selesai (timestamp format: ISO 8601)
- `duration`: **TIDAK PERLU DI BODY REQUEST** - otomatis dihitung dari start - finish
- `site_id`: FK ke tabel m_sites (validasi: harus ada di tabel m_sites)
- `remark`: Catatan tambahan (optional)

### Output (Response)
- Semua field input ditampilkan
- `activities_name`: Nama aktivitas (dari join dengan tabel m_activities)
- `site_name`: Nama site (dari join dengan tabel m_sites)
- `duration`: Durasi dalam jam (otomatis dihitung)

## Endpoints

### 1. POST `/api/hauling-problem`
Membuat data hauling problem baru.
**Authentication**: JWT Bearer Token required

**Request Body:**
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ds",
  "activities_id": 1,
  "start": "2024-01-01T08:00:00.000Z",
  "finish": "2024-01-01T16:00:00.000Z",
  "site_id": 1,
  "remark": "Problem pada unit excavator"
}
```

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Data hauling problem berhasil dibuat",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "activities_id": 1,
    "activities_name": "Excavation",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "site_id": 1,
    "site_name": "Site Jakarta",
    "remark": "Problem pada unit excavator",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. GET `/api/hauling-problem`
Mengambil semua data hauling problem dengan pagination dan filter.
**Authentication**: JWT Bearer Token required

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `activity_date`: Filter berdasarkan tanggal aktivitas (format: YYYY-MM-DD)
- `start_date`: Filter berdasarkan tanggal mulai aktivitas (format: YYYY-MM-DD)
- `end_date`: Filter berdasarkan tanggal akhir aktivitas (format: YYYY-MM-DD)
- `shift`: Filter berdasarkan shift ('ds' atau 'ns')
- `activities_id`: Filter berdasarkan ID aktivitas
- `site_id`: Filter berdasarkan ID site
- `search`: Pencarian umum di nama aktivitas, nama site, atau remark
- `sortBy`: Field untuk sorting (id, activityDate, shift, start, finish, duration, createdAt, updatedAt)
- `sortOrder`: Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/hauling-problem?page=1&limit=10&shift=ds&search=excavator&sortBy=createdAt&sortOrder=DESC
```

**Filter Date Range:**
Anda dapat menggunakan kombinasi `start_date` dan `end_date` untuk filter berdasarkan rentang tanggal:

**Contoh 1: Filter rentang tanggal lengkap**
```bash
GET /api/hauling-problem?start_date=2024-01-01&end_date=2024-01-31
```

**Contoh 2: Filter dari tanggal tertentu ke atas**
```bash
GET /api/hauling-problem?start_date=2024-01-15
```

**Contoh 3: Filter sampai tanggal tertentu ke bawah**
```bash
GET /api/hauling-problem?end_date=2024-01-15
```

**Contoh 4: Kombinasi filter daterange dengan filter lain**
```bash
GET /api/hauling-problem?start_date=2024-01-01&end_date=2024-01-31&shift=ds&search=excavator
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Data hauling problem berhasil diambil",
  "data": [
    {
      "id": 1,
      "activity_date": "2024-01-01T00:00:00.000Z",
      "shift": "ds",
      "activities_id": 1,
      "activities_name": "Excavation",
      "start": "2024-01-01T08:00:00.000Z",
      "finish": "2024-01-01T16:00:00.000Z",
      "duration": 8.0,
      "site_id": 1,
      "site_name": "Site Jakarta",
      "remark": "Problem pada unit excavator",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

### 3. GET `/api/hauling-problem/:id`
Mengambil data hauling problem berdasarkan ID.
**Authentication**: JWT Bearer Token required

**Path Parameters:**
- `id`: ID hauling problem (number)

**Contoh Request:**
```bash
GET /api/hauling-problem/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Data hauling problem berhasil diambil",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "activities_id": 1,
    "activities_name": "Excavation",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "site_id": 1,
    "site_name": "Site Jakarta",
    "remark": "Problem pada unit excavator",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. PUT `/api/hauling-problem/:id`
Mengupdate data hauling problem berdasarkan ID.
**Authentication**: JWT Bearer Token required

**Path Parameters:**
- `id`: ID hauling problem yang akan diupdate (number)

**Request Body:**
```json
{
  "shift": "ns",
  "remark": "Problem pada unit excavator - updated"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Data hauling problem berhasil diupdate",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ns",
    "activities_id": 1,
    "activities_name": "Excavation",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "site_id": 1,
    "site_name": "Site Jakarta",
    "remark": "Problem pada unit excavator - updated",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. DELETE `/api/hauling-problem/:id`
Menghapus data hauling problem berdasarkan ID (soft delete).
**Authentication**: JWT Bearer Token required

**Path Parameters:**
- `id`: ID hauling problem yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/hauling-problem/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Data hauling problem berhasil dihapus",
  "data": null
}
```

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Activities dengan ID 999 tidak ditemukan",
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
  "message": "Data hauling problem dengan ID 999 tidak ditemukan",
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

### HaulingProblem Entity
```typescript
{
  id: number;                    // Primary key, auto increment
  activityDate: Date;            // Tanggal aktivitas
  shift: string;                 // Shift kerja ('ds' atau 'ns')
  activitiesId: number;          // Foreign key ke m_activities
  start: Date;                   // Waktu mulai
  finish: Date;                  // Waktu selesai
  duration: number;              // Durasi dalam jam (otomatis)
  siteId: number;                // Foreign key ke m_sites
  remark: string;                // Catatan tambahan (nullable)
  createdAt: Date;               // Timestamp pembuatan
  createdBy: number;             // ID user yang membuat (nullable)
  updatedAt: Date;               // Timestamp update terakhir
  updatedBy: number;             // ID user yang update (nullable)
  deletedAt: Date;               // Timestamp soft delete (nullable)
  deletedBy: number;             // ID user yang hapus (nullable)
  activities: Activities;        // Relasi ke tabel activities
  site: Sites;                   // Relasi ke tabel sites
}
```

### Shift Values
- `ds`: Day Shift (Shift Pagi)
- `ns`: Night Shift (Shift Malam)

## Business Rules

1. **Validasi Activities**: `activities_id` harus ada di tabel `m_activities`
2. **Validasi Sites**: `site_id` harus ada di tabel `m_sites`
3. **Validasi Waktu**: `start` harus lebih awal dari `finish`
4. **Auto Calculation**: `duration` otomatis dihitung dari selisih `start` dan `finish`
5. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
6. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
7. **Pagination**: Limit maksimal adalah 100 data per halaman

## Database Schema

### Tabel r_ccr_hauling_problem
```sql
CREATE TABLE r_ccr_hauling_problem (
  id SERIAL PRIMARY KEY,
  activity_date TIMESTAMP NOT NULL,
  shift ENUM('ds', 'ns') NOT NULL,
  activities_id INT NOT NULL,
  start TIMESTAMP NOT NULL,
  finish TIMESTAMP NOT NULL,
  duration FLOAT,
  site_id INT NOT NULL,
  remark TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updatedBy INT,
  deletedAt TIMESTAMP,
  deletedBy INT,
  FOREIGN KEY (activities_id) REFERENCES m_activities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (site_id) REFERENCES m_sites(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

## Testing Examples

### Valid Create Request
```bash
curl -X POST http://localhost:3000/api/hauling-problem \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "activities_id": 1,
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "site_id": 1,
    "remark": "Problem pada unit excavator"
  }'
```

### Valid Update Request
```bash
curl -X PUT http://localhost:3000/api/hauling-problem/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift": "ns",
    "remark": "Problem pada unit excavator - updated"
  }'
```

### Valid Delete Request
```bash
curl -X DELETE http://localhost:3000/api/hauling-problem/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dependencies

- `@nestjs/common`
- `@nestjs/typeorm`
- `@nestjs/swagger`
- `class-validator`
- `class-transformer`
- `typeorm`

## Notes

- Semua validasi menggunakan class-validator decorators
- **Custom Validator**: `@IsNotEmptyString()` digunakan untuk memastikan string tidak kosong
- Field `duration` otomatis dihitung dan tidak perlu diisi manual
- Relasi dengan tabel `m_activities` dan `m_sites` menggunakan eager loading
- Implementasi menggunakan soft delete untuk menjaga integritas data
- **Filter Date Range**: Dukungan filter daterange dengan parameter `start_date` dan `end_date`
  - Format tanggal menggunakan ISO 8601 (YYYY-MM-DD)
  - Jika `start_date` dan `end_date` keduanya disediakan, akan mencari data dengan `activity_date` di antara kedua tanggal tersebut (inclusive)
  - Jika hanya `start_date` yang disediakan, akan mencari data dengan `activity_date` >= start_date
  - Jika hanya `end_date` yang disediakan, akan mencari data dengan `activity_date` <= end_date
  - Filter daterange dapat dikombinasikan dengan filter lainnya
