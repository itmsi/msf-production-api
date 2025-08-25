# Parent Plan Working Hour Form API Documentation

## Overview
Endpoint ini digunakan untuk mendapatkan data activities yang dikelompokkan berdasarkan status untuk form parent plan working hour. Data akan dikelompokkan secara dinamis berdasarkan status yang ada di database.

## Endpoint
```
GET /api/parent-plan-working-hour/form
```

## Authentication
Endpoint ini memerlukan JWT authentication. Sertakan header:
```
Authorization: Bearer <jwt_token>
```

## Request
Tidak ada parameter yang diperlukan untuk endpoint ini.

## Response Structure

### Success Response (200)
```json
{
  "statusCode": 200,
  "message": "Parent plan working hour form data",
  "data": [
    {
      "name": "Delay",
      "group_detail": [
        {
          "id": 1,
          "name": "P5M",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 5,
          "name": "GST",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 6,
          "name": "P2H",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 11,
          "name": "tes delay",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    },
    {
      "name": "Working",
      "group_detail": [
        {
          "id": 2,
          "name": "Loading Barge",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    },
    {
      "name": "Breakdown",
      "group_detail": [
        {
          "id": 3,
          "name": "Maintenance",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 9,
          "name": "Schedule",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 10,
          "name": "UnSchedule",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    },
    {
      "name": "Idle",
      "group_detail": [
        {
          "id": 4,
          "name": "Waiting",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 7,
          "name": "Hujan",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 8,
          "name": "Fogging",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    }
  ]
}
```

## Field Descriptions

### Data Array
Array berisi grup activities yang dikelompokkan berdasarkan status.

### Group Object
- `name` (string): Nama grup berdasarkan status activities
  - `Delay`: Activities dengan status 'delay'
  - `Working`: Activities dengan status 'working'
  - `Breakdown`: Activities dengan status 'breakdown'
  - `Idle`: Activities dengan status 'idle'
  - `[status]`: Activities dengan status lainnya (otomatis)

### Group Detail Array
Array berisi detail activities dalam setiap grup.

### Activity Object
- `id` (number): ID dari activity (dari tabel `m_activities`)
- `name` (string): Nama activity
- `type_data` (string): Tipe data yang diharapkan (default: 'number')
- `type_field` (string): Tipe field input (default: 'input')

## Example Usage

### cURL Request
```bash
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/form' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTYxMDg2MDEsImV4cCI6MTc1NjE5NTAwMX0.Y8gfUuwQrXCSujWKkoO2Y-bziMNK0Xhu5bCMioikK-g'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:9526/api/parent-plan-working-hour/form', {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log(data);
```

## Notes
- Data activities diambil dari tabel `m_activities` yang aktif (tidak di-soft delete)
- Pengelompokan berdasarkan field `status` dari tabel activities
- Field `type_data` dan `type_field` selalu bernilai default 'number' dan 'input'
- Response akan otomatis menyesuaikan dengan status activities yang ada di database
- Jika tidak ada activities dengan status tertentu, grup tersebut tidak akan muncul di response

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Dependencies
- JWT Authentication
- Activities Module
- TypeORM Repository
- Database connection to `m_activities` table
