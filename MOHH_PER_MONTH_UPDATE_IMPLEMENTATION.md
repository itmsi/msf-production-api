# Implementasi Update MOHH Per Month dengan Perhitungan dari Total MOHH Per Month

## Deskripsi
Implementasi logika untuk mengupdate kolom `mohh_per_month` di tabel `r_plan_working_hour` dengan menghitung dari `total_mohh_per_month` di tabel `r_parent_plan_working_hour` dibagi jumlah hari di bulan tersebut.

## Logika Implementasi

### 1. Perhitungan MOHH Per Month
- Ambil nilai `total_mohh_per_month` dari payload request
- Hitung jumlah hari dalam bulan yang dipilih
- Bagi `total_mohh_per_month` dengan jumlah hari dalam bulan
- Simpan hasil perhitungan ke kolom `mohh_per_month` di tabel `r_plan_working_hour`

### 2. Formula Perhitungan
```
mohh_per_month = total_mohh_per_month / jumlah_hari_dalam_bulan
```

## File yang Dimodifikasi

### 1. Service (`src/modules/plan-working-hour/parent-plan-working-hour.service.ts`)

#### Method `create()`
- Mengubah logika pengisian `mohh_per_month` dari langsung menggunakan `createDto.total_mohh_per_month`
- Menambahkan perhitungan `createDto.total_mohh_per_month / daysInMonth`

#### Method `update()`
- Mengubah logika pengisian `mohh_per_month` dari langsung menggunakan `updateDto.total_mohh_per_month`
- Menambahkan perhitungan `updateDto.total_mohh_per_month / existingPlanWorkingHours.length`

#### Method `updateDetail()`
- Mengubah logika pengisian `mohh_per_month` dari langsung menggunakan `updateDto.mohh_per_month`
- Menambahkan perhitungan `updateDto.mohh_per_month / existingPlanWorkingHours.length`

#### Method `updateDetailByPlanWorkingHourId()`
- Tidak perlu diubah karena mengupdate satu record saja
- Nilai `mohh_per_month` yang dikirim sudah merupakan nilai per hari

## Contoh Penggunaan

### Request Body untuk Create/Update
```json
{
  "plan_date": "2025-10-01",
  "total_working_hour_month": 100,
  "total_working_hour_day": 20,
  "total_mohh_per_month": 620,
  "total_working_hour_longshift": 10,
  "total_working_day_longshift": 10,
  "detail": [
    {"activities_id": 2, "activities_hour": 2},
    {"activities_id": 3, "activities_hour": 2}
  ]
}
```

### Perhitungan untuk Oktober 2025
- Jumlah hari dalam Oktober 2025: 31 hari
- `total_mohh_per_month`: 620
- `mohh_per_month` per hari: 620 / 31 = 20.00

### Response di Tabel r_plan_working_hour
```json
{
  "id": 1,
  "plan_date": "2025-10-01T00:00:00.000Z",
  "is_calender_day": true,
  "is_holiday_day": false,
  "is_schedule_day": true,
  "schedule_day": 1,
  "working_hour_month": 3.23,
  "working_hour_day": 20,
  "mohh_per_month": 20.00,
  "parent_plan_working_hour_id": 1
}
```

## Perubahan Kode

### Sebelum (Langsung dari Payload)
```typescript
mohh_per_month: createDto.total_mohh_per_month,
```

### Sesudah (Dibagi Jumlah Hari)
```typescript
mohh_per_month: createDto.total_mohh_per_month / daysInMonth, // Dibagi jumlah hari di bulan
```

## Contoh Perhitungan untuk Berbagai Bulan

### Januari 2025 (31 hari)
- `total_mohh_per_month`: 620
- `mohh_per_month` per hari: 620 / 31 = 20.00

### Februari 2025 (28 hari)
- `total_mohh_per_month`: 560
- `mohh_per_month` per hari: 560 / 28 = 20.00

### April 2025 (30 hari)
- `total_mohh_per_month`: 600
- `mohh_per_month` per hari: 600 / 30 = 20.00

## Dampak Perubahan

1. **Konsistensi**: Nilai `mohh_per_month` di setiap hari dalam bulan akan sama
2. **Akurasi**: Perhitungan yang lebih akurat berdasarkan jumlah hari dalam bulan
3. **Fleksibilitas**: Dapat menangani bulan dengan jumlah hari yang berbeda (28, 30, 31)

## Testing

Untuk memastikan perubahan berfungsi dengan baik, lakukan testing dengan:

1. **Create Request untuk Bulan 31 Hari**: Kirim request dengan `total_mohh_per_month: 620`
2. **Create Request untuk Bulan 30 Hari**: Kirim request dengan `total_mohh_per_month: 600`
3. **Create Request untuk Bulan 28 Hari**: Kirim request dengan `total_mohh_per_month: 560`
4. **Verifikasi**: Pastikan nilai `mohh_per_month` di database sesuai dengan perhitungan

## Catatan

- Perubahan ini mempengaruhi kolom `mohh_per_month` di tabel `r_plan_working_hour`
- Perhitungan dilakukan otomatis berdasarkan jumlah hari dalam bulan yang dipilih
- Semua method yang mengupdate plan working hour telah disesuaikan
- Method `updateDetailByPlanWorkingHourId` tidak perlu diubah karena mengupdate satu record saja
