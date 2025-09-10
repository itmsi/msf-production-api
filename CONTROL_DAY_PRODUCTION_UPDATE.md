# Control Day Production API Update

## Perubahan yang Dilakukan

API `control/day-production` telah diperbarui sesuai dengan spesifikasi yang diberikan untuk mengimplementasikan grouping berdasarkan NS/DS dan perhitungan yang benar.

### 1. Perubahan DTO (DayProductionQueryDto)

- **Ditambahkan**: `startDate` dan `endDate` untuk filter range tanggal
- **Dihapus**: `selectedDate` (diganti dengan startDate/endDate)
- **Dipertahankan**: `shift`, `unit`, `page`, `limit`

### 2. Perubahan Logic Service (getDayProduction)

#### Grouping Data
- Data sekarang di-group berdasarkan: `activity_date`, `tyre_type`, `no_unit`, `shift`
- Setiap group mewakili satu unit dalam satu shift (DS/NS) pada tanggal tertentu

#### Perhitungan MOHH
- **Sebelum**: Fixed 24 jam per hari
- **Sesudah**: `duration * 24` berdasarkan range tanggal input (startDate - endDate)
- Jika tidak ada range tanggal, default 1 hari (24 jam)

#### Perhitungan EWH (Effective Working Hours)
- **Sebelum**: Menggunakan nilai tetap
- **Sesudah**: Akumulasi dari `totalHM` dari semua record `base_data_pro` dalam group yang sama

#### Perhitungan Breakdown Time
- **Sebelum**: Tidak dihitung
- **Sesudah**: Sum dari `r_loss_time.duration` dengan `lossType = 'BD'` untuk unit, tanggal, dan shift yang sama
- Mendukung range tanggal jika startDate/endDate diberikan

#### Perhitungan Standby Time
- **Formula**: `mohh - breakdown_time - ewh_time`

#### Perhitungan Material Counts
- **ore_hauling**: Sum dari `totalVessel` dimana `material = 'ore'` dan `activity = 'hauling'`
- **ore_barge**: Sum dari `totalVessel` dimana `material = 'ore'` dan `activity = 'barging'`
- **quarry**: Sum dari `totalVessel` dimana `material = 'quarry'`
- **boulder**: Sum dari `totalVessel` dimana `material = 'boulder'`
- **ob**: Sum dari `totalVessel` dimana `material = 'ob'`

#### Perhitungan Tonnage
- **6x4 Tyre Type**:
  - ore_hauling_tonnage: `ore_hauling * 26.56`
  - quarry_tonnage: `quarry * 16.6`
  - ore_barge_tonnage: `ore_barge * 16.6`
  - boulder_tonnage: `boulder * 26.56`
  - ob_tonnage: `(ob * 26.56) / 1.6`

- **8x4 Tyre Type**:
  - ore_hauling_tonnage: `ore_hauling * 29.56`
  - quarry_tonnage: `quarry * 18.26`
  - ore_barge_tonnage: `ore_barge * 18.26`
  - boulder_tonnage: `boulder * 29.56`
  - ob_tonnage: `(ob * 29.56) / 1.6`

#### Perhitungan Availability Metrics
- **PA (Physical Availability)**: `(ewh_time + standby_time) / mohh`
- **UA (Unit Availability)**: `ewh_time / (ewh_time + standby_time)`
- **MA (Mechanical Availability)**: `ewh_time / (ewh_time + breakdown_time)`
- **EU (Effectiveness Utilization)**: `ewh_time / mohh`

#### Perhitungan SR (Stripping Ratio)
- **Formula**: `ob_tonnage / ore_hauling_tonnage`

### 3. Perubahan Response Format

Response sekarang menggunakan format yang konsisten dengan pagination:
```json
{
    "statusCode": 200,
    "message": "Data berhasil diambil",
    "data": [...],
    "pagination": {
        "total": 7,
        "page": 1,
        "limit": 10,
        "lastPage": 1
    }
}
```

### 4. Perubahan Controller

- **Ditambahkan**: Query parameters untuk `startDate`, `endDate`, `shift`, `unit`, `page`, `limit`
- **Diperbarui**: Dokumentasi API dengan contoh response yang sesuai spesifikasi

## Cara Penggunaan

### Request Example
```bash
curl -X 'GET' \
  'http://localhost:9539/api/control/day-production?startDate=2025-01-01&endDate=2025-01-31&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### Response Example
```json
{
    "statusCode": 200,
    "message": "Data berhasil diambil",
    "data": [
        {
            "activity_date": "2025-10-01",
            "tyre_type": "6x4",
            "no_unit": "KFM-DT-001",
            "shift": "ds",
            "mohh": 24,
            "standby_time": 2,
            "breakdown_time": 3.5,
            "ewh_time": 35,
            "pa": 0,
            "ua": 0,
            "ma": 0,
            "eu": 0,
            "ore_hauling": 5,
            "quarry": 0,
            "ob": 0,
            "boulder": 20,
            "ore_barge": 8,
            "ore_hauling_tonnage": 132.8,
            "quarry_tonnage": 0,
            "ore_barge_tonnage": 212.48,
            "boulder_tonnage": 0,
            "ob_tonnage": 0,
            "sr": 0
        }
    ],
    "pagination": {
        "total": 7,
        "page": 1,
        "limit": 10,
        "lastPage": 1
    }
}
```

## Catatan Penting

1. **Grouping**: Data sekarang di-group berdasarkan unit dan shift, sehingga setiap baris mewakili satu unit dalam satu shift
2. **MOHH Calculation**: Berdasarkan range tanggal input, bukan fixed per hari
3. **Breakdown Time**: Diambil dari tabel `r_loss_time` dengan filter yang tepat
4. **Material Calculation**: Akumulasi dari semua record dalam group yang sama
5. **Tonnage Factors**: Menggunakan faktor yang berbeda untuk setiap jenis material dan tyre type

## Testing

API telah di-build dan tidak ada error linting. Silakan test dengan data real untuk memastikan perhitungan sesuai dengan ekspektasi.
