# Catatan Khusus Perhitungan Quarry

## Perbedaan Perhitungan Quarry vs Field Lain

### Field yang Dibagi dengan Jumlah Hari dalam Bulan:
- `ob_target`: `total_ob_target / total_days`
- `ore_target`: `total_ore_target / total_days`
- `ore_shipment_target`: `total_ore_shipment_target / total_days`
- `average_moth_ewh`: `total_average_month_ewh / total_days`

### Field Quarry (TIDAK Dibagi):
- `quarry`: `total_quarry_target` (diambil langsung dari body request)

## Contoh Perhitungan

### Input dari Body Request:
```json
{
  "plan_date": "2025-08-21",
  "total_quarry_target": 300000,
  "total_ob_target": 1500000,
  "total_ore_target": 750000
}
```

### Bulan Agustus 2025 (31 hari):

#### Field yang Dibagi:
- `ob_target` per hari: `1500000 / 31 = 48387.10`
- `ore_target` per hari: `750000 / 31 = 24193.55`
- `ore_shipment_target` per hari: `600000 / 31 = 19354.84`

#### Field Quarry (TIDAK Dibagi):
- `quarry` per hari: `300000` (sama untuk semua hari)
- `shift_quarry` per hari: `300000 / 2 = 150000` (sama untuk semua hari)

## Alasan Perbedaan

Field `quarry` diambil langsung dari body request tanpa dibagi jumlah hari karena:

1. **Karakteristik Operasional**: Quarry mungkin memiliki target harian yang tetap, tidak bergantung pada jumlah hari dalam bulan
2. **Kebutuhan Bisnis**: Target quarry bisa jadi sama setiap hari, berbeda dengan target OB atau ore yang bisa bervariasi
3. **Fleksibilitas**: Memberikan fleksibilitas dalam menentukan target quarry harian

## Implementasi di Kode

```typescript
// Di service generateDailyPlanProductions
const quarry = createDto.total_quarry_target; // Diambil langsung, tidak dibagi

// Untuk setiap hari dalam bulan
const planProduction: Partial<PlanProduction> = {
  // ... field lain
  quarry: quarry, // Nilai sama untuk semua hari
  shift_quarry: quarry / 2, // Nilai sama untuk semua hari
  // ... field lain
};
```

## Dampak pada Data yang Di-generate

Dengan perbedaan ini, data harian yang di-generate akan memiliki:

- **Field yang dibagi**: Nilai berbeda setiap hari (sesuai dengan target harian)
- **Field quarry**: Nilai sama setiap hari (sesuai dengan target total dari body request)

## Validasi

Pastikan field `total_quarry_target` di body request:
- Tidak kosong (required)
- Berupa angka positif
- Memiliki nilai yang masuk akal untuk target quarry harian
