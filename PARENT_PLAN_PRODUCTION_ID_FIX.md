# Perbaikan Hardcode ID pada Parent Plan Production

## Masalah
Method `updateParentPlanProductionTotals` menggunakan ID hardcode `21` untuk mengupdate parent plan production, padahal seharusnya mencari parent plan production berdasarkan `plan_date` yang diberikan.

## Penyebab
Kode sebelumnya menggunakan ID hardcode yang tidak fleksibel dan hanya bekerja untuk satu record tertentu.

## Solusi
Mengganti hardcode ID dengan pencarian parent plan production berdasarkan tahun dan bulan yang sama dengan data yang sedang diproses.

## Perubahan yang Dilakukan

### File: `src/modules/daily-plan-production/daily-plan-production.service.ts`

**Sebelum:**
```typescript
// Selalu update parent plan production dengan ID 20 untuk Oktober 2025
console.log('Updating parent plan production with ID 20...');

// Gunakan QueryBuilder untuk update yang lebih eksplisit
await this.parentPlanProductionRepository
  .createQueryBuilder()
  .update(ParentPlanProduction)
  .set({
    total_average_month_ewh: total_average_month_ewh,
    total_ore_target: total_ore_target,
    total_ore_shipment_target: total_ore_shipment_target,
    total_ob_target: total_ob_target,
  })
  .where('id = :id', { id: 21 })
  .execute();

console.log(`Updated parent plan production ID 20 with new totals:`);
```

**Sesudah:**
```typescript
// Cari parent plan production berdasarkan tahun dan bulan yang sama
const parentPlan = await this.parentPlanProductionRepository.findOne({
  where: {
    plan_date: Between(startOfMonth, endOfMonth),
  },
});

if (!parentPlan) {
  console.log(`No parent plan production found for month ${year}-${month.toString().padStart(2, '0')}`);
  return;
}

console.log(`Updating parent plan production with ID ${parentPlan.id}...`);

// Gunakan QueryBuilder untuk update yang lebih eksplisit
await this.parentPlanProductionRepository
  .createQueryBuilder()
  .update(ParentPlanProduction)
  .set({
    total_average_month_ewh: total_average_month_ewh,
    total_ore_target: total_ore_target,
    total_ore_shipment_target: total_ore_shipment_target,
    total_ob_target: total_ob_target,
  })
  .where('id = :id', { id: parentPlan.id })
  .execute();

console.log(`Updated parent plan production ID ${parentPlan.id} with new totals:`);
```

## Logika Pencarian Parent Plan Production

### 1. Menghitung Rentang Bulan
```typescript
const year = planDate.getFullYear();
const month = planDate.getMonth() + 1;
const startOfMonth = new Date(year, month - 1, 1);
const endOfMonth = new Date(year, month, 0);
```

### 2. Mencari Parent Plan Production
```typescript
const parentPlan = await this.parentPlanProductionRepository.findOne({
  where: {
    plan_date: Between(startOfMonth, endOfMonth),
  },
});
```

### 3. Validasi dan Update
```typescript
if (!parentPlan) {
  console.log(`No parent plan production found for month ${year}-${month.toString().padStart(2, '0')}`);
  return;
}

// Update dengan ID yang ditemukan
.where('id = :id', { id: parentPlan.id })
```

## Keuntungan Perubahan

### ✅ Fleksibilitas
- Tidak lagi terikat pada ID tertentu
- Bekerja untuk semua parent plan production
- Otomatis menemukan parent yang sesuai

### ✅ Robustness
- Validasi keberadaan parent plan production
- Error handling yang lebih baik
- Log yang informatif

### ✅ Maintainability
- Kode lebih mudah dipahami
- Tidak ada magic number
- Lebih mudah untuk testing

## Contoh Penggunaan

### Sebelum Perubahan
```typescript
// Hanya bekerja untuk ID 21
await this.updateParentPlanProductionTotals(new Date('2025-10-15'));
// Selalu mengupdate parent dengan ID 21
```

### Sesudah Perubahan
```typescript
// Bekerja untuk parent plan production manapun
await this.updateParentPlanProductionTotals(new Date('2025-10-15'));
// Akan mencari dan mengupdate parent yang sesuai dengan bulan Oktober 2025
```

## Testing

### Test Case 1: Parent Plan Production Ditemukan
```typescript
// Input: plan_date = '2025-10-15'
// Expected: Mencari parent plan production untuk Oktober 2025
// Result: Update parent dengan ID yang sesuai
```

### Test Case 2: Parent Plan Production Tidak Ditemukan
```typescript
// Input: plan_date = '2025-11-15' (jika tidak ada parent untuk November)
// Expected: Log "No parent plan production found for month 2025-11"
// Result: Tidak melakukan update
```

## Dampak

### ✅ Positif
- Kode lebih fleksibel dan dapat digunakan untuk semua parent plan production
- Tidak ada lagi ketergantungan pada ID hardcode
- Error handling yang lebih baik
- Log yang lebih informatif

### ⚠️ Tidak Berubah
- Fungsi utama tetap sama
- Performance tidak terpengaruh signifikan
- API contract tetap sama

## Catatan Penting

1. **Query Optimization**: Query menggunakan `Between` untuk mencari parent dalam rentang bulan yang sama
2. **Error Handling**: Jika parent tidak ditemukan, method akan return tanpa error
3. **Logging**: Log yang informatif untuk debugging dan monitoring
4. **Flexibility**: Sekarang dapat bekerja untuk semua parent plan production

## Kesimpulan

Perbaikan ini menghilangkan ketergantungan pada ID hardcode dan membuat kode lebih fleksibel, robust, dan maintainable. Sekarang method dapat bekerja untuk semua parent plan production berdasarkan data yang sedang diproses.
