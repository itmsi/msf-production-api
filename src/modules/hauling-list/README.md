# Hauling List Module

Module ini menangani operasi CRUD untuk hauling list dan activities (operation points).

## Endpoints

### Hauling List Endpoints

- `GET /api/hauling-list` - Mengambil semua data hauling list dengan pagination dan filter
- `POST /api/hauling-list` - Membuat data hauling list baru
- `GET /api/hauling-list/:id` - Mengambil data hauling list berdasarkan ID
- `PATCH /api/hauling-list/:id` - Update data hauling list
- `DELETE /api/hauling-list/:id` - Hapus data hauling list

### Activities Endpoints

- `GET /api/hauling-list/activities` - Mengambil data activities (operation points) dengan pagination, filter, dan sorting

## Activities Endpoint Details

Endpoint `/api/hauling-list/activities` menyediakan fitur:

### Features
- ✅ **Pagination** - Kontrol jumlah data per halaman
- ✅ **Filtering** - Filter berdasarkan nama, tipe, dan site
- ✅ **Sorting** - Urutkan berdasarkan field tertentu
- ✅ **Limit** - Batasi jumlah data yang dikembalikan
- ✅ **Response Standard** - Format response yang konsisten

### Query Parameters
- `page` - Nomor halaman (default: 1)
- `limit` - Jumlah data per halaman (default: 10)
- `name` - Filter nama operation point
- `type` - Filter tipe operation point (loading/dumping/stockpile)
- `site_name` - Filter nama site
- `orderBy` - Field untuk pengurutan
- `orderDirection` - Arah pengurutan (ASC/DESC)

### Response Format
```json
{
  "statusCode": 200,
  "message": "Data activities berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "OP-001",
      "longitude": 106.8456,
      "latitude": -6.2088
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "lastPage": 2
  }
}
```

## Data Source

Activities endpoint mengambil data dari:
- **Primary Table**: `m_operation_points`
- **Joined Table**: `m_sites` (untuk informasi site)

## Authentication

Semua endpoint memerlukan JWT Bearer Token untuk authentication.

## Documentation

Untuk dokumentasi lengkap, lihat:
- [Activities API Documentation](./ACTIVITIES_API_DOCUMENTATION.md)
- [API Examples](./API_EXAMPLES.md)

## Usage Examples

### Basic Activities Request
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### With Filters and Pagination
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?type=loading&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### With Sorting
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?orderBy=name&orderDirection=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
