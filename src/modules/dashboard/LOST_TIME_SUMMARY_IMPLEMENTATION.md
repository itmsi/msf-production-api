# Lost Time Summary Endpoint Implementation

## Overview
Endpoint `/api/dashboard/lost-time-summary` telah berhasil diimplementasikan sesuai dengan spesifikasi yang diberikan. Endpoint ini mengembalikan data Lost Time Summary dengan tiga komponen utama: MOHH data, Lost Time data, dan Tables data (PA, MA, UA, EU).

## Endpoint Details

### URL
```
GET /api/dashboard/lost-time-summary
```

### Query Parameters
- `startDate` (optional): Start date dalam format YYYY-MM-DD
- `endDate` (optional): End date dalam format YYYY-MM-DD

### Response Format
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "mohh": [
      {
        "name": "STB",
        "value": 2224.3,
        "color": "#34d399"
      },
      {
        "name": "BD", 
        "value": 1.1,
        "color": "#d1d5db"
      },
      {
        "name": "EWH",
        "value": 270.6,
        "color": "#10b981"
      }
    ],
    "lost_time": [
      {
        "name": "Rain",
        "value": 0.3,
        "color": "#1e3a8a"
      },
      {
        "name": "Slippery",
        "value": 0.1,
        "color": "#d1d5db"
      },
      {
        "name": "MHR",
        "value": 0.25,
        "color": "#34d399"
      },
      {
        "name": "Internal",
        "value": 0.2,
        "color": "#fbbf24"
      },
      {
        "name": "External",
        "value": 0.35,
        "color": "#60a5fa"
      }
    ],
    "tables": [
      {
        "title": "PA",
        "data": [
          {
            "target": 1000,
            "actual": 1000,
            "percent": 10
          }
        ]
      },
      {
        "title": "MA",
        "data": [
          {
            "target": 1000,
            "actual": 1000,
            "percent": 10
          }
        ]
      },
      {
        "title": "UA",
        "data": [
          {
            "target": 1000,
            "actual": 1000,
            "percent": 10
          }
        ]
      },
      {
        "title": "EU",
        "data": [
          {
            "target": 1000,
            "actual": 1000,
            "percent": 10
          }
        ]
      }
    ]
  }
}
```

## Implementation Details

### 1. Dashboard Service (`dashboard.service.ts`)

#### Method: `getLostTimeSummary(startDate?, endDate?)`
- **Fungsi**: Method utama yang mengkoordinasikan perhitungan semua data
- **Parameter**: 
  - `startDate` (optional): Tanggal mulai dalam format YYYY-MM-DD
  - `endDate` (optional): Tanggal akhir dalam format YYYY-MM-DD
- **Default**: Jika tidak ada parameter, menggunakan tanggal pertama bulan ini sampai hari ini

#### Method: `calculateMohhData(startDate, endDate)`
- **Fungsi**: Menghitung data MOHH (STB, BD, EWH)
- **Formula**:
  - **STB (Standby Time)**: `MOHH - EWH - Breakdown Time`
  - **BD (Breakdown Time)**: `SUM(r_loss_time.duration) WHERE loss_type = 'BD'`
  - **EWH (Effective Working Hours)**: `SUM(r_base_data_pro.totalHM)`

#### Method: `calculateLostTimeData(startDate, endDate)`
- **Fungsi**: Menghitung data Lost Time berdasarkan activities dengan status 'idle' dan 'delay'
- **Data Source**: 
  - `m_activities` dengan status 'idle' atau 'delay'
  - `r_loss_time` dengan loss_type = 'STB'
- **Activities**: Rain, Slippery, MHR, Internal, External

#### Method: `calculateTablesData(startDate, endDate)`
- **Fungsi**: Menghitung data Tables (PA, MA, UA, EU)
- **Formula**:
  - **PA (Physical Availability)**: `(EWH + Standby Time) / MOHH`
  - **MA (Mechanical Availability)**: `EWH / (EWH + Breakdown Time)`
  - **UA (Utilization Availability)**: `EWH / (EWH + Standby Time)`
  - **EU (Effectiveness Utilization)**: `EWH / MOHH`

### 2. Dashboard Controller (`dashboard.controller.ts`)

#### Endpoint: `GET /lost-time-summary`
- **Swagger Documentation**: Lengkap dengan parameter dan response schema
- **Query Parameters**: startDate dan endDate (optional)
- **Authentication**: Memerlukan JWT Bearer token

### 3. Dashboard Module (`dashboard.module.ts`)

#### Entities yang Ditambahkan:
- `EffectiveWorkingHours` (r_loss_time)
- `Activities` (m_activities)
- `ParentPlanWorkingHour` (r_parent_plan_working_hour)

## Database Tables Used

### Primary Tables:
1. **`r_parent_base_data_pro`** - Data parent base production
2. **`r_base_data_pro`** - Data base production dengan totalHM
3. **`r_loss_time`** - Data loss time dengan duration dan loss_type
4. **`m_activities`** - Master activities dengan status
5. **`r_parent_plan_working_hour`** - Data target untuk PA, MA, UA, EU

### Relationships:
- `r_base_data_pro.parent_base_data_pro_id` → `r_parent_base_data_pro.id`
- `r_loss_time.population_id` → `r_parent_base_data_pro.population_id`
- `r_loss_time.activities_id` → `m_activities.id`

## Testing

### Test dengan curl:
```bash
# Test tanpa parameter
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/lost-time-summary' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Test dengan parameter tanggal
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/lost-time-summary?startDate=2025-01-01&endDate=2025-01-31' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Expected Response:
- Status Code: 200
- Message: "success"
- Data structure sesuai dengan spesifikasi

## Error Handling

- **Database Error**: Ditangkap dan dikembalikan sebagai BadRequestException
- **Invalid Date Format**: Validasi format tanggal YYYY-MM-DD
- **Missing Data**: Mengembalikan nilai default (0) untuk data yang tidak ditemukan

## Performance Considerations

- **Query Optimization**: Menggunakan raw SQL queries untuk performa yang lebih baik
- **Data Aggregation**: Menggunakan SUM dan COALESCE untuk menghindari NULL values
- **Indexing**: Pastikan ada index pada kolom yang sering digunakan untuk filtering

## Future Enhancements

1. **Caching**: Implementasi Redis cache untuk data yang sering diakses
2. **Real-time Data**: Integrasi dengan WebSocket untuk update real-time
3. **Export Feature**: Tambahan endpoint untuk export data ke Excel/PDF
4. **Advanced Filtering**: Filter berdasarkan unit, shift, atau kategori lainnya

## Dependencies

- `@nestjs/common` - Framework NestJS
- `@nestjs/typeorm` - ORM untuk database operations
- `@nestjs/swagger` - API documentation
- `typeorm` - Database query builder
