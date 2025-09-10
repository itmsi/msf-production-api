# Trend Hauling Barging API Update

## Perubahan yang Dilakukan

### 1. Implementasi Logic Real Database
Mengubah endpoint `/api/dashboard/monthly/trend-hauling-barging` dari data statis menjadi data real dari database sesuai dengan spesifikasi yang diminta.

### 2. Data Sources yang Digunakan

#### Ore Barging
- **Source**: Tabel `TB_R_Base_Data_Pro` (r_base_data_pro + r_parent_base_data_pro)
- **Logic**: 
  - Material = 'ore-barge' 
  - Activity = 'barging'
  - Tonnage calculation berdasarkan tyre_type:
    - 6x4: vessel × 16.6
    - 8x4: vessel × 18.26
- **Alternative**: Control MTD dengan SUM(kolom ORE BARGE (TON))

#### Ore Hauling
- **Source**: Tabel `TB_R_Base_Data_Pro` (r_base_data_pro + r_parent_base_data_pro)
- **Logic**: 
  - Material = 'ore'
  - Activity = 'hauling'
  - Tonnage calculation berdasarkan tyre_type:
    - 6x4: vessel × 26.56
    - 8x4: vessel × 29.56
- **Alternative**: Control MTD dengan SUM(kolom ORE (TON))

#### Slippery
- **Source**: Tabel `TB_R_Loss_Time` (r_loss_time)
- **Logic**: 
  - Category = 'STB' (Standby)
  - Problem = 'slippery' (case insensitive)
  - SUM(duration) per tanggal

#### Rain
- **Source**: Tabel `TB_R_Loss_Time` (r_loss_time)
- **Logic**: 
  - Category = 'STB' (Standby)
  - Problem = 'rain' (case insensitive)
  - SUM(duration) per tanggal

### 3. Query Implementation

#### Ore Barging Query
```sql
SELECT 
  DATE(rpbdp.activity_date) as activity_date,
  SUM(rbdp.total_vessel * 
    CASE 
      WHEN mp.tyre_type = '6x4' THEN 16.6
      WHEN mp.tyre_type = '8x4' THEN 18.26
      ELSE 0
    END
  ) as ore_barging_tonnage
FROM r_parent_base_data_pro rpbdp
JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
JOIN m_population mp ON rpbdp.population_id = mp.id
WHERE rbdp.material = 'ore-barge'
  AND rbdp.activity = 'barging'
  AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
GROUP BY DATE(rpbdp.activity_date)
ORDER BY DATE(rpbdp.activity_date)
```

#### Ore Hauling Query
```sql
SELECT 
  DATE(rpbdp.activity_date) as activity_date,
  SUM(rbdp.total_vessel * 
    CASE 
      WHEN mp.tyre_type = '6x4' THEN 26.56
      WHEN mp.tyre_type = '8x4' THEN 29.56
      ELSE 0
    END
  ) as ore_hauling_tonnage
FROM r_parent_base_data_pro rpbdp
JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
JOIN m_population mp ON rpbdp.population_id = mp.id
WHERE rbdp.material = 'ore'
  AND rbdp.activity = 'hauling'
  AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
GROUP BY DATE(rpbdp.activity_date)
ORDER BY DATE(rpbdp.activity_date)
```

#### Slippery Query
```sql
SELECT 
  DATE(rlt.date_activity) as activity_date,
  SUM(rlt.duration) as slippery_duration
FROM r_loss_time rlt
JOIN m_activities ma ON rlt.activities_id = ma.id
WHERE rlt.loss_type = 'STB'
  AND LOWER(ma.name) LIKE '%slippery%'
  AND DATE(rlt.date_activity) BETWEEN $1 AND $2
GROUP BY DATE(rlt.date_activity)
ORDER BY DATE(rlt.date_activity)
```

#### Rain Query
```sql
SELECT 
  DATE(rlt.date_activity) as activity_date,
  SUM(rlt.duration) as rain_duration
FROM r_loss_time rlt
JOIN m_activities ma ON rlt.activities_id = ma.id
WHERE rlt.loss_type = 'STB'
  AND LOWER(ma.name) LIKE '%rain%'
  AND DATE(rlt.date_activity) BETWEEN $1 AND $2
GROUP BY DATE(rlt.date_activity)
ORDER BY DATE(rlt.date_activity)
```

### 4. Response Format
Endpoint sekarang mengembalikan data per hari dalam bulan yang diminta dengan format:

```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "date": "01/09",
      "ore_barging": 2500,
      "ore_hauling": 2000,
      "slippery": 5,
      "rain": 8
    },
    {
      "date": "02/09",
      "ore_barging": 2500,
      "ore_hauling": 1800,
      "slippery": 4,
      "rain": 6
    }
    // ... data untuk setiap hari dalam bulan
  ]
}
```

### 5. Error Handling
- Menambahkan try-catch block untuk error handling
- Mengembalikan response error dengan statusCode 500 jika terjadi kesalahan
- Logging error untuk debugging

### 6. Performance Optimization
- Menggunakan Promise.all untuk menjalankan semua query secara parallel
- Menggunakan Map untuk quick lookup data berdasarkan tanggal
- Mengoptimalkan query dengan proper indexing pada kolom yang digunakan

## File yang Dimodifikasi

1. `src/modules/dashboard/dashboard.service.ts`
   - Update method `getTrendHaulingBarging()`
   - Implementasi query database real
   - Error handling dan logging

## Testing

Untuk testing endpoint ini:

```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/monthly/trend-hauling-barging?month=2025-09' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-token>'
```

## Notes

- Data akan menampilkan semua hari dalam bulan yang diminta
- Jika tidak ada data untuk hari tertentu, nilai akan diisi dengan 0
- Format tanggal dalam response menggunakan format DD/MM
- Tonnage calculation menggunakan faktor yang berbeda untuk ore barging dan ore hauling sesuai dengan tyre type
