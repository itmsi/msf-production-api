# Validasi Endpoint Parent Plan Working Hour

## Endpoint yang Mendukung Validasi

### 1. POST /api/parent-plan-working-hour
Endpoint untuk membuat parent plan working hour baru.

### 2. PATCH /api/parent-plan-working-hour/:id  
Endpoint untuk mengupdate parent plan working hour yang sudah ada.

## Validasi yang Diterapkan

## Deskripsi
Kedua endpoint ini digunakan untuk membuat dan mengupdate parent plan working hour beserta detail harian dan aktivitas secara otomatis. Kedua endpoint memiliki validasi yang sama untuk memastikan integritas data dan mencegah duplikasi.

## Validasi yang Diterapkan

### 1. Validasi Format Tanggal
- **plan_date** harus berupa tanggal pertama dari bulan (01)
- Format yang diterima: `YYYY-MM-01` (contoh: `2025-08-01`)
- **Error**: Jika format tidak sesuai, akan muncul pesan:
  ```
  plan_date harus berupa tanggal pertama dari bulan (01). 
  Tanggal yang dikirim: 2025-08-15. 
  Gunakan format YYYY-MM-01 (contoh: 2025-08-01)
  ```

### 2. Validasi Periode Waktu
- **plan_date** tidak boleh di masa lalu (untuk bulan yang sudah lewat)
- **Error**: Jika bulan yang dipilih sudah lewat, akan muncul pesan:
  ```
  Tidak dapat membuat plan untuk bulan yang sudah lewat. 
  Bulan yang dipilih: 2025-06. 
  Bulan saat ini: 2025-08
  ```



### 3. Validasi Logika Hari Kerja
- **total_available_day + total_holiday_day = total_calendar_day**
- **Error**: Jika tidak sesuai, akan muncul pesan:
  ```
  Total hari tersedia + total hari libur harus sama dengan total hari kalender. 
  20 + 8 ≠ 31
  ```

### 4. Validasi Detail Activities
- **detail** tidak boleh kosong atau null
- **Error**: Jika kosong, akan muncul pesan:
  ```
  Detail activities tidak boleh kosong. Minimal harus ada satu aktivitas.
  ```

### 5. Validasi Unik Activities ID
- **activities_id** dalam detail harus unik (tidak boleh duplikat)
- **Error**: Jika ada duplikasi, akan muncul pesan:
  ```
  Activities ID harus unik. Tidak boleh ada duplikasi activities_id dalam detail.
  ```

### 6. Validasi Activities ID Valid
- Semua **activities_id** yang dikirim harus ada di database
- Activities tidak boleh sudah di-soft delete
- **Error**: Jika ada ID yang tidak valid, akan muncul pesan:
  ```
  Activities ID berikut tidak ditemukan atau sudah dihapus: 999, 888
  ```

### 7. Validasi Activities Hour
- **activities_hour** tidak boleh negatif
- **Error**: Jika ada nilai negatif, akan muncul pesan:
  ```
  Activities hour tidak boleh negatif. Activities ID 6: -1
  ```

### 8. Validasi Duplikat Bulan (Fitur Utama)
- **Tidak boleh ada data untuk bulan yang sama di tahun yang sama**
- Validasi ini menggunakan query database yang kompatibel dengan berbagai database
- **Untuk POST**: Mencegah pembuatan data baru untuk bulan yang sudah ada
- **Untuk PATCH**: Mencegah update ke bulan yang sudah ada (kecuali record yang sedang diupdate)
- **Error**: Jika bulan sudah ada, akan muncul pesan:
  ```
  Data untuk bulan Agustus 2025 sudah ada dalam sistem. 
  Silakan gunakan bulan lain atau update data yang sudah ada.
  ```

## Contoh Request yang Valid

### POST /api/parent-plan-working-hour
```json
{
  "plan_date": "2025-08-01",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour_month": 184,
  "total_working_day_longshift": 5,
  "total_working_hour_day": 8,
  "total_working_hour_longshift": 12,
  "total_mohh_per_month": 1000,
  "detail": [
    {
      "activities_id": 6,
      "activities_hour": 1
    },
    {
      "activities_id": 2,
      "activities_hour": 1
    },
    {
      "activities_id": 3,
      "activities_hour": 1
    }
  ]
}
```

### PATCH /api/parent-plan-working-hour/13
```json
{
  "plan_date": "2025-09-01",
  "total_calendar_day": 30,
  "total_holiday_day": 8,
  "total_available_day": 22,
  "total_working_hour_month": 176,
  "total_working_day_longshift": 5,
  "total_working_hour_day": 8,
  "total_working_hour_longshift": 12,
  "total_mohh_per_month": 1000,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 2
    },
    {
      "activities_id": 2,
      "activities_hour": 3
    },
    {
      "activities_id": 3,
      "activities_hour": 4
    }
  ]
}
```

## Contoh Request yang Tidak Valid

### 1. Tanggal Bukan Pertama Bulan
```json
{
  "plan_date": "2025-08-15",  // ❌ Harus 2025-08-01
  // ... field lainnya
}
```

### 2. Bulan yang Sudah Lewat
```json
{
  "plan_date": "2025-06-01",  // ❌ Juni 2025 sudah lewat (jika sekarang Agustus 2025)
  // ... field lainnya
}
```



### 3. Activities ID Duplikat
```json
{
  "plan_date": "2025-08-01",
  // ... field lainnya
  "detail": [
    {
      "activities_id": 6,      // ❌ Duplikat
      "activities_hour": 1
    },
    {
      "activities_id": 6,      // ❌ Duplikat
      "activities_hour": 2
    }
  ]
}
```

### 4. Bulan yang Sudah Ada
```json
{
  "plan_date": "2025-08-01",  // ❌ Agustus 2025 sudah ada di database
  // ... field lainnya
}
```

### 6. Update ke Bulan yang Sudah Ada
```json
PATCH /api/parent-plan-working-hour/13
{
  "plan_date": "2025-08-01",  // ❌ Agustus 2025 sudah ada di database (bukan record 13)
  // ... field lainnya
}
```

## Response Error

Semua validasi error akan mengembalikan response dengan format:

```json
{
  "statusCode": 400,
  "message": "Pesan error validasi",
  "error": "Bad Request"
}
```

## Catatan Penting

1. **Validasi duplikat bulan** adalah fitur utama yang mencegah pembuatan data ganda untuk bulan yang sama
2. **Untuk POST**: Mencegah pembuatan data baru untuk bulan yang sudah ada
3. **Untuk PATCH**: Mencegah update ke bulan yang sudah ada, dengan pengecualian record yang sedang diupdate
4. **plan_date** harus selalu tanggal 01 untuk konsistensi data
5. **Semua validasi** dijalankan sebelum melakukan operasi database
6. **Error handling** yang detail membantu developer memahami masalah dengan cepat
7. **Kompatibilitas database** menggunakan query `BETWEEN` yang didukung oleh semua database

## Testing

Untuk memastikan validasi berfungsi dengan baik, gunakan file test:

### 1. Validasi Create (POST)
```
src/modules/plan-working-hour/__test__/parent-plan-working-hour.service.validation.spec.ts
```

### 2. Validasi Update (PATCH)
```
src/modules/plan-working-hour/__test__/parent-plan-working-hour.service.update-validation.spec.ts
```

Test ini mencakup semua skenario validasi yang telah diimplementasikan untuk kedua endpoint.
