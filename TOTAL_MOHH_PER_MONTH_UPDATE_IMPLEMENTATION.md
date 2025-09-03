# Implementasi Update Total MOHH Per Month dari R Plan Working Hour

## Deskripsi
Implementasi logika untuk mengupdate kolom `total_mohh_per_month` di tabel `r_parent_plan_working_hour` dengan menjumlahkan semua data di tabel `r_plan_working_hour` di kolom `mohh_per_month` dengan `parent_plan_working_hour_id` yang sama.

## Logika Implementasi

### 1. Perhitungan Total MOHH Per Month
- Ambil semua record dari tabel `r_plan_working_hour` dengan `parent_plan_working_hour_id` yang sama
- Jumlahkan semua nilai `mohh_per_month` dari record tersebut
- Update kolom `total_mohh_per_month` di tabel `r_parent_plan_working_hour` dengan hasil penjumlahan
- Bulatkan hasil ke 2 desimal

### 2. Formula Perhitungan
```
total_mohh_per_month = SUM(mohh_per_month dari r_plan_working_hour WHERE parent_plan_working_hour_id = id)
```

## File yang Dimodifikasi

### 1. Service (`src/modules/plan-working-hour/parent-plan-working-hour.service.ts`)

#### Method `create()`
- Menambahkan perhitungan total `mohh_per_month` dari semua record di `r_plan_working_hour`
- Update `total_mohh_per_month` di parent plan dengan hasil penjumlahan

#### Method `update()`
- Menambahkan perhitungan total `mohh_per_month` dari semua record di `r_plan_working_hour`
- Update `total_mohh_per_month` di parent plan dengan hasil penjumlahan

#### Method `updateDetail()`
- Menambahkan perhitungan total `mohh_per_month` dari semua record di `r_plan_working_hour`
- Update `total_mohh_per_month` di parent plan dengan hasil penjumlahan

#### Method `updateDetailByPlanWorkingHourId()`
- Menambahkan perhitungan total `mohh_per_month` dari semua record di `r_plan_working_hour`
- Update `total_mohh_per_month` di parent plan dengan hasil penjumlahan

## Contoh Implementasi

### Kode yang Ditambahkan
```typescript
// Hitung total mohh_per_month dari semua record di r_plan_working_hour
const totalMohhPerMonth = updatedPlanWorkingHours.reduce(
  (sum, pwh) => sum + (pwh.mohh_per_month || 0),
  0
);

// Update total_mohh_per_month di parent plan berdasarkan jumlah dari r_plan_working_hour (dibulatkan ke 2 desimal)
parentPlan.total_mohh_per_month = Math.round(totalMohhPerMonth * 100) / 100;
```

## Alur Proses

1. **Create/Update Data**: Ketika data di `r_plan_working_hour` diupdate
2. **Hitung Total**: Ambil semua record `r_plan_working_hour` dengan `parent_plan_working_hour_id` yang sama
3. **Jumlahkan MOHH**: Jumlahkan semua nilai `mohh_per_month`
4. **Update Parent**: Update `total_mohh_per_month` di `r_parent_plan_working_hour`
5. **Simpan**: Simpan perubahan ke database

## Keuntungan Implementasi

1. **Konsistensi Data**: `total_mohh_per_month` selalu sesuai dengan jumlah dari data detail
2. **Otomatis Update**: Setiap kali data detail diupdate, total akan otomatis terupdate
3. **Akurasi**: Menggunakan perhitungan yang akurat dari data yang sebenarnya
4. **Rounding**: Hasil dibulatkan ke 2 desimal untuk konsistensi format

## Testing

Untuk memastikan implementasi berjalan dengan benar, dapat dilakukan testing dengan:

1. **Create Data**: Buat data baru dan pastikan `total_mohh_per_month` terhitung dengan benar
2. **Update Data**: Update data existing dan pastikan `total_mohh_per_month` terupdate
3. **Multiple Records**: Test dengan multiple record untuk memastikan penjumlahan berjalan dengan benar
4. **Edge Cases**: Test dengan nilai null/undefined untuk memastikan tidak ada error
