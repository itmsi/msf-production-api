# Update Response Field working_longshift

## Deskripsi Perubahan

Berdasarkan permintaan user, response untuk endpoint detail parent plan working hour sekarang akan menyertakan field `working_longshift` dengan nilai boolean yang diambil langsung dari kolom `working_longshift` di tabel `r_plan_working_hour` (kolom bertipe boolean dengan default false).

## Detail Perubahan

### 1. Service Update
**File**: `src/modules/plan-working-hour/parent-plan-working-hour.service.ts`

**Method**: `getDetailById()` - Baris 1270
```typescript
working_longshift: planWorkingHour.working_longshift || false, // ambil langsung dari kolom working_longshift yang bertipe boolean
```

**Method**: `findAllDetail()` - Baris 1050
```typescript
working_longshift: pwh.working_longshift || false, // ambil langsung dari kolom working_longshift yang bertipe boolean
```

### 2. DTO Update
**File**: `src/modules/plan-working-hour/dto/parent-plan-working-hour.dto.ts`

**Class**: `ParentPlanWorkingHourDetailResponseDto` - Baris 580
```typescript
@ApiProperty({
  description: 'Status long shift dari kolom working_longshift (boolean: true = ada long shift, false = tidak ada long shift)',
  example: true,
})
working_longshift: boolean;
```

**Class**: `ParentPlanWorkingHourDetailResponseDto` - Baris 580
```typescript
@ApiProperty({
  description: 'Status long shift dari kolom working_longshift (boolean: true = ada long shift, false = tidak ada long shift)',
  example: true,
})
working_longshift: boolean;
```

### 3. API Documentation Update
**File**: `src/modules/plan-working-hour/parent-plan-working-hour.controller.ts`

**Endpoint**: `GET /api/parent-plan-working-hour/detail/:id` - Baris 430
```typescript
working_longshift: true,
```

## Logic Field working_longshift

Field `working_longshift` akan bernilai:
- **`true`**: Jika kolom `working_longshift` = true (ada long shift)
- **`false`**: Jika kolom `working_longshift` = false (tidak ada long shift)
- **Sumber**: Diambil langsung dari kolom `working_longshift` yang bertipe boolean di tabel `r_plan_working_hour`

## Contoh Response

### Endpoint: GET /api/parent-plan-working-hour/detail/556

**Response dengan Long Shift (true)**:
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": {
    "id": 556,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_working_hour_month": 184,
    "total_working_hour_day": 8,
    "total_working_day_longshift": 5,
    "total_working_hour_longshift": "12.00",
    "total_mohh_per_month": 1000,
    "working_longshift": true,
    "details": [
      {
        "name": "Delay",
        "group_detail": [
          {
            "activities_id": 1,
            "name": "P5M",
            "type_data": "number",
            "type_field": "input",
            "activities_hour": 1
          }
        ]
      }
    ]
  }
}
```

**Response tanpa Long Shift (false)**:
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": {
    "id": 556,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_working_hour_month": 184,
    "total_working_hour_day": 8,
    "total_working_day_longshift": 0,
    "total_working_hour_longshift": "0.00",
    "total_mohh_per_month": 1000,
    "working_longshift": false,
    "details": [
      {
        "name": "Working",
        "group_detail": [
          {
            "activities_id": 2,
            "name": "Loading Barge",
            "type_data": "number",
            "type_field": "input",
            "activities_hour": 8
          }
        ]
      }
    ]
  }
}
```

## Endpoint yang Terpengaruh

1. **`GET /api/parent-plan-working-hour/detail/:id`** - Detail by ID
2. **`GET /api/parent-plan-working-hour/detail`** - Detail dengan pagination

## Catatan

- Field `working_longshift` adalah boolean yang diambil langsung dari kolom `working_longshift`
- Kolom `working_longshift` bertipe boolean dengan default `false` di database
- Tidak ada konversi, nilai boolean langsung dari database
- Field ini konsisten di semua endpoint detail
- Dapat digunakan untuk UI logic (menampilkan/menyembunyikan elemen long shift) dan conditional logic
