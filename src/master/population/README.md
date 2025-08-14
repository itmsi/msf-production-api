# Population Module

Module ini menangani operasi CRUD untuk data population (unit/alat berat) dalam sistem.

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete data population
- **Pagination**: Mendukung pagination untuk data yang banyak
- **Filtering**: Filter berdasarkan berbagai kriteria
- **Searching**: Pencarian global di semua field
- **Sorting**: Pengurutan berdasarkan field tertentu
- **Validation**: Validasi data input dan duplikasi
- **Soft Delete**: Data tidak benar-benar dihapus dari database
- **Relations**: Join dengan tabel terkait (unit_type, activities, sites)

## Endpoints

### GET /populations
Mendapatkan semua data population dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian umum di semua field
- `status`: Filter berdasarkan status (active/inactive)
- `unit_type_id`: Filter berdasarkan unit type ID
- `activities_id`: Filter berdasarkan activities ID
- `site_id`: Filter berdasarkan site ID
- `engine_brand`: Filter berdasarkan brand engine (cummins/weichai)
- `tyre_type`: Filter berdasarkan tipe ban (6x4/8x4)
- `date_from`: Filter berdasarkan tanggal kedatangan (dari)
- `date_to`: Filter berdasarkan tanggal kedatangan (sampai)
- `sortBy`: Field untuk sorting
- `sortOrder`: Urutan sorting (ASC/DESC)

### GET /populations/:id
Mendapatkan data population berdasarkan ID dengan relasi lengkap.

### POST /populations
Membuat population baru.

**Body Request:**
```json
{
  "date_arrive": "2024-01-01",
  "status": "active",
  "unit_type_id": 1,
  "no_unit": "EXC001",
  "vin_number": "VIN123456789",
  "no_unit_system": "SYS001",
  "engine_brand": "cummins",
  "serial_engine": "ENG123456",
  "activities_id": 1,
  "site_origin": "Site A",
  "remarks": "Unit dalam kondisi baik",
  "site_id": 1,
  "company": "PT ABC",
  "tyre_type": "6x4"
}
```

### PUT /populations/:id
Mengupdate data population berdasarkan ID.

### DELETE /populations/:id
Menghapus data population (soft delete).

## Validasi

- **VIN Number**: Harus unik, tidak boleh duplikat
- **No Unit**: Harus unik, tidak boleh duplikat
- **No Unit System**: Harus unik, tidak boleh duplikat
- **Required Fields**: Semua field wajib diisi kecuali remarks
- **Enum Values**: Status, engine_brand, dan tyre_type harus sesuai enum yang ditentukan

## Relasi

- **UnitType**: Relasi dengan tabel m_unit_type
- **Activities**: Relasi dengan tabel m_activities
- **Sites**: Relasi dengan tabel m_sites

## Response Format

Semua response menggunakan format standar:
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

- **400**: Bad Request - Data tidak valid
- **401**: Unauthorized - JWT token tidak valid
- **404**: Not Found - Data tidak ditemukan
- **409**: Conflict - Data duplikat
- **500**: Internal Server Error - Kesalahan server
