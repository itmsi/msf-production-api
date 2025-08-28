# Filter is_dt pada Populations API

## Deskripsi
Filter `is_dt` telah ditambahkan pada endpoint `/api/populations` untuk memungkinkan filtering berdasarkan kategori unit type.

## Fitur Filter

### **is_dt (Dump Truck Filter)**
- **true**: Hanya menampilkan data dengan `unit_type_name = "dump truck"`
- **false**: Menampilkan semua data kecuali yang `unit_type_name = "dump truck"`
- **null/kosong**: Menampilkan semua data (tidak ada filter)

## Kategori Unit Type

### **Dump Truck**
- `dump truck`

### **Non-Dump Truck (Heavy Equipment & Lainnya)**
- `excavator`
- `bulldozer`
- `wheel loader`
- `motor grader`
- `crane`
- `shovel`
- Dan unit type lainnya

## Penggunaan

### Parameter Query
```typescript
is_dt?: boolean | null
```

### Contoh Request

#### Filter Dump Truck Saja
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&is_dt=true&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Filter Bukan Dump Truck
```bash
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&is_dt=false&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```



## Implementasi Teknis

### Database Query untuk is_dt
```sql
-- Jika is_dt = true
LOWER(unitType.unit_name) = LOWER('dump truck')

-- Jika is_dt = false
LOWER(unitType.unit_name) != LOWER('dump truck')
```



### Entity Relationship
Filter diterapkan pada join dengan tabel `m_unit_type`:
```typescript
.leftJoinAndSelect('population.unitType', 'unitType')
```

## Kombinasi dengan Filter Lain
Filter `is_dt` dan `is_he` dapat dikombinasikan dengan semua filter yang sudah ada:
- `page` dan `limit` (pagination)
- `search` (pencarian global)
- `status`
- `unit_type_id`
- `unit_type_name`
- `activities_id`
- `site_id`
- `engine_brand`
- `tyre_type`
- `date_from` dan `date_to`
- `sortBy` dan `sortOrder`

## Logika Filter

### **is_dt Filter**
```typescript
if (isDt !== null && isDt !== undefined) {
  if (isDt === true) {
    // Hanya dump truck
    qb.andWhere('LOWER(unitType.unit_name) = LOWER(:dumpTruckName)', { dumpTruckName: 'dump truck' });
  } else {
    // Semua kecuali dump truck
    qb.andWhere('LOWER(unitType.unit_name) != LOWER(:dumpTruckName)', { dumpTruckName: 'dump truck' });
  }
}
```



## Response
Response akan tetap dalam format yang sama, namun data yang dikembalikan hanya yang sesuai dengan filter `is_dt` dan `is_he` yang diberikan.

## Error Handling
- Jika `is_dt` atau `is_he` tidak valid, akan mengembalikan error 400
- Jika tidak ada data yang sesuai, akan mengembalikan response kosong dengan meta data yang sesuai

## Testing
Untuk testing, gunakan berbagai nilai:

```bash
# Test is_dt
is_dt=true    # Hanya dump truck
is_dt=false   # Semua kecuali dump truck
is_dt=        # Semua data
```

## Use Cases

### **Mining Operations**
- `is_dt=true`: Untuk melihat semua dump truck yang tersedia
- `is_dt=false`: Untuk melihat semua unit kecuali dump truck

### **Fleet Management**
- `is_dt=true`: Untuk manajemen khusus dump truck
- `is_dt=false`: Untuk manajemen unit non-dump truck

### **Reporting**
- `is_dt=true`: Untuk laporan khusus dump truck
- `is_dt=false`: Untuk laporan unit non-dump truck
