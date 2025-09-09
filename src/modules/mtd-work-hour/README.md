# MTD Work Hour Module

## Deskripsi
Module ini menyediakan API untuk mengambil data MTD (Month-to-Date) Work Hour berdasarkan berbagai jenis problem yang terjadi pada unit. Module ini mengolah data dari tabel Effective Working Hours dan Population untuk menghasilkan analisis yang komprehensif tentang jam kerja efektif.

## Fitur
- ✅ GET endpoint untuk mengambil data MTD Work Hour
- ✅ Filter berdasarkan date range (startDate, endDate)
- ✅ Filter berdasarkan unit dan jenis problem
- ✅ Pagination dengan page dan limit
- ✅ Summary data berdasarkan jenis problem
- ✅ Swagger documentation
- ✅ JWT Authentication
- ✅ Error handling

## Struktur File
```
mtd-work-hour/
├── entities/
│   └── mtd-work-hour.entity.ts          # Entity untuk response data
├── dto/
│   └── mtd-work-hour.dto.ts             # DTO untuk request/response
├── mtd-work-hour.controller.ts           # Controller dengan endpoint GET
├── mtd-work-hour.service.ts              # Service dengan business logic
├── mtd-work-hour.module.ts               # Module configuration
├── index.ts                              # Export file
└── README.md                             # File ini
```

## Database Schema
Module ini menggunakan data dari tabel-tabel berikut:
- `m_population` - Data master population/unit
- `r_loss_time` - Data effective working hours dengan berbagai jenis problem

## API Endpoints
- `GET /mtd-work-hour` - Get MTD Work Hour data dengan filter dan pagination
- `GET /mtd-work-hour/by-problem-type` - Get data berdasarkan jenis problem tertentu
- `GET /mtd-work-hour/summary` - Get summary data berdasarkan jenis problem
- `GET /mtd-work-hour/problem-types` - Get daftar jenis problem yang tersedia

## Dependencies
- TypeORM untuk database operations
- Class-validator untuk validation
- Class-transformer untuk transformation
- JWT Guard untuk authentication
- Swagger untuk dokumentasi API

## Cara Penggunaan
1. Import module ke `app.module.ts`
2. Pastikan tabel-tabel yang diperlukan sudah ada di database
3. Pastikan foreign key constraints sudah terpasang
4. Gunakan endpoint dengan authentication JWT

## Business Logic

### Data Sources:
- **Unit**: Diambil dari `m_population.no_unit` dengan status active
- **Problem Types**: Diambil dari `r_loss_time` yang dijoin dengan `m_activities`

### Jenis Problem yang Didukung:
1. **P5M**: Dari Effective Working Hours List[Problem] = "P5M"
2. **Perg. Shift**: Dari Effective Working Hours List[Problem] = "Perg. Shift"
3. **Rest Time**: Dari Effective Working Hours List[Problem] = "Rest Time"
4. **GST**: Dari Effective Working Hours List[Problem] = "GST"
5. **Travelling**: Dari Effective Working Hours List[Problem] = "Travelling"
6. **Perbaikan Front Loading**: Dari Effective Working Hours List[Problem] = "Perbaikan Front Loading"
7. **Cek Elevasi**: Dari Effective Working Hours List[Problem] = "Cek Elevasi"
8. **Refuelling**: Dari Effective Working Hours List[Problem] = "Refuelling"
9. **Slippery**: Dari Effective Working Hours List[Problem] = "Slippery"
10. **Travelling Equipment**: Dari Effective Working Hours List[Problem] = "Travelling Equipment"
11. **Fogging**: Dari Effective Working Hours List[Problem] = "Fogging"
12. **Safety Talk**: Dari Effective Working Hours List[Problem] = "Safety Talk"
13. **P2H**: Dari Effective Working Hours List[Problem] = "P2H"

### Logic Processing:
- Data dikelompokkan berdasarkan unit dan jenis problem
- Durasi dihitung dari field `duration` di tabel `r_loss_time`
- Filter berdasarkan date range menggunakan `dateActivity`
- Pagination diterapkan pada hasil akhir

## Contoh Response

### GET /mtd-work-hour
```json
{
  "statusCode": 200,
  "message": "Data MTD Work Hour berhasil diambil",
  "data": [
    {
      "unit": "DT-001",
      "totalDuration": 24.5,
      "problems": [
        {
          "unit": "DT-001",
          "activityDate": "2024-01-15",
          "problemType": "P5M",
          "duration": 2.5,
          "description": "P5M - Preventive Maintenance",
          "totalDuration": 2.5
        }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### GET /mtd-work-hour/summary
```json
{
  "statusCode": 200,
  "message": "Summary data berhasil diambil",
  "data": [
    {
      "problemType": "P5M",
      "totalDuration": 15.5,
      "count": 5,
      "averageDuration": 3.1
    }
  ]
}
```
