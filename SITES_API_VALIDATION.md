# Sites API Validation Documentation

## Overview
Dokumentasi ini menjelaskan validasi yang telah diterapkan pada endpoint `/api/sites` untuk proses insert dan update.

## Validasi Create Sites (POST /api/sites)

### Request Body Structure
```json
{
  "name": "Site Jakarta",           // MANDATORY
  "location": "Jakarta Selatan",    // MANDATORY
  "longitude": 106.8456,           // MANDATORY
  "latitude": -6.2088,             // MANDATORY
  "operator_point": [               // MANDATORY
    {
      "type": "dumping",           // MANDATORY
      "name": "Dumping Point A",   // MANDATORY
      "longitude": 106.8456,       // NULLABLE (optional)
      "latitude": -6.2088          // NULLABLE (optional)
    }
  ]
}
```

### Validasi Field Sites
- **name**: 
  - Tipe: string
  - Required: ✅ Mandatory
  - Min length: 1 karakter
  - Max length: 100 karakter
  - Tidak boleh kosong

- **location**: 
  - Tipe: string
  - Required: ✅ Mandatory
  - Min length: 1 karakter
  - Max length: 200 karakter
  - Tidak boleh kosong

- **longitude**: 
  - Tipe: number
  - Required: ✅ Mandatory
  - Range: -180 sampai 180
  - Tidak boleh kosong

- **latitude**: 
  - Tipe: number
  - Required: ✅ Mandatory
  - Range: -90 sampai 90
  - Tidak boleh kosong

### Validasi Field Operator Points
- **type**: 
  - Tipe: enum ('dumping' atau 'loading')
  - Required: ✅ Mandatory
  - Tidak boleh kosong

- **name**: 
  - Tipe: string
  - Required: ✅ Mandatory
  - Min length: 1 karakter
  - Max length: 100 karakter
  - Tidak boleh kosong

- **longitude**: 
  - Tipe: number
  - Required: ❌ Nullable (optional)
  - Range: -180 sampai 180 (jika diisi)
  - Boleh kosong

- **latitude**: 
  - Tipe: number
  - Required: ❌ Nullable (optional)
  - Range: -90 sampai 90 (jika diisi)
  - Boleh kosong

## Validasi Update Sites (PUT /api/sites/:id)

### Request Body Structure
```json
{
  "name": "Site Jakarta Updated",   // OPTIONAL
  "location": "Jakarta Selatan",    // OPTIONAL
  "longitude": 106.8456,           // OPTIONAL
  "latitude": -6.2088,             // OPTIONAL
  "operator_point": [               // OPTIONAL
    {
      "type": "dumping",           // MANDATORY (jika diisi)
      "name": "Dumping Point A",   // MANDATORY (jika diisi)
      "longitude": 106.8456,       // NULLABLE (optional)
      "latitude": -6.2088          // NULLABLE (optional)
    }
  ]
}
```

### Validasi Field Sites (Update)
- **name**: 
  - Tipe: string
  - Required: ❌ Optional
  - Min length: 1 karakter (jika diisi)
  - Max length: 100 karakter (jika diisi)

- **location**: 
  - Tipe: string
  - Required: ❌ Optional
  - Min length: 1 karakter (jika diisi)
  - Max length: 200 karakter (jika diisi)

- **longitude**: 
  - Tipe: number
  - Required: ❌ Optional
  - Range: -180 sampai 180 (jika diisi)

- **latitude**: 
  - Tipe: number
  - Required: ❌ Optional
  - Range: -90 sampai 90 (jika diisi)

### Validasi Field Operator Points (Update)
- **type**: 
  - Tipe: enum ('dumping' atau 'loading')
  - Required: ✅ Mandatory (jika operator_point diisi)
  - Tidak boleh kosong

- **name**: 
  - Tipe: string
  - Required: ✅ Mandatory (jika operator_point diisi)
  - Min length: 1 karakter (jika diisi)
  - Max length: 100 karakter (jika diisi)

- **longitude**: 
  - Tipe: number
  - Required: ❌ Nullable (optional)
  - Range: -180 sampai 180 (jika diisi)
  - Boleh kosong

- **latitude**: 
  - Tipe: number
  - Required: ❌ Nullable (optional)
  - Range: -90 sampai 90 (jika diisi)
  - Boleh kosong

## Error Response Examples

### Validation Error - Missing Required Fields
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": [
    "name should not be empty",
    "location should not be empty",
    "longitude should not be empty",
    "latitude should not be empty"
  ]
}
```

### Validation Error - Invalid Coordinates
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": [
    "longitude must not be greater than 180",
    "latitude must not be less than -90"
  ]
}
```

### Validation Error - Invalid Operator Point Type
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": [
    "type must be one of the following values: dumping, loading"
  ]
}
```

## Database Constraints

### Tabel m_sites
- `name`: NOT NULL
- `location`: NOT NULL  
- `longitude`: NOT NULL
- `latitude`: NOT NULL

### Tabel m_operation_points
- `type`: NOT NULL
- `name`: NOT NULL
- `longitude`: NULL (optional)
- `latitude`: NULL (optional)

## Testing Examples

### Valid Create Request
```bash
curl -X POST http://localhost:3000/api/sites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Site Jakarta",
    "location": "Jakarta Selatan",
    "longitude": 106.8456,
    "latitude": -6.2088,
    "operator_point": [
      {
        "type": "dumping",
        "name": "Dumping Point A"
      }
    ]
  }'
```

### Valid Update Request
```bash
curl -X PUT http://localhost:3000/api/sites/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Site Jakarta Updated",
    "operator_point": [
      {
        "type": "loading",
        "name": "Loading Point B",
        "longitude": 106.8500,
        "latitude": -6.2100
      }
    ]
  }'
```

## Notes
- Semua validasi menggunakan class-validator decorators
- **Custom Validator**: `@IsNotEmptyString()` digunakan untuk memastikan string tidak kosong (tidak hanya whitespace)
- Validasi koordinat menggunakan range yang valid (longitude: -180 sampai 180, latitude: -90 sampai 90)
- Field operator_point pada create bersifat mandatory dengan minimal 1 item
- Field operator_point pada update bersifat optional
- Jika operator_point diisi pada update, semua field mandatory di dalamnya harus diisi
- Longitude dan latitude pada operator_point selalu optional (nullable)
- **Additional Validation**: Service level validation menggunakan helper functions untuk business logic
- **Business Rules**: Nama site tidak boleh duplikat, koordinat tidak boleh sama dengan site lain

## Custom Validators Used

### @IsNotEmptyString()
- **Perbedaan dengan @IsNotEmpty()**: 
  - `@IsNotEmpty()`: Hanya mengecek null/undefined
  - `@IsNotEmptyString()`: Mengecek null/undefined + string kosong + whitespace only
- **Contoh yang akan gagal**:
  - `""` (string kosong)
  - `"   "` (hanya whitespace)
  - `null` atau `undefined`
- **Contoh yang akan lulus**:
  - `"Site A"` (string valid)
  - `"  Site B  "` (akan di-trim otomatis)

### @IsValidFloat()
- **Fungsi**: Memastikan value adalah float/number yang valid
- **Validasi**: Tidak boleh null, undefined, NaN, atau Infinity
- **Contoh yang akan gagal**:
  - `null`, `undefined`
  - `NaN`, `Infinity`, `-Infinity`
  - `"123"` (string)
- **Contoh yang akan lulus**:
  - `106.8456`, `-6.2088`
  - `0`, `1`, `-1`

### @IsFloatInRange(min, max)
- **Fungsi**: Memastikan float berada dalam range tertentu
- **Validasi**: Value harus valid float + dalam range min-max
- **Contoh penggunaan**:
  - `@IsFloatInRange(-180, 180)` untuk longitude
  - `@IsFloatInRange(-90, 90)` untuk latitude

### @IsNullableFloatInRange(min, max)
- **Fungsi**: Memastikan float nullable berada dalam range tertentu
- **Validasi**: Value boleh null/undefined, atau valid float dalam range
- **Contoh penggunaan**:
  - `@IsNullableFloatInRange(-180, 180)` untuk longitude operator point
  - `@IsNullableFloatInRange(-90, 90)` untuk latitude operator point

### Helper Functions di Service
- **validateSiteData()**: Validasi tambahan untuk semua field
- **validateBusinessRules()**: Validasi business logic (duplikasi nama, koordinat)
- **Error Response**: Semua error akan digabung dan dikembalikan dalam satu response
