# Implementasi Update Total Working Hour Day dari Payload

## Deskripsi
Implementasi logika untuk mengupdate kolom `total_working_hour_day` di tabel `r_parent_plan_working_hour` langsung dari payload request, tanpa perlu menjumlahkan dari tabel `r_plan_working_hour`.

## Logika Implementasi

### 1. Update Total Working Hour Day
- Langsung mengambil nilai `total_working_hour_day` dari payload request
- Update kolom `total_working_hour_day` di tabel `r_parent_plan_working_hour` dengan nilai tersebut
- Tidak perlu menghitung total dari tabel `r_plan_working_hour`

### 2. Perbedaan dengan Total Working Hour Month
- `total_working_hour_month` tetap dihitung dari akumulasi data di tabel `r_plan_working_hour`
- `total_working_hour_day` langsung diambil dari payload tanpa akumulasi

## File yang Dimodifikasi

### 1. Service (`src/modules/plan-working-hour/parent-plan-working-hour.service.ts`)

#### Method `create()`
- Menghapus perhitungan total `total_working_hour_day` dari tabel `r_plan_working_hour`
- Menambahkan logika update `total_working_hour_day` langsung dari payload
- Mempertahankan perhitungan `total_working_hour_month` dari tabel `r_plan_working_hour`

#### Method `update()`
- Menghapus perhitungan total `total_working_hour_day` dari tabel `r_plan_working_hour`
- Menambahkan logika update `total_working_hour_day` langsung dari payload
- Mempertahankan perhitungan `total_working_hour_month` dari tabel `r_plan_working_hour`

#### Method `updateDetail()`
- Menghapus perhitungan total `total_working_hour_day` dari tabel `r_plan_working_hour`
- Menambahkan logika update `total_working_hour_day` langsung dari payload
- Mempertahankan perhitungan `total_working_hour_month` dari tabel `r_plan_working_hour`

#### Method `updateDetailByPlanWorkingHourId()`
- Menghapus perhitungan total `total_working_hour_day` dari tabel `r_plan_working_hour`
- Menambahkan logika update `total_working_hour_day` langsung dari payload
- Mempertahankan perhitungan `total_working_hour_month` dari tabel `r_plan_working_hour`

## Contoh Penggunaan

### Request Body untuk Create/Update
```json
{
  "plan_date": "2025-10-01",
  "total_working_hour_month": 100,
  "total_working_hour_day": 20,
  "total_mohh_per_month": 20,
  "total_working_hour_longshift": 10,
  "total_working_day_longshift": 10,
  "detail": [
    {"activities_id": 2, "activities_hour": 2},
    {"activities_id": 3, "activities_hour": 2}
  ]
}
```

### Response
```json
{
  "id": 1,
  "plan_date": "2025-10-01T00:00:00.000Z",
  "total_calendar_day": 31,
  "total_holiday_day": 0,
  "total_available_day": 31,
  "total_working_hour_month": 100.00,
  "total_working_hour_day": 20,
  "total_working_hour_longshift": 10,
  "total_working_day_longshift": 10,
  "total_mohh_per_month": 20
}
```

## Perubahan Kode

### Sebelum (Menghitung dari r_plan_working_hour)
```typescript
// Hitung total working_hour_day dari semua record di r_plan_working_hour
const totalWorkingHourDay = updatedPlanWorkingHours.reduce(
  (sum, pwh) => sum + (pwh.working_hour_day || 0),
  0
);

// Update parent plan dengan nilai yang dihitung (dibulatkan ke 2 desimal)
savedParentPlan.total_working_hour_day = Math.round(totalWorkingHourDay * 100) / 100;
```

### Sesudah (Langsung dari Payload)
```typescript
// Langsung update total_working_hour_day dari payload tanpa akumulasi dari r_plan_working_hour
if (createDto.total_working_hour_day !== undefined) {
  savedParentPlan.total_working_hour_day = createDto.total_working_hour_day;
}
```

## Dampak Perubahan

1. **Performa**: Tidak perlu melakukan perhitungan akumulasi dari tabel `r_plan_working_hour`
2. **Konsistensi**: Nilai `total_working_hour_day` selalu sesuai dengan yang dikirim dalam payload
3. **Fleksibilitas**: User dapat mengirim nilai `total_working_hour_day` yang berbeda dengan perhitungan otomatis

## Testing

Untuk memastikan perubahan berfungsi dengan baik, lakukan testing dengan:

1. **Create Request**: Kirim request dengan `total_working_hour_day: 20`
2. **Update Request**: Update dengan `total_working_hour_day: 25`
3. **Verifikasi**: Pastikan nilai di database sesuai dengan payload yang dikirim

## Catatan

- Perubahan ini hanya mempengaruhi kolom `total_working_hour_day` di tabel `r_parent_plan_working_hour`
- Kolom `total_working_hour_month` tetap dihitung dari akumulasi data di tabel `r_plan_working_hour`
- Semua method yang mengupdate parent plan working hour telah disesuaikan
