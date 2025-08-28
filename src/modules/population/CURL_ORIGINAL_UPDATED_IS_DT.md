# CURL Original dengan Filter is_dt

## CURL Asli (Sebelum Update)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## CURL Setelah Update (Dengan Filter is_dt)

### Filter Dump Truck Saja
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

### Filter Bukan Dump Truck
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=false&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## Perubahan yang Ditambahkan
- **Parameter baru**: `is_dt=true` atau `is_dt=false`
- **Posisi**: Setelah `status=active` dan sebelum `sortBy=id`
- **Fungsi**: Filter data berdasarkan kategori dump truck

## Contoh Nilai is_dt
```bash
# Untuk Dump Truck saja
is_dt=true

# Untuk semua unit kecuali dump truck
is_dt=false

# Untuk semua data (tidak ada filter)
is_dt= (kosong)
```

## Fitur Case-Insensitive
Filter ini akan bekerja sama untuk semua variasi case pada `unit_type_name`:
- `unit_type_name="dump truck"` ✅
- `unit_type_name="Dump Truck"` ✅
- `unit_type_name="DUMP TRUCK"` ✅
- `unit_type_name="Dump truck"` ✅

## Kombinasi dengan Filter Existing
Filter `is_dt` dapat dikombinasikan dengan semua filter yang sudah ada:
- `page=1`
- `limit=10`
- `status=active`
- `unit_type_id`
- `unit_type_name`
- `activities_id`
- `site_id`
- `engine_brand`
- `tyre_type`
- `date_from` dan `date_to`
- `sortBy=id`
- `sortOrder=DESC`

## Testing
Untuk testing, gunakan berbagai nilai `is_dt`:

```bash
# Test dengan dump truck
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Test dengan bukan dump truck
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=false&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Test tanpa filter is_dt (semua data)
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Implementasi Teknis
Filter ini menggunakan:
- **Join**: Tabel `m_population` → `m_unit_type`
- **Case-insensitive**: Fungsi `LOWER()` pada kedua sisi
- **Query**: 
  - `LOWER(unitType.unit_name) = LOWER('dump truck')` untuk `is_dt=true`
  - `LOWER(unitType.unit_name) != LOWER('dump truck')` untuk `is_dt=false`

## Response yang Diharapkan
Response akan berisi data population yang sesuai dengan filter `is_dt` yang diberikan, dengan format yang sama seperti sebelumnya namun data yang sudah difilter.

### Contoh Response untuk is_dt=true
```json
{
  "statusCode": 200,
  "message": "Data population berhasil diambil",
  "data": [
    {
      "id": 1,
      "no_unit": "DT-001",
      "unitType": {
        "unit_name": "Dump Truck",
        "type_name": "Transportation",
        "model_name": "HD785-7"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```
