# Swagger Documentation - Analysis Hauling Barging Module

## Overview
Module Analysis Hauling Barging menyediakan API untuk mengambil data analisis hauling dan barging dengan dokumentasi Swagger yang lengkap.

## Endpoints

### GET /analysis-hauling-barging

**Summary**: Mengambil data analysis hauling barging
**Description**: Mengambil data analisis hauling dan barging dengan filter tanggal dan pagination

**Security**: Bearer Token (JWT)

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| startDate | string | No | Start date untuk filter (YYYY-MM-DD) | 2024-01-01 |
| endDate | string | No | End date untuk filter (YYYY-MM-DD) | 2024-12-31 |
| page | number | No | Page number untuk pagination (default: 1) | 1 |
| limit | number | No | Limit data per page (default: 10) | 10 |

**Responses**:

#### 200 OK
```json
{
  "statusCode": 200,
  "message": "Data analysis hauling barging berhasil diambil",
  "data": [
    {
      "date": "2024-01-01",
      "bargeVessel": 5,
      "bargeBCM": 125.5,
      "bargeTonnage": 200.8,
      "oreHaulingVessel": 8,
      "oreHaulingBCM": 200.0,
      "oreHaulingTonnage": 320.0,
      "obVessel": 12,
      "obBCM": 300.0,
      "obTonnage": 480.0,
      "tmmVessel": 20,
      "tmmBCM": 500.0,
      "tmmTonnage": 800.0
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  }
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Data Models

### AnalysisHaulingBargingFilterDto
```typescript
{
  startDate?: string;    // Format: YYYY-MM-DD
  endDate?: string;      // Format: YYYY-MM-DD
  page?: number;         // Minimum: 1
  limit?: number;        // Minimum: 1
}
```

### AnalysisHaulingBargingResponseDto
```typescript
{
  date: string;                    // Tanggal data
  bargeVessel: number;             // Jumlah vessel untuk ore barge
  bargeBCM: number;                // BCM untuk ore barge (tonnage / 1.6)
  bargeTonnage: number;            // Tonnage untuk ore barge
  oreHaulingVessel: number;        // Jumlah vessel untuk ore hauling
  oreHaulingBCM: number;           // BCM untuk ore hauling (tonnage / 1.6)
  oreHaulingTonnage: number;       // Tonnage untuk ore hauling
  obVessel: number;                // Jumlah vessel untuk OB
  obBCM: number;                   // BCM untuk OB (tonnage / 1.6)
  obTonnage: number;                // Tonnage untuk OB
  tmmVessel: number;               // Total vessel TMM (ore hauling + OB)
  tmmBCM: number;                  // Total BCM TMM (ore hauling + OB)
  tmmTonnage: number;               // Total tonnage TMM (ore hauling + OB)
}
```

## Contoh Penggunaan

### 1. Mengambil semua data
```bash
curl -X GET "http://localhost:3000/analysis-hauling-barging" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 2. Filter berdasarkan tanggal
```bash
curl -X GET "http://localhost:3000/analysis-hauling-barging?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 3. Dengan pagination
```bash
curl -X GET "http://localhost:3000/analysis-hauling-barging?page=2&limit=20" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 4. Kombinasi filter dan pagination
```bash
curl -X GET "http://localhost:3000/analysis-hauling-barging?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Business Logic

### Data Processing:
1. **Ore Barge**: Material = 'ore-barge' AND Activity = 'barging'
2. **Ore Hauling**: Material = 'ore' AND Activity = 'hauling'
3. **OB**: Material = 'ob'
4. **TMM**: Penjumlahan dari Ore Hauling + OB

### Calculations:
- **Tonnage Factor**:
  - 6x4 tyre: 26.56
  - 8x4 tyre: 29.56
- **BCM**: Tonnage / 1.6
- **Grouping**: Berdasarkan tanggal (date_arrive)

## Error Handling

### Validation Errors:
- Invalid date format
- Page number < 1
- Limit < 1

### Authentication Errors:
- Missing JWT token
- Invalid JWT token
- Expired JWT token

### Database Errors:
- Connection issues
- Query execution errors
- Data not found
