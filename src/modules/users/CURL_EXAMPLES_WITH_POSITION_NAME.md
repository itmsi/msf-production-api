# Contoh CURL dengan Filter Position Name

## Filter Berdasarkan Position Name Saja
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?position_name=administrator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjgyMTYsImV4cCI6MTc1NjQ1NDYxNn0.jcnOcg00_g-zlIdAztmuE4qdHLQux80XgqCbOAjyEUk'
```

## Filter Lengkap dengan Position Name
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=administrator&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjgyMTYsImV4cCI6MTc1NjQ1NDYxNn0.jcnOcg00_g-zlIdAztmuE4qdHLQux80XgqCbOAjyEUk'
```

## Contoh Case-Insensitive
```bash
# Semua request ini akan memberikan hasil yang sama
curl -X 'GET' \
  'http://localhost:9526/api/users?position_name=administrator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

curl -X 'GET' \
  'http://localhost:9526/api/users?position_name=Administrator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

curl -X 'GET' \
  'http://localhost:9526/api/users?position_name=ADMINISTRATOR&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Kombinasi dengan Filter Lain
```bash
# Filter dengan search dan position_name
curl -X 'GET' \
  'http://localhost:9526/api/users?search=john&position_name=administrator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Filter dengan role dan position_name
curl -X 'GET' \
  'http://localhost:9526/api/users?role=ADMIN&position_name=administrator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Filter dengan sorting dan position_name
curl -X 'GET' \
  'http://localhost:9526/api/users?position_name=administrator&sortBy=username&sortOrder=ASC&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Contoh Position Names yang Umum
```bash
# Super Administrator
position_name="Super Administrator"

# Administrator
position_name=administrator

# Manager
position_name=manager

# Supervisor
position_name=supervisor

# Operator
position_name=operator

# Staff
position_name=staff

# Viewer
position_name=viewer
```

## Testing dengan Karakter Khusus
```bash
# Position name dengan spasi
curl -X 'GET' \
  'http://localhost:9526/api/users?position_name="Super Administrator"&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Position name dengan angka
curl -X 'GET' \
  'http://localhost:9526/api/users?position_name="Manager Level 1"&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## CURL Original yang Diupdate
```bash
# CURL Asli (Sebelum Update)
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjgyMTYsImV4cCI6MTc1NjQ1NDYxNn0.jcnOcg00_g-zlIdAztmuE4qdHLQux80XgqCbOAjyEUk'

# CURL Setelah Update (Dengan Filter Position Name)
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=administrator&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjgyMTYsImV4cCI6MTc1NjQ1NDYxNn0.jcnOcg00_g-zlIdAztmuE4qdHLQux80XgqCbOAjyEUk'
```

## Response yang Diharapkan
Response akan berisi data users yang memiliki role dengan position name yang sesuai (case-insensitive):

```json
{
  "statusCode": 200,
  "message": "Get users successfully",
  "data": [
    {
      "id": 1,
      "username": "admin_user",
      "email": "admin@example.com",
      "isActive": true,
      "roles": [
        {
          "id": 1,
          "role_code": "ADMIN",
          "position_name": "Administrator"
        }
      ],
      "employees": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
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

## Kombinasi Filter Lengkap
```bash
# Semua filter yang tersedia
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&search=john&role=ADMIN&position_name=administrator&sortBy=username&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```
