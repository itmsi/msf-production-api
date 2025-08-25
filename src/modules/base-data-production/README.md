# Base Data Production Module

Module ini menangani operasi CRUD untuk data produksi dasar yang terdiri dari dua tabel:
- `r_parent_base_data_pro` - Data utama produksi
- `r_base_data_pro` - Detail data produksi

## Struktur Data

### Parent Base Data Pro
- `id` - Primary key (auto increment)
- `unit_id` - ID unit
- `activity_date` - Tanggal aktivitas
- `shift` - Shift (ds/ns)
- `driver_id` - ID driver
- `start_shift` - Waktu mulai shift
- `end_shift` - Waktu selesai shift

### Base Data Pro Detail
- `id` - Primary key (auto increment)
- `parent_base_data_pro_id` - Foreign key ke parent
- `km_awal` - Kilometer awal
- `km_akhir` - Kilometer akhir
- `total_km` - Total kilometer
- `hm_awal` - Hour meter awal
- `hm_akhir` - Hour meter akhir
- `total_hm` - Total hour meter
- `loading_point_id` - ID loading point
- `dumping_point_id` - ID dumping point
- `mround_distance` - Mround distance
- `distance` - Distance
- `total_vessel` - Total vessel
- `material` - Jenis material

## Endpoints

### POST /base-data-production
Membuat data produksi baru dengan detail.

**Request Body:**
```json
{
  "unit_id": 1,
  "activity_date": "2025-08-21",
  "shift": "ds",
  "driver_id": 1,
  "start_shift": "2025-08-21 08:00:00",
  "end_shift": "2025-08-21 16:00:00",
  "detail": [
    {
      "km_awal": 1,
      "km_akhir": 1,
      "total_km": 1,
      "hm_awal": 1,
      "hm_akhir": 1,
      "total_hm": 1,
      "loading_point_id": 1,
      "dumping_point_id": 1,
      "mround_distance": 1,
      "distance": 1,
      "total_vessel": 1,
      "material": "coal"
    }
  ]
}
```

### GET /base-data-production
Mengambil semua data produksi dengan pagination dan filter.

**Query Parameters:**
- `startDate` - Filter tanggal mulai (YYYY-MM-DD)
- `endDate` - Filter tanggal akhir (YYYY-MM-DD)
- `keyword` - Filter keyword untuk semua field
- `page` - Nomor halaman (default: 1)
- `limit` - Item per halaman (default: 10)

### GET /base-data-production/:id
Mengambil data produksi berdasarkan ID.

### PATCH /base-data-production/:id
Mengupdate data produksi berdasarkan ID.

### DELETE /base-data-production/:id
Menghapus data produksi berdasarkan ID (termasuk detail).

## Fitur

- **Create**: Membuat data produksi baru dengan multiple detail
- **Update**: Mengupdate data produksi dan detail
- **Read**: Membaca data dengan pagination dan filter
- **Delete**: Menghapus data produksi dan semua detail terkait
- **Filter**: Filter berdasarkan tanggal, keyword untuk semua field
- **Pagination**: Pagination dengan helper function
- **Swagger**: Dokumentasi API lengkap
- **Validation**: Validasi input dengan class-validator
- **Authentication**: JWT authentication guard

## Dependencies

- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - API documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation
- `typeorm` - Database ORM
