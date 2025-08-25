# Effective Working Hours - Contoh Penggunaan

## 1. Create Data

### Request
```bash
curl -X POST http://localhost:3000/effective-working-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T10:00:00Z"
  }'
```

### Response
```json
{
  "statusCode": 200,
  "message": "Effective working hours created successfully",
  "data": {
    "id": 1,
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T10:00:00Z",
    "duration": 120
  }
}
```

## 2. Get All Data dengan Filter

### Request
```bash
curl -X GET "http://localhost:3000/effective-working-hours?startDate=2024-01-01&endDate=2024-01-31&lossType=STB&keyword=standby&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
```json
{
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": [
    {
      "id": 1,
      "dateActivity": "2024-01-15",
      "lossType": "StandBy",
      "shift": "DS",
      "unit": "EXCAVATOR-HITACHI-EX1200",
      "activity": "Loading",
      "description": "Standby karena hujan",
      "start": "2024-01-15T08:00:00Z",
      "end": "2024-01-15T10:00:00Z",
      "duration": 120
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## 3. Get Data by ID

### Request
```bash
curl -X GET http://localhost:3000/effective-working-hours/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
```json
{
  "statusCode": 200,
  "message": "Effective working hours retrieved successfully",
  "data": {
    "id": 1,
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T10:00:00Z",
    "duration": 120
  }
}
```

## 4. Update Data

### Request
```bash
curl -X PATCH http://localhost:3000/effective-working-hours/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Standby karena hujan lebat",
    "end": "2024-01-15T11:00:00Z"
  }'
```

### Response
```json
{
  "statusCode": 200,
  "message": "Effective working hours updated successfully",
  "data": {
    "id": 1,
    "dateActivity": "2024-01-15",
    "lossType": "STB",
    "shift": "DS",
    "populationId": 1,
    "activitiesId": 1,
    "description": "Standby karena hujan lebat",
    "start": "2024-01-15T08:00:00Z",
    "end": "2024-01-15T11:00:00Z",
    "duration": 180
  }
}
```

## 5. Delete Data

### Request
```bash
curl -X DELETE http://localhost:3000/effective-working-hours/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response
```json
{
  "statusCode": 200,
  "message": "Effective working hours deleted successfully",
  "data": null
}
```

## Contoh Data untuk Testing

### Standby Time
```json
{
  "dateActivity": "2024-01-15",
  "lossType": "STB",
  "shift": "DS",
  "populationId": 1,
  "activitiesId": 1,
  "description": "Standby karena hujan",
  "start": "2024-01-15T08:00:00Z",
  "end": "2024-01-15T10:00:00Z"
}
```

### Breakdown Time
```json
{
  "dateActivity": "2024-01-15",
  "lossType": "BD",
  "shift": "NS",
  "populationId": 2,
  "activitiesId": 2,
  "description": "Breakdown mesin",
  "start": "2024-01-15T20:00:00Z",
  "end": "2024-01-15T22:00:00Z"
}
```

## Filter Options

### Date Range
- `startDate`: Format YYYY-MM-DD
- `endDate`: Format YYYY-MM-DD

### Loss Type
- `STB`: StandBy
- `BD`: BreakDown

### Shift
- `DS`: Day Shift
- `NS`: Night Shift

### Keyword Search
Mencari di kolom:
- description
- activity name
- unit name
- type name
- model name

### Pagination
- `page`: Halaman (default: 1)
- `limit`: Limit per halaman (default: 10)
