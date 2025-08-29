# Update Struktur Database Kolom working_longshift

## Deskripsi Perubahan

Berdasarkan pengecekan database, kolom `working_longshift` di tabel `r_plan_working_hour` bertipe **boolean** dengan default `false`, bukan integer yang perlu dikonversi.

## Struktur Database yang Benar

### 1. Migration File
**File**: `src/database/migrations/1756361000000-AddWorkingLongshiftColumnToRPlanWorkingHour.ts`

```typescript
// Tambah kolom working_longshift
await queryRunner.addColumn(
  'r_plan_working_hour',
  new TableColumn({
    name: 'working_longshift',
    type: 'boolean',
    default: false,
    isNullable: false,
  }),
);
```

### 2. Entity Update
**File**: `src/modules/plan-working-hour/entities/plan-working-hour.entity.ts`

```typescript
@Column({ type: 'boolean', default: false, nullable: false })
working_longshift: boolean;
```

## Perbedaan dengan Sebelumnya

### Sebelumnya (Salah)
- Menggunakan kolom `working_hour_longshift` (integer)
- Konversi dengan `Boolean(working_hour_longshift)` 
- Logic: `0 = false`, `1 = true`

### Sekarang (Benar)
- Menggunakan kolom `working_longshift` (boolean)
- Langsung ambil nilai: `working_longshift || false`
- Logic: `true = true`, `false = false`

## Service Implementation

### Method getDetailById()
```typescript
working_longshift: planWorkingHour.working_longshift || false, // ambil langsung dari kolom working_longshift yang bertipe boolean
```

### Method findAllDetail()
```typescript
working_longshift: pwh.working_longshift || false, // ambil langsung dari kolom working_longshift yang bertipe boolean
```

## DTO Update

### ParentPlanWorkingHourDetailResponseDto
```typescript
@ApiProperty({
  description: 'Status long shift dari kolom working_longshift (boolean: true = ada long shift, false = tidak ada long shift)',
  example: true,
})
working_longshift: boolean;
```

## Response Format

### Response dengan Long Shift
```json
{
  "working_longshift": true
}
```

### Response tanpa Long Shift
```json
{
  "working_longshift": false
}
```

## Keuntungan Perubahan

1. **Tipe Data Konsisten**: Boolean di database = Boolean di response
2. **Tidak Ada Konversi**: Nilai langsung dari database
3. **Performance Lebih Baik**: Tidak perlu operasi konversi
4. **Maintenance Lebih Mudah**: Logic lebih sederhana dan jelas
5. **Default Value**: Database otomatis set `false` jika tidak ada nilai

## Catatan

- Kolom `working_longshift` sudah ada di database dengan tipe boolean
- Default value adalah `false` (tidak ada long shift)
- Tidak ada perubahan struktur database, hanya menggunakan kolom yang sudah ada
- Response tetap boolean sesuai dengan tipe data di database
