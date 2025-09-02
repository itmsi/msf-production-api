# Daily Plan Production Total Update Process

## Deskripsi
Proses ini menambahkan fitur untuk menghitung total dari beberapa field dalam tabel `r_plan_production` dan mengupdate tabel `r_parent_plan_production` secara otomatis.

## Field yang Dihitung Total

### 1. total_average_month_ewh
- **Sumber**: `average_month_ewh` (tabel r_plan_production)
- **Target**: `total_average_month_ewh` (tabel r_parent_plan_production)
- **Proses**: Menghitung total dari semua `average_month_ewh` dalam satu bulan

### 2. total_ore_target
- **Sumber**: `ore_target` (tabel r_plan_production)
- **Target**: `total_ore_target` (tabel r_parent_plan_production)
- **Proses**: Menghitung total dari semua `ore_target` dalam satu bulan

### 3. total_ore_shipment_target
- **Sumber**: `ore_shipment_target` (tabel r_plan_production)
- **Target**: `total_ore_shipment_target` (tabel r_parent_plan_production)
- **Proses**: Menghitung total dari semua `ore_shipment_target` dalam satu bulan

### 4. total_ob_target
- **Sumber**: `ob_target` (tabel r_plan_production)
- **Target**: `total_ob_target` (tabel r_parent_plan_production)
- **Proses**: Menghitung total dari semua `ob_target` dalam satu bulan

## Kapan Proses Ini Berjalan

### 1. Saat Create (POST)
- Ketika data baru dibuat di `r_plan_production`
- Otomatis menghitung total dan mengupdate `r_parent_plan_production`

### 2. Saat Update (PATCH)
- Ketika data diupdate di `r_plan_production`
- Otomatis menghitung ulang total dan mengupdate `r_parent_plan_production`

### 3. Saat Delete (DELETE)
- Ketika data dihapus dari `r_plan_production`
- Otomatis menghitung ulang total dan mengupdate `r_parent_plan_production`

## Implementasi

### Method: `updateParentPlanProductionTotals(planDate: Date)`

```typescript
private async updateParentPlanProductionTotals(planDate: Date): Promise<void> {
  // 1. Ambil tahun dan bulan dari plan_date
  const year = planDate.getFullYear();
  const month = planDate.getMonth() + 1;

  // 2. Hitung tanggal awal dan akhir bulan
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0);

  // 3. Ambil semua data plan production dalam satu bulan
  const monthlyPlans = await this.dailyPlanProductionRepository.find({
    where: {
      plan_date: Between(startOfMonth, endOfMonth),
    },
  });

  // 4. Hitung total dari field-field yang diminta
  const total_average_month_ewh = monthlyPlans.reduce((sum, plan) => {
    return sum + (plan.average_moth_ewh || plan.average_day_ewh || 0);
  }, 0);

  const total_ore_target = monthlyPlans.reduce((sum, plan) => {
    return sum + (plan.ore_target || 0);
  }, 0);

  const total_ore_shipment_target = monthlyPlans.reduce((sum, plan) => {
    return sum + (plan.ore_shipment_target || 0);
  }, 0);

  const total_ob_target = monthlyPlans.reduce((sum, plan) => {
    return sum + (plan.ob_target || 0);
  }, 0);

  // 5. Cari atau buat parent plan production
  const parentPlan = await this.parentPlanProductionRepository.findOne({
    where: {
      plan_date: Between(startOfMonth, endOfMonth),
    },
  });

  if (parentPlan) {
    // Update yang sudah ada
    parentPlan.total_average_month_ewh = total_average_month_ewh;
    parentPlan.total_ore_target = total_ore_target;
    parentPlan.total_ore_shipment_target = total_ore_shipment_target;
    parentPlan.total_ob_target = total_ob_target;
    await this.parentPlanProductionRepository.save(parentPlan);
  } else {
    // Buat yang baru
    const newParentPlan = new ParentPlanProduction();
    newParentPlan.plan_date = startOfMonth;
    newParentPlan.total_average_month_ewh = total_average_month_ewh;
    newParentPlan.total_ore_target = total_ore_target;
    newParentPlan.total_ore_shipment_target = total_ore_shipment_target;
    newParentPlan.total_ob_target = total_ob_target;
    // Set nilai default untuk field lainnya
    await this.parentPlanProductionRepository.save(newParentPlan);
  }
}
```

## Log Output

Proses ini akan menampilkan log untuk tracking:

```
Updated parent plan production for 2025-10
Created new parent plan production for 2025-10
```

## Contoh Penggunaan

### Request PATCH
```bash
curl 'https://dev-msf-revenues-api.motorsights.com/api/daily-plan-production/592' \
  -X 'PATCH' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "plan_date":"2025-10-31",
    "average_month_ewh":10.06,
    "average_day_ewh":24,
    "ore_target":10.06,
    "schedule_day":1,
    "ore_shipment_target":10.06,
    "sisa_stock":0,
    "ob_target":10.06,
    "quarry":312,
    "total_fleet":3
  }'
```

### Hasil
Setelah request di atas diproses:
1. Data di `r_plan_production` akan diupdate
2. Total dari semua data dalam bulan Oktober 2025 akan dihitung
3. Data di `r_parent_plan_production` untuk Oktober 2025 akan diupdate dengan total yang baru

## Catatan Penting

1. **Perhitungan Bulanan**: Proses ini menghitung total berdasarkan bulan dari `plan_date`
2. **Otomatis**: Tidak perlu request terpisah, otomatis berjalan saat CRUD operation
3. **Fallback**: Jika tidak ada parent plan production untuk bulan tersebut, akan dibuat yang baru
4. **Logging**: Semua operasi akan di-log untuk monitoring
5. **Error Handling**: Jika tidak ada data untuk diupdate, proses akan berhenti dengan aman
6. **Division by Zero Protection**: Semua perhitungan pembagian dilindungi dari pembagian oleh nol
7. **Try-Catch**: Semua operasi update parent dibungkus dengan try-catch untuk mencegah error 500

## Perbaikan Error Handling

### 1. Division by Zero Protection
Semua perhitungan pembagian sekarang dilindungi dari pembagian oleh nol:

```typescript
// Sebelum (bisa error jika ore_target = 0)
plan.sr_target = plan.ob_target / plan.ore_target;

// Sesudah (aman dari division by zero)
plan.sr_target = plan.ore_target !== 0 ? plan.ob_target / plan.ore_target : 0;
```

### 2. Try-Catch untuk Update Parent
Operasi update parent plan production dibungkus dengan try-catch:

```typescript
private async updateParentPlanProductionTotals(planDate: Date): Promise<void> {
  try {
    // ... proses update parent
  } catch (error) {
    console.error('Error updating parent plan production totals:', error);
    // Jangan throw error agar tidak mengganggu proses utama
  }
}
```

### 3. Logging yang Lebih Baik
Ditambahkan logging untuk debugging:

```typescript
console.log(`No data found for month ${year}-${month.toString().padStart(2, '0')}`);
console.log(`Updated parent plan production for ${year}-${month.toString().padStart(2, '0')}`);
console.log(`Created new parent plan production for ${year}-${month.toString().padStart(2, '0')}`);
```

## Troubleshooting

### Error 500 pada PATCH Request
Jika masih terjadi error 500, kemungkinan penyebabnya:

1. **Database Connection**: Pastikan koneksi database stabil
2. **Missing Data**: Pastikan data yang direferensikan ada di database
3. **Field Type Mismatch**: Pastikan tipe data sesuai dengan entity

### Debug Steps
1. Cek log server untuk error detail
2. Pastikan semua field required terisi
3. Cek apakah parent plan production untuk bulan tersebut ada
4. Pastikan tidak ada constraint violation di database
