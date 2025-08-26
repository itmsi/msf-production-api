# Barge Form Module

Module ini mengelola data barge form yang disimpan di tabel `r_input_barge`.

## Fitur

- **Create**: Membuat data barge form baru dengan perhitungan otomatis `capacity_per_dt` dan `achievment`
- **Read**: Mengambil data barge form dengan filter tanggal dan keyword search
- **Update**: Memperbarui data barge form dengan perhitungan ulang otomatis
- **Delete**: Soft delete data barge form

## Endpoints

### POST /barge-form
Membuat barge form baru.

**Request Body:**
```json
{
  "barge_id": 1,
  "site_id": 1,
  "shipment": "SHIP001",
  "start_loading": "2024-01-01T08:00:00Z",
  "end_loading": "2024-01-01T18:00:00Z",
  "total_vessel": 100.5,
  "vol_by_survey": 95.2,
  "remarks": "Loading completed successfully",
  "status": "completed"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Barge form created successfully",
  "data": { ... }
}
```

### GET /barge-form
Mengambil semua barge form dengan filter dan pagination.

**Query Parameters:**
- `start_date` (optional): Tanggal mulai filter (YYYY-MM-DD)
- `end_date` (optional): Tanggal akhir filter (YYYY-MM-DD)
- `keyword` (optional): Keyword untuk mencari di barge name, site name, shipment, atau remarks
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Barge forms retrieved successfully",
  "data": [
    {
      "id": 1,
      "shipment": "SHIP001",
      "barge_name": "Barge Alpha",
      "site_name": "Site Jakarta",
      "start_loading": "2024-01-01T08:00:00Z",
      "end_loading": "2024-01-01T18:00:00Z",
      "total_vessel": 100.5,
      "vol_by_survey": 95.2,
      "capacity_per_dt": 0.95,
      "achievment": 1.0,
      "remarks": "Loading completed successfully",
      "status": "completed"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### GET /barge-form/:id
Mengambil barge form berdasarkan ID.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Barge form retrieved successfully",
  "data": { ... }
}
```

### PATCH /barge-form/:id
Memperbarui barge form.

**Request Body:** (semua field optional)
```json
{
  "shipment": "SHIP002",
  "total_vessel": 110.0,
  "vol_by_survey": 105.0,
  "status": "in_progress"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Barge form updated successfully",
  "data": { ... }
}
```

### DELETE /barge-form/:id
Menghapus barge form (soft delete).

**Response:**
```json
{
  "statusCode": 200,
  "message": "Barge form deleted successfully",
  "data": null
}
```

## Perhitungan Otomatis

### Capacity per DT
```
capacity_per_dt = vol_by_survey / total_vessel
```

### Achievement
```
achievment = vol_by_survey / capacity_per_dt
```

Perhitungan ini dilakukan otomatis saat create dan update jika data yang diperlukan tersedia.

## Validasi

- `barge_id`: Required, integer
- `site_id`: Required, integer
- `shipment`: Required, string
- `start_loading`: Required, datetime
- `end_loading`: Required, datetime
- `total_vessel`: Optional, float
- `vol_by_survey`: Optional, float
- `capacity_per_dt`: Optional, float (calculated)
- `achievment`: Optional, float (calculated)
- `remarks`: Optional, string
- `status`: Optional, string

## Relasi Database

- `barge_id` → `m_barge.id`
- `site_id` → `m_sites.id`

## Swagger Documentation

Semua endpoint sudah dilengkapi dengan dokumentasi Swagger yang lengkap termasuk:
- Deskripsi endpoint
- Parameter request/response
- Contoh data
- Status code response
- Error handling
