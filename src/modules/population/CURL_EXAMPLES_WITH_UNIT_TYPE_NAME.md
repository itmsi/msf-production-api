# Contoh CURL dengan Filter Unit Type Name

## Filter Berdasarkan Unit Type Name Saja
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjQ0MDgsImV4cCI6MTc1NjQ1MDgwOH0.Pf8a4Wf45eqCoQfmboIkU1X0P0DeeJR4nlnDz7ZRg6o'
```

## Filter Lengkap dengan Unit Type Name
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&unit_type_name=excavator&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjQ0MDgsImV4cCI6MTc1NjQ1MDgwOH0.Pf8a4Wf45eqCoQfmboIkU1X0P0DeeJR4nlnDz7ZRg6o'
```

## Contoh Case-Insensitive
```bash
# Semua request ini akan memberikan hasil yang sama
curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name=Excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name=EXCAVATOR&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Kombinasi dengan Filter Lain
```bash
# Filter dengan status dan unit_type_name
curl -X 'GET' \
  'http://localhost:9526/api/populations?status=active&unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Filter dengan site_id dan unit_type_name
curl -X 'GET' \
  'http://localhost:9526/api/populations?site_id=1&unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Filter dengan engine_brand dan unit_type_name
curl -X 'GET' \
  'http://localhost:9526/api/populations?engine_brand=cummins&unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Filter dengan Search dan Unit Type Name
```bash
# Kombinasi search global dengan unit_type_name
curl -X 'GET' \
  'http://localhost:9526/api/populations?search=komatsu&unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Contoh Unit Type Names yang Umum
```bash
# Excavator
unit_type_name=excavator

# Dump Truck
unit_type_name="dump truck"

# Wheel Loader
unit_type_name="wheel loader"

# Bulldozer
unit_type_name=bulldozer

# Motor Grader
unit_type_name="motor grader"
```

## Testing dengan Karakter Khusus
```bash
# Unit type dengan spasi
curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name="Heavy Equipment"&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Unit type dengan angka
curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name="PC200-8"&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Response yang Diharapkan
Response akan berisi data population yang memiliki unit type dengan nama yang sesuai (case-insensitive):

```json
{
  "statusCode": 200,
  "message": "Data population berhasil diambil",
  "data": [
    {
      "id": 1,
      "unit_type_name": "Excavator",
      "unitType": {
        "id": 1,
        "unit_name": "Excavator",
        "type_name": "Heavy Equipment",
        "model_name": "PC200-8"
      }
      // ... field lainnya
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```
