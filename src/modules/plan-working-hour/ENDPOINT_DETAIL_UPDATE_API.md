# Endpoint Detail Update API Documentation

## PATCH /api/parent-plan-working-hour/detail/{id}

Endpoint ini digunakan untuk mengupdate data detail parent plan working hour berdasarkan ID. Endpoint ini akan mengedit data di tabel `r_plan_working_hour` dan `r_plan_working_hour_detail`.

### Deskripsi
Mengupdate data detail parent plan working hour berdasarkan ID (r_plan_working_hour dan r_plan_working_hour_detail)

### Method
`PATCH`

### URL
```
/api/parent-plan-working-hour/detail/{id}
```

### Parameters

#### Path Parameters
- `id` (number, required): ID parent plan working hour

#### Query Parameters (untuk GET /api/parent-plan-working-hour/detail)
- `start_date` (string, required): Tanggal mulai (YYYY-MM-DD)
- `end_date` (string, required): Tanggal akhir (YYYY-MM-DD)
- `month_year` (string, required): Bulan dan tahun (YYYY-MM)
- `page` (string, optional): Nomor halaman (default: 1)
- `limit` (string, optional): Jumlah data per halaman (default: 10, max: 100)
- `calendar_day` (string, optional): Filter berdasarkan status hari kalender
  - `available`: Filter data dengan schedule_day = 1
  - `holiday`: Filter data dengan schedule_day = 0
  - `one-shift`: Filter data dengan schedule_day = 0.5

#### Request Body
```json
{
  "plan_date": "2025-08-01",
  "working_hour_month": 184,
  "working_day_longshift": 5,
  "working_hour_day": 8,
  "working_hour_longshift": 12,
  "mohh_per_month": 1000,
  "schedule_day": 23,
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
    }
  ]
}
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
accept: application/json
```

### Response

#### Success Response (200)
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diupdate",
      "data": {
      "id": 9,
      "plan_date": "2025-08-01T00:00:00.000Z",
      "working_hour_month": 184,
      "working_hour_day": 8,
      "working_day_longshift": 5,
      "working_hour_longshift": "12.00",
      "mohh_per_month": 1000,
      "schedule_day": 23,
    "details": [
      {
        "name": "Delay",
        "group_detail": [
          {
            "activities_id": 1,
            "name": "P5M",
            "type_data": "number",
            "type_field": "input",
            "activities_hour": 1
          }
        ]
      }
    ]
  }
}
```

#### Error Response (400)
```json
{
  "statusCode": 400,
  "message": "Parent plan working hour dengan ID 1 tidak ditemukan",
  "error": "Bad Request"
}
```

### Contoh Penggunaan

#### cURL untuk Update Detail
```bash
curl -X 'PATCH' \
  'http://localhost:9526/api/parent-plan-working-hour/detail/366' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYxMDcyMTgsImV4cCI6MTc1NjE5MzYxOH0.1FvKAexsLE_1rP1_UiV_JynchBs-5_eXWi3axRht81M' \
  -H 'Content-Type: application/json' \
  -d '{
  "plan_date": "2025-08-01",
  "working_hour_month": 184,
  "working_day_longshift": 5,
  "working_hour_day": 8,
  "working_hour_longshift": 12,
  "mohh_per_month": 1000,
  "schedule_day": 23,
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
    }
  ]
}'
```

#### cURL untuk GET Detail dengan Filter
```bash
# Filter berdasarkan available days (schedule_day = 1)
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10&calendar_day=available' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'

# Filter berdasarkan holiday days (schedule_day = 0)
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10&calendar_day=holiday' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'

# Filter berdasarkan one-shift days (schedule_day = 0.5)
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10&calendar_day=one-shift' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

### Implementasi

#### Update Detail
Endpoint ini menggunakan method `updateDetail` di `ParentPlanWorkingHourService` yang akan:

#### Get Detail dengan Filter
Endpoint ini menggunakan method `getDetail` di `ParentPlanWorkingHourService` yang akan:

1. **Filter berdasarkan calendar_day**:
   - `available`: Mencari data dengan `schedule_day = 1`
   - `holiday`: Mencari data dengan `schedule_day = 0`
   - `one-shift`: Mencari data dengan `schedule_day = 0.5`

2. **Response calendar_day berdasarkan schedule_day**:
   - Jika `schedule_day = 1` → `calendar_day = "available"`
   - Jika `schedule_day = 0` → `calendar_day = "holiday"`
   - Jika `schedule_day = 0.5` → `calendar_day = "one-shift"`

#### Update Detail
Endpoint ini menggunakan method `updateDetail` di `ParentPlanWorkingHourService` yang akan:

1. **Update Parent Plan**: Mengupdate data di tabel `r_parent_plan_working_hour` jika ada perubahan plan_date
2. **Update Plan Working Hour**: Mengupdate data di tabel `r_plan_working_hour` untuk semua tanggal terkait dengan field baru:
   - `working_hour_month`: Total jam kerja per bulan
   - `working_day_longshift`: Total hari kerja long shift
   - `working_hour_longshift`: Total jam kerja long shift
   - `working_hour_day`: Total jam kerja per hari
   - `mohh_per_month`: Total MOHH per bulan
   - `schedule_day`: Total hari schedule kerja
3. **Update Plan Working Hour Detail**: Mengupdate data di tabel `r_plan_working_hour_detail` dengan menghapus detail lama dan insert detail baru

### Perbedaan dengan Endpoint Update Biasa

- **Endpoint Update Biasa** (`PATCH /api/parent-plan-working-hour/{id}`): Mengupdate semua data termasuk parent plan dengan field lama
- **Endpoint Detail Update** (`PATCH /api/parent-plan-working-hour/detail/{id}`): Fokus pada update detail di tabel `r_plan_working_hour` dan `r_plan_working_hour_detail` dengan field baru

### Field Baru yang Digunakan

- `working_hour_month`: Menggantikan `total_working_hour_month`
- `working_day_longshift`: Menggantikan `total_working_day_longshift`
- `working_hour_day`: Menggantikan `total_working_hour_day`
- `working_hour_longshift`: Menggantikan `total_working_hour_longshift`
- `mohh_per_month`: Menggantikan `total_mohh_per_month`
- `schedule_day`: Field baru untuk total hari schedule kerja

### Catatan Penting

- Endpoint ini menggunakan transaction untuk memastikan konsistensi data
- Jika terjadi error, semua perubahan akan di-rollback
- Field yang tidak ada di request body tidak akan diupdate
- Detail activities akan dihapus dan di-insert ulang untuk semua tanggal terkait
