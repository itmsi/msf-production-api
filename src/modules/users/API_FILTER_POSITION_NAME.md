# Filter Position Name pada Users API

## Deskripsi
Filter `position_name` telah ditambahkan pada endpoint `/api/users` untuk memungkinkan filtering berdasarkan nama posisi/jabatan dari tabel `m_role`.

## Fitur
- **Case-insensitive**: Filter ini tidak membedakan huruf besar dan kecil
- **Exact match**: Mencari role dengan position name yang persis sama (setelah dikonversi ke lowercase)
- **Real-time**: Filter diterapkan langsung pada query database
- **Join dengan tabel role**: Filter diterapkan pada join dengan tabel `m_role` melalui relasi `userRoles`

## Penggunaan

### Parameter Query
```typescript
position_name?: string
```

### Contoh Request
```bash
# Filter berdasarkan position name
curl -X 'GET' \
  'http://localhost:9526/api/users?position_name=administrator&page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Filter dengan parameter lainnya
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&status=active&position_name=administrator&role=ADMIN&sortBy=username&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Contoh Nilai
- `position_name=administrator`
- `position_name=Administrator` (akan dikonversi ke lowercase)
- `position_name=ADMINISTRATOR` (akan dikonversi ke lowercase)

## Implementasi Teknis

### Database Query
Filter ini menggunakan fungsi `LOWER()` pada kedua sisi untuk memastikan case-insensitive matching:

```sql
LOWER(role.position_name) = LOWER(:position_name)
```

### Entity Relationship
Filter diterapkan pada join dengan tabel `m_role`:
```typescript
.leftJoinAndSelect('user.userRoles', 'userRole')
.leftJoinAndSelect('userRole.role', 'role')
```

### Struktur Tabel
- **m_user**: Tabel utama users
- **r_user_role**: Junction table untuk relasi many-to-many user-role
- **m_role**: Tabel role dengan kolom `position_name`

## Kombinasi dengan Filter Lain
Filter `position_name` dapat dikombinasikan dengan semua filter yang sudah ada:
- `page` dan `limit` (pagination)
- `search` (pencarian global)
- `role` (filter berdasarkan role code)
- `sortBy` dan `sortOrder` (sorting)

## Response
Response akan tetap dalam format yang sama, namun data yang dikembalikan hanya yang sesuai dengan filter `position_name` yang diberikan.

### Contoh Response
```json
{
  "statusCode": 200,
  "message": "Get users successfully",
  "data": [
    {
      "id": 1,
      "username": "admin_user",
      "email": "admin@example.com",
      "isActive": true,
      "roles": [
        {
          "id": 1,
          "role_code": "ADMIN",
          "position_name": "Administrator"
        }
      ],
      "employees": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
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

## Error Handling
- Jika `position_name` tidak valid, akan mengembalikan error 400
- Jika tidak ada data yang sesuai, akan mengembalikan response kosong dengan meta data yang sesuai

## Testing
Untuk testing, gunakan berbagai kombinasi case:
```bash
# Test case-insensitive
position_name=administrator
position_name=Administrator
position_name=ADMINISTRATOR

# Test dengan spasi
position_name="Super Administrator"

# Test dengan karakter khusus
position_name="Manager Level 1"
```

## Contoh Position Names yang Umum
Berdasarkan data seeder yang ada:
- `Super Administrator`
- `Administrator`
- `Manager`
- `Supervisor`
- `Operator`
- `Staff`
- `Viewer`

## Relasi dengan Role Code
Filter `position_name` berbeda dengan filter `role`:
- **role**: Filter berdasarkan `role_code` (contoh: 'ADMIN', 'MANAGER')
- **position_name**: Filter berdasarkan `position_name` (contoh: 'Administrator', 'Manager')

Kedua filter dapat digunakan bersamaan untuk hasil yang lebih spesifik.
