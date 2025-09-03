# VALIDASI KM DAN HM - BASE DATA PRODUCTION

## Ringkasan Perubahan

Menambahkan validasi untuk memastikan nilai akhir (kmAkhir, hmAkhir) tidak boleh kurang dari atau sama dengan nilai awal (kmAwal, hmAwal) pada proses create dan update di modul base-data-production.

## File yang Diubah

### 1. DTO Validation
- **File**: `src/modules/base-data-production/dto/create-base-data-production.dto.ts`
- **Perubahan**: 
  - Menambahkan custom validator `IsEndValueGreaterThanStart`
  - Menambahkan validasi pada `kmAkhir` dan `hmAkhir`

### 2. Service Validation
- **File**: `src/modules/base-data-production/base-data-production.service.ts`
- **Perubahan**:
  - Menambahkan method `validateKmAndHmValues()`
  - Menambahkan pemanggilan validasi di method `create()` dan `update()`

## Detail Implementasi

### Custom Validator di DTO
```typescript
// Custom validator untuk memastikan nilai akhir tidak kurang dari nilai awal
export function IsEndValueGreaterThanStart(validationOptions?: any) {
  return function (object: any, propertyName: string) {
    const originalValidate = function(value: any) {
      if (value === undefined || value === null) return true;
      
      const startValue = object[propertyName.replace('Akhir', 'Awal')];
      if (startValue === undefined || startValue === null) return true;
      
      if (value <= startValue) {
        return false;
      }
      return true;
    };
    
    Reflect.defineMetadata('validation:isEndValueGreaterThanStart', originalValidate, object, propertyName);
  };
}
```

### Validasi di DTO
```typescript
@ApiProperty({ description: 'Kilometer akhir', example: 25.9 })
@IsNumber()
@IsNotEmpty()
@Validate(IsEndValueGreaterThanStart, { message: 'Kilometer akhir harus lebih besar dari kilometer awal' })
kmAkhir: number;

@ApiProperty({ description: 'Hour meter akhir', example: 12 })
@IsNumber()
@IsNotEmpty()
@Validate(IsEndValueGreaterThanStart, { message: 'Hour meter akhir harus lebih besar dari hour meter awal' })
hmAkhir: number;
```

### Service Validation Method
```typescript
private validateKmAndHmValues(createDto: CreateBaseDataProductionDto): void {
  for (const detail of createDto.detail) {
    // Validate KM values
    if (detail.kmAkhir <= detail.kmAwal) {
      throw new BadRequestException(`Kilometer akhir (${detail.kmAkhir}) harus lebih besar dari kilometer awal (${detail.kmAwal})`);
    }

    // Validate HM values
    if (detail.hmAkhir <= detail.hmAwal) {
      throw new BadRequestException(`Hour meter akhir (${detail.hmAkhir}) harus lebih besar dari hour meter awal (${detail.hmAwal})`);
    }
  }
}
```

## Test Cases

### ✅ Valid Data
```json
{
  "kmAwal": 10,
  "kmAkhir": 25.9,
  "hmAwal": 5,
  "hmAkhir": 12
}
```
**Result**: Success (201 Created)

### ❌ Invalid KM Data
```json
{
  "kmAwal": 25,
  "kmAkhir": 10,
  "hmAwal": 5,
  "hmAkhir": 12
}
```
**Result**: Error (400 Bad Request) - "Kilometer akhir (10) harus lebih besar dari kilometer awal (25)"

### ❌ Invalid HM Data
```json
{
  "kmAwal": 10,
  "kmAkhir": 25.9,
  "hmAwal": 12,
  "hmAkhir": 5
}
```
**Result**: Error (400 Bad Request) - "Hour meter akhir (5) harus lebih besar dari hour meter awal (12)"

### ❌ Equal Values
```json
{
  "kmAwal": 10,
  "kmAkhir": 10,
  "hmAwal": 5,
  "hmAkhir": 12
}
```
**Result**: Error (400 Bad Request) - "Kilometer akhir (10) harus lebih besar dari kilometer awal (10)"

## Impact

1. **Create Operation**: Validasi diterapkan sebelum data disimpan ke database
2. **Update Operation**: Validasi diterapkan jika detail data diupdate
3. **Error Messages**: Pesan error yang jelas dan informatif
4. **Data Integrity**: Memastikan data KM dan HM selalu konsisten dan logis

## Validasi yang Diterapkan

- **kmAkhir > kmAwal**: Kilometer akhir harus lebih besar dari kilometer awal
- **hmAkhir > hmAwal**: Hour meter akhir harus lebih besar dari hour meter awal
- **Tidak boleh sama**: Nilai akhir tidak boleh sama dengan nilai awal
- **Multiple Details**: Validasi diterapkan untuk setiap detail dalam array

## Kompatibilitas

- ✅ **Create Base Data Production**: Validasi diterapkan
- ✅ **Update Base Data Production**: Validasi diterapkan
- ✅ **Activity Enum**: Tetap mendukung semua nilai enum termasuk 'support'
- ✅ **Backward Compatibility**: Tidak mempengaruhi data yang sudah ada
