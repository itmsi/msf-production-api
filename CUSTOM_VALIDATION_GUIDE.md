# Custom Validation Guide

## Overview
Dokumentasi ini menjelaskan custom validators dan helper functions yang telah dibuat untuk validasi yang lebih ketat dan fleksibel.

## 🎯 **Custom Validators**

### 1. **IsNotEmptyString**
Decorator untuk memastikan string tidak kosong (tidak hanya whitespace).

### 2. **IsValidFloat**
Decorator untuk memastikan value adalah float/number yang valid.

```typescript
import { IsValidFloat } from '../../common/validators';

export class CreateSitesDto {
  @IsValidFloat()
  longitude: number;
}
```

**Validasi yang dilakukan:**
- Tidak boleh null/undefined
- Harus berupa number
- Tidak boleh NaN
- Tidak boleh Infinity/-Infinity

### 3. **IsFloatInRange(min, max)**
Decorator untuk memastikan float berada dalam range tertentu.

```typescript
import { IsFloatInRange } from '../../common/validators';

export class CreateSitesDto {
  @IsFloatInRange(-180, 180)
  longitude: number;
  
  @IsFloatInRange(-90, 90)
  latitude: number;
}
```

### 4. **IsNullableFloatInRange(min, max)**
Decorator untuk memastikan float nullable berada dalam range tertentu.

```typescript
import { IsNullableFloatInRange } from '../../common/validators';

export class OperatorPointDto {
  @IsNullableFloatInRange(-180, 180)
  longitude?: number;
  
  @IsNullableFloatInRange(-90, 90)
  latitude?: number;
}
```

```typescript
import { IsNotEmptyString } from '../../common/validators/not-empty-string.validator';

export class CreateSitesDto {
  @IsNotEmptyString()
  name: string;
  
  @IsNotEmptyString()
  location: string;
}
```

**Perbedaan dengan @IsNotEmpty():**
- `@IsNotEmpty()`: Hanya mengecek null/undefined
- `@IsNotEmptyString()`: Mengecek null/undefined + string kosong + whitespace only

**Contoh validasi:**
```typescript
// ❌ Akan gagal validasi
name: ""           // String kosong
name: "   "        // Hanya whitespace
name: null         // Null
name: undefined    // Undefined

// ✅ Akan lulus validasi
name: "Site A"     // String valid
name: "  Site B  " // String dengan whitespace di awal/akhir (akan di-trim)
```

### 2. **IsNotEmptyStringArray**
Decorator untuk memastikan array tidak kosong dan setiap item string tidak kosong.

```typescript
import { IsNotEmptyStringArray } from '../../common/validators/not-empty-string.validator';

export class CreateSitesDto {
  @IsNotEmptyStringArray()
  tags: string[];
}
```

**Contoh validasi:**
```typescript
// ❌ Akan gagal validasi
tags: []                    // Array kosong
tags: [""]                  // Array dengan string kosong
tags: ["   "]              // Array dengan whitespace only
tags: ["tag1", "", "tag3"] // Array dengan item kosong

// ✅ Akan lulus validasi
tags: ["tag1", "tag2"]     // Array valid
tags: ["  tag1  ", "tag2"] // Array dengan whitespace (akan di-trim)
```

## 🛠️ **Helper Functions**

### 1. **validateNotEmptyString**
Validasi manual untuk string tidak boleh kosong.

```typescript
import { validateNotEmptyString, ValidationResult } from '../../common/helpers/validation.helper';

const result: ValidationResult = validateNotEmptyString("   ", "name");
if (!result.isValid) {
  console.log(result.errors); // ["name tidak boleh kosong atau hanya berisi whitespace"]
}
```

### 2. **validateNotEmptyArray**
Validasi manual untuk array tidak boleh kosong.

```typescript
import { validateNotEmptyArray } from '../../common/helpers/validation.helper';

const result = validateNotEmptyArray([], "operator_point");
if (!result.isValid) {
  console.log(result.errors); // ["operator_point tidak boleh kosong"]
}
```

### 3. **validateLongitude & validateLatitude**
Validasi manual untuk koordinat.

### 4. **validateNullableLongitude & validateNullableLatitude**
Validasi manual untuk koordinat yang nullable (optional).

```typescript
import { validateNullableLongitude, validateNullableLatitude } from '../../common/helpers/validation.helper';

const longResult = validateNullableLongitude(106.8456, "longitude");
if (!longResult.isValid) {
  console.log(longResult.errors);
}

const latResult = validateNullableLatitude(null, "latitude"); // null valid untuk nullable
if (!latResult.isValid) {
  console.log(latResult.errors);
}
```

**Perbedaan dengan validateLongitude/validateLatitude:**
- `validateLongitude/validateLatitude`: Field mandatory, tidak boleh null
- `validateNullableLongitude/validateNullableLatitude`: Field nullable, boleh null/undefined

```typescript
import { validateLongitude, validateLatitude } from '../../common/helpers/validation.helper';

const longResult = validateLongitude(200, "longitude");
if (!longResult.isValid) {
  console.log(longResult.errors); // ["longitude harus berada di range -180 sampai 180"]
}

const latResult = validateLatitude(-100, "latitude");
if (!latResult.isValid) {
  console.log(latResult.errors); // ["latitude harus berada di range -90 sampai 90"]
}
```

### 4. **validateEnum**
Validasi manual untuk enum values.

```typescript
import { validateEnum } from '../../common/helpers/validation.helper';

const allowedTypes = ['dumping', 'loading'];
const result = validateEnum('invalid', allowedTypes, 'type');
if (!result.isValid) {
  console.log(result.errors); // ["type harus salah satu dari: dumping, loading"]
}
```

### 5. **validateMultipleFields**
Validasi multiple fields dan return semua error.

```typescript
import { validateMultipleFields } from '../../common/helpers/validation.helper';

const validations = [
  validateNotEmptyString(data.name, 'name'),
  validateNotEmptyString(data.location, 'location'),
  validateLongitude(data.longitude, 'longitude'),
  validateLatitude(data.latitude, 'latitude')
];

const result = validateMultipleFields(validations);
if (!result.isValid) {
  console.log(result.errors); // Semua error dari semua validasi
}
```

### 6. **validateObject**
Validasi object dengan rules yang diberikan.

```typescript
import { validateObject } from '../../common/helpers/validation.helper';

const rules = {
  name: (value) => validateNotEmptyString(value, 'name'),
  location: (value) => validateNotEmptyString(value, 'location'),
  longitude: (value) => validateLongitude(value, 'longitude'),
  latitude: (value) => validateLatitude(value, 'latitude')
};

const result = validateObject(data, rules);
if (!result.isValid) {
  console.log(result.errors); // Semua error dari semua field
}
```

## 📝 **Interface ValidationResult**

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

**Contoh penggunaan:**
```typescript
const result: ValidationResult = validateNotEmptyString("", "name");
console.log(result.isValid);  // false
console.log(result.errors);   // ["name tidak boleh kosong atau hanya berisi whitespace"]
```

## 🚀 **Contoh Implementasi di Service**

### **Validasi Tambahan di Create Method**
```typescript
async create(data: CreateSitesDto): Promise<ApiResponse<SitesResponseDto>> {
  try {
    // Validasi tambahan menggunakan helper functions
    const validationResult = this.validateSiteData(data);
    if (!validationResult.isValid) {
      throwError(`Validasi gagal: ${validationResult.errors.join(', ')}`, 400);
    }

    // Validasi business rules
    const businessValidation = await this.validateBusinessRules(data);
    if (!businessValidation.isValid) {
      throwError(`Business rule validation gagal: ${businessValidation.errors.join(', ')}`, 400);
    }

    // Lanjutkan dengan create data...
  } catch (error) {
    // Handle error...
  }
}
```

### **Validasi Business Rules**
```typescript
private async validateBusinessRules(data: CreateSitesDto | UpdateSitesDto, excludeId?: number): Promise<ValidationResult> {
  const errors: string[] = [];

  // Validasi nama site tidak boleh duplikat
  if ('name' in data && data.name !== undefined) {
    const existingSite = await this.sitesRepository.findOne({
      where: {
        name: data.name,
        ...(excludeId && { id: Not(excludeId) })
      }
    });

    if (existingSite) {
      errors.push(`Nama site '${data.name}' sudah ada`);
    }
  }

  // Validasi koordinat tidak boleh sama dengan site lain
  if ('longitude' in data && 'latitude' in data && 
      data.longitude !== undefined && data.latitude !== undefined) {
    const existingSite = await this.sitesRepository.findOne({
      where: {
        longitude: data.longitude,
        latitude: data.latitude,
        ...(excludeId && { id: Not(excludeId) })
      }
    });

    if (existingSite) {
      errors.push(`Koordinat (${data.longitude}, ${data.latitude}) sudah digunakan oleh site lain`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

## 🔧 **Cara Menambahkan Custom Validator Baru**

### **1. Buat File Validator**
```typescript
// src/common/validators/custom-validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCustomValidator(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCustomValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Logic validasi custom
          return true; // atau false
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} tidak valid`;
        },
      },
    });
  };
}
```

### **2. Export di Index File**
```typescript
// src/common/validators/index.ts
export * from './not-empty-string.validator';
export * from './custom-validator';
```

### **3. Gunakan di DTO**
```typescript
import { IsCustomValidator } from '../../common/validators';

export class CreateDto {
  @IsCustomValidator()
  field: string;
}
```

## 📋 **Best Practices**

1. **Gunakan Custom Validators untuk:**
   - Validasi yang sering digunakan
   - Validasi yang kompleks
   - Validasi yang memerlukan business logic

2. **Gunakan Helper Functions untuk:**
   - Validasi manual di service
   - Validasi yang dinamis
   - Validasi yang memerlukan database query

3. **Pesan Error yang Jelas:**
   - Gunakan bahasa Indonesia
   - Jelaskan apa yang salah
   - Berikan contoh yang benar

4. **Validasi Berlapis:**
   - DTO level: Basic validation (type, required, format)
   - Service level: Business logic validation
   - Database level: Constraint validation

## 🧪 **Testing Custom Validators**

```typescript
import { validate } from 'class-validator';
import { IsNotEmptyString } from './not-empty-string.validator';

class TestDto {
  @IsNotEmptyString()
  name: string;
}

describe('IsNotEmptyString', () => {
  it('should pass for valid string', async () => {
    const dto = new TestDto();
    dto.name = 'Valid Name';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail for empty string', async () => {
    const dto = new TestDto();
    dto.name = '';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isNotEmptyString).toBe('name tidak boleh kosong atau hanya berisi whitespace');
  });

  it('should fail for whitespace only', async () => {
    const dto = new TestDto();
    dto.name = '   ';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
  });
});
```

## 📚 **Referensi**

- [class-validator Documentation](https://github.com/typestack/class-validator)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [TypeORM Validation](https://typeorm.io/#/validation)
