# Endpoint Detail Parent Plan Working Hour

## Overview
Endpoint ini digunakan untuk mengambil detail data parent plan working hour berdasarkan rentang tanggal dengan perhitungan metrics lengkap.

## Endpoint
```
GET /api/parent-plan-working-hour/detail
```

## Authentication
Endpoint ini memerlukan JWT authentication. Sertakan header:
```
Authorization: Bearer <jwt_token>
```

## Query Parameters

### Required Parameters
- `start_date` (string): Tanggal mulai dalam format YYYY-MM-DD
- `end_date` (string): Tanggal akhir dalam format YYYY-MM-DD  
- `month_year` (string): Bulan dan tahun dalam format YYYY-MM

### Optional Parameters
- `page` (string): Nomor halaman (default: 1)
- `limit` (string): Jumlah data per halaman (default: 10, max: 100)

## Example Request
```bash
GET /api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10
```

## Response Structure

### Success Response (200)
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": [
            {
          "plan_date": "2025-08-01",
          "calendar_day": "available",
          "working_hour_day": 8.00,
          "working_hour_month": 216.00,
          "working_hour_longshift": 14.40,
          "working_day_longshift": 1.50,
          "mohh_per_month": 100.00,
          "total_delay": 10.00,
          "total_idle": 10.00,
          "total_breakdown": 10.00,
          "ewh": 80.00,
          "pa": 1.00,
          "ma": 0.89,
          "ua": 0.80,
          "eu": 0.67,
          "is_available_to_edit": true,
          "is_available_to_delete": true
        }
  ],
  "pagination": {
    "total": 31,
    "page": 1,
    "limit": 10,
    "lastPage": 4
  }
}
```

## Field Descriptions

### Data Fields
- `plan_date`: Tanggal rencana dalam format YYYY-MM-DD
- `calendar_day`: Status hari kalender
  - `available`: Hari kerja normal (is_calender_day = true)
  - `one shift`: Hari dengan shift tunggal (is_calender_day = false)
  - `holiday`: Hari libur (is_calender_day = null)
- `working_hour_day`: Jam kerja per hari
- `working_hour_month`: Jam kerja per bulan
- `working_hour_longshift`: Jam kerja long shift
- `working_day_longshift`: Hari kerja long shift
- `mohh_per_month`: MOHH (Machine Operating Hours) per bulan
- `total_delay`: Total jam delay dari activities dengan status 'delay'
- `total_idle`: Total jam idle dari activities dengan status 'idle'
- `total_breakdown`: Total jam breakdown dari activities dengan status 'breakdown'

### Calculated Metrics
- `ewh` (Effective Working Hours): `total_mohh - total_delay - total_breakdown`
- `pa` (Performance Availability): `(ewh + total_delay + total_idle) / total_mohh`
- `ma` (Mechanical Availability): `ewh / (ewh + total_breakdown)`
- `ua` (Utilization Availability): `ewh / (ewh + total_delay + total_idle)`
- `eu` (Equipment Utilization): `ewh / (ewh + total_delay + total_idle + total_breakdown)`

### Availability Flags
- `is_available_to_edit`: Apakah data tersedia untuk diedit
  - `true`: Jika plan_date sama dengan bulan/tahun hari ini atau di masa depan
  - `false`: Jika plan_date di masa lalu
- `is_available_to_delete`: Apakah data tersedia untuk dihapus
  - `true`: Jika plan_date sama dengan bulan/tahun hari ini atau di masa depan
  - `false`: Jika plan_date di masa lalu

## Business Logic

### Calendar Day Determination
- `is_calender_day = true` → `calendar_day = "available"`
- `is_calender_day = false` → `calendar_day = "one shift"`
- `is_calender_day = null` → `calendar_day = "holiday"`

### Metrics Calculation
1. **EWH**: Effective Working Hours = Total MOHH - Total Delay - Total Breakdown
2. **PA**: Performance Availability = (EWH + Total Delay + Total Idle) / Total MOHH
3. **MA**: Mechanical Availability = EWH / (EWH + Total Breakdown)
4. **UA**: Utilization Availability = EWH / (EWH + Total Delay + Total Idle)
5. **EU**: Equipment Utilization = EWH / (EWH + Total Delay + Total Idle + Total Breakdown)

### Data Source
- Data utama diambil dari tabel `r_plan_working_hour`
- Detail activities diambil dari tabel `r_plan_working_hour_detail`
- Status activities diambil dari tabel `m_activities`
- Semua metrics dihitung secara real-time berdasarkan data yang ada

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Parameter start_date, end_date, dan month_year harus diisi",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Notes
- Endpoint ini mendukung pagination untuk data yang besar
- Semua metrics dihitung secara real-time berdasarkan data yang ada di database
- Filter berdasarkan rentang tanggal memastikan data yang relevan
- Response menggunakan helper `paginateResponse` untuk konsistensi dengan endpoint lainnya
- **Semua nilai numeric di-round ke 2 digit di belakang koma** untuk konsistensi format
