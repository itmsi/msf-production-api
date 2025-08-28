# Perbaikan Validasi Filter is_dt

## Masalah yang Ditemukan
Filter `is_dt` mengembalikan error:
```
"is_dt must be a boolean value"
```

## Penyebab Masalah
1. **Parameter Query sebagai String**: Ketika mengirim `is_dt=true` melalui URL, nilai yang diterima adalah string `"true"`, bukan boolean `true`
2. **Validasi @IsBoolean()**: Dekorator ini tidak dapat memproses string dan mengharapkan tipe boolean asli
3. **Missing @Transform**: Tidak ada transformasi dari string ke boolean sebelum validasi

## Solusi yang Diterapkan
Menambahkan dekorator `@Transform` untuk mengkonversi string ke boolean:

```typescript
@Transform(({ value }) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
})
@IsBoolean()
is_dt?: boolean | null;
```

## Urutan Dekorator yang Benar
```typescript
@ApiProperty({...})           // Dokumentasi Swagger
@IsOptional()                 // Parameter opsional
@Transform({...})             // Transformasi string → boolean
@IsBoolean()                  // Validasi tipe boolean
is_dt?: boolean | null;       // Tipe data
```

## Testing yang Berhasil
```bash
# Test dengan is_dt=true
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&is_dt=true&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Response berhasil dengan data dump truck
{
  "statusCode": 200,
  "message": "Data population berhasil diambil",
  "data": [
    {
      "id": 15,
      "no_unit": "KFM-DT-006",
      "unitType": {
        "unit_name": "Dump Truck",
        "type_name": "Transport",
        "model_name": "HD465"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## Filter yang Berfungsi
- ✅ `is_dt=true` → Hanya data dengan `unit_type_name = "dump truck"`
- ✅ `is_dt=false` → Semua data kecuali `unit_type_name = "dump truck"`
- ✅ `is_dt=` (kosong) → Semua data (tidak ada filter)

## Implementasi di Service
```typescript
// Filter by is_dt (Dump Truck)
if (isDt !== null && isDt !== undefined) {
  if (isDt === true) {
    qb.andWhere('LOWER(unitType.unit_name) = LOWER(:dumpTruckName)', { 
      dumpTruckName: 'dump truck' 
    });
  } else {
    qb.andWhere('LOWER(unitType.unit_name) != LOWER(:dumpTruckName)', { 
      dumpTruckName: 'dump truck' 
    });
  }
}
```

## Kesimpulan
Filter `is_dt` sekarang berfungsi dengan benar untuk:
1. **Case-insensitive matching** menggunakan `LOWER()`
2. **String to boolean conversion** menggunakan `@Transform`
3. **Proper validation** menggunakan `@IsBoolean()`
4. **Swagger documentation** yang lengkap
