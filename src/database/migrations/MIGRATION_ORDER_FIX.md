# Migration Order Fix

## Masalah yang Ditemukan

Error terjadi karena urutan migrasi yang tidak tepat:

```
Migration "UpdateParentPlanWorkingHourColumns1700000000039" failed, error: relation "r_parent_plan_working_hour" does not exist
```

## Analisis Masalah

### Urutan Migrasi yang Salah:
1. `1700000000039-UpdateParentPlanWorkingHourColumns.ts` - Mencoba mengupdate tabel `r_parent_plan_working_hour`
2. `1700000000043-CreateTableRParentPlanWorkingHour.ts` - Membuat tabel `r_parent_plan_working_hour`

**Masalah**: Migrasi `1700000000039` dijalankan sebelum `1700000000043`, padahal seharusnya sebaliknya.

### Timestamp Migrasi:
- `1700000000039` = 1700000000039 (lebih kecil)
- `1700000000043` = 1700000000043 (lebih besar)

TypeORM menjalankan migrasi berdasarkan urutan timestamp dari kecil ke besar.

## Solusi yang Diterapkan

### 1. Hapus Migrasi Bermasalah
- **Dihapus**: `1700000000039-UpdateParentPlanWorkingHourColumns.ts`

### 2. Buat Migrasi Baru dengan Timestamp yang Benar
- **Dibuat**: `1700000000050-UpdateParentPlanWorkingHourColumns.ts`

### 3. Urutan Migrasi yang Benar Sekarang:
1. `1700000000043-CreateTableRParentPlanWorkingHour.ts` - Membuat tabel
2. `1700000000050-UpdateParentPlanWorkingHourColumns.ts` - Mengupdate kolom

## Struktur Tabel yang Benar

### Tabel: `r_parent_plan_working_hour`

#### Kolom Awal (setelah CreateTable):
- `id` (int, primary key, auto increment)
- `plan_date` (timestamp)
- `total_calendar_day` (int)
- `total_holiday_day` (int)
- `total_available_day` (int)
- `total_working_hour` (float) ← **Akan di-rename**
- `total_working_day_longshift` (int)
- `working_hour_longshift` (int) ← **Akan di-rename**
- `total_mohh_per_month` (int)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `deletedAt` (timestamp)

#### Kolom Setelah Update (setelah UpdateParentPlanWorkingHourColumns):
- `id` (int, primary key, auto increment)
- `plan_date` (timestamp)
- `total_calendar_day` (int)
- `total_holiday_day` (int)
- `total_available_day` (int)
- `total_working_hour_month` (float) ← **Sudah di-rename**
- `total_working_day_longshift` (int)
- `total_working_hour_day` (int) ← **Sudah di-rename**
- `total_mohh_per_month` (int)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `deletedAt` (timestamp)

## Langkah-langkah Perbaikan

### 1. Hapus Migrasi Bermasalah
```bash
rm src/database/migrations/1700000000039-UpdateParentPlanWorkingHourColumns.ts
```

### 2. Buat Migrasi Baru
```bash
# File baru: 1700000000050-UpdateParentPlanWorkingHourColumns.ts
# Dengan timestamp yang lebih besar dari 1700000000043
```

### 3. Jalankan Migrasi
```bash
npm run migration:run
```

## Verifikasi Perbaikan

### 1. Cek Urutan Migrasi
```bash
# Pastikan urutan timestamp benar
1700000000043 < 1700000000050
```

### 2. Cek Struktur Tabel
```sql
-- Setelah migrasi berhasil, cek struktur tabel
\d r_parent_plan_working_hour
```

### 3. Cek Status Migrasi
```bash
# Cek apakah ada migrasi yang pending
npm run migration:show
```

## Catatan Penting

1. **Urutan Timestamp**: Selalu pastikan timestamp migrasi yang membuat tabel lebih kecil dari migrasi yang mengupdate tabel
2. **Dependency Check**: Sebelum membuat migrasi, pastikan tabel yang akan diupdate sudah ada
3. **Testing**: Test migrasi di environment development sebelum production
4. **Backup**: Selalu backup database sebelum menjalankan migrasi di production

## Contoh Urutan Timestamp yang Benar

```typescript
// 1. Buat tabel (timestamp kecil)
export class CreateTable1700000000043 implements MigrationInterface

// 2. Update tabel (timestamp lebih besar)
export class UpdateTable1700000000050 implements MigrationInterface

// 3. Tambah kolom (timestamp lebih besar lagi)
export class AddColumn1700000000060 implements MigrationInterface
```

## Kesimpulan

Masalah telah diperbaiki dengan:
1. Menghapus migrasi bermasalah dengan timestamp `1700000000039`
2. Membuat migrasi baru dengan timestamp `1700000000050`
3. Memastikan urutan migrasi yang benar: buat tabel dulu, baru update kolom

Sekarang migrasi dapat dijalankan tanpa error.
