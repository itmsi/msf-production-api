# API Detail Parent Plan Working Hour - Contoh Penggunaan

## Contoh Request

### 1. Request Dasar
```bash
GET /api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 2. Request dengan Pagination
```bash
GET /api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=20
```

### 3. Request untuk Bulan Berbeda
```bash
GET /api/parent-plan-working-hour/detail?start_date=2025-09-01&end_date=2025-09-30&month_year=2025-09&page=1&limit=15
```

## Contoh Response

### Response Sukses (200)
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": [
    {
      "plan_date": "2025-08-01",
      "calendar_day": "available",
      "working_hour_day": 8.00,
      "working_hour_month": 216.00,
      "working_hour_longshift": 14.40,
      "working_day_longshift": 1.50,
      "mohh_per_month": 100.00,
      "total_delay": 10.00,
      "total_idle": 10.00,
      "total_breakdown": 10.00,
      "ewh": 80.00,
      "pa": 1.00,
      "ma": 0.89,
      "ua": 0.80,
      "eu": 0.67,
      "is_available_to_edit": true,
      "is_available_to_delete": true
    },
    {
      "plan_date": "2025-08-02",
      "calendar_day": "available",
      "working_hour_day": 8.00,
      "working_hour_month": 216.00,
      "working_hour_longshift": 14.40,
      "working_day_longshift": 1.50,
      "mohh_per_month": 100.00,
      "total_delay": 5.00,
      "total_idle": 3.00,
      "total_breakdown": 2.00,
      "ewh": 93.00,
      "pa": 1.01,
      "ma": 0.98,
      "ua": 0.93,
      "eu": 0.93,
      "is_available_to_edit": true,
      "is_available_to_delete": true
    },
    {
      "plan_date": "2025-08-03",
      "calendar_day": "holiday",
      "working_hour_day": 0,
      "working_hour_month": 0,
      "working_hour_longshift": 0,
      "working_day_longshift": 0,
      "mohh_per_month": 0,
      "total_delay": 0,
      "total_idle": 0,
      "total_breakdown": 0,
      "ewh": 0,
      "pa": 0,
      "ma": 0,
      "ua": 0,
      "eu": 0,
      "is_available_to_edit": true,
      "is_available_to_delete": true
    }
  ],
  "pagination": {
    "total": 31,
    "page": 1,
    "limit": 10,
    "lastPage": 4
  }
}
```

## Contoh Penggunaan dengan cURL

### 1. Request Dasar
```bash
curl -X GET "http://localhost:3000/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Request dengan Pagination
```bash
curl -X GET "http://localhost:3000/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=2&limit=15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Contoh Penggunaan dengan JavaScript/Node.js

### 1. Menggunakan Fetch API
```javascript
const fetchDetailData = async (startDate, endDate, monthYear, page = 1, limit = 10) => {
  const url = `http://localhost:3000/api/parent-plan-working-hour/detail?start_date=${startDate}&end_date=${endDate}&month_year=${monthYear}&page=${page}&limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Contoh penggunaan
fetchDetailData('2025-08-01', '2025-08-31', '2025-08', 1, 20)
  .then(data => {
    console.log('Data berhasil diambil:', data);
    console.log('Total data:', data.pagination.total);
    console.log('Data pertama:', data.data[0]);
  })
  .catch(error => {
    console.error('Gagal mengambil data:', error);
  });
```

### 2. Menggunakan Axios
```javascript
const axios = require('axios');

const fetchDetailData = async (startDate, endDate, monthYear, page = 1, limit = 10) => {
  try {
    const response = await axios.get('http://localhost:3000/api/parent-plan-working-hour/detail', {
      params: {
        start_date: startDate,
        end_date: endDate,
        month_year: monthYear,
        page: page,
        limit: limit
      },
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.response?.data || error.message);
    throw error;
  }
};

// Contoh penggunaan
fetchDetailData('2025-08-01', '2025-08-31', '2025-08', 1, 20)
  .then(data => {
    console.log('Data berhasil diambil:', data);
    console.log('Total data:', data.pagination.total);
    console.log('Data pertama:', data.data[0]);
  })
  .catch(error => {
    console.error('Gagal mengambil data:', error);
  });
```

## Contoh Penggunaan dengan Python

### Menggunakan requests
```python
import requests

def fetch_detail_data(start_date, end_date, month_year, page=1, limit=10):
    url = "http://localhost:3000/api/parent-plan-working-hour/detail"
    
    params = {
        'start_date': start_date,
        'end_date': end_date,
        'month_year': month_year,
        'page': page,
        'limit': limit
    }
    
    headers = {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        raise

# Contoh penggunaan
try:
    data = fetch_detail_data('2025-08-01', '2025-08-31', '2025-08', 1, 20)
    print("Data berhasil diambil")
    print(f"Total data: {data['pagination']['total']}")
    print(f"Data pertama: {data['data'][0]}")
except Exception as e:
    print(f"Gagal mengambil data: {e}")
```

## Contoh Penggunaan dengan Postman

### 1. Setup Request
- **Method**: GET
- **URL**: `http://localhost:3000/api/parent-plan-working-hour/detail`

### 2. Query Parameters
```
start_date: 2025-08-01
end_date: 2025-08-31
month_year: 2025-08
page: 1
limit: 10
```

### 3. Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## Catatan Penting

1. **Authentication**: Semua request harus menyertakan JWT token yang valid
2. **Date Format**: Gunakan format YYYY-MM-DD untuk start_date dan end_date
3. **Month Format**: Gunakan format YYYY-MM untuk month_year
4. **Pagination**: 
   - page default: 1
   - limit default: 10, maksimal: 100
5. **Response**: Data akan diurutkan berdasarkan plan_date secara ascending
6. **Metrics**: Semua metrics dihitung secara real-time berdasarkan data yang ada
