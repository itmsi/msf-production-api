# Users Module

Modul ini menangani manajemen users dalam sistem MSF Production. User adalah akun pengguna yang dapat login ke sistem dan memiliki role tertentu untuk menentukan level akses. Setiap user terkait dengan employee dan dapat memiliki multiple roles.

## Endpoints

### 1. GET /api/users

Mendapatkan semua data users dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Search berdasarkan username, email, atau nama employee
- `role` (optional): Filter berdasarkan role code
- `sortBy` (optional): Field untuk sorting (id, username, email, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/users?page=1&limit=10&search=john&role=ADMIN&sortBy=username&sortOrder=ASC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get users successfully",
  "data": [
    {
      "id": 1,
      "username": "usertest",
      "email": "john@example.com",
      "isActive": true,
      "employee_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
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
        "lastName": "Doe",
        "email": "john.doe@company.com"
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

### 2. GET /api/users/:id

Mendapatkan data user berdasarkan ID.

**Path Parameters:**
- `id`: ID user (number)

**Contoh Request:**
```bash
GET /api/users/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "User found successfully",
  "data": {
    "id": 1,
    "username": "usertest",
    "email": "john@example.com",
    "isActive": true,
    "employee_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
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
      "lastName": "Doe",
      "email": "john.doe@company.com"
    }
  }
}
```

### 3. POST /api/users

Membuat user baru.

**Request Body:**
```json
{
  "username": "usertest",
  "password": "password123",
  "email": "john@example.com",
  "roleId": 1,
  "employee_id": 1
}
```

**Field Validation:**
- `username`: String, required, minLength: 3, maxLength: 50 (harus unik, hanya huruf dan angka)
- `password`: String, required, minLength: 6, maxLength: 100
- `email`: String, required, valid email format (harus unik)
- `roleId`: Number, required, minimum: 1
- `employee_id`: Number, optional, minimum: 1

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "username": "usertest",
    "email": "john@example.com",
    "isActive": true,
    "employee_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "roles": [],
    "employees": undefined
  }
}
```

### 4. PUT /api/users/:id

Mengupdate data user berdasarkan ID.

**Path Parameters:**
- `id`: ID user yang akan diupdate (number)

**Request Body:**
```json
{
  "email": "john.updated@example.com",
  "roleId": 2,
  "employee_id": 1
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "username": "usertest",
    "email": "john.updated@example.com",
    "isActive": true,
    "employee_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "roles": [],
    "employees": undefined
  }
}
```

### 5. DELETE /api/users/:id

Menghapus data user berdasarkan ID (soft delete).

**Path Parameters:**
- `id`: ID user yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/users/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "User deleted successfully",
  "data": null
}
```

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Username hanya boleh mengandung huruf dan angka, tanpa spasi atau simbol",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Username already registered",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

Semua endpoint memerlukan JWT token yang valid. Token harus dikirim dalam header Authorization:

```
Authorization: Bearer <jwt_token>
```

## Data Model

### User Entity
```typescript
{
  id: number;           // Primary key, auto increment
  username: string;     // Username unik (max 50 chars)
  password: string;     // Password yang di-hash
  email: string;        // Email unik
  isActive: boolean;    // Status aktif user
  employee_id: number;  // Foreign key ke tabel employee
  createdAt: Date;      // Timestamp pembuatan
  updatedAt: Date;      // Timestamp update terakhir
  deletedAt: Date;      // Timestamp soft delete (optional)
  employees: Employee;  // Relation ke Employee entity
  userRoles: UserRole[]; // Relation ke UserRole entity
}
```

### Role DTO
```typescript
{
  id: number;
  role_code: string;
  position_name: string;
}
```

### Employee DTO
```typescript
{
  id: number;
  firstName: string;
  lastName: string;
  email: string; // Generated from firstName + lastName
}
```

## Business Rules

1. **Unique Username**: Username harus unik dalam sistem
2. **Unique Email**: Email harus unik dalam sistem
3. **Password Hashing**: Password di-hash menggunakan bcrypt dengan salt 10
4. **Soft Delete**: Data tidak benar-benar dihapus dari database, hanya ditandai sebagai deleted
5. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
6. **Pagination**: Limit maksimal adalah 100 data per halaman
7. **Search**: Search berdasarkan username, email, atau nama employee (case-insensitive)
8. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi
9. **Role Assignment**: User dapat memiliki multiple roles melalui UserRole entity
10. **Employee Association**: User terkait dengan employee tertentu
11. **Username Format**: Username hanya boleh mengandung huruf dan angka, tanpa spasi atau simbol
12. **Password Security**: Password minimal 6 karakter
13. **Email Validation**: Email harus dalam format yang valid
14. **Role Validation**: Role ID harus valid dan ada dalam sistem
15. **Employee Validation**: Employee ID harus valid dan ada dalam sistem

## Examples

### Create User with Role

```bash
# Create user dengan role ADMIN
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "password": "admin123",
    "email": "admin@company.com",
    "roleId": 1,
    "employee_id": 1
  }'

# Create user tanpa employee_id
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "regular_user",
    "password": "user123",
    "email": "user@company.com",
    "roleId": 2
  }'
```

### Search and Filter Users

```bash
# Search users dengan keyword "john"
curl "http://localhost:3000/api/users?search=john&page=1&limit=5" \
  -H "Authorization: Bearer <jwt_token>"

# Filter users berdasarkan role ADMIN
curl "http://localhost:3000/api/users?role=ADMIN&sortBy=username&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update User

```bash
# Update email dan role
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@company.com",
    "roleId": 2
  }'
```

### Soft Delete User

```bash
# Soft delete user
curl -X DELETE http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Use Cases

### 1. **User Registration**
- Admin dapat membuat user baru untuk employee
- User otomatis mendapatkan role yang ditentukan
- Password di-hash untuk keamanan

### 2. **Role Management**
- User dapat memiliki multiple roles
- Role assignment dapat diubah sewaktu-waktu
- Role inheritance melalui UserRole entity

### 3. **Employee Association**
- User terkait dengan employee tertentu
- Memudahkan tracking user berdasarkan employee
- Data employee dapat diakses melalui user

### 4. **Access Control**
- User sebagai basis untuk sistem otorisasi
- Role menentukan permissions yang dapat diakses
- Soft delete memastikan data history tetap terjaga

### 5. **User Lifecycle**
- User dapat diaktifkan/nonaktifkan
- Password dapat di-reset
- User dapat dihapus (soft delete)

## User-Role Relationship

```
User (1) ←→ (N) UserRole (N) ←→ (1) Role
```

- Satu user dapat memiliki multiple roles
- Satu role dapat diberikan kepada multiple users
- UserRole entity sebagai junction table
- Memungkinkan flexible role assignment

## Password Security

- Password di-hash menggunakan bcrypt
- Salt rounds: 10
- Password minimal 6 karakter
- Password tidak dapat diakses setelah di-hash
- Reset password menggunakan token

## Validation Rules

### Username
- Required
- String
- Min length: 3
- Max length: 50
- Pattern: hanya huruf dan angka
- Unique dalam sistem

### Password
- Required
- String
- Min length: 6
- Max length: 100

### Email
- Required
- Valid email format
- Max length: 100
- Unique dalam sistem

### Role ID
- Required
- Number
- Min value: 1
- Harus ada dalam sistem

### Employee ID
- Optional
- Number
- Min value: 1
- Harus ada dalam sistem

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `users.controller.spec.ts`
- `users.service.spec.ts`

## Dependencies

- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - Swagger documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation
- `bcrypt` - Password hashing

## Notes

- Semua endpoint menggunakan JWT authentication
- Password di-hash secara otomatis saat create user
- Username dan email harus unik dalam sistem
- User dapat memiliki multiple roles
- Soft delete digunakan (bukan hard delete)
- Employee association bersifat optional
- Role assignment dapat diubah sewaktu-waktu
- Timestamp menggunakan format ISO 8601
- Response format konsisten untuk semua endpoint
- Error handling terstandarisasi dengan format yang sama
- Search mendukung multiple field (username, email, employee name)
- Sorting dengan validasi field untuk mencegah SQL injection
- Pagination dengan limit maksimal 100
- Filter berdasarkan role code
- User-role relationships dihapus saat user dihapus
- Employee data di-generate secara dinamis
- Username validation menggunakan regex pattern
- Password security dengan bcrypt hashing
- Email validation menggunakan built-in validator
- Role dan employee validation untuk data integrity
- Soft delete memastikan data history tetap terjaga
- Multiple role support untuk flexible access control
- Employee association untuk organizational structure
- Search functionality yang powerful dan flexible
- Sorting dengan multiple field support
- Pagination yang user-friendly
- Comprehensive error handling
- Detailed Swagger documentation
- Type-safe DTOs dengan validation
- Proper entity relationships
- Audit trail dengan timestamps
- Security best practices
- Performance optimization dengan query builder
- Data integrity dengan foreign key constraints
