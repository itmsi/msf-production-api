# Activities API Examples

Berikut adalah contoh-contoh penggunaan endpoint `/api/hauling-list/activities` dengan berbagai kombinasi parameter.

## 1. Basic Request (Default)

**Endpoint:** `GET /api/hauling-list/activities`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
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

## 2. With Pagination

**Endpoint:** `GET /api/hauling-list/activities?page=2&limit=5`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data activities berhasil diambil",
  "data": [
    {
      "id": 6,
      "name": "OP-006",
      "longitude": 106.8461,
      "latitude": -6.2094
    }
  ],
  "pagination": {
    "total": 15,
    "page": 2,
    "limit": 5,
    "lastPage": 3
  }
}
```

## 3. Filter by Name

**Endpoint:** `GET /api/hauling-list/activities?name=OP-001`

**Response:**
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
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

## 4. Filter by Type

**Endpoint:** `GET /api/hauling-list/activities?type=loading`

**Response:**
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
      "id": 3,
      "name": "OP-003",
      "longitude": 106.8458,
      "latitude": -6.2090
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

## 5. Filter by Site Name

**Endpoint:** `GET /api/hauling-list/activities?site_name=Site A`

**Response:**
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
    "total": 2,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

## 6. Sorting by Name (Ascending)

**Endpoint:** `GET /api/hauling-list/activities?orderBy=name&orderDirection=ASC`

**Response:**
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
    },
    {
      "id": 3,
      "name": "OP-003",
      "longitude": 106.8458,
      "latitude": -6.2090
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

## 7. Sorting by Name (Descending)

**Endpoint:** `GET /api/hauling-list/activities?orderBy=name&orderDirection=DESC`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data activities berhasil diambil",
  "data": [
    {
      "id": 15,
      "name": "OP-015",
      "longitude": 106.8470,
      "latitude": -6.2102
    },
    {
      "id": 14,
      "name": "OP-014",
      "longitude": 106.8469,
      "latitude": -6.2101
    },
    {
      "id": 13,
      "name": "OP-013",
      "longitude": 106.8468,
      "latitude": -6.2100
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

## 8. Combined Filters and Sorting

**Endpoint:** `GET /api/hauling-list/activities?type=loading&site_name=Site A&orderBy=name&orderDirection=ASC&page=1&limit=20`

**Response:**
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
      "id": 3,
      "name": "OP-003",
      "longitude": 106.8458,
      "latitude": -6.2090
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "lastPage": 1
  }
}
```

## 9. Filter by Coordinates Range

**Endpoint:** `GET /api/hauling-list/activities?orderBy=longitude&orderDirection=ASC`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data activities berhasil diambil",
  "data": [
    {
      "id": 5,
      "name": "OP-005",
      "longitude": 106.8450,
      "latitude": -6.2082
    },
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

## 10. Empty Result (No Data Found)

**Endpoint:** `GET /api/hauling-list/activities?name=NonExistentOP`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data activities berhasil diambil",
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "lastPage": 0
  }
}
```

## cURL Examples

### Basic Request
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### With Pagination
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### With Filters
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?type=loading&site_name=Site A" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### With Sorting
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?orderBy=name&orderDirection=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Combined Parameters
```bash
curl -X GET "http://localhost:3000/api/hauling-list/activities?type=loading&site_name=Site A&orderBy=name&orderDirection=ASC&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

1. **Authentication**: Semua request memerlukan JWT Bearer Token
2. **Default Values**: 
   - `page` = 1
   - `limit` = 10
   - `orderBy` = 'id'
   - `orderDirection` = 'ASC'
3. **Filtering**: Semua filter bersifat optional dan case-insensitive
4. **Pagination**: `lastPage` dihitung otomatis berdasarkan total data dan limit
5. **Empty Results**: Jika tidak ada data yang ditemukan, array `data` akan kosong dengan `total: 0`
