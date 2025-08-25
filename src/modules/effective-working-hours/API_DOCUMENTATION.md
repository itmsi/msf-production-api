# Effective Working Hours API Documentation

## Overview
Module ini mengelola data effective working hours yang disimpan dalam tabel `r_loss_time`. Data ini mencakup informasi tentang waktu kerja efektif, termasuk standby time dan breakdown time.

## Endpoints

### 1. Create Effective Working Hours
**POST** `/effective-working-hours`

**Request Body:**
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

**Response:**
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

### 2. Get All Effective Working Hours
**GET** `/effective-working-hours`

**Query Parameters:**
- `startDate` (optional): Tanggal mulai filter (format: YYYY-MM-DD)
- `endDate` (optional): Tanggal akhir filter (format: YYYY-MM-DD)
- `lossType` (optional): Filter berdasarkan tipe loss (STB atau BD)
- `keyword` (optional): Keyword untuk pencarian di semua kolom
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Limit per halaman (default: 10)

**Response:**
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

### 3. Get Effective Working Hours by ID
**GET** `/effective-working-hours/:id`

**Response:**
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

### 4. Update Effective Working Hours
**PATCH** `/effective-working-hours/:id`

**Request Body:**
```json
{
  "description": "Standby karena hujan lebat",
  "end": "2024-01-15T11:00:00Z"
}
```

**Response:**
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

### 5. Delete Effective Working Hours
**DELETE** `/effective-working-hours/:id`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Effective working hours deleted successfully",
  "data": null
}
```

## Data Models

### Loss Type Enum
- `STB`: StandBy
- `BD`: BreakDown

### Shift Enum
- `DS`: Day Shift
- `NS`: Night Shift

### Auto Calculation
Field `duration` akan otomatis dihitung dari selisih waktu `start` dan `end` dalam menit.

## Validation Rules
- `dateActivity`: Wajib diisi, format datetime
- `lossType`: Wajib diisi, enum STB atau BD
- `shift`: Wajib diisi, enum DS atau NS
- `populationId`: Wajib diisi, integer
- `activitiesId`: Wajib diisi, integer
- `description`: Opsional, string
- `start`: Opsional, datetime
- `end`: Opsional, datetime

## Notes
- Semua endpoint memerlukan autentikasi JWT
- Data yang dihapus menggunakan soft delete
- Duration otomatis dihitung jika start dan end tersedia
- Response untuk get all sudah include pagination
