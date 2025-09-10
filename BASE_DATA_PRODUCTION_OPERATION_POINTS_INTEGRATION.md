# Base Data Production - Operation Points Integration

## Perubahan yang Dilakukan

### 1. Migrasi Database
**File:** `src/database/migrations/1757000000003-AddOperationPointsForeignKeysToBaseDataPro.ts`

Menambahkan foreign key constraints untuk:
- `loading_point_id` → `m_operation_points(id)`
- `dumping_point_id` → `m_operation_points(id)`
- `dumping_point_op_id` → `m_operation_points(id)`
- `dumping_point_barge_id` → `m_barge(id)`
- `parent_base_data_pro_id` → `r_parent_base_data_pro(id)`

### 2. Entity Update
**File:** `src/modules/base-data-production/entities/base-data-pro.entity.ts`

Menambahkan relasi ManyToOne:
```typescript
@ManyToOne(() => OperationPoints, { nullable: true })
@JoinColumn({ name: 'loading_point_id' })
loadingPoint: OperationPoints;

@ManyToOne(() => OperationPoints, { nullable: true })
@JoinColumn({ name: 'dumping_point_id' })
dumpingPoint: OperationPoints;

@ManyToOne(() => OperationPoints, { nullable: true })
@JoinColumn({ name: 'dumping_point_op_id' })
dumpingPointOp: OperationPoints;

@ManyToOne(() => Barge, { nullable: true })
@JoinColumn({ name: 'dumping_point_barge_id' })
dumpingPointBarge: Barge;
```

### 3. DTO Update
**File:** `src/modules/base-data-production/dto/create-base-data-production.dto.ts`

Memperbarui dokumentasi API untuk menunjukkan referensi ke tabel yang benar:
- `loadingPointId` → references `m_operation_points`
- `dumpingPointId` → references `m_operation_points`
- `dumpingPointOpId` → references `m_operation_points`
- `dumpingPointBargeId` → references `m_barge`

### 4. Service Update
**File:** `src/modules/base-data-production/base-data-production.service.ts`

Memperbarui validasi foreign key:
- `loadingPointId` dan `dumpingPointId` sekarang divalidasi terhadap `m_operation_points`
- Pesan error yang lebih spesifik menunjukkan tabel referensi

## Struktur Data

### Tabel yang Terlibat
1. **`r_parent_base_data_pro`** - Data utama produksi
2. **`r_base_data_pro`** - Detail data produksi
3. **`m_operation_points`** - Master data operation points (loading/dumping points)
4. **`m_barge`** - Master data barge (untuk dumping point barge)
5. **`m_population`** - Master data unit/population
6. **`m_users`** - Master data driver

### Relasi
```
r_parent_base_data_pro (1) ←→ (N) r_base_data_pro
r_base_data_pro.loading_point_id → m_operation_points.id
r_base_data_pro.dumping_point_id → m_operation_points.id
r_base_data_pro.dumping_point_op_id → m_operation_points.id
r_base_data_pro.dumping_point_barge_id → m_barge.id
r_parent_base_data_pro.population_id → m_population.id
r_parent_base_data_pro.driver_id → m_users.id
```

## Curl Request yang Sudah Disesuaikan

```bash
curl 'https://dev-msf-revenues-api.motorsights.com/api/base-data-production' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "activityDate": "2025-09-10",
    "population_id": 34,
    "driverId": 15,
    "shift": "ds",
    "startShift": "2025-09-10T10:10:00+07:00",
    "endShift": "2025-09-10T11:11:00+07:00",
    "type": "DT",
    "detail": [
      {
        "hmAwal": 1,
        "hmAkhir": 2,
        "kmAwal": 1,
        "kmAkhir": 2,
        "totalVessel": 2,
        "distance": 2,
        "loadingPointId": 1,
        "dumpingPointId": 2,
        "activity": "direct",
        "material": "biomas"
      }
    ]
  }'
```

## Validasi

Sistem sekarang akan memvalidasi:
1. `loadingPointId` harus ada di tabel `m_operation_points`
2. `dumpingPointId` harus ada di tabel `m_operation_points`
3. `dumpingPointOpId` harus ada di tabel `m_operation_points`
4. `dumpingPointBargeId` harus ada di tabel `m_barge`
5. `population_id` harus ada di tabel `m_population`
6. `driverId` harus ada di tabel `m_users`

## Error Messages

Pesan error yang lebih spesifik:
- `Loading Point dengan ID {id} tidak ditemukan di tabel m_operation_points`
- `Dumping Point dengan ID {id} tidak ditemukan di tabel m_operation_points`
- `Dumping Point Operation dengan ID {id} tidak ditemukan`
- `Dumping Point Barge dengan ID {id} tidak ditemukan`
