# API Documentation - Hauling Activities

## Endpoint: GET /api/hauling-list/activities

Endpoint ini digunakan untuk mengambil data activities (operation points) dengan fitur pagination, filtering, dan ordering.

### Base URL
```
GET /api/hauling-list/activities
```

### Authentication
Endpoint ini memerlukan authentication menggunakan JWT Bearer Token.

### Query Parameters

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `page` | number | No | 1 | Nomor halaman | `?page=1` |
| `limit` | number | No | 10 | Jumlah data per halaman | `?limit=20` |
| `name` | string | No | - | Filter berdasarkan nama operation point | `?name=OP-001` |
| `type` | string | No | - | Filter berdasarkan tipe operation point | `?type=loading` |
| `site_name` | string | No | - | Filter berdasarkan nama site | `?site_name=Site A` |
| `orderBy` | string | No | 'id' | Field untuk pengurutan | `?orderBy=name` |
| `orderDirection` | string | No | 'ASC' | Arah pengurutan | `?orderDirection=DESC` |

### Valid Values

#### `type` (Filter)
- `loading` - Operation point untuk loading
- `dumping` - Operation point untuk dumping
- `stockpile` - Operation point untuk stockpile

#### `orderBy` (Sorting)
- `id` - ID operation point
- `name` - Nama operation point
- `type` - Tipe operation point
- `longitude` - Longitude
- `latitude` - Latitude
- `createdAt` - Tanggal pembuatan

#### `orderDirection` (Sorting)
- `ASC` - Ascending (A-Z, 0-9)
- `DESC` - Descending (Z-A, 9-0)

### Response Format

#### Success Response (200)
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
    },
    {
      "id": 2,
      "name": "OP-002",
      "longitude": 106.8457,
      "latitude": -6.2089
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

#### Error Response (401 - Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Error Response (500 - Internal Server Error)
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### Example Requests

#### 1. Basic Request (Default Pagination)
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. With Pagination
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. With Filter by Name
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?name=OP-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. With Filter by Type
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?type=loading" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. With Filter by Site Name
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?site_name=Site A" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. With Sorting
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?orderBy=name&orderDirection=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 7. Combined Filters and Sorting
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?type=loading&site_name=Site A&orderBy=name&orderDirection=ASC&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Data Source

Endpoint ini mengambil data dari tabel `m_operation_points` dengan join ke tabel `m_sites` untuk mendapatkan informasi site.

### Field Mapping

| Response Field | Database Field | Description |
|----------------|----------------|-------------|
| `id` | `m_operation_points.id` | Primary key operation point |
| `name` | `m_operation_points.name` | Nama operation point |
| `longitude` | `m_operation_points.longitude` | Koordinat longitude |
| `latitude` | `m_operation_points.latitude` | Koordinat latitude |

### Notes

1. **Pagination**: Default page adalah 1 dan default limit adalah 10
2. **Filtering**: Semua filter bersifat optional dan menggunakan case-insensitive search
3. **Sorting**: Default sorting berdasarkan `id` dengan arah `ASC`
4. **Performance**: Query menggunakan index pada field yang sering digunakan untuk filtering dan sorting
5. **Security**: Endpoint dilindungi dengan JWT authentication

### Related Endpoints

- `GET /api/hauling-list` - Mengambil data hauling list
- `POST /api/hauling-list` - Membuat data hauling list baru
- `GET /api/hauling-list/:id` - Mengambil data hauling list berdasarkan ID
- `PATCH /api/hauling-list/:id` - Update data hauling list
- `DELETE /api/hauling-list/:id` - Hapus data hauling list
