# Filter Unit Type Name pada Populations API

## Deskripsi
Filter `unit_type_name` telah ditambahkan pada endpoint `/api/populations` untuk memungkinkan filtering berdasarkan nama unit type dari tabel `m_unit_type`.

## Fitur
- **Case-insensitive**: Filter ini tidak membedakan huruf besar dan kecil
- **Exact match**: Mencari unit type dengan nama yang persis sama (setelah dikonversi ke lowercase)
- **Real-time**: Filter diterapkan langsung pada query database

## Penggunaan

### Parameter Query
```typescript
unit_type_name?: string
```

### Contoh Request
```bash
# Filter berdasarkan unit type name
curl -X 'GET' \
  'http://localhost:9526/api/populations?unit_type_name=excavator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Filter dengan parameter lainnya
curl -X 'GET' \
  'http://localhost:9526/api/populations?page=1&limit=10&status=active&unit_type_name=excavator&date_from=2024-01-01&date_to=2024-12-31&sortBy=id&sortOrder=DESC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Contoh Nilai
- `unit_type_name=excavator`
- `unit_type_name=Excavator` (akan dikonversi ke lowercase)
- `unit_type_name=EXCAVATOR` (akan dikonversi ke lowercase)

## Implementasi Teknis

### Database Query
Filter ini menggunakan fungsi `LOWER()` pada kedua sisi untuk memastikan case-insensitive matching:

```sql
LOWER(unitType.unit_name) = LOWER(:unitTypeName)
```

### Entity Relationship
Filter diterapkan pada join dengan tabel `m_unit_type`:
```typescript
.leftJoinAndSelect('population.unitType', 'unitType')
```

## Kombinasi dengan Filter Lain
Filter `unit_type_name` dapat dikombinasikan dengan semua filter yang sudah ada:
- `status`
- `unit_type_id`
- `activities_id`
- `site_id`
- `engine_brand`
- `tyre_type`
- `date_from` dan `date_to`
- `search` (pencarian global)

## Response
Response akan tetap dalam format yang sama, namun data yang dikembalikan hanya yang sesuai dengan filter `unit_type_name` yang diberikan.

## Error Handling
- Jika `unit_type_name` tidak valid, akan mengembalikan error 400
- Jika tidak ada data yang sesuai, akan mengembalikan response kosong dengan meta data yang sesuai

## Testing
Untuk testing, gunakan berbagai kombinasi case:
```bash
# Test case-insensitive
unit_type_name=excavator
unit_type_name=Excavator
unit_type_name=EXCAVATOR

# Test dengan spasi
unit_type_name="Heavy Equipment"

# Test dengan karakter khusus
unit_type_name="PC200-8"
```
