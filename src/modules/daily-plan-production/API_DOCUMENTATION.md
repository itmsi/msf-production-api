# Daily Plan Production API Documentation

## Overview
Module ini menangani operasi CRUD untuk tabel `r_plan_production` dengan logika bisnis yang kompleks, termasuk filter berdasarkan `calendar_day` dan logic response yang diperbarui.

## Endpoint

### GET /api/daily-plan-production

Mengambil semua data daily plan production dengan pagination, filter, dan sorting.

#### Query Parameters

| Parameter | Tipe | Required | Default | Deskripsi |
|-----------|------|----------|---------|------------|
| `start_date` | string | false | - | Filter tanggal mulai (YYYY-MM-DD) |
| `end_date` | string | false | - | Filter tanggal akhir (YYYY-MM-DD) |
| `search` | string | false | - | Keyword pencarian |
| `sortBy` | string | false | 'plan_date' | Field untuk sorting |
| `sortOrder` | string | false | 'DESC' | Urutan sorting (ASC/DESC) |
| `page` | number | false | 1 | Nomor halaman |
| `limit` | number | false | 10 | Limit per halaman |
| **`calendar_day`** | **string** | **false** | **-** | **Filter berdasarkan status hari kalender** |

#### Filter calendar_day

Parameter `calendar_day` memungkinkan filtering berdasarkan status hari kalender:

- **`available`**: Filter data dengan `schedule_day = 1`
- **`holiday`**: Filter data dengan `schedule_day = 0`
- **`one-shift`**: Filter data dengan `schedule_day = 0.5`

#### Contoh Request

##### 1. Get All Data (tanpa filter)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/daily-plan-production?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

##### 2. Filter Available Days
```bash
curl -X 'GET' \
  'http://localhost:9526/api/daily-plan-production?page=1&limit=10&calendar_day=available' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

##### 3. Filter Holiday Days
```bash
curl -X 'GET' \
  'http://localhost:9526/api/daily-plan-production?page=1&limit=10&calendar_day=holiday' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

##### 4. Filter One-Shift Days
```bash
curl -X 'GET' \
  'http://localhost:9526/api/daily-plan-production?page=1&limit=10&calendar_day=one-shift' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

##### 5. Kombinasi Filter
```bash
curl -X 'GET' \
  'http://localhost:9526/api/daily-plan-production?start_date=2025-08-01&end_date=2025-08-31&calendar_day=available&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

#### Response Structure

```json
{
  "statusCode": 200,
  "message": "Data daily plan production berhasil diambil",
  "data": [
    {
      "id": 1,
      "date": "2025-08-01",
      "calender_day": "available",
      "average_month_ewh": 1.5,
      "average_day_ewh": 1.5,
      "ob_target": 1000.0,
      "ore_target": 800.0,
      "quarry": 200.0,
      "sr_target": 1.25,
      "ore_shipment_target": 750.0,
      "sisa_stock": 50.0,
      "total_fleet": 15,
      "tonnage_per_fleet": 53.33,
      "vessel_per_fleet": 1.52,
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

#### Field Response

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | number | ID unik daily plan production |
| `date` | string | Tanggal rencana (YYYY-MM-DD) |
| **`calender_day`** | **string** | **Status hari kalender berdasarkan schedule_day** |
| `average_month_ewh` | number | Rata-rata EWH per bulan |
| `average_day_ewh` | number | Rata-rata EWH per hari |
| `ob_target` | number | Target OB (Overburden) |
| `ore_target` | number | Target ore |
| `quarry` | number | Target quarry |
| `sr_target` | number | Target SR (ob_target / ore_target) |
| `ore_shipment_target` | number | Target pengiriman ore |
| `sisa_stock` | number | Sisa stock (ore_target - ore_shipment_target) |
| `total_fleet` | number | Total armada |
| `tonnage_per_fleet` | number | Tonnage per armada |
| `vessel_per_fleet` | number | Vessel per armada |
| `is_available_to_edit` | boolean | Apakah tersedia untuk edit |
| `is_available_to_delete` | boolean | Apakah tersedia untuk hapus |

## Logic Response calendar_day

### Sebelum (Lama):
```typescript
// Berdasarkan kolom is_calender_day
const calenderDay = plan.is_calender_day ? 'available' : 'not holiday';
```

### Sesudah (Baru):
```typescript
// Berdasarkan kolom schedule_day
let calenderDay = 'holiday';
if (plan.schedule_day === 1) {
  calenderDay = 'available';
} else if (plan.schedule_day === 0.5) {
  calenderDay = 'one-shift';
} else if (plan.schedule_day === 0) {
  calenderDay = 'holiday';
}
```

### Mapping Nilai:
- **`schedule_day = 1`** → **`calender_day = "available"`**
- **`schedule_day = 0.5`** → **`calender_day = "one-shift"`**
- **`schedule_day = 0`** → **`calender_day = "holiday"`**

## Implementasi Filter

### Service Layer
```typescript
// Add filter berdasarkan calendar_day
if (calendar_day) {
  switch (calendar_day) {
    case 'available':
      where.schedule_day = 1;
      break;
    case 'holiday':
      where.schedule_day = 0;
      break;
    case 'one-shift':
      where.schedule_day = 0.5;
      break;
  }
}
```

### Database Query
Filter ini akan diterjemahkan ke query SQL:
```sql
-- Filter available days
WHERE schedule_day = 1

-- Filter holiday days  
WHERE schedule_day = 0

-- Filter one-shift days
WHERE schedule_day = 0.5
```

## Keuntungan Perubahan

1. **Filter Fleksibel**: Dapat memfilter data berdasarkan status hari kalender
2. **Logic Response yang Akurat**: Response `calender_day` berdasarkan nilai `schedule_day` yang sebenarnya
3. **Konsistensi Data**: Mapping yang jelas antara filter dan nilai database
4. **Fleksibilitas Query**: Dapat mengkombinasikan filter dengan parameter lainnya
5. **Dokumentasi Lengkap**: API documentation yang jelas dengan contoh penggunaan

## Testing

### Test Cases untuk Filter

1. **Filter Available Days**:
   - Request: `calendar_day=available`
   - Expected: Semua data dengan `schedule_day = 1`
   - Response: `calender_day = "available"`

2. **Filter Holiday Days**:
   - Request: `calendar_day=holiday`
   - Expected: Semua data dengan `schedule_day = 0`
   - Response: `calender_day = "holiday"`

3. **Filter One-Shift Days**:
   - Request: `calendar_day=one-shift`
   - Expected: Semua data dengan `schedule_day = 0.5`
   - Response: `calender_day = "one-shift"`

4. **Kombinasi Filter**:
   - Request: `start_date=2025-08-01&end_date=2025-08-31&calendar_day=available`
   - Expected: Data available days dalam rentang tanggal tertentu

### Test Cases untuk Response

1. **Data dengan schedule_day = 1**:
   - Expected Response: `calender_day = "available"`

2. **Data dengan schedule_day = 0.5**:
   - Expected Response: `calender_day = "one-shift"`

3. **Data dengan schedule_day = 0**:
   - Expected Response: `calender_day = "holiday"`

## Catatan Penting

- Endpoint menggunakan JWT authentication
- Filter `calendar_day` bersifat optional
- Response `calender_day` selalu konsisten dengan nilai `schedule_day`
- Pagination tetap berfungsi dengan filter yang diterapkan
- Sorting dan search tetap berfungsi dengan filter yang diterapkan
