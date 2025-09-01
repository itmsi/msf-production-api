# Update Field Name: populationId → population_id

## Deskripsi Perubahan

Berdasarkan permintaan user, field `populationId` di endpoint base-data-production telah diubah menjadi `population_id` untuk konsistensi dengan naming convention yang digunakan di database.

## Detail Perubahan

### 1. DTO Update
**File**: `src/modules/base-data-production/dto/create-base-data-production.dto.ts`

**Sebelum**:
```typescript
export class CreateBaseDataProductionDto {
  @ApiProperty({ description: 'ID population/unit', example: 6 })
  @IsInt()
  @IsNotEmpty()
  populationId: number;
  // ... other fields
}
```

**Sesudah**:
```typescript
export class CreateBaseDataProductionDto {
  @ApiProperty({ description: 'ID population/unit', example: 6 })
  @IsInt()
  @IsNotEmpty()
  population_id: number;
  // ... other fields
}
```

### 2. Service Update
**File**: `src/modules/base-data-production/base-data-production.service.ts`

**Method `create()`**:
```typescript
// Sebelum
populationId: createDto.populationId,

// Sesudah
populationId: createDto.population_id,
```

**Method `validateForeignKeys()`**:
```typescript
// Sebelum
const population = await this.populationRepository.findOne({ where: { id: createDto.populationId } });
throw new BadRequestException(`Unit dengan ID ${createDto.populationId} tidak ditemukan di tabel population`);

// Sesudah
const population = await this.populationRepository.findOne({ where: { id: createDto.population_id } });
throw new BadRequestException(`Unit dengan ID ${createDto.population_id} tidak ditemukan di tabel population`);
```

**Method `update()`**:
```typescript
// Sebelum
if (updateDto.populationId !== undefined) parentBaseDataPro.populationId = updateDto.populationId;

// Sesudah
if (updateDto.population_id !== undefined) parentBaseDataPro.populationId = updateDto.population_id;
```

**Response Transformation**:
```typescript
// Sebelum
populationId: createdData.populationId,

// Sesudah
population_id: createdData.populationId,
```

### 3. README Update
**File**: `src/modules/base-data-production/README.md`

**Request Body Example**:
```json
// Sebelum
{
  "populationId": 1,
  "activity_date": "2025-08-21",
  // ... other fields
}

// Sesudah
{
  "population_id": 1,
  "activity_date": "2025-08-21",
  // ... other fields
}
```

## Request Format Baru

### POST /api/base-data-production
```bash
curl -X 'POST' \
  'http://localhost:9526/api/base-data-production' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "population_id": 6,
  "activityDate": "2025-08-21",
  "shift": "DS",
  "driverId": 1,
  "startShift": "2025-08-21T08:00:00.000Z",
  "endShift": "2025-08-21T16:00:00.000Z",
  "detail": [
    {
      "kmAwal": 10,
      "kmAkhir": 25.9,
      "totalKm": 0,
      "hmAwal": 5,
      "hmAkhir": 12,
      "totalHm": 0,
      "loadingPointId": 1,
      "dumpingPointId": 1,
      "dumpingPointOpId": 1,
      "dumpingPointBargeId": 1,
      "activity": "hauling",
      "distance": 15,
      "totalVessel": 3,
      "material": "biomas"
    }
  ]
}'
```

### PATCH /api/base-data-production/:id
```bash
curl -X 'PATCH' \
  'http://localhost:9526/api/base-data-production/1' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "population_id": 7,
  "shift": "NS"
}'
```

## Response Format

### Create/Update Response
```json
{
  "statusCode": 201,
  "message": "Base data production berhasil dibuat",
  "data": {
    "id": 1,
    "population_id": 6,
    "activityDate": "2025-08-21T00:00:00.000Z",
    "shift": "ds",
    "driverId": 1,
    "startShift": "2025-08-21T08:00:00.000Z",
    "endShift": "2025-08-21T16:00:00.000Z",
    "baseDataPro": [
      // ... detail data
    ]
  }
}
```

## Catatan Penting

1. **Field Name**: `populationId` → `population_id`
2. **Database Column**: Tetap menggunakan `population_id` (tidak ada perubahan)
3. **Entity Property**: Tetap menggunakan `populationId` (tidak ada perubahan)
4. **API Request**: Sekarang menggunakan `population_id`
5. **API Response**: Sekarang menggunakan `population_id`
6. **Backward Compatibility**: Tidak ada, semua request harus menggunakan field name baru

## Endpoint yang Terpengaruh

1. **POST** `/api/base-data-production` - Create
2. **PATCH** `/api/base-data-production/:id` - Update
3. **GET** `/api/base-data-production` - List (response)
4. **GET** `/api/base-data-production/:id` - Detail (response)

## Testing

Setelah perubahan ini, pastikan untuk:
1. Update semua client yang menggunakan endpoint ini
2. Test create operation dengan field name baru
3. Test update operation dengan field name baru
4. Verifikasi response format menggunakan field name baru

