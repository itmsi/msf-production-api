# Dashboard Monthly Endpoints

## Overview
Endpoint-endpoint bulanan untuk dashboard yang menyediakan data trend dan status berdasarkan bulan tertentu.

## Endpoints

### 1. Monthly Status
**GET** `/api/dashboard/monthly/status?month=2025-09`

Mengambil data status bulanan untuk berbagai aktivitas dengan progress charts.

**Query Parameters:**
- `month` (string, required): Bulan dalam format YYYY-MM (contoh: 2025-09)

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "title": "OB Removing",
      "target": 3000,
      "chart_data": [
        {
          "name": "progress",
          "value": 10,
          "fill": "#3BAF9F"
        }
      ],
      "weekness": 123,
      "achievement": 123.123218
    },
    {
      "title": "Ore Hauling",
      "target": 2950,
      "chart_data": [
        {
          "name": "progress",
          "value": 40,
          "fill": "#3BAF9F"
        }
      ],
      "weekness": 123,
      "achievement": 2700
    },
    {
      "title": "Ore Barging",
      "target": 2980,
      "chart_data": [
        {
          "name": "progress",
          "value": 62.88,
          "fill": "#3BAF9F"
        }
      ],
      "weekness": 123,
      "achievement": 2750
    },
    {
      "title": "Quarry",
      "target": 2950,
      "chart_data": [
        {
          "name": "progress",
          "value": 23,
          "fill": "#3BAF9F"
        }
      ],
      "weekness": 123,
      "achievement": 2800
    }
  ]
}
```

### 2. Monthly Trend Hauling Barging
**GET** `/api/dashboard/monthly/trend-hauling-barging?month=2025-09`

Mengambil data trend bulanan untuk hauling dan barging dengan kondisi cuaca.

**Query Parameters:**
- `month` (string, required): Bulan dalam format YYYY-MM (contoh: 2025-09)

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "date": "01/07",
      "ore_barging": 2500,
      "ore_hauling": 2000,
      "slippery": 5,
      "rain": 8
    },
    {
      "date": "02/07",
      "ore_barging": 2500,
      "ore_hauling": 1800,
      "slippery": 4,
      "rain": 6
    }
  ]
}
```

### 3. Monthly Trend Fuel Ratio
**GET** `/api/dashboard/monthly/trend-fuel-ratio?month=2025-09`

Mengambil data trend bulanan untuk fuel ratio (FR) dan specific ratio (SR).

**Query Parameters:**
- `month` (string, required): Bulan dalam format YYYY-MM (contoh: 2025-09)

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "chart": [
      {
        "date": "01/07",
        "fr": 2500,
        "sr": 2000
      },
      {
        "date": "02/07",
        "fr": 2500,
        "sr": 1800
      }
    ],
    "meta": [
      {
        "key": "fr",
        "label": "FR",
        "color": "#D96C06",
        "yAxis": "left"
      },
      {
        "key": "sr",
        "label": "SR",
        "color": "#3E7D70",
        "yAxis": "left"
      }
    ]
  }
}
```

### 4. Monthly Trend Performance Unit
**GET** `/api/dashboard/monthly/trend-performance-unit?month=2025-09`

Mengambil data trend bulanan untuk performance metrics (PA, MA, UA, EU).

**Query Parameters:**
- `month` (string, required): Bulan dalam format YYYY-MM (contoh: 2025-09)

**Response:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "chart": [
      {
        "date": "01/07",
        "pa": 2500,
        "ma": 200,
        "ua": 2000,
        "eu": 2000
      },
      {
        "date": "02/07",
        "pa": 2500,
        "ma": 18200,
        "ua": 1800,
        "eu": 1800
      }
    ],
    "meta": [
      {
        "key": "pa",
        "label": "PA",
        "color": "#D96C06",
        "yAxis": "left"
      },
      {
        "key": "ma",
        "label": "MA",
        "color": "#3E7D70",
        "yAxis": "left"
      },
      {
        "key": "ua",
        "label": "UA",
        "color": "#54AD9B",
        "yAxis": "left"
      },
      {
        "key": "eu",
        "label": "EU",
        "color": "#D7EED2",
        "yAxis": "left"
      }
    ]
  }
}
```

## Authentication
Semua endpoint memerlukan JWT authentication dengan header `Authorization: Bearer <token>`.

## Error Handling
- **400 Bad Request**: Jika parameter `month` tidak valid atau tidak ada
- **401 Unauthorized**: Jika token JWT tidak valid atau tidak ada
- **500 Internal Server Error**: Jika terjadi kesalahan server

## Usage Examples

### cURL Examples

```bash
# Get monthly status
curl -X GET "http://localhost:3000/api/dashboard/monthly/status?month=2025-09" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get trend hauling barging
curl -X GET "http://localhost:3000/api/dashboard/monthly/trend-hauling-barging?month=2025-09" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get trend fuel ratio
curl -X GET "http://localhost:3000/api/dashboard/monthly/trend-fuel-ratio?month=2025-09" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get trend performance unit
curl -X GET "http://localhost:3000/api/dashboard/monthly/trend-performance-unit?month=2025-09" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript/TypeScript Examples

```typescript
// Get monthly status
const response = await fetch('/api/dashboard/monthly/status?month=2025-09', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
const data = await response.json();

// Get trend hauling barging
const response2 = await fetch('/api/dashboard/monthly/trend-hauling-barging?month=2025-09', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
const data2 = await response2.json();
```

## Implementation Notes

### Service Methods
- `getMonthlyStatus(month: string)` - Mengambil data status bulanan
- `getTrendHaulingBarging(month: string)` - Mengambil data trend hauling barging
- `getTrendFuelRatio(month: string)` - Mengambil data trend fuel ratio
- `getTrendPerformanceUnit(month: string)` - Mengambil data trend performance unit

### DTO Classes
- `MonthlyStatusResponseDto` - Response untuk monthly status
- `TrendHaulingBargingResponseDto` - Response untuk trend hauling barging
- `TrendFuelRatioResponseDto` - Response untuk trend fuel ratio
- `TrendPerformanceUnitResponseDto` - Response untuk trend performance unit

### Swagger Documentation
Semua endpoint telah didokumentasikan dengan Swagger dan dapat diakses melalui `/api` endpoint ketika aplikasi berjalan dalam mode development.
