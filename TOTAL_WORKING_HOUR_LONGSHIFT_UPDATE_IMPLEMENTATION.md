# Implementasi Update Total Working Hour Longshift dan Total Working Day Longshift

## Deskripsi
Implementasi logika untuk mengupdate kolom `total_working_hour_longshift` dan `total_working_day_longshift` di tabel `r_parent_plan_working_hour` langsung dari payload request, tanpa perlu menjumlahkan dari tabel `r_plan_working_hour`.

## Logika Implementasi

### 1. Update Total Working Hour Longshift
- Langsung mengambil nilai `total_working_hour_longshift` dari payload request
- Update kolom `total_working_hour_longshift` di tabel `r_parent_plan_working_hour` dengan nilai tersebut
- Tidak perlu menghitung total dari tabel `r_plan_working_hour`

### 2. Update Total Working Day Longshift
- Langsung mengambil nilai `total_working_day_longshift` dari payload request
- Jika nilai adalah `boolean`, konversi ke `number` (true = 1, false = 0)
- Update kolom `total_working_day_longshift` di tabel `r_parent_plan_working_hour` dengan nilai tersebut
- Tidak perlu menghitung total dari tabel `r_plan_working_hour`

## File yang Dimodifikasi

### 1. Service (`src/modules/plan-working-hour/parent-plan-working-hour.service.ts`)

#### Method `create()`
- Menambahkan logika update `total_working_hour_longshift` dan `total_working_day_longshift` langsung dari payload
- Menghapus perhitungan total dari tabel `r_plan_working_hour`

#### Method `update()`
- Menambahkan logika update `total_working_hour_longshift` dan `total_working_day_longshift` langsung dari payload
- Menghapus perhitungan total dari tabel `r_plan_working_hour`

#### Method `updateDetail()`
- Menambahkan logika update `total_working_hour_longshift` dan `total_working_day_longshift` langsung dari payload
- Menghapus perhitungan total dari tabel `r_plan_working_hour`

#### Method `updateDetailByPlanWorkingHourId()`
- Menambahkan logika update `total_working_hour_longshift` dan `total_working_day_longshift` langsung dari payload
- Menghapus perhitungan total dari tabel `r_plan_working_hour`

## Contoh Penggunaan

### Request Body untuk Update
```json
{
  "plan_date": "2025-10-01T17:00:00.000Z",
  "working_hour_month": 6.45,
  "working_hour_day": 24,
  "mohh_per_month": 24,
  "working_hour_longshift": 8,
  "working_day_longshift": true,
  "schedule_day": 0,
  "detail": [
    {"activities_id": 2, "activities_hour": 1},
    {"activities_id": 3, "activities_hour": 1}
  ]
}
```

### Response dengan Notifikasi
```
Data berhasil diupdate dengan total_working_hour_longshift: 10 dan total_working_day_longshift: 10
```

## Struktur Database

### Tabel `r_parent_plan_working_hour`
- `total_working_hour_longshift`: decimal(10,2) - Total jam kerja long shift
- `total_working_day_longshift`: int - Total hari kerja dengan long shift

### Tabel `r_plan_working_hour`
- `working_hour_longshift`: int - Jam kerja long shift per hari
- `working_day_longshift`: int - Hari kerja long shift (1 = true, 0 = false)
- `parent_plan_working_hour_id`: int - Foreign key ke r_parent_plan_working_hour

## Validasi dan Error Handling

1. **Validasi Tipe Data**: Memastikan `total_working_day_longshift` bisa berupa boolean atau number
2. **Update Langsung**: Nilai langsung diupdate dari payload tanpa perhitungan tambahan
3. **Konversi Boolean**: Boolean true/false dikonversi ke number 1/0
4. **Rollback**: Jika terjadi error, semua perubahan di-rollback

## Testing

Untuk menguji implementasi ini, gunakan curl command berikut:

```bash
curl 'http://localhost:9527/api/parent-plan-working-hour/detail/619' \
  -X 'PATCH' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "plan_date": "2025-10-01T17:00:00.000Z",
    "working_hour_month": 6.45,
    "working_hour_day": 24,
    "mohh_per_month": 24,
    "working_hour_longshift": 8,
    "working_day_longshift": true,
    "schedule_day": 0,
    "detail": [
      {"activities_id": 2, "activities_hour": 1},
      {"activities_id": 3, "activities_hour": 1}
    ]
  }'
```

## Catatan Penting

1. **Update Langsung**: Nilai `total_working_hour_longshift` dan `total_working_day_longshift` langsung diupdate dari payload
2. **Performance**: Tidak ada perhitungan tambahan dari tabel child, sehingga lebih cepat
3. **Konsistensi**: Pastikan nilai yang dikirim sesuai dengan kebutuhan bisnis
4. **Backward Compatibility**: Implementasi tetap mendukung format data lama
