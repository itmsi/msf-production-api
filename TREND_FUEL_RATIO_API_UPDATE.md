# Trend Fuel Ratio API Update

## Perubahan yang Dilakukan

### 1. Implementasi Logic Real Database
Mengubah endpoint `/api/dashboard/monthly/trend-fuel-ratio` dari data statis menjadi data real dari database sesuai dengan spesifikasi yang diminta.

### 2. Data Sources yang Digunakan

#### Fuel Consumption (qty_supply)
- **Source**: Tabel `r_fuel` (TB_R_Fuel)
- **Logic**: 
  - SUM(qty_supply) per bulan yang dipilih
  - Filter berdasarkan activity_date dalam range bulan yang diminta
  - Exclude data dengan qty_supply NULL

#### Ore Barging
- **Source**: Tabel `r_base_data_pro` + `r_parent_base_data_pro`
- **Logic**: 
  - Material = 'ore-barge' 
  - Activity = 'barging'
  - Tonnage calculation berdasarkan tyre_type:
    - 6x4: vessel × 16.6
    - 8x4: vessel × 18.26

#### OB Removing
- **Source**: Tabel `r_base_data_pro` + `r_parent_base_data_pro`
- **Logic**: 
  - Material = 'ob'
  - Tonnage calculation berdasarkan tyre_type:
    - 6x4: vessel × 26.56
    - 8x4: vessel × 29.56

#### Ore Hauling
- **Source**: Tabel `r_base_data_pro` + `r_parent_base_data_pro`
- **Logic**: 
  - Material = 'ore'
  - Activity = 'hauling'
  - Tonnage calculation berdasarkan tyre_type:
    - 6x4: vessel × 26.56
    - 8x4: vessel × 29.56

### 3. Perhitungan Ratio

#### FR (Fuel Ratio)
```
FR = SUM(qty_supply dari tabel r_fuel) / Ore Barging
```

#### SR (Specific Ratio)
```
SR = OB Removing / Ore Hauling
```

### 4. Query Implementation

#### Fuel Consumption Query
```sql
SELECT 
  SUM(COALESCE(rf.qty_supply, 0)) as total_qty_supply
FROM r_fuel rf
WHERE DATE(rf.activity_date) BETWEEN $1 AND $2
  AND rf.qty_supply IS NOT NULL
```

#### Ore Barging Query
```sql
SELECT 
  SUM(rbdp.total_vessel * 
    CASE 
      WHEN mp.tyre_type = '6x4' THEN 16.6
      WHEN mp.tyre_type = '8x4' THEN 18.26
      ELSE 0
    END
  ) as total_ore_barging
FROM r_parent_base_data_pro rpbdp
JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
JOIN m_population mp ON rpbdp.population_id = mp.id
WHERE rbdp.material = 'ore-barge'
  AND rbdp.activity = 'barging'
  AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
```

#### OB Removing Query
```sql
SELECT 
  SUM(rbdp.total_vessel * 
    CASE 
      WHEN mp.tyre_type = '6x4' THEN 26.56
      WHEN mp.tyre_type = '8x4' THEN 29.56
      ELSE 0
    END
  ) as total_ob_removing
FROM r_parent_base_data_pro rpbdp
JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
JOIN m_population mp ON rpbdp.population_id = mp.id
WHERE rbdp.material = 'ob'
  AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
```

#### Ore Hauling Query
```sql
SELECT 
  SUM(rbdp.total_vessel * 
    CASE 
      WHEN mp.tyre_type = '6x4' THEN 26.56
      WHEN mp.tyre_type = '8x4' THEN 29.56
      ELSE 0
    END
  ) as total_ore_hauling
FROM r_parent_base_data_pro rpbdp
JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
JOIN m_population mp ON rpbdp.population_id = mp.id
WHERE rbdp.material = 'ore'
  AND rbdp.activity = 'hauling'
  AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
```

### 5. Response Format

#### Request
```
GET /api/dashboard/monthly/trend-fuel-ratio?month=2025-09
```

#### Response
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "chart": [
      {
        "date": "09/25",
        "fr": 0.15,
        "sr": 1.2
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

### 6. Perubahan Utama

1. **Data Real**: Menggunakan data real dari database bukan data statis
2. **Perhitungan Bulanan**: Data dihitung per bulan, bukan per hari dalam bulan
3. **Format Date**: Menggunakan format MM/YY untuk display (contoh: 09/25 untuk September 2025)
4. **Error Handling**: Menambahkan try-catch untuk menangani error
5. **Rounding**: Nilai FR dan SR dibulatkan ke 2 desimal
6. **Null Safety**: Menggunakan COALESCE untuk menangani nilai NULL

### 7. Testing

Endpoint dapat ditest menggunakan curl:
```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/monthly/trend-fuel-ratio?month=2025-09' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

### 8. Catatan Penting

- Data yang dikembalikan adalah data per bulan, bukan per hari
- Jika tidak ada data untuk bulan tertentu, nilai FR dan SR akan menjadi 0
- Perhitungan tonnage menggunakan faktor konversi berdasarkan tyre_type unit
- Format tanggal menggunakan MM/YY untuk konsistensi dengan endpoint lainnya
