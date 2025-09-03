# Dashboard Module

Module ini menyediakan endpoint-endpoint untuk dashboard yang menampilkan berbagai metrik dan data produksi.

## Endpoints

### 1. Spider Chart Data
**GET** `/api/dashboard/spider`

Menampilkan data untuk spider chart dengan metrik CT, Prod, EWH, FR, dan Speed.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "metric": "CT", "target": 100, "actual": 80, "percent": 80 },
    { "metric": "Prod", "target": 120, "actual": 90, "percent": 75 },
    { "metric": "EWH", "target": 90, "actual": 70, "percent": 78 },
    { "metric": "FR", "target": 95, "actual": 95, "percent": 100 },
    { "metric": "Speed", "target": 110, "actual": 100, "percent": 91 }
  ]
}
```

### 2. MTD Achievement
**GET** `/api/dashboard/mtd-achievment`

Menampilkan data pencapaian Month-to-Date untuk berbagai aktivitas.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "name": "Ore Hauling", "target": 10000, "actual": 8500 },
    { "name": "OB", "target": 12000, "actual": 10000 },
    { "name": "Ore Barging", "target": 9000, "actual": 8700 },
    { "name": "Quarry", "target": 8000, "actual": 7500 }
  ]
}
```

### 3. Hauling Data
**GET** `/api/dashboard/hauling`

Menampilkan data hauling harian dengan informasi target, actual, dan kondisi cuaca.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "date": "01/07", "target": 2500, "actual": 2000, "slippery": 5, "rain": 8 },
    { "date": "02/07", "target": 2500, "actual": 1800, "slippery": 4, "rain": 6 },
    { "date": "03/07", "target": 2500, "actual": 1700, "slippery": 6, "rain": 7 },
    { "date": "04/07", "target": 2500, "actual": 2200, "slippery": 8, "rain": 9 },
    { "date": "05/07", "target": 2500, "actual": 2100, "slippery": 10, "rain": 5 },
    { "date": "06/07", "target": 2500, "actual": 1900, "slippery": 7, "rain": 8 },
    { "date": "07/07", "target": 2500, "actual": 2300, "slippery": 9, "rain": 10 }
  ]
}
```

### 4. Barge Data
**GET** `/api/dashboard/barge`

Menampilkan data barge dan hauling harian.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "date": "01/07", "barge": 3000, "hauling": 2800 },
    { "date": "02/07", "barge": 2950, "hauling": 2700 },
    { "date": "03/07", "barge": 2980, "hauling": 2750 },
    { "date": "04/07", "barge": 2900, "hauling": 2600 },
    { "date": "05/07", "barge": 3000, "hauling": 2700 },
    { "date": "06/07", "barge": 2800, "hauling": 2500 },
    { "date": "07/07", "barge": 2900, "hauling": 2650 }
  ]
}
```

### 5. TMM Data
**GET** `/api/dashboard/tmm`

Menampilkan data TMM (Total Material Movement) harian.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "date": "01/07", "ore": 500, "over": 1400, "tmm": 2000 },
    { "date": "02/07", "ore": 700, "over": 1600, "tmm": 2400 },
    { "date": "03/07", "ore": 800, "over": 1000, "tmm": 1800 },
    { "date": "04/07", "ore": 900, "over": 1500, "tmm": 2500 },
    { "date": "05/07", "ore": 600, "over": 1700, "tmm": 3000 },
    { "date": "06/07", "ore": 700, "over": 1200, "tmm": 2100 }
  ]
}
```

### 6. Lost Time Data
**GET** `/api/dashboard/lost-time`

Menampilkan data waktu hilang berdasarkan kategori.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "name": "Slippery", "value": 30 },
    { "name": "Rain", "value": 7 },
    { "name": "Waiting Hauler", "value": 1 },
    { "name": "Rest & Meals", "value": 1 },
    { "name": "Daily shift", "value": 1 },
    { "name": "Friday pray", "value": 1 }
  ]
}
```

### 7. Daily Achievement
**GET** `/api/dashboard/daily-achievment`

Menampilkan data pencapaian harian untuk berbagai shift.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "title": "Daily ACV",
      "details": [
        { "name": "Ore Hauling", "target": 10000, "actual": 8500 },
        { "name": "OB", "target": 12000, "actual": 10000 },
        { "name": "Ore Barging", "target": 9000, "actual": 8700 },
        { "name": "Quarry", "target": 8000, "actual": 7500 }
      ]
    },
    {
      "title": "Day Shift ACV",
      "details": [
        { "name": "Ore Hauling", "target": 10000, "actual": 8500 },
        { "name": "OB", "target": 12000, "actual": 10000 },
        { "name": "Ore Barging", "target": 9000, "actual": 8700 },
        { "name": "Quarry", "target": 8000, "actual": 7500 }
      ]
    },
    {
      "title": "Night Shift ACV",
      "details": [
        { "name": "Ore Hauling", "target": 10000, "actual": 8500 },
        { "name": "OB", "target": 12000, "actual": 10000 },
        { "name": "Ore Barging", "target": 9000, "actual": 8700 },
        { "name": "Quarry", "target": 8000, "actual": 7500 }
      ]
    }
  ]
}
```

### 8. Barge List
**GET** `/api/dashboard/barge-list`

Menampilkan daftar barge dan detail informasi kapasitas.

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "barge_name": "Barge Alpha",
        "start_loading": "2025-09-01 08:00",
        "finish_load": "2025-09-01 14:30",
        "capacity": 12000,
        "total_vessel": 1,
        "vol_by_draft": 11800,
        "capacity_per_dt": 95,
        "acv": 92,
        "remarks": "Smooth operation"
      }
    ],
    "details": [
      { "title": "Capacity", "value": 130000 },
      { "title": "Vessel", "value": 3100 },
      { "title": "Vol By Draft", "value": 123123 },
      { "title": "ACV", "value": 500 }
    ]
  }
}
```

## Struktur File

```
src/modules/dashboard/
├── dashboard.module.ts      # Module configuration
├── dashboard.controller.ts  # Controller dengan semua endpoint
├── dashboard.service.ts     # Service dengan logic bisnis
├── index.ts                # Export semua komponen
├── dto/                    # Data Transfer Objects (jika diperlukan)
└── entities/               # Entity models (jika diperlukan)
```

## Penggunaan

Module ini sudah terintegrasi ke dalam aplikasi utama dan dapat diakses melalui endpoint `/api/dashboard/*`. Semua endpoint mengembalikan data statis sesuai dengan spesifikasi yang diberikan.

## Swagger Documentation

Semua endpoint dashboard telah didokumentasikan dengan Swagger dan dapat diakses melalui:

- **Swagger UI**: `http://localhost:3000/api` (ketika aplikasi berjalan)
- **OpenAPI JSON**: `http://localhost:3000/api-json`

### Fitur Swagger yang Tersedia:

1. **API Tags**: Semua endpoint dikelompokkan di bawah tag "Dashboard"
2. **Operation Summary**: Setiap endpoint memiliki deskripsi singkat
3. **Detailed Description**: Penjelasan lengkap tentang fungsi setiap endpoint
4. **Response Schema**: Struktur response yang detail dengan contoh data
5. **Type Safety**: DTO classes dengan ApiProperty decorator untuk validasi tipe data

### DTO Classes

Module ini menggunakan DTO (Data Transfer Object) classes untuk memastikan konsistensi response dan dokumentasi yang baik:

- `SpiderResponseDto` - Response untuk spider chart data
- `AchievementResponseDto` - Response untuk achievement data
- `HaulingResponseDto` - Response untuk hauling data
- `BargeResponseDto` - Response untuk barge data
- `TmmResponseDto` - Response untuk TMM data
- `LostTimeResponseDto` - Response untuk lost time data
- `DailyAchievementResponseDto` - Response untuk daily achievement data
- `BargeListResponseDto` - Response untuk barge list data
