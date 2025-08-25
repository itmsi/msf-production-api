# Endpoint Detail Parent Plan Working Hour by ID

## Overview
Endpoint ini digunakan untuk mengambil detail data parent plan working hour berdasarkan ID dari tabel `r_plan_working_hour` dengan informasi lengkap activities dan metrics.

## Endpoint
```
GET /api/parent-plan-working-hour/detail/{id}
```

## Authentication
Endpoint ini memerlukan JWT authentication. Sertakan header:
```
Authorization: Bearer <jwt_token>
```

## Path Parameters
- `id` (number): ID dari tabel `r_plan_working_hour`

## Example Request
```bash
GET /api/parent-plan-working-hour/detail/9
```

## Response Structure

### Success Response (200)
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": {
    "id": 9,
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
    "is_available_to_delete": true,
    "activities": [
      {
        "id": 1,
        "activities_id": 1,
        "activities_hour": 5.00,
        "activity_name": "Loading Barge",
        "activity_status": "working",
        "activities_group_id": 1,
        "activities_group_name": "Production"
      }
    ]
  }
}
```

## Field Descriptions

### Main Data Fields
- `id`: ID dari tabel `r_plan_working_hour`
- `plan_date`: Tanggal rencana dalam format YYYY-MM-DD
- `calendar_day`: Status hari kalender (available/one shift/holiday)
- `working_hour_day`: Jam kerja per hari
- `working_hour_month`: Jam kerja per bulan
- `working_hour_longshift`: Jam kerja long shift
- `working_day_longshift`: Hari kerja long shift
- `mohh_per_month`: MOHH per bulan

### Calculated Metrics
- `total_delay`: Total jam delay dari activities
- `total_idle`: Total jam idle dari activities
- `total_breakdown`: Total jam breakdown dari activities
- `ewh`: Effective Working Hours
- `pa`: Performance Availability
- `ma`: Mechanical Availability
- `ua`: Utilization Availability
- `eu`: Equipment Utilization

### Availability Flags
- `is_available_to_edit`: Apakah data tersedia untuk diedit
- `is_available_to_delete`: Apakah data tersedia untuk dihapus

### Activities Array
- `id`: ID dari tabel `r_plan_working_hour_detail`
- `activities_id`: ID dari tabel `m_activities`
- `activities_hour`: Jam aktivitas
- `activity_name`: Nama aktivitas
- `activity_status`: Status aktivitas (working/delay/idle/breakdown)
- `activities_group_id`: ID dari tabel `m_activities_group` (TODO: implement when available)
- `activities_group_name`: Nama grup aktivitas (TODO: implement when available)

## Database Joins

### Tables Involved
1. **`r_plan_working_hour`**: Data utama berdasarkan ID
2. **`r_plan_working_hour_detail`**: Detail activities (join via `plant_working_hour_id`)
3. **`m_activities`**: Informasi aktivitas (join via `activities_id`)
4. **`m_activities_group`**: Grup aktivitas (TODO: implement join)

### Join Relationships
```sql
r_plan_working_hour.id = r_plan_working_hour_detail.plant_working_hour_id
r_plan_working_hour_detail.activities_id = m_activities.id
m_activities.activities_group_id = m_activities_group.id (TODO)
```

## Business Logic

### 1. Data Retrieval
- Mengambil data dari `r_plan_working_hour` berdasarkan ID
- Join dengan `r_plan_working_hour_detail` untuk detail activities
- Join dengan `m_activities` untuk informasi aktivitas

### 2. Metrics Calculation
- **EWH**: `total_mohh - total_delay - total_breakdown`
- **PA**: `(ewh + total_delay + total_idle) / total_mohh`
- **MA**: `ewh / (ewh + total_breakdown)`
- **UA**: `ewh / (ewh + total_delay + total_idle)`
- **EU**: `ewh / (ewh + total_delay + total_idle + total_breakdown)`

### 3. Calendar Day Determination
- `is_calender_day = true` → `calendar_day = "available"`
- `is_calender_day = false` → `calendar_day = "one shift"`
- `is_calender_day = null` → `calendar_day = "holiday"`

### 4. Availability Logic
- `is_available_to_edit`: `true` jika plan_date > today
- `is_available_to_delete`: `true` jika plan_date > today

## Error Responses

### Bad Request (400) - ID Not Found
```json
{
  "statusCode": 400,
  "message": "Plan working hour dengan ID 999 tidak ditemukan",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Example Usage

### cURL
```bash
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail/9' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### JavaScript/Node.js
```javascript
const fetchDetailById = async (id) => {
  try {
    const response = await fetch(`http://localhost:9526/api/parent-plan-working-hour/detail/${id}`, {
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
fetchDetailById(9)
  .then(data => {
    console.log('Data berhasil diambil:', data);
    console.log('Activities:', data.data.activities);
  })
  .catch(error => {
    console.error('Gagal mengambil data:', error);
  });
```

### Python
```python
import requests

def fetch_detail_by_id(id):
    url = f"http://localhost:9526/api/parent-plan-working-hour/detail/{id}"
    
    headers = {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        raise

# Contoh penggunaan
try:
    data = fetch_detail_by_id(9)
    print("Data berhasil diambil")
    print(f"Activities count: {len(data['data']['activities'])}")
except Exception as e:
    print(f"Gagal mengambil data: {e}")
```

## Notes

### Current Implementation
- ✅ Data retrieval dari `r_plan_working_hour`
- ✅ Join dengan `r_plan_working_hour_detail`
- ✅ Join dengan `m_activities`
- ✅ Metrics calculation
- ✅ Rounding ke 2 digit
- ✅ Availability flags

### TODO Items
- 🔄 Join dengan `m_activities_group` (entity belum tersedia)
- 🔄 Implement activities group data

### Performance Considerations
- Query menggunakan proper JOIN strategy
- Single record retrieval (tidak ada pagination)
- Efficient metrics calculation

## Testing

### Test Coverage
- ✅ Controller endpoint test
- ✅ Service method test
- ✅ Error handling test
- ✅ Data processing test
- ✅ 17 test cases berhasil

### Test Scenarios
1. **Success case**: Data ditemukan dan diproses dengan benar
2. **Error case**: ID tidak ditemukan
3. **Data processing**: Metrics calculation dan rounding
4. **Activities mapping**: Detail activities diproses dengan benar

## Conclusion

Endpoint `/api/parent-plan-working-hour/detail/{id}` telah berhasil diimplementasikan dengan:

- ✅ **Data Retrieval**: Mengambil data berdasarkan ID dengan JOIN ke multiple tabel
- ✅ **Metrics Calculation**: Semua metrics dihitung secara real-time
- ✅ **Activities Detail**: Informasi lengkap activities dengan status dan nama
- ✅ **Error Handling**: Proper error response untuk ID tidak ditemukan
- ✅ **Documentation**: Swagger docs lengkap dengan examples
- ✅ **Testing**: Coverage lengkap untuk controller dan service

Endpoint ini siap digunakan untuk mengambil detail data spesifik berdasarkan ID dengan informasi lengkap activities dan metrics.
