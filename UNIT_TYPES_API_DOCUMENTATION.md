# Unit Types API Documentation

## Overview
API untuk mengelola data unit types dengan fitur pagination, filtering, sorting, dan grouping.

## Endpoints

### GET /api/unit-types

Mendapatkan semua data unit type dengan berbagai opsi filtering dan grouping.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | string | No | "1" | Nomor halaman |
| `limit` | string | No | "10" | Jumlah data per halaman (max: 100) |
| `search` | string | No | - | Pencarian umum di semua field |
| `brand_id` | string | No | - | Filter berdasarkan brand ID |
| `unit_name` | string | No | - | Filter berdasarkan nama unit |
| `type_name` | string | No | - | Filter berdasarkan tipe unit |
| `model_name` | string | No | - | Filter berdasarkan model unit |
| `sortBy` | string | No | "id" | Field untuk sorting |
| `sortOrder` | string | No | "DESC" | Urutan sorting (ASC/DESC) |
| `is_group` | string | No | "false" | Jika true, data dikelompokkan berdasarkan unit_name |

#### Contoh Request

**1. Tanpa Grouping (Default)**
```bash
curl -X 'GET' \
  'http://localhost:9526/api/unit-types?page=1&limit=10&sortBy=unit_name' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data unit type berhasil diambil",
  "data": [
    {
      "id": 1,
      "brand_id": 1,
      "unit_name": "Excavator",
      "type_name": "Heavy Equipment",
      "model_name": "PC200-8",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "brand": {
        "id": 1,
        "brand_name": "Komatsu"
      }
    },
    {
      "id": 2,
      "brand_id": 1,
      "unit_name": "Excavator",
      "type_name": "Heavy Equipment",
      "model_name": "PC300-8",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "brand": {
        "id": 1,
        "brand_name": "Komatsu"
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

**2. Dengan Grouping**
```bash
curl -X 'GET' \
  'http://localhost:9526/api/unit-types?page=1&limit=10&sortBy=unit_name&is_group=true' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data unit type berhasil diambil",
  "data": [
    {
      "id": 1,
      "unit_name": "Excavator"
    },
    {
      "id": 2,
      "unit_name": "Dump Truck"
    },
    {
      "id": 3,
      "unit_name": "Loader"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

#### Fitur Grouping

Parameter `is_group` memungkinkan Anda untuk:

1. **`is_group=false` (Default)**: Menampilkan semua data unit type dalam format array biasa dengan semua field
2. **`is_group=true`**: Menampilkan data unit type yang dikelompokkan berdasarkan `unit_name` dengan format sederhana:
   - Hanya menampilkan `id` dan `unit_name`
   - Menggunakan query terpisah dengan `GROUP BY` untuk menghindari duplikasi
   - Setiap `unit_name` hanya muncul sekali

#### Kombinasi dengan Filter Lain

Parameter `is_group` dapat dikombinasikan dengan semua filter dan sorting yang ada:

```bash
# Grouping dengan search
curl -X 'GET' \
  'http://localhost:9526/api/unit-types?search=excavator&is_group=true' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Grouping dengan brand filter
curl -X 'GET' \
  'http://localhost:9526/api/unit-types?brand_id=1&is_group=true' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Grouping dengan pagination
curl -X 'GET' \
  'http://localhost:9526/api/unit-types?page=1&limit=5&is_group=true' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Parameter query tidak valid |
| 401 | Unauthorized - JWT token tidak valid atau tidak ada |
| 500 | Internal Server Error - Terjadi kesalahan pada server |

## Implementasi Teknis

### DTO Changes
- Menambahkan parameter `is_group` ke `GetUnitTypesQueryDto`
- Membuat `GroupedUnitTypeDto` dan `GroupedUnitTypeItemDto` untuk response grouping

### Service Logic
- Menambahkan logika conditional untuk grouping di `UnitTypeService.findAll()`
- Menggunakan query terpisah dengan `GROUP BY` untuk mendapatkan `unit_name` yang unik
- Query grouping hanya mengambil `id` dan `unit_name` untuk performa yang lebih baik
- Pagination diterapkan setelah grouping untuk hasil yang akurat

### Controller Updates
- Menambahkan dokumentasi API untuk parameter `is_group`
- Update response schema untuk mendukung kedua format (grouped dan ungrouped)
