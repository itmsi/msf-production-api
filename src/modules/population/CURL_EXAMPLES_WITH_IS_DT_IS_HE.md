# Contoh CURL dengan Filter is_dt

## CURL Original (Sebelum Update)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## CURL Setelah Update (Dengan Filter is_dt dan is_he)

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



## Kombinasi Filter

### Dump Truck + Status Active
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Heavy Equipment + Status Active
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_he=true&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```



## Filter dengan Parameter Lain

### Dump Truck + Engine Brand
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&engine_brand=cummins&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Heavy Equipment + Tyre Type
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_he=true&tyre_type=6x4&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Dump Truck + Date Range
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Testing Berbagai Nilai

### Test is_dt
```bash
# Hanya dump truck
is_dt=true

# Semua kecuali dump truck
is_dt=false

# Semua data (tidak ada filter)
is_dt=
```



## Response yang Diharapkan

### Filter is_dt=true
Response akan berisi data population yang memiliki `unit_type_name = "dump truck"`:

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



## Kombinasi Filter Lengkap
```bash
# Semua filter yang tersedia
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&engine_brand=cummins&tyre_type=6x4&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```
