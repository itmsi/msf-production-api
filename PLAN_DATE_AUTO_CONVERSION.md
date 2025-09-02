# Konversi Otomatis Plan Date

## Deskripsi Perubahan

Sistem sekarang secara otomatis mengkonversi `plan_date` yang dikirim ke tanggal pertama dari bulan yang sama, menghilangkan kebutuhan untuk mengirim tanggal dengan format yang tepat.

## Perubahan yang Dilakukan

### 1. Method `create` di `ParentPlanWorkingHourService`

**Sebelum:**
```typescript
// Validasi bahwa plan_date adalah tanggal pertama dari bulan (01)
const dayOfMonth = planDate.getDate();
if (dayOfMonth !== 1) {
  throw new BadRequestException(
    `plan_date harus berupa tanggal pertama dari bulan (01). ` +
    `Tanggal yang dikirim: ${createDto.plan_date}. ` +
    `Gunakan format YYYY-MM-01 (contoh: 2025-08-01)`
  );
}
```

**Sesudah:**
```typescript
// Konversi otomatis plan_date ke tanggal pertama dari bulan
const inputDate = new Date(createDto.plan_date);
const year = inputDate.getFullYear();
const month = inputDate.getMonth();

// Buat tanggal pertama dari bulan yang sama
const planDate = new Date(year, month, 1);

// Update plan_date dengan tanggal yang sudah dikonversi
createDto.plan_date = planDate.toISOString().split('T')[0];

console.log(`Tanggal dikonversi dari ${inputDate.toISOString()} menjadi ${createDto.plan_date}`);
```

### 2. Method `update` di `ParentPlanWorkingHourService`

**Sebelum:**
```typescript
// Validasi bahwa plan_date adalah tanggal pertama dari bulan (01)
const dayOfMonth = newPlanDate.getDate();
if (dayOfMonth !== 1) {
  throw new BadRequestException(
    `plan_date harus berupa tanggal pertama dari bulan (01). ` +
    `Tanggal yang dikirim: ${updateDto.plan_date}. ` +
    `Gunakan format YYYY-MM-01 (contoh: 2025-09-01)`
  );
}
```

**Sesudah:**
```typescript
// Konversi otomatis plan_date ke tanggal pertama dari bulan
const inputDate = new Date(updateDto.plan_date);
const year = inputDate.getFullYear();
const month = inputDate.getMonth();

// Buat tanggal pertama dari bulan yang sama
const newPlanDate = new Date(year, month, 1);

// Update plan_date dengan tanggal yang sudah dikonversi
updateDto.plan_date = newPlanDate.toISOString().split('T')[0];

console.log(`Tanggal dikonversi dari ${inputDate.toISOString()} menjadi ${updateDto.plan_date}`);
```

## Contoh Penggunaan

### Sebelum Perubahan
```bash
curl 'http://localhost:9527/api/parent-plan-working-hour/15' \
  -X 'PATCH' \
  -H 'Content-Type: application/json' \
  --data-raw '{"plan_date":"2025-11-01T17:00:00.000Z",...}'
```

**Error yang muncul:**
```
plan_date harus berupa tanggal pertama dari bulan (01). 
Tanggal yang dikirim: 2025-11-01T17:00:00.000Z. 
Gunakan format YYYY-MM-01 (contoh: 2025-09-01)
```

### Sesudah Perubahan
```bash
curl 'http://localhost:9527/api/parent-plan-working-hour/15' \
  -X 'PATCH' \
  -H 'Content-Type: application/json' \
  --data-raw '{"plan_date":"2025-11-01T17:00:00.000Z",...}'
```

**Log yang muncul:**
```
Tanggal dikonversi dari 2025-11-01T17:00:00.000Z menjadi 2025-11-01
```

**Hasil:** Request berhasil diproses tanpa error.

## Format Tanggal yang Diterima

Sistem sekarang menerima berbagai format tanggal:

1. **ISO String dengan timezone:** `"2025-11-01T17:00:00.000Z"`
2. **ISO String tanpa timezone:** `"2025-11-01T17:00:00.000"`
3. **Tanggal dengan format YYYY-MM-DD:** `"2025-11-01"`
4. **Tanggal dengan format YYYY-MM-DD HH:mm:ss:** `"2025-11-01 17:00:00"`

Semua format di atas akan dikonversi otomatis menjadi `"2025-11-01"` (tanggal pertama dari bulan).

## Endpoint yang Terpengaruh

1. **POST** `/api/parent-plan-working-hour` - Membuat parent plan working hour baru
2. **PATCH** `/api/parent-plan-working-hour/:id` - Mengupdate parent plan working hour yang sudah ada

## Keuntungan

1. **User Experience yang Lebih Baik:** User tidak perlu khawatir tentang format tanggal yang tepat
2. **Fleksibilitas:** Menerima berbagai format tanggal input
3. **Konsistensi:** Data selalu disimpan dalam format yang konsisten (YYYY-MM-01)
4. **Backward Compatibility:** Tetap mendukung format lama yang sudah ada

## Catatan Teknis

- Konversi dilakukan di awal proses sebelum validasi lainnya
- Log ditambahkan untuk tracking konversi yang dilakukan
- Semua validasi lainnya tetap berjalan seperti biasa
- Data yang disimpan ke database tetap dalam format yang konsisten
