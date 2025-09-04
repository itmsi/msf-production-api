# Dashboard Module

## Overview
Dashboard module menyediakan berbagai endpoint untuk menampilkan data dashboard yang berisi informasi tentang performa operasional, achievement, dan trend data.

## Endpoints

### 1. Spider Chart Data
- **GET** `/api/dashboard/spider`
- **Description**: Mengambil data untuk spider chart dengan metrik CT, Prod, EWH, FR, dan Speed
- **Response**: Array of metrics dengan target, actual, dan percentage

### 2. MTD Achievement
- **GET** `/api/dashboard/mtd-achievment`
- **Description**: Mengambil data Month-to-Date achievement untuk berbagai aktivitas
- **Response**: Array of activities dengan target dan actual values

### 3. Hauling Data
- **GET** `/api/dashboard/hauling`
- **Description**: Mengambil data hauling harian dengan target, actual, dan kondisi cuaca
- **Response**: Array of daily hauling data dengan slippery dan rain conditions

### 4. Barge Data
- **GET** `/api/dashboard/barge`
- **Description**: Mengambil data barge dan hauling harian
- **Response**: Array of daily barge dan hauling data

### 5. TMM Data
- **GET** `/api/dashboard/tmm`
- **Description**: Mengambil data Total Material Movement (TMM) harian
- **Response**: Array of daily TMM data dengan ore, overburden, dan total

### 6. Lost Time Data
- **GET** `/api/dashboard/lost-time`
- **Description**: Mengambil data lost time berdasarkan kategori
- **Response**: Array of lost time categories dengan values

### 7. Daily Achievement
- **GET** `/api/dashboard/daily-achievment`
- **Description**: Mengambil data achievement harian untuk berbagai shift
- **Response**: Array of achievement data untuk Daily ACV, Day Shift ACV, dan Night Shift ACV

### 8. Barge List
- **GET** `/api/dashboard/barge-list`
- **Description**: Mengambil daftar barge dan detail kapasitas
- **Response**: Object dengan list barge dan detail kapasitas

### 9. Barge Status
- **GET** `/api/dashboard/barge-status`
- **Description**: Mengambil status barge dengan barging ore, list, dan gain lost data
- **Response**: Object dengan barging ore progress, list data, dan gain lost data

### 10. Lost Time Summary
- **GET** `/api/dashboard/lost-time-summary`
- **Description**: Mengambil ringkasan lost time dengan MOHH, lost time, dan tables data
- **Response**: Object dengan MOHH data, lost time data, dan tables data

### 11. Monthly Status
- **GET** `/api/dashboard/monthly/status`
- **Description**: Mengambil data status bulanan untuk berbagai aktivitas dengan progress charts
- **Query Parameters**: 
  - `month` (string): Bulan dalam format YYYY-MM (contoh: 2025-09)
- **Response**: Array of activities dengan title, target, chart_data, weekness, dan achievement

### 12. Monthly Trend Hauling Barging
- **GET** `/api/dashboard/monthly/trend-hauling-barging`
- **Description**: Mengambil data trend bulanan untuk hauling dan barging dengan kondisi cuaca
- **Query Parameters**: 
  - `month` (string): Bulan dalam format YYYY-MM (contoh: 2025-09)
- **Response**: Array of daily data dengan ore_barging, ore_hauling, slippery, dan rain

### 13. Monthly Trend Fuel Ratio
- **GET** `/api/dashboard/monthly/trend-fuel-ratio`
- **Description**: Mengambil data trend bulanan untuk fuel ratio (FR) dan specific ratio (SR)
- **Query Parameters**: 
  - `month` (string): Bulan dalam format YYYY-MM (contoh: 2025-09)
- **Response**: Object dengan chart data dan meta information untuk FR dan SR

### 14. Monthly Trend Performance Unit
- **GET** `/api/dashboard/monthly/trend-performance-unit`
- **Description**: Mengambil data trend bulanan untuk performance metrics (PA, MA, UA, EU)
- **Query Parameters**: 
  - `month` (string): Bulan dalam format YYYY-MM (contoh: 2025-09)
- **Response**: Object dengan chart data dan meta information untuk PA, MA, UA, dan EU

## Response Format
Semua endpoint mengembalikan response dengan format yang konsisten:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [...]
}
```

## Authentication
Semua endpoint memerlukan JWT authentication dengan header `Authorization: Bearer <token>`.

## Swagger Documentation
Dokumentasi lengkap tersedia di `/api` endpoint ketika aplikasi berjalan dalam mode development.
