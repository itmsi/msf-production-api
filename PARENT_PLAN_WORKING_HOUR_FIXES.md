# Perbaikan API Parent Plan Working Hour

## Overview
Dokumen ini menjelaskan perbaikan yang telah dibuat untuk mengatasi error pada endpoint POST `/api/parent-plan-working-hour` dan menambahkan validasi duplikat bulan.

## Masalah yang Diatasi

### 1. **Error Validation DTO**
**Sebelum**: Field `detail` menggunakan `ActivityDetailDto` yang memerlukan field tambahan:
```typescript
export class ActivityDetailDto {
  @IsNumber()
  activities_id: number;
  
  @IsString()        // ❌ Required
  name: string;
  
  @IsString()        // ❌ Required  
  type_data: string;
  
  @IsString()        // ❌ Required
  type_field: string;
  
  @IsNumber()
  activities_hour: number;
}
```

**Request yang salah**:
```json
{
  "detail": [
    {
      "activities_id": 6,    // ✅ Valid
      "activities_hour": 1   // ✅ Valid
    }
  ]
}
```

**Error yang terjadi**:
```
BadRequestException: Invalid input
```

### 2. **Tidak Ada Validasi Duplikat Bulan**
- User bisa membuat data untuk bulan yang sama berulang kali
- Tidak ada pengecekan apakah bulan sudah ada dalam sistem

## Solusi yang Diimplementasikan

### 1. **Perbaikan DTO - Gunakan SimpleActivityDetailDto**
```typescript
// DTO untuk detail activities yang sederhana (hanya activities_id dan activities_hour)
export class SimpleActivityDetailDto {
  @ApiProperty({ description: 'ID aktivitas', example: 1 })
  @IsNumber()
  activities_id: number;

  @ApiProperty({ description: 'Jam aktivitas', example: 2 })
  @IsNumber()
  activities_hour: number;
}

export class CreateParentPlanWorkingHourDto {
  // ... field lainnya ...
  
  @ApiProperty({
    description: 'Detail aktivitas per tanggal',
    type: [SimpleActivityDetailDto],  // ✅ Sekarang menggunakan SimpleActivityDetailDto
    required: true,
    example: [
      { activities_id: 1, activities_hour: 1 },
      { activities_id: 2, activities_hour: 1 },
      { activities_id: 3, activities_hour: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimpleActivityDetailDto)  // ✅ Sekarang menggunakan SimpleActivityDetailDto
  detail: SimpleActivityDetailDto[];     // ✅ Sekarang menggunakan SimpleActivityDetailDto
}
```

### 2. **Validasi Duplikat Bulan**
```typescript
async create(createDto: CreateParentPlanWorkingHourDto): Promise<ParentPlanWorkingHour> {
  // Validasi duplikat bulan
  const planDate = new Date(createDto.plan_date);
  const year = planDate.getFullYear();
  const month = planDate.getMonth();
  
  // Cek apakah sudah ada data untuk bulan yang sama
  const existingPlan = await this.parentPlanWorkingHourRepository.findOne({
    where: {
      plan_date: new Date(year, month, 1), // Tanggal 01 bulan tersebut
    },
  });

  if (existingPlan) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    throw new BadRequestException(
      `Data untuk bulan ${monthNames[month]} ${year} sudah ada dalam sistem. ` +
      `Silakan gunakan bulan lain atau update data yang sudah ada.`
    );
  }
  
  // ... lanjutkan dengan proses create
}
```

### 3. **Error Message yang Lebih Detail**
```typescript
} catch (error) {
  await queryRunner.rollbackTransaction();
  
  // Jika error sudah BadRequestException, throw langsung
  if (error instanceof BadRequestException) {
    throw error;
  }
  
  // Jika error lain, buat message yang lebih detail
  let errorMessage = 'Gagal membuat parent plan working hour';
  
  if (error.message) {
    if (error.message.includes('duplicate key')) {
      errorMessage = 'Data dengan informasi yang sama sudah ada dalam sistem';
    } else if (error.message.includes('violates foreign key constraint')) {
      errorMessage = 'Data referensi tidak ditemukan (activities_id tidak valid)';
    } else if (error.message.includes('invalid input syntax')) {
      errorMessage = 'Format data tidak valid';
    } else {
      errorMessage += `: ${error.message}`;
    }
  }
  
  throw new BadRequestException(errorMessage);
}
```

## Hasil Perbaikan

### 1. **Request Sekarang Valid**
```bash
curl -X 'POST' \
  'http://localhost:9526/api/parent-plan-working-hour' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
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
}'
```

### 2. **Response Sukses**
```json
{
  "statusCode": 201,
  "message": "Parent plan working hour berhasil dibuat",
  "data": {
    "id": 1,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_calendar_day": 31,
    "total_holiday_day": 8,
    "total_available_day": 23,
    "total_working_hour_month": 184,
    "total_working_day_longshift": 5,
    "total_working_hour_day": 8,
    "total_working_hour_longshift": 12,
    "total_mohh_per_month": 1000,
    "createdAt": "2025-08-28T12:00:00.000Z",
    "updatedAt": "2025-08-28T12:00:00.000Z"
  }
}
```

### 3. **Error Duplikat Bulan**
```json
{
  "statusCode": 400,
  "message": "Data untuk bulan Agustus 2025 sudah ada dalam sistem. Silakan gunakan bulan lain atau update data yang sudah ada.",
  "error": "Bad Request"
}
```

### 4. **Error Lain yang Lebih Detail**
```json
{
  "statusCode": 400,
  "message": "Data referensi tidak ditemukan (activities_id tidak valid)",
  "error": "Bad Request"
}
```

## Testing

### 1. **Test Validasi Duplikat Bulan**
```bash
# Request pertama - sukses
curl -X POST "http://localhost:9526/api/parent-plan-working-hour" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_date": "2025-08-01", ...}'

# Request kedua dengan bulan yang sama - error duplikat
curl -X POST "http://localhost:9526/api/parent-plan-working-hour" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_date": "2025-08-15", ...}'
```

### 2. **Test Format Detail yang Benar**
```bash
# ✅ Format yang benar (SimpleActivityDetailDto)
{
  "detail": [
    {"activities_id": 1, "activities_hour": 1},
    {"activities_id": 2, "activities_hour": 1}
  ]
}

# ❌ Format yang salah (ActivityDetailDto lama)
{
  "detail": [
    {"activities_id": 1, "activities_hour": 1, "name": "P5M", "type_data": "number", "type_field": "input"},
    {"activities_id": 2, "activities_hour": 1, "name": "P5M", "type_data": "number", "type_field": "input"}
  ]
}
```

## Keuntungan Perbaikan

1. **Request Lebih Sederhana**: User tidak perlu mengisi field yang tidak diperlukan
2. **Validasi Duplikat**: Mencegah data ganda untuk bulan yang sama
3. **Error Message Jelas**: User tahu persis apa yang salah
4. **Data Integrity**: Memastikan setiap bulan hanya ada satu data
5. **User Experience**: Proses create lebih mudah dan error handling lebih baik

## Catatan Penting

1. **Migration**: Jika ada data lama yang duplikat, perlu dibersihkan terlebih dahulu
2. **Testing**: Pastikan semua endpoint lain yang menggunakan `ActivityDetailDto` masih berfungsi
3. **Documentation**: Update API documentation untuk mencerminkan perubahan DTO
4. **Frontend**: Update frontend untuk menggunakan format baru yang lebih sederhana
