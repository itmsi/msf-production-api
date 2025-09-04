# Fuel Consumption Validation Implementation

## Overview
Implementasi validasi untuk API fuel consumption yang memastikan data yang masuk sesuai dengan logika bisnis.

## Validasi yang Ditambahkan

### 1. Validasi HM (Hour Meter)
- **Field**: `now_refueling_hm` vs `last_refueling_hm`
- **Aturan**: `now_refueling_hm` tidak boleh kurang dari atau sama dengan `last_refueling_hm`
- **Pesan Error**: "now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm"

### 2. Validasi KM (Kilometer)
- **Field**: `now_refueling_km` vs `last_refueling_km`
- **Aturan**: `now_refueling_km` tidak boleh kurang dari atau sama dengan `last_refueling_km`
- **Pesan Error**: "now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km"

### 3. Validasi Waktu Refueling
- **Field**: `end_refueling_time` vs `start_refueling_time`
- **Aturan**: `end_refueling_time` tidak boleh kurang dari atau sama dengan `start_refueling_time`
- **Pesan Error**: "end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time"

## Implementasi

### 1. DTO Validation (src/modules/fuel-consumption/dto/create-fuel-consumption.dto.ts)
```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// Custom validator for greater than comparison
function IsGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
      },
    });
  };
}

// Applied to fields:
@ValidateIf((o) => o.last_refueling_hm !== undefined && o.now_refueling_hm !== undefined)
@IsGreaterThan('last_refueling_hm', {
  message: 'now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm',
})
now_refueling_hm?: number;

@ValidateIf((o) => o.last_refueling_km !== undefined && o.now_refueling_km !== undefined)
@IsGreaterThan('last_refueling_km', {
  message: 'now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km',
})
now_refueling_km?: number;

@ValidateIf((o) => o.start_refueling_time !== undefined && o.end_refueling_time !== undefined)
@IsGreaterThan('start_refueling_time', {
  message: 'end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time',
})
end_refueling_time?: string;
```

### 2. Service Validation (src/modules/fuel-consumption/fuel-consumption.service.ts)

#### Method untuk Create
```typescript
private validateFuelConsumptionData(data: CreateFuelConsumptionDto | UpdateFuelConsumptionDto): void {
  // Validate now_refueling_hm vs last_refueling_hm
  if (data.now_refueling_hm !== undefined && data.last_refueling_hm !== undefined) {
    if (data.now_refueling_hm <= data.last_refueling_hm) {
      throwError('now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm', 400);
    }
  }

  // Validate now_refueling_km vs last_refueling_km
  if (data.now_refueling_km !== undefined && data.last_refueling_km !== undefined) {
    if (data.now_refueling_km <= data.last_refueling_km) {
      throwError('now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km', 400);
    }
  }

  // Validate end_refueling_time vs start_refueling_time
  if (data.end_refueling_time && data.start_refueling_time) {
    const startTime = new Date(data.start_refueling_time);
    const endTime = new Date(data.end_refueling_time);
    if (endTime <= startTime) {
      throwError('end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time', 400);
    }
  }
}
```

#### Method untuk Update
```typescript
private validateFuelConsumptionUpdate(id: number, updateData: UpdateFuelConsumptionDto): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const existingData = await this.fuelConsumptionRepository.findOne({
        where: { id },
      });

      if (!existingData) {
        reject(new Error('Fuel consumption not found'));
        return;
      }

      // For update, we need to compare with existing data if the field is not provided in update
      const dataToValidate = {
        last_refueling_hm: updateData.last_refueling_hm !== undefined ? updateData.last_refueling_hm : existingData.last_refueling_hm,
        now_refueling_hm: updateData.now_refueling_hm !== undefined ? updateData.now_refueling_hm : existingData.now_refueling_hm,
        last_refueling_km: updateData.last_refueling_km !== undefined ? updateData.last_refueling_km : existingData.last_refueling_km,
        now_refueling_km: updateData.now_refueling_km !== undefined ? updateData.now_refueling_km : existingData.now_refueling_km,
        start_refueling_time: updateData.start_refueling_time || existingData.start_refueling_time,
        end_refueling_time: updateData.end_refueling_time || existingData.end_refueling_time,
      };

      // Apply same validation logic
      if (dataToValidate.now_refueling_hm !== undefined && dataToValidate.last_refueling_hm !== undefined) {
        if (dataToValidate.now_refueling_hm <= dataToValidate.last_refueling_hm) {
          throwError('now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm', 400);
        }
      }

      if (dataToValidate.now_refueling_km !== undefined && dataToValidate.last_refueling_km !== undefined) {
        if (dataToValidate.now_refueling_km <= dataToValidate.last_refueling_km) {
          throwError('now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km', 400);
        }
      }

      if (dataToValidate.end_refueling_time && dataToValidate.start_refueling_time) {
        const startTime = new Date(dataToValidate.start_refueling_time);
        const endTime = new Date(dataToValidate.end_refueling_time);
        if (endTime <= startTime) {
          throwError('end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time', 400);
        }
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
```

## Testing

### Test Cases yang Sudah Diverifikasi

1. **Create dengan data valid**: ✅ Berhasil
   ```json
   {
     "last_refueling_hm": 100,
     "now_refueling_hm": 200,
     "last_refueling_km": 100,
     "now_refueling_km": 200,
     "start_refueling_time": "2025-09-04T10:10:00+07:00",
     "end_refueling_time": "2025-09-04T12:12:00+07:00"
   }
   ```

2. **Create dengan now_refueling_hm < last_refueling_hm**: ✅ Error
   ```json
   {
     "last_refueling_hm": 200,
     "now_refueling_hm": 100
   }
   ```
   Response: `{"statusCode":400,"message":"now_refueling_hm tidak boleh kurang dari atau sama dengan last_refueling_hm"}`

3. **Create dengan now_refueling_km < last_refueling_km**: ✅ Error
   ```json
   {
     "last_refueling_km": 200,
     "now_refueling_km": 100
   }
   ```
   Response: `{"statusCode":400,"message":"now_refueling_km tidak boleh kurang dari atau sama dengan last_refueling_km"}`

4. **Create dengan end_refueling_time < start_refueling_time**: ✅ Error
   ```json
   {
     "start_refueling_time": "2025-09-04T12:12:00+07:00",
     "end_refueling_time": "2025-09-04T10:10:00+07:00"
   }
   ```
   Response: `{"statusCode":400,"message":"end_refueling_time tidak boleh kurang dari atau sama dengan start_refueling_time"}`

## Cara Penggunaan

### POST /api/fuel-consumption
Validasi akan otomatis berjalan saat membuat data baru.

### PATCH /api/fuel-consumption/:id
Validasi akan otomatis berjalan saat mengupdate data, dengan mempertimbangkan data yang sudah ada jika field tidak disertakan dalam payload update.

## Catatan Penting

1. Validasi berjalan di dua level:
   - **DTO Level**: Menggunakan class-validator decorators
   - **Service Level**: Menggunakan custom validation logic

2. Untuk update, validasi mempertimbangkan data yang sudah ada di database jika field tidak disertakan dalam payload update.

3. Semua pesan error dalam bahasa Indonesia sesuai permintaan.

4. Validasi hanya berjalan jika kedua field yang dibandingkan tersedia (tidak undefined/null).
