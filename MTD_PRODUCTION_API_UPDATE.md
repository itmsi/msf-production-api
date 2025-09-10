# MTD Production API Update

## Perubahan yang Dilakukan

### 1. Struktur Response Baru
- Mengubah struktur response dari format lama ke format baru sesuai spesifikasi
- Field `dt_type`, `unit`, `activityDate` diganti dengan `activity_date`, `tyre_type`, `no_unit`, `shift`
- Menambahkan field `mohh` sebagai number (bukan string)

### 2. Logic Grouping
- Mengubah grouping dari hanya berdasarkan `unit` menjadi berdasarkan kombinasi:
  - `activity_date`
  - `tyre_type` 
  - `no_unit`
  - `shift`

### 3. Perhitungan Breakdown Time
- Menambahkan method `getBreakdownTime()` untuk menghitung breakdown time dari tabel `r_loss_time`
- Breakdown time dihitung berdasarkan `lossType = 'BD'` untuk unit, tanggal, dan shift tertentu

### 4. Perhitungan Tonnage yang Diperbaiki
- **Ore Barge**: Menggunakan faktor berbeda dari ore hauling
  - 6x4: 16.6 (bukan 26.56)
  - 8x4: 18.26 (bukan 29.56)
- **Ore Hauling**: Tetap menggunakan faktor yang sama
  - 6x4: 26.56
  - 8x4: 29.56

### 5. Perhitungan Availability Metrics
- **PA (Physical Availability)**: `(ewh_time + standby_time) / mohh`
- **UA (Unit Availability)**: `ewh_time / (ewh_time + standby_time)`
- **MA (Mechanical Availability)**: `ewh_time / (ewh_time + breakdown_time)`
- **EU (Effectiveness Utilization)**: `ewh_time / mohh`

### 6. Perhitungan Standby Time
- Standby time = `mohh - breakdown_time - ewh_time`
- EWH time = HM (sesuai spesifikasi)

### 7. Struktur Pagination
- Mengubah dari `meta` ke `pagination`
- Menambahkan field `lastPage` menggantikan `totalPages`

### 8. Dependencies
- Menambahkan import `EffectiveWorkingHours` dan `LossType` dari module effective-working-hours
- Menambahkan repository injection untuk `EffectiveWorkingHours`

## File yang Dimodifikasi

1. `src/modules/control-production/mtd-production.service.ts`
   - Update method `getMtdProduction()`
   - Tambah method `getBreakdownTime()`
   - Update imports dan dependencies

2. `src/modules/control-production/dto/mtd-production.dto.ts`
   - Update `MtdProductionItemDto` dengan field baru
   - Tambah `PaginationDto`
   - Update `MtdProductionResponseDto`

3. `src/modules/control-production/mtd-production.controller.ts`
   - Update response example di Swagger documentation

## Testing

Untuk test endpoint yang sudah diupdate:

```bash
curl -X 'GET' \
  'http://localhost:9539/api/control/mtd-production?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Response akan mengikuti format yang telah ditentukan dengan struktur pagination yang baru.
