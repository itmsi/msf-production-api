# MTD Work Hour API Documentation

## Overview
API ini menyediakan endpoint untuk mengambil data MTD (Month-to-Date) Work Hour berdasarkan berbagai jenis problem yang terjadi pada unit. Data diambil dari tabel Effective Working Hours dan Population.

## Base URL
```
http://localhost:3000/mtd-work-hour
```

## Authentication
Semua endpoint memerlukan JWT authentication. Gunakan header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get MTD Work Hour Data
**GET** `/mtd-work-hour`

Mengambil data MTD Work Hour dengan filter dan pagination.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| startDate | string | No | Tanggal mulai filter (YYYY-MM-DD) | 2024-01-01 |
| endDate | string | No | Tanggal akhir filter (YYYY-MM-DD) | 2024-01-31 |
| unit | string | No | Filter berdasarkan unit | DT-001 |
| problemType | string | No | Filter berdasarkan jenis problem | P5M |
| page | number | No | Nomor halaman (default: 1) | 1 |
| limit | number | No | Jumlah data per halaman (default: 10) | 10 |

#### Response
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
        },
        {
          "unit": "DT-001",
          "activityDate": "2024-01-15",
          "problemType": "GST",
          "duration": 1.0,
          "description": "GST - General Service Time",
          "totalDuration": 1.0
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

### 2. Get MTD Work Hour by Problem Type
**GET** `/mtd-work-hour/by-problem-type`

Mengambil data MTD Work Hour berdasarkan jenis problem tertentu.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| problemType | string | **Yes** | Jenis problem yang dicari | P5M |
| startDate | string | No | Tanggal mulai filter (YYYY-MM-DD) | 2024-01-01 |
| endDate | string | No | Tanggal akhir filter (YYYY-MM-DD) | 2024-01-31 |
| unit | string | No | Filter berdasarkan unit | DT-001 |
| page | number | No | Nomor halaman (default: 1) | 1 |
| limit | number | No | Jumlah data per halaman (default: 10) | 10 |

#### Response
```json
{
  "statusCode": 200,
  "message": "Data P5M berhasil diambil",
  "data": [
    {
      "unit": "DT-001",
      "activityDate": "2024-01-15",
      "problemType": "P5M",
      "duration": 2.5,
      "description": "P5M - Preventive Maintenance",
      "totalDuration": 2.5
    },
    {
      "unit": "DT-002",
      "activityDate": "2024-01-15",
      "problemType": "P5M",
      duration": 3.0,
      "description": "P5M - Preventive Maintenance",
      "totalDuration": 3.0
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 3. Get MTD Work Hour Summary
**GET** `/mtd-work-hour/summary`

Mengambil summary data MTD Work Hour berdasarkan jenis problem.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| startDate | string | No | Tanggal mulai filter (YYYY-MM-DD) | 2024-01-01 |
| endDate | string | No | Tanggal akhir filter (YYYY-MM-DD) | 2024-01-31 |
| unit | string | No | Filter berdasarkan unit | DT-001 |
| problemType | string | No | Filter berdasarkan jenis problem | P5M |

#### Response
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
    },
    {
      "problemType": "GST",
      "totalDuration": 8.0,
      "count": 4,
      "averageDuration": 2.0
    }
  ]
}
```

### 4. Get Available Problem Types
**GET** `/mtd-work-hour/problem-types`

Mengambil daftar jenis problem yang tersedia.

#### Response
```json
{
  "statusCode": 200,
  "message": "Daftar jenis problem berhasil diambil",
  "data": [
    "P5M",
    "Perg. Shift",
    "Rest Time",
    "GST",
    "Travelling",
    "Perbaikan Front Loading",
    "Cek Elevasi",
    "Refuelling",
    "Slippery",
    "Travelling Equipment",
    "Fogging",
    "Safety Talk",
    "P2H"
  ]
}
```

## Problem Types

Berikut adalah daftar jenis problem yang didukung:

1. **P5M** - Preventive Maintenance
2. **Perg. Shift** - Pergantian Shift
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

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Gagal mendapatkan data: Problem type harus diisi",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Contoh Penggunaan

### Mengambil data semua unit dengan filter tanggal
```bash
curl -X GET "http://localhost:3000/mtd-work-hour?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Mengambil data P5M untuk unit tertentu
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/by-problem-type?problemType=P5M&unit=DT-001" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Mengambil summary data
```bash
curl -X GET "http://localhost:3000/mtd-work-hour/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Database Schema

### Tabel yang Digunakan
- `m_population` - Data master population/unit
- `r_loss_time` - Data effective working hours dengan berbagai jenis problem
- `m_activities` - Data master activities

### Relasi
- `r_loss_time.population_id` → `m_population.id`
- `r_loss_time.activities_id` → `m_activities.id`

## Notes
- Semua tanggal menggunakan format YYYY-MM-DD
- Durasi dalam satuan jam (float)
- Pagination dimulai dari halaman 1
- Maksimal limit per halaman adalah 100
