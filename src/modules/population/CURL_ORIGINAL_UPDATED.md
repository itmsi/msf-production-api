# CURL Original dengan Filter Unit Type Name

## CURL Asli (Sebelum Update)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjQ0MDgsImV4cCI6MTc1NjQ1MDgwOH0.Pf8a4Wf45eqCoQfmboIkU1X0P0DeeJR4nlnDz7ZRg6o'
```

## CURL Setelah Update (Dengan Filter Unit Type Name)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&unit_type_name=excavator&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjQ0MDgsImV4cCI6MTc1NjQ1MDgwOH0.Pf8a4Wf45eqCoQfmboIkU1X0P0DeeJR4nlnDz7ZRg6o'
```

## Perubahan yang Ditambahkan
- **Parameter baru**: `unit_type_name=excavator`
- **Posisi**: Setelah `status=active` dan sebelum `date_from=2024-01-01`
- **Fungsi**: Filter data berdasarkan nama unit type dari tabel `m_unit_type`

## Contoh Nilai Unit Type Name
```bash
# Untuk Excavator
unit_type_name=excavator

# Untuk Dump Truck
unit_type_name="dump truck"

# Untuk Wheel Loader
unit_type_name="wheel loader"

# Untuk Bulldozer
unit_type_name=bulldozer
```

## Fitur Case-Insensitive
Filter ini akan bekerja sama untuk semua variasi case:
- `unit_type_name=excavator` ✅
- `unit_type_name=Excavator` ✅
- `unit_type_name=EXCAVATOR` ✅
- `unit_type_name=ExCaVaToR` ✅

## Kombinasi dengan Filter Existing
Filter `unit_type_name` dapat dikombinasikan dengan semua filter yang sudah ada:
- `page=1`
- `limit=10`
- `status=active`
- `date_from=2024-01-01`
- `date_to=2024-12-31`
- `sortBy=id`
- `sortOrder=DESC`

## Testing
Untuk testing, gunakan berbagai nilai unit_type_name yang ada di database Anda:

```bash
# Test dengan excavator
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&unit_type_name=excavator&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Test dengan dump truck
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&unit_type_name="dump truck"&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```
