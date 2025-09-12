# Update Endpoint Lost Time Dashboard

## Overview
Endpoint `/api/dashboard/lost-time` telah diupdate untuk mengikuti spesifikasi yang diberikan. Endpoint ini sekarang mengambil data dari tabel `m_activities` dan `r_loss_time` dengan filter berdasarkan status aktivitas dan rentang tanggal.

## Perubahan yang Dibuat

### 1. Controller Update (`dashboard.controller.ts`)
- Menambahkan parameter query `start_date` dan `end_date`
- Menambahkan dokumentasi API dengan `@ApiQuery` untuk kedua parameter
- Parameter bersifat opsional dengan format YYYY-MM-DD

### 2. Service Update (`dashboard.service.ts`)
- Mengimplementasikan query database yang kompleks
- Menggunakan JOIN antara tabel `r_loss_time` dan `m_activities`
- Filter berdasarkan status aktivitas 'idle' dan 'delay'
- Filter berdasarkan rentang tanggal yang diberikan
- Mengelompokkan data berdasarkan problem type dari kolom `description`

## Query Logic

### Problem Type Classification
Data dikelompokkan berdasarkan kata kunci dalam kolom `activity_name` (prioritas utama) dan `description` (fallback):

1. **Slippery**: Contains 'slippery' dalam activity_name atau description
2. **Rain**: Contains 'rain' atau 'hujan' dalam activity_name atau description
3. **Waiting Hauler**: Contains 'waiting hauler' atau 'menunggu hauler' dalam activity_name atau description
4. **Rest & Meals**: Contains 'rest', 'meal', atau 'istirahat' dalam activity_name atau description
5. **Daily shift**: Contains 'daily shift' atau 'shift harian' dalam activity_name atau description
6. **Friday pray**: Contains 'friday pray', 'jumat', atau 'shalat' dalam activity_name atau description
7. **Other**: Semua yang tidak cocok dengan kategori di atas

**Prioritas**: Jika kata kunci ditemukan di `activity_name`, maka akan menggunakan kategori tersebut. Jika tidak ditemukan di `activity_name`, akan mencari di `description`.

### Database Query
```sql
SELECT 
  CASE 
    WHEN LOWER(ma.name) LIKE '%slippery%' THEN 'Slippery'
    WHEN LOWER(ma.name) LIKE '%rain%' OR LOWER(ma.name) LIKE '%hujan%' THEN 'Rain'
    WHEN LOWER(ma.name) LIKE '%waiting hauler%' OR LOWER(ma.name) LIKE '%menunggu hauler%' THEN 'Waiting Hauler'
    WHEN LOWER(ma.name) LIKE '%rest%' OR LOWER(ma.name) LIKE '%meal%' OR LOWER(ma.name) LIKE '%istirahat%' THEN 'Rest & Meals'
    WHEN LOWER(ma.name) LIKE '%daily shift%' OR LOWER(ma.name) LIKE '%shift harian%' THEN 'Daily shift'
    WHEN LOWER(ma.name) LIKE '%friday pray%' OR LOWER(ma.name) LIKE '%jumat%' OR LOWER(ma.name) LIKE '%shalat%' THEN 'Friday pray'
    WHEN LOWER(lt.description) LIKE '%slippery%' THEN 'Slippery'
    WHEN LOWER(lt.description) LIKE '%rain%' OR LOWER(lt.description) LIKE '%hujan%' THEN 'Rain'
    WHEN LOWER(lt.description) LIKE '%waiting hauler%' OR LOWER(lt.description) LIKE '%menunggu hauler%' THEN 'Waiting Hauler'
    WHEN LOWER(lt.description) LIKE '%rest%' OR LOWER(lt.description) LIKE '%meal%' OR LOWER(lt.description) LIKE '%istirahat%' THEN 'Rest & Meals'
    WHEN LOWER(lt.description) LIKE '%daily shift%' OR LOWER(lt.description) LIKE '%shift harian%' THEN 'Daily shift'
    WHEN LOWER(lt.description) LIKE '%friday pray%' OR LOWER(lt.description) LIKE '%jumat%' OR LOWER(lt.description) LIKE '%shalat%' THEN 'Friday pray'
    ELSE 'Other'
  END as problem_type,
  COALESCE(SUM(lt.duration), 0) as total_duration
FROM r_loss_time lt
INNER JOIN m_activities ma ON lt.activities_id = ma.id
WHERE lt.date_activity BETWEEN $1 AND $2
  AND ma.status IN ('idle', 'delay', 'breakdown')
  AND lt."deletedAt" IS NULL
  AND ma."deletedAt" IS NULL
GROUP BY problem_type
ORDER BY total_duration DESC
```

## API Usage

### Request
```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/lost-time?start_date=2024-01-01&end_date=2024-01-31' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

### Response Format
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    { "name": "Slippery", "value": 30.5 },
    { "name": "Rain", "value": 7.2 },
    { "name": "Waiting Hauler", "value": 1.0 },
    { "name": "Rest & Meals", "value": 1.0 },
    { "name": "Daily shift", "value": 1.0 },
    { "name": "Friday pray", "value": 1.0 }
  ]
}
```

## Features

### 1. Date Range Filtering
- Parameter `start_date` dan `end_date` untuk memfilter data berdasarkan rentang tanggal
- Default range: 30 hari terakhir jika tidak ada parameter yang diberikan
- Format tanggal: YYYY-MM-DD

### 2. Activity Status Filtering
- Hanya mengambil data dengan status aktivitas 'idle' dan 'delay'
- Mengabaikan data yang sudah di-soft delete

### 3. Duration Calculation
- Menghitung total durasi untuk setiap problem type
- Durasi dalam menit (sesuai dengan kolom duration di database)
- Pembulatan ke 2 desimal

### 4. Sorting
- Data diurutkan berdasarkan total durasi (descending)
- Problem type dengan durasi terpanjang akan muncul pertama

## Error Handling
- Try-catch block untuk menangani error database
- Response error dengan status code 500 jika terjadi kesalahan
- Logging error untuk debugging

## Dependencies
- TypeORM DataSource untuk database connection
- QueryRunner untuk raw SQL queries
- Proper connection management dengan release()

## Testing
Endpoint telah ditest dan berfungsi dengan baik:

### Test Results
1. **Dengan parameter tanggal**: `GET /api/dashboard/lost-time?start_date=2025-09-01&end_date=2025-09-05`
   - Response: `{"statusCode":200,"message":"success","data":[{"name":"Other","value":26786},{"name":"Slippery","value":205}]}`
   - Menunjukkan data loss time dengan kategori "Other" dan "Slippery" dalam rentang tanggal tersebut

2. **Tanpa parameter tanggal** (default 30 hari terakhir): `GET /api/dashboard/lost-time`
   - Response: `{"statusCode":200,"message":"success","data":[{"name":"Other","value":26786},{"name":"Slippery","value":525}]}`
   - Menunjukkan ada data loss time dengan kategori "Other" dan "Slippery"

### Catatan Testing
- Endpoint berfungsi dengan baik dan mengembalikan response yang sesuai format
- Data dikelompokkan berdasarkan kata kunci dalam kolom `activity_name` (prioritas utama) dan `description` (fallback)
- Kategori "Slippery" berhasil dikenali dari activity_name "Slippery"
- Kategori "Other" muncul untuk data yang tidak cocok dengan kategori yang sudah didefinisikan
- Durasi dihitung dengan benar dan filter tanggal berfungsi dengan baik
- Status filter mencakup 'idle', 'delay', dan 'breakdown'

### Rekomendasi untuk Testing Lebih Lanjut
1. Pastikan database memiliki data di tabel `r_loss_time` dan `m_activities`
2. Pastikan ada data dengan status 'idle', 'delay', atau 'breakdown'
3. Pastikan kolom `activity_name` dan `description` berisi kata kunci yang sesuai dengan kategori yang didefinisikan
4. Test dengan berbagai rentang tanggal
5. Test tanpa parameter tanggal (default 30 hari terakhir)
6. Tambahkan data test dengan activity_name yang sesuai dengan kategori yang didefinisikan
7. Test dengan data yang memiliki description kosong atau null
