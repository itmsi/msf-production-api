# CURL Original dengan Filter Position Name

## CURL Asli (Sebelum Update)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjgyMTYsImV4cCI6MTc1NjQ1NDYxNn0.jcnOcg00_g-zlIdAztmuE4qdHLQux80XgqCbOAjyEUk'
```

## CURL Setelah Update (Dengan Filter Position Name)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=administrator&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjgyMTYsImV4cCI6MTc1NjQ1NDYxNn0.jcnOcg00_g-zlIdAztmuE4qdHLQux80XgqCbOAjyEUk'
```

## Perubahan yang Ditambahkan
- **Parameter baru**: `position_name=administrator`
- **Posisi**: Setelah `limit=10` dan sebelum `sortBy=id`
- **Fungsi**: Filter data berdasarkan nama posisi/jabatan dari tabel `m_role`

## Contoh Nilai Position Name
```bash
# Untuk Administrator
position_name=administrator

# Untuk Manager
position_name=manager

# Untuk Supervisor
position_name=supervisor

# Untuk Operator
position_name=operator

# Untuk Staff
position_name=staff

# Untuk Viewer
position_name=viewer
```

## Fitur Case-Insensitive
Filter ini akan bekerja sama untuk semua variasi case:
- `position_name=administrator` ✅
- `position_name=Administrator` ✅
- `position_name=ADMINISTRATOR` ✅
- `position_name=AdMiNiStRaToR` ✅

## Kombinasi dengan Filter Existing
Filter `position_name` dapat dikombinasikan dengan semua filter yang sudah ada:
- `page=1`
- `limit=10`
- `search` (pencarian global)
- `role` (filter berdasarkan role code)
- `sortBy=id`
- `sortOrder` (ASC/DESC)

## Testing
Untuk testing, gunakan berbagai nilai position_name yang ada di database Anda:

```bash
# Test dengan administrator
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=administrator&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Test dengan manager
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=manager&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Test dengan "Super Administrator" (dengan spasi)
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name="Super Administrator"&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Implementasi Teknis
Filter ini menggunakan:
- **Join**: Tabel `m_user` → `r_user_role` → `m_role`
- **Case-insensitive**: Fungsi `LOWER()` pada kedua sisi
- **Query**: `LOWER(role.position_name) = LOWER(:position_name)`

## Response yang Diharapkan
Response akan berisi data users yang memiliki role dengan position name yang sesuai dengan filter yang diberikan, dengan format yang sama seperti sebelumnya namun data yang sudah difilter.
