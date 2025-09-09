# Control Day Work Hour Module

## Deskripsi
Module ini menyediakan API untuk mengambil data Control Day Work Hour berdasarkan spesifikasi yang diberikan. Module ini mengolah data dari tabel-tabel Population, Production, dan Effective Working Hours untuk menghasilkan analisis yang komprehensif tentang kontrol jam kerja harian.

## Fitur
- ✅ GET endpoint untuk mengambil data control day work hour
- ✅ Filter berdasarkan date range (startDate, endDate)
- ✅ Filter berdasarkan unit dan shift
- ✅ Pagination dengan page dan limit
- ✅ Generate data dari sumber data yang ada
- ✅ Swagger documentation
- ✅ JWT Authentication
- ✅ Error handling

## Struktur File
```
control-day-work-hour/
├── entities/
│   └── control-day-work-hour.entity.ts    # Entity untuk tabel control_day_work_hour
├── dto/
│   └── control-day-work-hour.dto.ts       # DTO untuk request/response
├── control-day-work-hour.controller.ts    # Controller dengan endpoint GET
├── control-day-work-hour.service.ts       # Service dengan business logic
├── control-day-work-hour.module.ts        # Module configuration
├── index.ts                               # Export file
└── API_DOCUMENTATION.md                   # File ini
```

## Database Schema
Module ini menggunakan tabel `control_day_work_hour` dengan struktur:
- `id`: Primary key
- `unit`: Unit dari data master population
- `shift`: Shift dari Production[Shift]
- `filterDate`: Tanggal filter
- `p5m`: Data P5M dari Effective Working Hours
- `pergShift`: Data Perg. Shift dari Effective Working Hours
- `restTime`: Data Rest Time dari Effective Working Hours
- `gst`: Data GST dari Effective Working Hours
- `travelling`: Data Travelling dari Effective Working Hours
- `perbaikanFrontLoading`: Data Perbaikan Front Loading dari Effective Working Hours
- `cekElevasi`: Data Cek Elevasi dari Effective Working Hours
- `refuelling`: Data Refuelling dari Effective Working Hours
- `slippery`: Data Slippery dari Effective Working Hours
- `travellingEquipment`: Data Travelling Equipment dari Effective Working Hours
- `fogging`: Data Fogging dari Effective Working Hours
- `safetyTalk`: Data Safety Talk dari Effective Working Hours
- `p2h`: Data P2H dari Effective Working Hours
- Timestamps dan audit fields

## API Endpoints

### 1. GET /control-day-work-hour
Mengambil data Control Day Work Hour dengan filter dan pagination.

**Query Parameters:**
- `startDate` (optional): Tanggal mulai filter (format: YYYY-MM-DD)
- `endDate` (optional): Tanggal akhir filter (format: YYYY-MM-DD)
- `unit` (optional): Unit untuk filter
- `shift` (optional): Shift untuk filter
- `page` (optional): Halaman untuk pagination (default: 1)
- `limit` (optional): Limit data per halaman (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "unit": "Unit-001",
      "shift": "DS",
      "filterDate": "2024-01-15",
      "p5m": 120.5,
      "pergShift": 45.0,
      "restTime": 30.0,
      "gst": 15.0,
      "travelling": 60.0,
      "perbaikanFrontLoading": 90.0,
      "cekElevasi": 20.0,
      "refuelling": 25.0,
      "slippery": 40.0,
      "travellingEquipment": 35.0,
      "fogging": 10.0,
      "safetyTalk": 15.0,
      "p2h": 50.0,
      "createdAt": "2024-01-15T08:00:00Z",
      "updatedAt": "2024-01-15T08:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 2. GET /control-day-work-hour/generate
Generate data Control Day Work Hour berdasarkan data yang ada di database.

**Query Parameters:**
- `startDate` (required): Tanggal mulai filter
- `endDate` (required): Tanggal akhir filter (yang akan digunakan sebagai filterDate)

**Response:**
```json
{
  "message": "Data Control Day Work Hour berhasil di-generate"
}
```

## Business Logic

### Data Sources:
- **Unit**: Diambil dari `m_population.no_unit`
- **Shift**: Diambil dari `r_plan_production.shift`
- **Problem Types**: Diambil dari `r_loss_time.description` dengan filter:
  - P5M
  - Perg. Shift
  - Rest Time
  - GST
  - Travelling
  - Perbaikan Front Loading
  - Cek Elevasi
  - Refuelling
  - Slippery
  - Travelling Equipment
  - Fogging
  - Safety Talk
  - P2H

### Logic Rules:
1. **Control Day Work Hour[Unit] == Group By Effective Working Hour[Unit]**
2. **Jika filter tanggal X sampai Y, tanggal yang diambil hanya Y**
3. Data di-aggregate berdasarkan `duration` dari Effective Working Hours
4. Setiap problem type di-mapping ke field yang sesuai

## Dependencies
- TypeORM untuk database operations
- Class-validator untuk validation
- Class-transformer untuk transformation
- JWT Guard untuk authentication
- Swagger untuk dokumentasi API

## Cara Penggunaan
1. Import module ke `app.module.ts` ✅
2. Pastikan tabel `control_day_work_hour` sudah ada di database
3. Jalankan migration untuk membuat tabel
4. Pastikan foreign key constraints sudah terpasang
5. Gunakan endpoint dengan authentication JWT

## Authentication
Semua endpoint memerlukan JWT authentication. Pastikan untuk menyertakan header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling
- **401 Unauthorized**: Token tidak valid atau tidak ada
- **400 Bad Request**: Parameter tidak valid
- **500 Internal Server Error**: Error server

## Contoh Penggunaan

### 1. Mengambil data dengan filter tanggal
```bash
GET /control-day-work-hour?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
```

### 2. Mengambil data dengan filter unit dan shift
```bash
GET /control-day-work-hour?unit=Unit-001&shift=DS&page=1&limit=10
```

### 3. Generate data untuk periode tertentu
```bash
GET /control-day-work-hour/generate?startDate=2024-01-01&endDate=2024-01-31
```

## Database Migration
Untuk membuat tabel `control_day_work_hour`, jalankan migration:
```bash
npm run migration:run
```

Migration file: `1757000000004-CreateTableControlDayWorkHour.ts`
