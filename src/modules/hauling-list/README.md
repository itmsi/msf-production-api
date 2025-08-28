# Hauling List Module

Modul ini menangani operasi CRUD untuk data hauling list yang tersimpan di tabel `r_ccr_hauling`.

## Fitur

- **Create**: Membuat data hauling list baru
- **Read**: Mengambil data hauling list dengan pagination dan filter
- **Update**: Mengupdate data hauling list yang ada
- **Delete**: Menghapus data hauling list
- **Authentication**: Menggunakan JWT Bearer Token

## Struktur Data

### Input (POST/PATCH)
- `activity_date`: Tanggal aktivitas (date format: YYYY-MM-DD)
- `shift`: Shift kerja (enum: 'ds' atau 'ns')
- `time`: Waktu aktivitas (timestamp format: ISO 8601)
- `unit_loading_id`: ID unit loading
- `unit_hauler_id`: ID unit hauler
- `material`: Jenis material (enum: 'biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry')
- `loading_point_id`: ID loading point
- `dumping_point_op_id`: ID dumping point operation (nullable)
- `dumping_point_barge_id`: ID dumping point barge (nullable)
- `vessel`: Jumlah vessel

### Output (Response)
- Semua field input ditampilkan
- `unit_loading_name`: Nama unit loading (dari join dengan tabel m_population)
- `unit_hauler_name`: Nama unit hauler (dari join dengan tabel m_population)
- `loading_point_name`: Nama loading point (dari join dengan tabel m_operation_points)
- `dumping_point_op_name`: Nama dumping point operation (dari join dengan tabel m_operation_points)
- `dumping_point_barge_name`: Nama dumping point barge (dari join dengan tabel m_barge)
- `total_tonnage`: Total tonnage (otomatis dihitung: vessel * 35)

## Endpoints

### POST `/api/hauling-list`
Membuat data hauling list baru.
**Authentication**: JWT Bearer Token required

### GET `/api/hauling-list`
Mengambil semua data hauling list dengan pagination dan filter.
**Authentication**: JWT Bearer Token required

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10)
- `activity_date`: Filter berdasarkan tanggal aktivitas
- `shift`: Filter berdasarkan shift ('ds' atau 'ns')
- `material`: Filter berdasarkan material (enum values)
- `unit_loading_name`: Filter berdasarkan nama unit loading
- `unit_hauler_name`: Filter berdasarkan nama unit hauler

### GET `/api/hauling-list/:id`
Mengambil data hauling list berdasarkan ID.
**Authentication**: JWT Bearer Token required

### PATCH `/api/hauling-list/:id`
Mengupdate data hauling list berdasarkan ID.
**Authentication**: JWT Bearer Token required

### DELETE `/api/hauling-list/:id`
Menghapus data hauling list berdasarkan ID.
**Authentication**: JWT Bearer Token required

## Relasi Database

- `unit_loading_id` → `m_population.id` (untuk nama unit loading)
- `unit_hauler_id` → `m_population.id` (untuk nama unit hauler)
- `loading_point_id` → `m_operation_points.id` (untuk nama loading point)
- `dumping_point_op_id` → `m_operation_points.id` (untuk nama dumping point operation)
- `dumping_point_barge_id` → `m_barge.id` (untuk nama dumping point barge)

## Validasi

- Semua field required kecuali `dumping_point_op_id` dan `dumping_point_barge_id`
- `activity_date` harus dalam format date yang valid (YYYY-MM-DD)
- `time` harus dalam format timestamp yang valid (ISO 8601)
- `shift` harus salah satu dari: 'ds', 'ns'
- `material` harus salah satu dari: 'biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'
- `vessel` harus berupa angka positif
- `total_tonnage` dihitung otomatis (vessel * 35)

## Authentication

Modul ini menggunakan JWT Bearer Token untuk autentikasi. Semua endpoint memerlukan token yang valid yang dikirim melalui header:
```
Authorization: Bearer <jwt_token>
```

## Pagination

Modul ini menggunakan helper pagination yang sudah tersedia di aplikasi untuk menangani pagination dan filter data.

## Swagger Documentation

Semua endpoint sudah didokumentasikan dengan Swagger dan menampilkan:
- Parameter yang diperlukan
- Response schema
- Authentication requirements
- Enum values untuk shift dan material
