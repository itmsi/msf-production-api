# Barge Form API Documentation

## Overview
API untuk mengelola data barge form dengan perhitungan otomatis capacity_per_dt dan achievment.

## Authentication
Semua endpoint memerlukan JWT token yang valid. Token harus disertakan dalam header Authorization dengan format:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Barge Form
**POST** `/barge-form`

Membuat barge form baru dengan perhitungan otomatis.

#### Request Body
```json
{
  "barge_id": 1,
  "site_id": 1,
  "shipment": "SHIP001",
  "start_loading": "2024-01-01T08:00:00Z",
  "end_loading": "2024-01-01T18:00:00Z",
  "total_vessel": 100.5,
  "vol_by_survey": 95.2,
  "remarks": "Loading completed successfully",
  "status": "completed"
}
```

#### Response (201 Created)
```json
{
  "statusCode": 201,
  "message": "Barge form created successfully",
  "data": {
    "id": 1,
    "shipment": "SHIP001",
    "barge_name": "Barge Alpha",
    "site_name": "Site Jakarta",
    "start_loading": "2024-01-01T08:00:00Z",
    "end_loading": "2024-01-01T18:00:00Z",
    "total_vessel": 100.5,
    "vol_by_survey": 95.2,
    "capacity_per_dt": 0.95,
    "achievment": 1.0,
    "remarks": "Loading completed successfully",
    "status": "completed"
  }
}
```

### 2. Get All Barge Forms
**GET** `/barge-form`

Mengambil semua barge form dengan filter dan pagination.

#### Query Parameters
- `start_date` (optional): Tanggal mulai filter (YYYY-MM-DD)
- `end_date` (optional): Tanggal akhir filter (YYYY-MM-DD)
- `keyword` (optional): Kata kunci pencarian
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10)

#### Example Request
```
GET /barge-form?start_date=2024-01-01&end_date=2024-01-31&keyword=alpha&page=1&limit=10
```

#### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Barge forms retrieved successfully",
  "data": [
    {
      "id": 1,
      "shipment": "SHIP001",
      "barge_name": "Barge Alpha",
      "site_name": "Site Jakarta",
      "start_loading": "2024-01-01T08:00:00Z",
      "end_loading": "2024-01-01T18:00:00Z",
      "total_vessel": 100.5,
      "vol_by_survey": 95.2,
      "capacity_per_dt": 0.95,
      "achievment": 1.0,
      "remarks": "Loading completed successfully",
      "status": "completed"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Get Barge Form by ID
**GET** `/barge-form/:id`

Mengambil barge form berdasarkan ID.

#### Path Parameters
- `id`: ID Barge Form (number)

#### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Barge form retrieved successfully",
  "data": {
    "id": 1,
    "shipment": "SHIP001",
    "barge_name": "Barge Alpha",
    "site_name": "Site Jakarta",
    "start_loading": "2024-01-01T08:00:00Z",
    "end_loading": "2024-01-01T18:00:00Z",
    "total_vessel": 100.5,
    "vol_by_survey": 95.2,
    "capacity_per_dt": 0.95,
    "achievment": 1.0,
    "remarks": "Loading completed successfully",
    "status": "completed"
  }
}
```

### 4. Update Barge Form
**PATCH** `/barge-form/:id`

Memperbarui barge form yang sudah ada.

#### Path Parameters
- `id`: ID Barge Form (number)

#### Request Body
```json
{
  "vol_by_survey": 98.5,
  "remarks": "Updated remarks"
}
```

#### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Barge form updated successfully",
  "data": {
    "id": 1,
    "shipment": "SHIP001",
    "barge_name": "Barge Alpha",
    "site_name": "Site Jakarta",
    "start_loading": "2024-01-01T08:00:00Z",
    "end_loading": "2024-01-01T18:00:00Z",
    "total_vessel": 100.5,
    "vol_by_survey": 98.5,
    "capacity_per_dt": 0.95,
    "achievment": 1.04,
    "remarks": "Updated remarks",
    "status": "completed"
  }
}
```

### 5. Delete Barge Form
**DELETE** `/barge-form/:id`

Soft delete barge form berdasarkan ID.

#### Path Parameters
- `id`: ID Barge Form (number)

#### Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Barge form deleted successfully",
  "data": null
}
```

## Business Logic

### Perhitungan Otomatis

#### Capacity per DT
```
capacity_per_dt = vol_by_survey / total_vessel
```

#### Achievement
```
achievment = vol_by_survey / capacity_per_dt
```

### Validasi
- `barge_id` dan `site_id` harus ada dan valid
- `shipment` harus diisi
- `start_loading` dan `end_loading` harus dalam format datetime yang valid
- `total_vessel` dan `vol_by_survey` harus berupa angka positif

### Filter dan Pencarian
- **Date Range**: Filter berdasarkan `start_loading` dan `end_loading`
- **Keyword Search**: Mencari di `barge.name`, `site.name`, `shipment`, dan `remarks`
- **Pagination**: Mendukung pagination dengan `page` dan `limit`

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Barge form not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Data Model

### BargeForm Entity
```typescript
{
  id: number;
  barge_id: number;
  site_id: number;
  shipment: string;
  start_loading: Date;
  end_loading: Date;
  total_vessel?: number;
  vol_by_survey?: number;
  capacity_per_dt?: number;
  achievment?: number;
  remarks?: string;
  status?: string;
  createdAt: Date;
  createdBy?: number;
  updatedAt: Date;
  updatedBy?: number;
  deletedAt?: Date;
  deletedBy?: number;
}
```

### Relations
- `barge`: Many-to-One dengan Barge entity
- `site`: Many-to-One dengan Sites entity

## Notes
- Semua endpoint memerlukan autentikasi JWT
- Soft delete digunakan untuk menghapus data
- Perhitungan otomatis dilakukan saat create dan update
- Data diurutkan berdasarkan `createdAt` DESC
- Relasi `barge` dan `site` dimuat secara eager