# API Examples - Parent Plan Working Hour

## Endpoint
`POST /api/parent-plan-working-hour`

## Request Body Examples

### Contoh 1: Agustus 2025 dengan Long Shift
```json
{
  "plan_date": "2025-08-01",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour": 184,
  "total_working_day_longshift": 5,
  "working_hour_longshift": 12,
  "working_hour_longshift_day": 8.5,
  "total_mohh_per_month": 1000,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 2
    },
    {
      "activities_id": 2,
      "activities_hour": 4
    },
    {
      "activities_id": 3,
      "activities_hour": 6
    }
  ]
}
```

### Contoh 2: September 2025 dengan Long Shift Minimal
```json
{
  "plan_date": "2025-09-01",
  "total_calendar_day": 30,
  "total_holiday_day": 9,
  "total_available_day": 21,
  "total_working_hour": 168,
  "total_working_day_longshift": 3,
  "working_hour_longshift": 10,
  "working_hour_longshift_day": 7.5,
  "total_mohh_per_month": 800,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 1
    },
    {
      "activities_id": 2,
      "activities_hour": 2
    },
    {
      "activities_id": 3,
      "activities_hour": 3
    }
  ]
}
```

### Contoh 3: Oktober 2025 tanpa Long Shift
```json
{
  "plan_date": "2025-10-01",
  "total_calendar_day": 31,
  "total_holiday_day": 10,
  "total_available_day": 21,
  "total_working_hour": 168,
  "total_working_day_longshift": 0,
  "working_hour_longshift": 8,
  "working_hour_longshift_day": null,
  "total_mohh_per_month": 600,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 1
    },
    {
      "activities_id": 2,
      "activities_hour": 1
    }
  ]
}
```

## Field Descriptions

### Field Baru: `working_hour_longshift_day`
- **Tipe**: `number` (decimal dengan 2 digit desimal)
- **Required**: `false` (opsional)
- **Format**: `float`
- **Contoh Nilai**:
  - `8.5` = 8 jam 30 menit
  - `9.0` = 9 jam penuh
  - `7.5` = 7 jam 30 menit
  - `10.0` = 10 jam penuh
- **Deskripsi**: Jam kerja long shift per hari untuk shift yang lebih panjang dari shift normal

### Field Lainnya
- **`plan_date`**: Tanggal rencana (format: YYYY-MM-DD)
- **`total_calendar_day`**: Total hari dalam bulan (28-31)
- **`total_holiday_day`**: Total hari libur dalam bulan
- **`total_available_day`**: Total hari tersedia untuk kerja
- **`total_working_hour`**: Total jam kerja dalam bulan
- **`total_working_day_longshift`**: Total hari dengan long shift
- **`working_hour_longshift`**: Jam kerja per hari untuk long shift
- **`total_mohh_per_month`**: Total MOHH (Man Operating Hour per Hour) per bulan
- **`detail`**: Array aktivitas dengan jam kerja masing-masing

## Response Example

```json
{
  "statusCode": 201,
  "message": "Parent plan working hour berhasil dibuat",
  "data": {
    "id": 3,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_calendar_day": 31,
    "total_holiday_day": 8,
    "total_available_day": 23,
    "total_working_hour": 184,
    "total_working_day_longshift": 5,
    "working_hour_longshift": 12,
    "working_hour_longshift_day": "8.50",
    "total_mohh_per_month": 1000,
    "createdAt": "2025-08-22T10:15:04.945Z",
    "updatedAt": "2025-08-22T10:15:04.945Z",
    "deletedAt": null,
    "planWorkingHours": [...]
  }
}
```

## Notes
- Field `working_hour_longshift_day` bersifat opsional
- Jika tidak diisi, akan bernilai `null`
- Format decimal dengan 2 digit desimal (contoh: 8.50, 7.25, 10.00)
- Otomatis akan membuat detail harian sesuai jumlah hari dalam bulan
- Hari Minggu otomatis ditandai sebagai hari libur
