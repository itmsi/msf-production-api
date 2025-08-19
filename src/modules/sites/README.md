# Sites Module

Modul ini menangani manajemen sites (lokasi tambang) dalam sistem MSF Production. Sites adalah lokasi geografis yang memiliki koordinat GPS dan dapat memiliki multiple operator points untuk operasi dumping dan loading.

## Endpoints

### 1. GET /api/sites

Mendapatkan semua data sites dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Pencarian umum di field name dan location
- `name` (optional): Filter berdasarkan nama site (partial match)
- `location` (optional): Filter berdasarkan lokasi site (partial match)
- `sortBy` (optional): Field untuk sorting (id, name, location, longitude, latitude, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/sites?page=1&limit=10&search=jakarta&name=site&location=selatan&sortBy=name&sortOrder=ASC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Data sites berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Site Jakarta",
      "location": "Jakarta Selatan",
      "longitude": 106.8456,
      "latitude": -6.2088,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "operator_points": [
        {
          "id": 1,
          "sites_id": 1,
          "type": "dumping",
          "name": "Dumping Point A",
          "longitude": 106.8456,
          "latitude": -6.2088,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 2. GET /api/sites/:id

Mendapatkan data site berdasarkan ID beserta operator points.

**Path Parameters:**
- `id`: ID site (number)

**Contoh Request:**
```bash
GET /api/sites/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Retrieve data success",
  "data": {
    "id": 1,
    "name": "Site Jakarta",
    "location": "Jakarta Selatan",
    "longitude": 106.8456,
    "latitude": -6.2088,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "operator_points": [
      {
        "id": 1,
        "sites_id": 1,
        "type": "dumping",
        "name": "Dumping Point A",
        "longitude": 106.8456,
        "latitude": -6.2088,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. POST /api/sites

Membuat site baru beserta operator points.

**Request Body:**
```json
{
  "name": "Site Jakarta",
  "location": "Jakarta Selatan",
  "longitude": 106.8456,
  "latitude": -6.2088,
  "operator_point": [
    {
      "type": "dumping",
      "name": "Dumping Point A",
      "longitude": 106.8456,
      "latitude": -6.2088
    },
    {
      "type": "loading",
      "name": "Loading Point A",
      "longitude": 106.8457,
      "latitude": -6.2089
    }
  ]
}
```

**Field Validation:**
- `name`: String, required, min: 1, max: 100 karakter
- `location`: String, required, min: 1, max: 200 karakter
- `longitude`: Number, required, min: -180, max: 180
- `latitude`: Number, required, min: -90, max: 90
- `operator_point`: Array, required, min: 1 item

**Operator Point Validation:**
- `type`: Enum, required (dumping atau loading)
- `name`: String, required, min: 1, max: 100 karakter
- `longitude`: Number, required, min: -180, max: 180
- `latitude`: Number, required, min: -90, max: 90

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Site berhasil dibuat",
  "data": {
    "id": 1,
    "name": "Site Jakarta",
    "location": "Jakarta Selatan",
    "longitude": 106.8456,
    "latitude": -6.2088,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "operator_points": [
      {
        "id": 1,
        "sites_id": 1,
        "type": "dumping",
        "name": "Dumping Point A",
        "longitude": 106.8456,
        "latitude": -6.2088,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 4. PUT /api/sites/:id

Mengupdate data site berdasarkan ID beserta operator points.

**Path Parameters:**
- `id`: ID site yang akan diupdate (number)

**Request Body:**
```json
{
  "name": "Site Jakarta Updated",
  "location": "Jakarta Selatan",
  "longitude": 106.8456,
  "latitude": -6.2088,
  "operator_point": [
    {
      "type": "loading",
      "name": "Loading Point A",
      "longitude": 106.8457,
      "latitude": -6.2089
    }
  ]
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Site berhasil diupdate",
  "data": {
    "id": 1,
    "name": "Site Jakarta Updated",
    "location": "Jakarta Selatan",
    "longitude": 106.8456,
    "latitude": -6.2088,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "operator_points": [
      {
        "id": 2,
        "sites_id": 1,
        "type": "loading",
        "name": "Loading Point A",
        "longitude": 106.8457,
        "latitude": -6.2089,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. DELETE /api/sites/:id

Menghapus data site berdasarkan ID (soft delete).

**Path Parameters:**
- `id`: ID site yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/sites/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Site berhasil dihapus",
  "data": null
}
```

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Site tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

Semua endpoint memerlukan JWT token yang valid. Token harus dikirim dalam header Authorization:

```
Authorization: Bearer <jwt_token>
```

## Data Model

### Sites Entity
```typescript
{
  id: number;           // Primary key, auto increment
  name: string;         // Nama site (max 100 karakter)
  location: string;     // Lokasi site (max 200 karakter)
  longitude: number;    // Longitude GPS (-180 sampai 180)
  latitude: number;     // Latitude GPS (-90 sampai 90)
  createdAt: Date;      // Timestamp pembuatan
  updatedAt: Date;      // Timestamp update terakhir
  deletedAt: Date;      // Timestamp soft delete (nullable)
  operator_points: OperationPoints[]; // Array operator points
}
```

### Operation Points Entity
```typescript
{
  id: number;           // Primary key, auto increment
  sites_id: number;     // Foreign key ke sites
  type: string;         // Tipe: 'dumping' atau 'loading'
  name: string;         // Nama operator point (max 100 karakter)
  longitude: number;    // Longitude GPS (-180 sampai 180)
  latitude: number;     // Latitude GPS (-90 sampai 90)
  createdAt: Date;      // Timestamp pembuatan
  updatedAt: Date;      // Timestamp update terakhir
}
```

### Operator Point Types
- `dumping` - Titik pembuangan material
- `loading` - Titik pemuatan material

## Business Rules

1. **GPS Coordinates**: Longitude harus antara -180 sampai 180, Latitude harus antara -90 sampai 90
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Search**: Pencarian dilakukan di field name dan location
6. **Filtering**: Filter berdasarkan name dan location (partial match)
7. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi
8. **Operator Points**: Setiap site harus memiliki minimal 1 operator point
9. **Cascade Delete**: Ketika site di-soft delete, operator points juga akan ter-soft delete

## Examples

### Create Multiple Sites

```bash
# Create first site
curl -X POST http://localhost:3000/api/sites \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Site Jakarta",
    "location": "Jakarta Selatan",
    "longitude": 106.8456,
    "latitude": -6.2088,
    "operator_point": [
      {
        "type": "dumping",
        "name": "Dumping Point A",
        "longitude": 106.8456,
        "latitude": -6.2088
      }
    ]
  }'

# Create second site
curl -X POST http://localhost:3000/api/sites \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Site Bandung",
    "location": "Bandung Barat",
    "longitude": 107.6186,
    "latitude": -6.9175,
    "operator_point": [
      {
        "type": "loading",
        "name": "Loading Point B",
        "longitude": 107.6186,
        "latitude": -6.9175
      }
    ]
  }'
```

### Search and Filter

```bash
# Search for sites containing "jakarta"
curl "http://localhost:3000/api/sites?search=jakarta" \
  -H "Authorization: Bearer <jwt_token>"

# Filter by location and sort by name
curl "http://localhost:3000/api/sites?location=selatan&sortBy=name&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Site

```bash
curl -X PUT http://localhost:3000/api/sites/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Site Jakarta Updated",
    "operator_point": [
      {
        "type": "loading",
        "name": "Loading Point A",
        "longitude": 106.8457,
        "latitude": -6.2089
      }
    ]
  }'
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `sites.controller.spec.ts`
- `sites.service.spec.ts`

## Dependencies

- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - Swagger documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation

## Notes

- Semua endpoint menggunakan JWT authentication
- Data yang di-soft delete tidak akan muncul di query findAll
- Timestamp menggunakan format ISO 8601
- Response format konsisten untuk semua endpoint
- Error handling terstandarisasi dengan format yang sama
- GPS coordinates divalidasi sesuai standar geografis
- Operator points dapat berupa dumping atau loading
- Setiap site dapat memiliki multiple operator points
- Soft delete bersifat cascade untuk operator points
