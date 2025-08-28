# Test Endpoint Users

## Test 1: Basic Request (Tanpa Filter)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## Test 2: Dengan Filter Position Name
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=administrator&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## Test 3: Dengan Filter Role
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&role=ADMIN&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## Test 4: Dengan Search
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&search=admin&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYzNjg3MTcsImV4cCI6MTc1NjQ1NTExN30.x003i1nsnD_plI-6pfPrK4GfdJzg5LpmCX0RA172TSg'
```

## Expected Response Format
```json
{
  "statusCode": 200,
  "message": "Get users successfully",
  "data": [
    {
      "id": 1,
      "username": "superadmin",
      "email": "superadmin@example.com",
      "isActive": true,
      "employee_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null,
      "roles": [
        {
          "id": 1,
          "role_code": "SUPER_ADMIN",
          "position_name": "Super Administrator"
        }
      ],
      "employees": {
        "id": 1,
        "firstName": "Super",
        "lastName": "Admin",
        "email": "super.admin@company.com"
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

## Debug Information
Setelah menjalankan test, periksa console log untuk melihat:
1. Generated SQL query
2. Query parameters
3. Query result count
4. Sample data

## Troubleshooting
Jika data tidak muncul, periksa:
1. Database connection
2. Data availability in tables
3. Soft delete status
4. Join relationships
5. JWT token validity
