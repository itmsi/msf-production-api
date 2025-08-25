# Effective Working Hours Module

## Deskripsi
Module ini mengelola data effective working hours yang disimpan dalam tabel `r_loss_time`. Data ini mencakup informasi tentang waktu kerja efektif, termasuk standby time dan breakdown time.

## Fitur
- ✅ Create effective working hours
- ✅ Read effective working hours dengan pagination
- ✅ Update effective working hours
- ✅ Delete effective working hours (soft delete)
- ✅ Filter berdasarkan date range, loss type, dan keyword
- ✅ Auto calculation duration dari start dan end time
- ✅ Join dengan tabel population dan activities untuk data lengkap

## Struktur File
```
effective-working-hours/
├── entities/
│   └── effective-working-hours.entity.ts
├── dto/
│   └── effective-working-hours.dto.ts
├── effective-working-hours.controller.ts
├── effective-working-hours.service.ts
├── effective-working-hours.module.ts
├── index.ts
├── API_DOCUMENTATION.md
└── README.md
```

## Database Schema
Module ini menggunakan tabel `r_loss_time` dengan struktur:
- `id`: Primary key
- `date_activity`: Tanggal aktivitas
- `loss_type`: Tipe loss (STB/BD)
- `shift`: Shift kerja (DS/NS)
- `population_id`: ID population
- `activities_id`: ID activities
- `description`: Deskripsi
- `start`: Waktu mulai
- `end`: Waktu selesai
- `duration`: Durasi (auto calculated)
- Timestamps dan audit fields

## API Endpoints
- `POST /effective-working-hours` - Create
- `GET /effective-working-hours` - Get all dengan filter dan pagination
- `GET /effective-working-hours/:id` - Get by ID
- `PATCH /effective-working-hours/:id` - Update
- `DELETE /effective-working-hours/:id` - Delete

## Dependencies
- TypeORM untuk database operations
- Class-validator untuk validation
- Class-transformer untuk transformation
- JWT Guard untuk authentication

## Cara Penggunaan
1. Import module ke `app.module.ts`
2. Pastikan tabel `r_loss_time` sudah ada di database
3. Pastikan foreign key constraints sudah terpasang
4. Gunakan endpoint sesuai dokumentasi API

## Notes
- Semua endpoint memerlukan JWT authentication
- Duration otomatis dihitung jika start dan end tersedia
- Data yang dihapus menggunakan soft delete
- Response format mengikuti standar API response helper
