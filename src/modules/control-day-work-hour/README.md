# Control Day Work Hour Module

## Deskripsi
Module ini mengelola data Control Day Work Hour yang mengintegrasikan data dari Population, Production, dan Effective Working Hours sesuai dengan spesifikasi yang diberikan.

## Fitur
- ✅ GET endpoint untuk mengambil data control day work hour
- ✅ Filter berdasarkan date range, unit, dan shift
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
└── API_DOCUMENTATION.md                   # Dokumentasi API lengkap
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
- `GET /control-day-work-hour` - Get data dengan filter dan pagination
- `GET /control-day-work-hour/generate` - Generate data dari sumber data yang ada

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
