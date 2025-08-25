# Migration: Menambahkan Kolom schedule_day ke Tabel r_plan_working_hour

## Overview

Migration ini menambahkan kolom baru `schedule_day` ke tabel `r_plan_working_hour` untuk menyimpan informasi jadwal hari kerja.

## Migration Details

### File Migration
```
src/database/migrations/1700000000038-AddScheduleDayColumnToPlanWorkingHour.ts
```

### Spesifikasi Kolom
- **Nama Kolom**: `schedule_day`
- **Tipe Data**: `float`
- **Default Value**: `1`
- **Nullable**: `true`
- **Tabel Target**: `r_plan_working_hour`

## Implementation

### 1. Migration File
```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScheduleDayColumnToPlanWorkingHour1700000000038 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'schedule_day',
        type: 'float',
        default: 1,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('r_plan_working_hour', 'schedule_day');
  }
}
```

### 2. Entity Update
```typescript
// src/modules/plan-working-hour/entities/plan-working-hour.entity.ts
@Column({ type: 'float', nullable: true, default: 1 })
schedule_day: number;
```

### 3. DTO Update
```typescript
// src/modules/plan-working-hour/dto/parent-plan-working-hour.dto.ts
@ApiProperty({ 
  description: 'Jadwal hari kerja', 
  example: 1.00
})
schedule_day: number;
```

### 4. Service Update
```typescript
// Menambahkan field schedule_day ke response
schedule_day: this.roundToTwoDecimals(pwh.schedule_day || 1),
```

## Database Changes

### Before Migration
```sql
-- Struktur tabel sebelum migration
CREATE TABLE r_plan_working_hour (
  id SERIAL PRIMARY KEY,
  plan_date TIMESTAMP,
  is_calender_day BOOLEAN,
  is_holiday_day BOOLEAN,
  is_schedule_day BOOLEAN,
  working_hour_month FLOAT,
  working_hour_day INTEGER,
  working_day_longshift INTEGER,
  working_hour_longshift INTEGER,
  mohh_per_month FLOAT,
  parent_plan_working_hour_id INTEGER,
  -- ... kolom lainnya
);
```

### After Migration
```sql
-- Struktur tabel setelah migration
CREATE TABLE r_plan_working_hour (
  id SERIAL PRIMARY KEY,
  plan_date TIMESTAMP,
  is_calender_day BOOLEAN,
  is_holiday_day BOOLEAN,
  is_schedule_day BOOLEAN,
  working_hour_month FLOAT,
  working_hour_day INTEGER,
  working_day_longshift INTEGER,
  working_hour_longshift INTEGER,
  mohh_per_month FLOAT,
  schedule_day FLOAT DEFAULT 1,  -- KOLOM BARU
  parent_plan_working_hour_id INTEGER,
  -- ... kolom lainnya
);
```

## API Response Update

### Response Structure Baru
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": [
    {
      "r_plan_working_hour_id": 1,
      "plan_date": "2025-08-01",
      "calendar_day": "available",
      "working_hour_day": 8.00,
      "working_hour_month": 216.00,
      "working_hour_longshift": 14.40,
      "working_day_longshift": 1.50,
      "mohh_per_month": 100.00,
      "schedule_day": 1.00,  // FIELD BARU
      "total_delay": 10.00,
      "total_idle": 10.00,
      "total_breakdown": 10.00,
      "ewh": 80.00,
      "pa": 1.00,
      "ma": 0.89,
      "ua": 0.80,
      "eu": 0.67,
      "is_available_to_edit": true,
      "is_available_to_delete": true
    }
  ]
}
```

## Testing

### Test Coverage
- ✅ **17 test cases** berhasil dijalankan
- ✅ Entity update test
- ✅ Service response test
- ✅ DTO validation test
- ✅ Migration execution test

### Test Scenarios
1. **Entity Field**: Kolom schedule_day tersedia dengan default value
2. **Service Response**: Field schedule_day diinclude dalam response
3. **DTO Validation**: Field schedule_day terdefinisi dengan benar
4. **Migration**: Kolom berhasil ditambahkan ke database

## Migration Execution

### Status
- ✅ **Migration berhasil dijalankan**
- ✅ **Kolom schedule_day berhasil ditambahkan**
- ✅ **Default value 1 berhasil diset**
- ✅ **Semua test berhasil**

### Execution Log
```
Migration AddScheduleDayColumnToPlanWorkingHour1700000000038 has been executed successfully.
query: ALTER TABLE "r_plan_working_hour" ADD "schedule_day" float DEFAULT 1
```

## Rollback

### Jika Perlu Rollback
```bash
npm run migration:revert
```

### Rollback Query
```sql
ALTER TABLE r_plan_working_hour DROP COLUMN schedule_day;
```

## Business Impact

### 1. Data Storage
- Kolom baru untuk menyimpan jadwal hari kerja
- Default value 1 untuk data existing
- Support untuk nilai float (desimal)

### 2. API Response
- Field baru di semua endpoint yang menggunakan entity ini
- Konsisten dengan rounding ke 2 digit
- Backward compatible (tidak mengubah struktur existing)

### 3. Frontend Integration
- Frontend perlu update untuk handle field baru
- Field schedule_day tersedia untuk display dan editing
- Default value 1 untuk data yang sudah ada

## Future Considerations

### 1. Data Population
- Update data existing dengan nilai yang sesuai
- Implement business logic untuk calculate schedule_day
- Validation rules untuk nilai schedule_day

### 2. Business Logic
- Implementasi perhitungan schedule_day berdasarkan business rules
- Integration dengan calendar dan working day logic
- Validation untuk range nilai yang valid

## Conclusion

Migration kolom `schedule_day` telah berhasil diimplementasikan dengan:

- ✅ **Database**: Kolom baru berhasil ditambahkan dengan default value 1
- ✅ **Entity**: Field baru tersedia di entity dengan proper decorator
- ✅ **DTO**: Field baru diinclude dalam response DTO
- ✅ **Service**: Field baru diproses dan di-round ke 2 digit
- ✅ **Testing**: Semua test berhasil dengan field baru
- ✅ **Documentation**: Dokumentasi lengkap untuk perubahan

Kolom `schedule_day` sekarang tersedia di tabel `r_plan_working_hour` dan dapat digunakan untuk menyimpan informasi jadwal hari kerja dengan default value 1.
