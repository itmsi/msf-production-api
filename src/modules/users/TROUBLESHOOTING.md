# Troubleshooting: Data Users Tidak Tampil

## Masalah yang Ditemukan
Endpoint `/api/users` tidak mengembalikan data meskipun data tersedia di database.

## Penyebab Potensial

### 1. **Parameter Controller Tidak Lengkap**
**Masalah**: Parameter `position_name` tidak diteruskan ke service
**Solusi**: ✅ Sudah diperbaiki - menambahkan `query.position_name` pada controller

### 2. **Urutan Query Builder Salah**
**Masalah**: `orderBy`, `skip`, dan `take` dipanggil sebelum validasi
**Solusi**: ✅ Sudah diperbaiki - memindahkan `skip` dan `take` setelah validasi

### 3. **Soft Delete Filter**
**Masalah**: Tidak ada filter untuk `deletedAt IS NULL`
**Solusi**: ✅ Sudah diperbaiki - menambahkan `.where('user.deletedAt IS NULL')`

### 4. **Relasi Entity**
**Masalah**: Relasi `userRoles` dan `role` mungkin tidak ter-load dengan benar
**Solusi**: ✅ Sudah menggunakan `leftJoinAndSelect` untuk semua relasi

## Debug Steps

### Step 1: Jalankan Test Basic
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Step 2: Periksa Console Log
Setelah menjalankan request, periksa console untuk melihat:
```
Generated SQL: SELECT ... FROM m_user user LEFT JOIN ...
Query parameters: { page: 1, limit: 10, search: undefined, role: undefined, position_name: undefined, sortBy: 'id', sortOrder: undefined }
Query result: { resultCount: 0, total: 0 }
First user sample: undefined
```

### Step 3: Periksa Database
```sql
-- Periksa apakah ada data users
SELECT COUNT(*) FROM m_user;

-- Periksa soft delete
SELECT COUNT(*) FROM m_user WHERE deletedAt IS NULL;

-- Periksa relasi
SELECT u.id, u.username, u.email, u.isActive, u.deletedAt
FROM m_user u
LEFT JOIN r_user_role ur ON u.id = ur.user_id
LEFT JOIN m_role r ON ur.role_id = r.id
WHERE u.deletedAt IS NULL
LIMIT 5;
```

## Solusi yang Sudah Diterapkan

### 1. **Controller Update**
```typescript
// Sebelum
return this.usersService.findAll(
  pageNum,
  limitNum,
  query.search,
  query.role,
  query.sortBy,        // ❌ Missing position_name
  query.sortOrder,
);

// Sesudah
return this.usersService.findAll(
  pageNum,
  limitNum,
  query.search,
  query.role,
  query.position_name, // ✅ Added position_name
  query.sortBy,
  query.sortOrder,
);
```

### 2. **Service Update**
```typescript
// Sebelum
qb.orderBy('user.id', 'DESC').skip(skip).take(limit);

// Sesudah
qb.orderBy(`user.${validSortBy}`, validSortOrder)
  .skip(skip)
  .take(limit);
```

### 3. **Soft Delete Filter**
```typescript
// Sebelum
const qb = this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.employees', 'employee')
  .leftJoinAndSelect('user.userRoles', 'userRole')
  .leftJoinAndSelect('userRole.role', 'role');

// Sesudah
const qb = this.userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.employees', 'employee')
  .leftJoinAndSelect('user.userRoles', 'userRole')
  .leftJoinAndSelect('userRole.role', 'role')
  .where('user.deletedAt IS NULL'); // ✅ Added soft delete filter
```

## Testing Setelah Perbaikan

### Test 1: Basic Request
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Test 2: Dengan Position Name
```bash
curl -X 'GET' \
  'http://localhost:9526/api/users?page=1&limit=10&position_name=administrator&sortBy=id' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Expected Result
Setelah perbaikan, endpoint seharusnya mengembalikan:
- Data users yang ada di database
- Relasi dengan employee dan roles
- Pagination yang benar
- Filter position_name yang berfungsi

## Jika Masih Bermasalah

### 1. **Periksa Database Connection**
```bash
# Test database connection
npm run start:dev
# Periksa log connection
```

### 2. **Periksa Entity Registration**
```typescript
// Pastikan entity terdaftar di module
@Module({
  imports: [TypeOrmModule.forFeature([Users, UserRole])],
  // ...
})
```

### 3. **Periksa Migration**
```bash
# Jalankan migration jika belum
npm run migration:run

# Periksa status migration
npm run migration:show
```

### 4. **Periksa Seeder**
```bash
# Jalankan seeder jika belum
npm run seed
```
