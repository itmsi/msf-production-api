# Implementasi Update Remaining Stock

## Deskripsi
Implementasi ini menambahkan logika baru untuk mengupdate kolom `remaining_stock` pada API daily-plan-production dengan fitur cascade update untuk data pada tanggal setelahnya.

## Perubahan yang Dilakukan

### 1. Update Logika di Method `update()`
- Menambahkan penanganan khusus untuk field `sisa_stock` dalam payload
- Jika ada `sisa_stock` dalam payload, nilai tersebut akan digunakan langsung untuk `remaining_stock`
- Jika tidak ada `sisa_stock`, tetap menggunakan logika lama dengan rumus `old_stock_global - ore_shipment_target + ore_target`

### 2. Menambahkan Method `updateRemainingStockForFutureDates()`
- Method baru untuk mengupdate `remaining_stock` pada data tanggal setelahnya
- Menggunakan rumus: `remaining_stock = remaining_stock (data sebelumnya) - ore_shipment_target + ore_target`
- Update dilakukan secara berurutan berdasarkan tanggal (ASC)
- **Perbaikan**: Menggunakan variabel `currentRemainingStock` yang diupdate secara berurutan untuk memastikan perhitungan yang akurat
- **Perbaikan Baru**: Menggunakan QueryBuilder untuk memastikan update langsung ke database
- **Verifikasi**: Menambahkan method verifikasi untuk memastikan update benar-benar terjadi di database

### 3. Cascade Update Trigger
- Cascade update akan dipicu ketika ada perubahan pada:
  - `sisa_stock`
  - `ore_target`
  - `ore_shipment_target`

## Logika Update

### Untuk Data yang Diupdate
```typescript
if (updateDto.sisa_stock !== undefined) {
  // Gunakan nilai sisa_stock langsung
  plan.remaining_stock = updateDto.sisa_stock;
} else if (updateDto.ore_target !== undefined || updateDto.ore_shipment_target !== undefined) {
  // Gunakan rumus lama
  plan.remaining_stock = oldStockGlobal - plan.ore_shipment_target + plan.ore_target;
}
```

### Untuk Data Tanggal Setelahnya
```typescript
// Ambil data yang baru diupdate untuk mendapatkan remaining_stock awal
const updatedPlan = await this.dailyPlanProductionRepository.findOne({
  where: { plan_date: updatedPlanDate },
});

let previousRemainingStock = updatedPlan.remaining_stock || 0;

// Untuk setiap data setelah tanggal yang diupdate
for (let i = 0; i < futurePlans.length; i++) {
  const currentPlan = futurePlans[i];
  
  // Hitung remaining_stock baru sesuai rumus
  const newRemainingStock = previousRemainingStock - currentPlan.ore_shipment_target + currentPlan.ore_target;
  
  // Update remaining_stock menggunakan QueryBuilder untuk memastikan update ke database
  await this.dailyPlanProductionRepository
    .createQueryBuilder()
    .update(PlanProduction)
    .set({ remaining_stock: newRemainingStock })
    .where('id = :id', { id: currentPlan.id })
    .execute();
  
  // Update previousRemainingStock untuk iterasi berikutnya
  previousRemainingStock = newRemainingStock;
}
```

## Fitur Verifikasi

Implementasi ini juga menambahkan fitur verifikasi untuk memastikan bahwa update benar-benar terjadi di database:

### Method `verifyRemainingStockUpdates()`
- Memverifikasi bahwa `remaining_stock` benar-benar terupdate di database
- Menampilkan perbandingan antara nilai yang diharapkan dan nilai aktual
- Memberikan indikator ✅ atau ❌ untuk setiap data yang diverifikasi

### Contoh Output Verifikasi
```
Verifying remaining_stock updates in database...
Verification - Starting with remaining_stock: 300
Verification - Plan 628 (2025-10-25):
  Expected remaining_stock: 293.5
  Actual remaining_stock: 293.5
  Match: ✅
Verification - Plan 629 (2025-10-26):
  Expected remaining_stock: 286.1
  Actual remaining_stock: 286.1
  Match: ✅
Verification completed
```

## Contoh Perhitungan Cascade Update

Misalkan kita memiliki data berikut:
- Data yang diupdate (2025-10-24): `remaining_stock = 300`, `ore_shipment_target = 10.06`, `ore_target = 1.61`
- Data tanggal 2025-10-25: `ore_shipment_target = 8.5`, `ore_target = 2.0`
- Data tanggal 2025-10-26: `ore_shipment_target = 9.2`, `ore_target = 1.8`

**Proses Cascade Update:**

1. **Data 2025-10-25:**
   - `remaining_stock = 300 - 8.5 + 2.0 = 293.5`

2. **Data 2025-10-26:**
   - `remaining_stock = 293.5 - 9.2 + 1.8 = 286.1`

**Log Console:**
```
Starting cascade update with remaining_stock: 300
Updating plan 628 (2025-10-25): remaining_stock from 250 to 293.5
Updating plan 629 (2025-10-26): remaining_stock from 240 to 286.1
Successfully updated remaining_stock for 2 future plans
```
## Contoh Penggunaan

### Request PATCH
```bash
curl 'http://localhost:9526/api/daily-plan-production/627' \
  -X 'PATCH' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "plan_date": "2025-10-24",
    "average_month_ewh": 10.1,
    "average_day_ewh": 24,
    "ore_target": 1.61,
    "schedule_day": 1,
    "ore_shipment_target": 10.06,
    "sisa_stock": 300,
    "ob_target": 3.23,
    "quarry": 312,
    "total_fleet": 4
  }'
```
```

### Hasil
1. Data dengan ID 627 akan diupdate dengan `remaining_stock = 300` (nilai dari `sisa_stock`)
2. Semua data pada tanggal setelah 2025-10-24 akan diupdate secara otomatis dengan rumus cascade
3. Parent plan production akan diupdate dengan total dari semua data dalam bulan yang sama

## File yang Dimodifikasi
- `src/modules/daily-plan-production/daily-plan-production.service.ts`
  - Method `update()`: Menambahkan logika penanganan `sisa_stock`
  - Method `updateRemainingStockForFutureDates()`: Method baru untuk cascade update
  - Import: Menambahkan `MoreThan` dari TypeORM

## Testing
- Build berhasil tanpa error
- Logika cascade update sudah diimplementasikan dengan QueryBuilder untuk memastikan update ke database
- Error handling sudah ditambahkan untuk mencegah crash pada proses utama
- Fitur verifikasi ditambahkan untuk memastikan update benar-benar terjadi di database
- Logging yang detail untuk monitoring proses update
