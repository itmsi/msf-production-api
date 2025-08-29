# Hauling List API Documentation

## GET /api/hauling-list

Mengambil semua data hauling list dengan pagination dan filter.

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | number | false | Nomor halaman (default: 1) | 1 |
| limit | number | false | Jumlah data per halaman (default: 10) | 10 |
| activity_date | string | false | Filter berdasarkan tanggal aktivitas spesifik | '2024-01-15' |
| start_date | string | false | Filter berdasarkan tanggal mulai aktivitas (YYYY-MM-DD) | '2024-01-01' |
| end_date | string | false | Filter berdasarkan tanggal akhir aktivitas (YYYY-MM-DD) | '2024-01-31' |
| shift | string | false | Filter berdasarkan shift | 'ds' atau 'ns' |
| material | string | false | Filter berdasarkan material | 'ore', 'biomas', dll |
| unit_loading_name | string | false | Filter berdasarkan nama unit loading | 'KFM-DT-001' |
| unit_hauler_name | string | false | Filter berdasarkan nama unit hauler | 'KFM-DT-002' |

### Filter Date Range

Anda dapat menggunakan kombinasi `start_date` dan `end_date` untuk filter berdasarkan rentang tanggal:

#### Contoh 1: Filter rentang tanggal lengkap
```bash
curl -X 'GET' \
  'http://localhost:9526/api/hauling-list?page=1&limit=10&start_date=2024-01-01&end_date=2024-01-31' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Contoh 2: Filter dari tanggal tertentu ke atas
```bash
curl -X 'GET' \
  'http://localhost:9526/api/hauling-list?start_date=2024-01-15' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Contoh 3: Filter sampai tanggal tertentu ke bawah
```bash
curl -X 'GET' \
  'http://localhost:9526/api/hauling-list?end_date=2024-01-15' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Contoh 4: Kombinasi filter daterange dengan filter lain
```bash
curl -X 'GET' \
  'http://localhost:9526/api/hauling-list?start_date=2024-01-01&end_date=2024-01-31&material=ore&shift=ds' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Response Format

```json
{
  "statusCode": 200,
  "message": "Data hauling list berhasil diambil",
  "data": [
    {
      "id": 1,
      "activity_date": "2024-01-15T00:00:00.000Z",
      "shift": "ds",
      "time": "2024-01-15T08:00:00.000Z",
      "material": "ore",
      "vessel": 5,
      "total_tonnage": 175,
      "unit_loading": {
        "id": 6,
        "no_unit": "KFM-DT-001",
        "unit_type_name": "DT"
      },
      "unit_hauler": {
        "id": 7,
        "no_unit": "KFM-DT-002",
        "unit_type_name": "DT"
      },
      "loading_point": {
        "id": 2,
        "name": "Loading Point A"
      },
      "dumping_point_op": {
        "id": 2,
        "name": "Dumping Point OP A"
      },
      "dumping_point_barge": {
        "id": 2,
        "name": "Dumping Point Barge A"
      },
      "created_at": "2024-01-15T08:00:00.000Z",
      "updated_at": "2024-01-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  }
}
```

### Notes

- Format tanggal menggunakan ISO 8601 (YYYY-MM-DD)
- Jika `start_date` dan `end_date` keduanya disediakan, akan mencari data dengan `activity_date` di antara kedua tanggal tersebut (inclusive)
- Jika hanya `start_date` yang disediakan, akan mencari data dengan `activity_date` >= start_date
- Jika hanya `end_date` yang disediakan, akan mencari data dengan `activity_date` <= end_date
- Filter daterange dapat dikombinasikan dengan filter lainnya
