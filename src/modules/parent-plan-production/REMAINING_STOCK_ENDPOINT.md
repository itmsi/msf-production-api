# Endpoint GET /api/parent-plan-production/remaining-stock

## Deskripsi
Endpoint ini digunakan untuk mendapatkan data remaining stock dari bulan sebelumnya berdasarkan tanggal yang diberikan.

## URL
```
GET /api/parent-plan-production/remaining-stock
```

## Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| plan_date | string | Yes | Tanggal rencana produksi (format: YYYY-MM-DD). Sistem akan mencari remaining stock dari tanggal terakhir bulan sebelumnya. | 2025-09-06 |

## Logika Bisnis
1. Input: `plan_date` (contoh: 2025-09-06)
2. Sistem menghitung tanggal terakhir bulan sebelumnya:
   - Bulan dari input: September 2025
   - Bulan sebelumnya: Agustus 2025
   - Tanggal terakhir Agustus: 31 Agustus 2025
   - Search date: 2025-08-31
3. Sistem mencari data di tabel `r_plan_production` dengan `plan_date = 2025-08-31`
4. Mengambil kolom `remaining_stock` dari data tersebut

## Response Success (200) - Data Ditemukan
```json
{
  "data": {
    "remaining_stock": 150000.0,
    "plan_date": "2025-08-31T00:00:00.000Z",
    "search_date": "2025-08-31",
    "input_date": "2025-09-06"
  },
  "message": "Remaining stock berhasil ditemukan",
  "statusCode": 200
}
```

## Response Success (200) - Data Tidak Ditemukan (Default 0)
```json
{
  "data": {
    "remaining_stock": 0,
    "plan_date": null,
    "search_date": "2025-11-30",
    "input_date": "2025-12-06",
    "message": "Data remaining stock tidak ditemukan untuk tanggal 2025-11-30 (tanggal terakhir bulan sebelumnya), menggunakan default value 0"
  },
  "message": "Remaining stock berhasil ditemukan",
  "statusCode": 200
}
```

## Response Error (400)
```json
{
  "statusCode": 400,
  "message": "Format tanggal tidak valid. Gunakan format YYYY-MM-DD",
  "error": "Bad Request"
}
```

## Response Error (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Contoh Penggunaan

### Contoh 1: Bulan dengan 31 hari
- Input: `plan_date=2025-09-06`
- Search: `2025-08-31` (tanggal terakhir Agustus)
- Result: remaining_stock dari data tanggal 31 Agustus 2025

### Contoh 2: Bulan dengan 30 hari
- Input: `plan_date=2025-10-15`
- Search: `2025-09-30` (tanggal terakhir September)
- Result: remaining_stock dari data tanggal 30 September 2025

### Contoh 3: Bulan Februari (28 hari)
- Input: `plan_date=2025-03-10`
- Search: `2025-02-28` (tanggal terakhir Februari)
- Result: remaining_stock dari data tanggal 28 Februari 2025

## Implementasi
- **Controller**: `ParentPlanProductionController.getRemainingStock()`
- **Service**: `ParentPlanProductionService.getRemainingStockFromPreviousMonth()`
- **DTO**: `GetRemainingStockQueryDto`
- **Entity**: `PlanProduction` (tabel `r_plan_production`)

## Catatan
- Endpoint ini memerlukan JWT authentication
- Data yang dicari adalah dari tabel `r_plan_production` bukan dari `r_parent_plan_production`
- Jika data tidak ditemukan untuk tanggal terakhir bulan sebelumnya, akan mengembalikan default value 0
- Format tanggal harus YYYY-MM-DD, jika tidak valid akan mengembalikan error 400
