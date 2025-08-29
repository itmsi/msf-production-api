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
      "activity_date": "2024-01-15",
      "shift": "ds",
      "time": "2024-01-15T08:00:00.000Z",
      "time_range": "08-09",
      "unit_loading_id": 6,
      "unit_loading_name": "KFM-DT-001",
      "unit_hauler_id": 7,
      "unit_hauler_name": "KFM-DT-002",
      "material": "ore",
      "loading_point_id": 2,
      "loading_point_name": "Loading Point A",
      "dumping_point_op_id": 2,
      "dumping_point_op_name": "Dumping Point OP A",
      "dumping_point_barge_id": 2,
      "dumping_point_barge_name": "Dumping Point Barge A",
      "vessel": 5,
      "total_tonnage": 175,
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T08:00:00.000Z"
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
- **Time Range**: Field `time_range` otomatis dihitung dari field `time` dengan format "HH-HH" (contoh: 09-10, 14-15)
  - Format menunjukkan rentang jam dari waktu yang ditentukan
  - Jika time = 09:12, maka time_range = "09-10"
  - Jika time = 14:30, maka time_range = "14-15"
