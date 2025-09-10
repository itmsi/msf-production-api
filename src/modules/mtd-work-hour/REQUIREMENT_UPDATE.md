# MTD Work Hour API - Update Sesuai Requirement

## Overview
API MTD Work Hour telah diperbarui sesuai dengan requirement yang diminta untuk mengambil data dari `m_population` dan `r_loss_time` berdasarkan problem type yang spesifik.

## Perubahan yang Dilakukan

### 1. Update Service Logic
- **File**: `src/modules/mtd-work-hour/mtd-work-hour.service.ts`
- **Perubahan**: Mengubah query dari `effectiveWorkingHours` menjadi `r_loss_time` (EffectiveWorkingHours entity)
- **Logic Baru**: 
  - Unit diambil dari `m_population` dengan status active
  - Duration diambil dari `r_loss_time.duration` berdasarkan problem type
  - Data dikelompokkan berdasarkan unit dan problem type

### 2. Method Baru yang Ditambahkan
- **`getMtdWorkHourByAllProblemTypes()`**: Mengambil data berdasarkan semua problem type yang spesifik sesuai requirement

### 3. Update Controller
- **File**: `src/modules/mtd-work-hour/mtd-work-hour.controller.ts`
- **Endpoint Baru**: `GET /mtd-work-hour/all-problem-types`
- **Fungsi**: Mengembalikan data dengan struktur yang sesuai requirement

### 4. Update DTO
- **File**: `src/modules/mtd-work-hour/dto/mtd-work-hour.dto.ts`
- **Perubahan**: Menambahkan `SCHEDULE_MAINTENANCE = 'Schedule Maintenance'` ke enum ProblemType

## Problem Types yang Didukung

Sesuai dengan requirement, API mendukung problem types berikut:

1. **P5M** - Preventive Maintenance
2. **Pergantian Shift** - Pergantian Shift
3. **Rest Time** - Waktu Istirahat
4. **GST** - General Service Time
5. **Travelling** - Perjalanan
6. **Perbaikan Front Loading** - Perbaikan Front Loading
7. **Cek Elevasi** - Pengecekan Elevasi
8. **Refuelling** - Pengisian Bahan Bakar
9. **Slippery** - Kondisi Licin
10. **Travelling Equipment** - Perjalanan Equipment
11. **Fogging** - Fogging
12. **Safety Talk** - Safety Talk
13. **P2H** - P2H
14. **Schedule Maintenance** - Schedule Maintenance (ditambahkan untuk data yang ada)

## Endpoints yang Tersedia

### 1. GET /mtd-work-hour
- **Fungsi**: Mengambil data MTD Work Hour dengan filter dan pagination
- **Response**: Data dikelompokkan berdasarkan unit dengan detail problems

### 2. GET /mtd-work-hour/by-problem-type
- **Fungsi**: Mengambil data berdasarkan jenis problem tertentu
- **Required**: problemType
- **Response**: Array data untuk problem type tertentu

### 3. GET /mtd-work-hour/all-problem-types
- **Fungsi**: Mengambil data berdasarkan semua problem type yang spesifik
- **Response**: Data dengan struktur field yang sesuai requirement

### 4. GET /mtd-work-hour/summary
- **Fungsi**: Mengambil summary data berdasarkan jenis problem
- **Response**: Summary dengan totalDuration, count, averageDuration

## Contoh Response

### GET /mtd-work-hour/all-problem-types
```json
{
  "statusCode": 200,
  "message": "Data MTD Work Hour berdasarkan semua problem types berhasil diambil",
  "data": [
    {
      "unit": "KFM-DT-001",
      "p5m": 2.5,
      "pergShift": 1.0,
      "restTime": 0.5,
      "gst": 1.5,
      "travelling": 2.0,
      "perbaikanFrontLoading": 0.0,
      "cekElevasi": 0.5,
      "refuelling": 1.0,
      "slippery": 0.0,
      "travellingEquipment": 0.5,
      "fogging": 0.0,
      "safetyTalk": 0.5,
      "p2h": 1.0,
      "totalDuration": 11.0
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

## Data Sources

### 1. Unit Data
- **Source**: `m_population.no_unit`
- **Filter**: `status = 'active'`

### 2. Duration Data
- **Source**: `r_loss_time.duration`
- **Join**: `r_loss_time.activities_id = m_activities.id`
- **Filter**: `r_loss_time.deletedAt IS NULL`

### 3. Problem Type
- **Source**: `m_activities.name`
- **Filter**: Berdasarkan problem types yang didukung

## Testing

### Test Endpoint Baru
```bash
curl -X 'GET' \
  'http://localhost:9539/api/mtd-work-hour/all-problem-types?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

### Test Endpoint Existing
```bash
curl -X 'GET' \
  'http://localhost:9539/api/mtd-work-hour?page=1&limit=5' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

## Kesimpulan

API MTD Work Hour telah berhasil diperbarui sesuai dengan requirement:
- ✅ Unit diambil dari `m_population`
- ✅ Duration diambil dari `r_loss_time` berdasarkan problem type
- ✅ Data dikelompokkan berdasarkan unit
- ✅ Mendukung semua problem types yang diminta
- ✅ Endpoint baru `/all-problem-types` dengan struktur response yang sesuai
- ✅ Backward compatibility dengan endpoint existing terjaga
- ✅ Testing berhasil dilakukan

API siap digunakan dengan struktur data yang sesuai requirement.
