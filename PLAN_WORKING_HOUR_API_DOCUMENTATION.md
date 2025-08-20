# Plan Working Hour API Documentation

## Overview
Modul Plan Working Hour digunakan untuk mengelola data perencanaan jam kerja dengan detail activities. Data detail activities akan disimpan ke table `r_plan_working_hour_detail`.

## Base URL
```
/api/plan-working-hour
```

## Authentication
Semua endpoint memerlukan JWT Bearer Token yang valid.

## API Endpoints

### 1. Create Plan Working Hour
**POST** `/api/plan-working-hour`

Membuat data plan working hour baru dengan detail activities.

#### Validasi
- `plan_date` tidak boleh duplikat (sudah ada di database)
- `activities_id` harus valid
- `activities_hour` harus > 0

#### Request Body
```json
{
  "plan_date": "2025-01-01",
  "working_day_longshift": 1,
  "working_hour_longshift": 1,
  "working_hour": 1,
  "mohh_per_month": 1,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 1
    },
    {
      "activities_id": 2,
      "activities_hour": 1
    },
    {
      "activities_id": 3,
      "activities_hour": 1
    },
    {
      "activities_id": 4,
      "activities_hour": 1
    },
    {
      "activities_id": 5,
      "activities_hour": 1
    }
  ]
}
```

#### Field Auto-fill
Sistem akan otomatis mengisi field berikut berdasarkan `plan_date`:
- `is_calender_day`: `true` jika `plan_date` terisi
- `is_holiday_day`: `false` jika `plan_date` terisi
- `is_schedule_day`: `true` jika `plan_date` bukan hari minggu

#### Response Success (201)
```json
{
  "id": 1,
  "plan_date": "2025-01-01",
  "is_calender_day": true,
  "is_holiday_day": false,
  "is_schedule_day": true,
  "working_day_longshift": 1,
  "working_hour_longshift": 1,
  "working_hour": 1,
  "mohh_per_month": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "details": [
    {
      "id": 1,
      "plant_working_hour_id": 1,
      "activities_id": 1,
      "activities_hour": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Response Error (400) - Duplikasi Plan Date
```json
{
  "statusCode": 400,
  "message": "Data untuk tanggal 2025-08-25 sudah ada. Silakan gunakan tanggal yang berbeda.",
  "error": "Bad Request"
}
```

### 2. Get All Plan Working Hours
**GET** `/api/plan-working-hour`

Mendapatkan semua data plan working hour dengan filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plan_date` | string | false | Filter berdasarkan tanggal plan (format: YYYY-MM-DD) |
| `start_date` | string | false | Filter berdasarkan tanggal mulai (format: YYYY-MM-DD) |
| `end_date` | string | false | Filter berdasarkan tanggal akhir (format: YYYY-MM-DD) |
| `is_calender_day` | boolean | false | Filter berdasarkan calendar day |
| `is_holiday_day` | boolean | false | Filter berdasarkan holiday day |
| `is_schedule_day` | boolean | false | Filter berdasarkan schedule day |
| `working_hour` | number | false | Filter berdasarkan working hour |
| `working_day_longshift` | number | false | Filter berdasarkan working day longshift |
| `working_hour_longshift` | number | false | Filter berdasarkan working hour longshift |
| `mohh_per_month` | number | false | Filter berdasarkan MOHH per month |
| `page` | number | false | Halaman yang akan ditampilkan (default: 1) |
| `limit` | number | false | Jumlah data per halaman (default: 10, max: 100) |

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Plan working hours retrieved successfully",
  "data": [
    {
      "id": 1,
      "plan_date": "2025-01-01",
      "total_mohh": 160,
      "total_delay": 8,
      "total_idle": 4,
      "total_repair": 2,
      "ewh": 146,
      "pa": 0.99,
      "ma": 0.99,
      "ua": 0.92,
      "eu": 0.91,
      "is_available_to_edit": true,
      "is_available_to_delete": true
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "lastPage": 5
  }
}
```

#### Response Fields Description
- `total_mohh`: Total MOHH per bulan dari kolom `mohh_per_month`
- `total_delay`: Total jam delay (jumlah `activities_hour` dari activities dengan status 'delay')
- `total_idle`: Total jam idle (jumlah `activities_hour` dari activities dengan status 'idle')
- `total_repair`: Total jam repair/breakdown (jumlah `activities_hour` dari activities dengan status 'breakdown')
- `ewh`: Effective Working Hours = `total_mohh - (total_delay + total_idle + total_repair)` (2 digit desimal)
- `pa`: Production Availability = `(ewh + total_delay + total_idle) / total_mohh` (2 digit desimal)
- `ma`: Mechanical Availability = `ewh / (ewh + total_repair)` (2 digit desimal)
- `ua`: Utilization Availability = `ewh / (ewh + total_delay + total_idle)` (2 digit desimal)
- `eu`: Equipment Utilization = `ewh / total_mohh` (2 digit desimal)
- `is_available_to_edit`: `true` jika `plan_date` > hari ini
- `is_available_to_delete`: `true` jika `plan_date` > hari ini

### 3. Get Form Data
**GET** `/api/plan-working-hour/form`

Mendapatkan data activities yang dikelompokkan berdasarkan status untuk form plan working hour.

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Plan working hour form data",
          "data": {
          "data_working": [
            {
              "id": 1,
              "name": "Loading Barge"
            }
          ],
          "data_delay": [
            {
              "id": 2,
              "name": "P5M"
            }
          ],
          "data_idle": [
            {
              "id": 3,
              "name": "Waiting"
            }
          ],
          "data_breakdown": [
            {
              "id": 4,
              "name": "Maintenance"
            }
          ]
        }
}
```

#### Response Description
Data akan dikelompokkan secara dinamis berdasarkan status yang ada:
- `data_working`: activities dengan status 'working'
- `data_delay`: activities dengan status 'delay'
- `data_idle`: activities dengan status 'idle'
- `data_breakdown`: activities dengan status 'breakdown'
- `data_[status]`: activities dengan status lainnya (otomatis ditambahkan)

### 4. Get Working Hours Summary
**GET** `/api/plan-working-hour/summary`

Mendapatkan summary working hours berdasarkan range tanggal.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | true | Tanggal mulai (format: YYYY-MM-DD) |
| `endDate` | string | true | Tanggal akhir (format: YYYY-MM-DD) |

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Working hours summary retrieved successfully",
  "data": {
    "totalWorkingHours": 160,
    "totalWorkingDays": 20,
    "totalHolidayDays": 2,
    "averageWorkingHoursPerDay": 8
  }
}
```

### 5. Get Plan Working Hours by Date Range
**GET** `/api/plan-working-hour/date-range`

Mendapatkan data plan working hour berdasarkan range tanggal.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | true | Tanggal mulai (format: YYYY-MM-DD) |
| `endDate` | string | true | Tanggal akhir (format: YYYY-MM-DD) |

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Plan working hours by date range retrieved successfully",
  "data": [
    {
      "id": 1,
      "plan_date": "2025-01-01",
      "working_day_longshift": 1,
      "working_hour_longshift": 1,
      "activities_hour": 1,
      "mohh_per_month": 1,
      "is_available_to_edit": true,
      "is_available_to_delete": true,
      "details": [
        {
          "id": 1,
          "activities_id": 1,
          "activities_hour": 1
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 6. Get Plan Working Hour by ID
**GET** `/api/plan-working-hour/:id`

Mendapatkan data plan working hour berdasarkan ID tertentu.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | true | ID plan working hour |

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Plan working hour retrieved successfully",
  "data": {
    "id": 1,
    "plan_date": "2025-01-01",
    "working_day_longshift": 1,
    "working_hour_longshift": 1,
        "activities_hour": 1,
    "mohh_per_month": 1,
    "is_available_to_edit": true,
    "is_available_to_delete": true,
    "details": [
      {
        "id": 1,
        "activities_id": 1,
        "activities_hour": 1
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Response Error (404)
```json
{
  "statusCode": 404,
  "message": "Plan working hour with ID 1 not found"
}
```

### 7. Update Plan Working Hour
**PATCH** `/api/plan-working-hour/:id`

Mengupdate data plan working hour berdasarkan ID tertentu.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | true | ID plan working hour |

#### Request Body
```json
{
  "plan_date": "2025-01-02",
  "working_hour": 8,
  "detail": [
    {
      "activities_id": 1,
                "activities_hour": 4
    },
    {
      "activities_id": 2,
                "activities_hour": 4
    }
  ]
}
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Plan working hour updated successfully",
  "data": {
    "id": 1,
    "plan_date": "2025-01-02",
    "working_day_longshift": 1,
    "working_hour_longshift": 1,
    "working_hour": 8,
    "mohh_per_month": 1,
    "is_available_to_edit": true,
    "is_available_to_delete": true,
    "details": [
      {
        "id": 1,
        "activities_id": 1,
                  "activities_hour": 4
      },
      {
        "id": 2,
        "activities_id": 2,
                  "activities_hour": 4
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 8. Delete Plan Working Hour
**DELETE** `/api/plan-working-hour/:id`

Menghapus data plan working hour berdasarkan ID tertentu (soft delete).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | true | ID plan working hour |

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Plan working hour deleted successfully",
  "data": null
}
```

## Data Models

### Plan Working Hour Entity
```typescript
{
  id: number;
  plan_date: Date;
  working_hour: number;
  working_day_longshift: number;
  working_hour_longshift: number;
  mohh_per_month: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  details: PlanWorkingHourDetail[];
}
```

### Plan Working Hour Detail Entity
```typescript
{
  id: number;
  plant_working_hour_id: number;
  activities_id: number;
  working_hour: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

## Business Logic

### Auto-fill Fields
1. **is_calender_day**: Otomatis `true` jika `plan_date` terisi
2. **is_holiday_day**: Otomatis `false` jika `plan_date` terisi
3. **is_schedule_day**: Otomatis `true` jika `plan_date` bukan hari minggu

### Availability Fields
1. **is_available_to_edit**: `true` jika `plan_date` > hari ini
2. **is_available_to_delete**: `true` jika `plan_date` > hari ini

### Detail Management
- Saat create: Detail activities akan disimpan ke table `r_plan_working_hour_detail`
- Saat update: Detail lama akan dihapus dan diganti dengan detail baru
- Saat delete: Detail akan dihapus terlebih dahulu sebelum menghapus plan working hour

## Error Handling

### Common Error Responses
- **400 Bad Request**: Data tidak valid atau required field kosong
- **401 Unauthorized**: JWT token tidak valid atau expired
- **404 Not Found**: Data plan working hour tidak ditemukan
- **500 Internal Server Error**: Error internal server

## Notes
- Semua endpoint memerlukan authentication JWT
- Data detail activities akan otomatis dikelola saat CRUD operations
- Field availability (`is_available_to_edit`, `is_available_to_delete`) akan otomatis dihitung berdasarkan tanggal
- Soft delete digunakan untuk semua operasi delete
