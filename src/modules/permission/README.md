# Permission Module

Modul ini menangani manajemen permissions dalam sistem MSF Production. Permission adalah hak akses yang dapat diberikan kepada role untuk mengakses menu tertentu. Setiap permission memiliki nama, kode unik, dan deskripsi yang menjelaskan fungsinya.

## Endpoints

### 1. GET /api/permissions

Mendapatkan semua data permissions dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Search berdasarkan permission_name atau permission_code
- `sortBy` (optional): Field untuk sorting (id, permission_name, permission_code, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/permissions?page=1&limit=10&search=user&sortBy=createdAt&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get permissions successfully",
  "data": [
    {
      "id": 1,
      "permission_name": "Create User",
      "permission_code": "CREATE_USER",
      "description": "Permission untuk membuat user baru",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1
    },
    {
      "id": 2,
      "permission_name": "Read User",
      "permission_code": "READ_USER",
      "description": "Permission untuk membaca data user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

### 2. GET /api/permissions/:id

Mendapatkan data permission berdasarkan ID.

**Path Parameters:**
- `id`: ID permission (number)

**Contoh Request:**
```bash
GET /api/permissions/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get permission successfully",
  "data": {
    "id": 1,
    "permission_name": "Create User",
    "permission_code": "CREATE_USER",
    "description": "Permission untuk membuat user baru",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 3. POST /api/permissions

Membuat permission baru.

**Request Body:**
```json
{
  "permission_name": "Create User",
  "permission_code": "CREATE_USER",
  "description": "Permission untuk membuat user baru",
  "createdBy": 1
}
```

**Field Validation:**
- `permission_name`: String, required, minLength: 1, maxLength: 100
- `permission_code`: String, required, minLength: 1, maxLength: 50 (harus unik)
- `description`: String, optional, maxLength: 500
- `createdBy`: Number, optional, min: 1 (auto-filled dari JWT token)

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Permission created successfully",
  "data": {
    "id": 1,
    "permission_name": "Create User",
    "permission_code": "CREATE_USER",
    "description": "Permission untuk membuat user baru",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 4. PUT /api/permissions/:id

Mengupdate data permission berdasarkan ID.

**Path Parameters:**
- `id`: ID permission yang akan diupdate (number)

**Request Body:**
```json
{
  "permission_name": "Create User Updated",
  "permission_code": "CREATE_USER",
  "description": "Permission untuk membuat user baru (updated)",
  "updatedBy": 1
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Permission updated successfully",
  "data": {
    "id": 1,
    "permission_name": "Create User Updated",
    "permission_code": "CREATE_USER",
    "description": "Permission untuk membuat user baru (updated)",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 5. DELETE /api/permissions/:id

Menghapus data permission berdasarkan ID (soft delete).

**Path Parameters:**
- `id`: ID permission yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/permissions/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Permission deleted successfully",
  "data": null
}
```

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
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
  "message": "Permission not found",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Permission code already exists",
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

### Permission Entity
```typescript
{
  id: number;           // Primary key, auto increment
  permission_name: string; // Nama permission (max 100 chars)
  permission_code: string; // Kode permission unik (max 50 chars)
  description: string;   // Deskripsi permission (optional, max 500 chars)
  createdAt: Date;      // Timestamp pembuatan
  createdBy: number;    // ID user yang membuat permission
  updatedAt: Date;      // Timestamp update terakhir
  updatedBy: number;    // ID user yang terakhir mengupdate permission
  deletedAt: Date;      // Timestamp soft delete (optional)
  deletedBy: number;    // ID user yang menghapus permission (optional)
  roleHasPermissions: RoleHasPermission[]; // Relation ke RoleHasPermission
  menuHasPermissions: MenuHasPermission[]; // Relation ke MenuHasPermission
}
```

## Business Rules

1. **Unique Permission Code**: Kode permission harus unik dalam sistem
2. **Soft Delete**: Data tidak benar-benar dihapus dari database, hanya ditandai sebagai deleted
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Search**: Search berdasarkan permission_name atau permission_code (case-insensitive)
6. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi
7. **Audit Trail**: Menyimpan informasi createdBy dan updatedBy
8. **Many-to-Many Relationship**: Permission dapat diberikan kepada multiple roles dan menus
9. **Cascade Soft Delete**: Ketika permission dihapus, relasi di RoleHasPermission dan MenuHasPermission tetap terjaga

## Examples

### Create Multiple Permissions

```bash
# Create permission untuk user management
curl -X POST http://localhost:3000/api/permissions \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_name": "Create User",
    "permission_code": "CREATE_USER",
    "description": "Permission untuk membuat user baru"
  }'

# Create permission untuk read user
curl -X POST http://localhost:3000/api/permissions \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_name": "Read User",
    "permission_code": "READ_USER",
    "description": "Permission untuk membaca data user"
  }'
```

### Search and Filter Permissions

```bash
# Search permissions dengan keyword "user"
curl "http://localhost:3000/api/permissions?search=user&page=1&limit=5" \
  -H "Authorization: Bearer <jwt_token>"

# Get permissions dengan sorting berdasarkan nama
curl "http://localhost:3000/api/permissions?sortBy=permission_name&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Permission

```bash
# Update permission name dan description
curl -X PUT http://localhost:3000/api/permissions/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_name": "Create User Updated",
    "description": "Permission untuk membuat user baru (updated)"
  }'
```

### Soft Delete Permission

```bash
# Soft delete permission
curl -X DELETE http://localhost:3000/api/permissions/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Use Cases

### 1. **Role-Based Access Control (RBAC)**
Permission digunakan sebagai dasar untuk sistem RBAC:
- Setiap role dapat memiliki multiple permissions
- Permission menentukan akses ke menu tertentu
- User dengan role tertentu akan memiliki akses sesuai permissions yang dimiliki role tersebut

### 2. **Menu Permission Assignment**
Permission dapat diberikan kepada menu:
- Menu dapat memiliki multiple permissions
- Permission menentukan operasi apa yang dapat dilakukan pada menu
- Contoh: Menu "User Management" dapat memiliki permissions "CREATE_USER", "READ_USER", "UPDATE_USER", "DELETE_USER"

### 3. **Dynamic Permission System**
Permission dapat dibuat secara dinamis:
- Admin dapat membuat permission baru sesuai kebutuhan
- Permission dapat diupdate atau dihapus (soft delete)
- Sistem mendukung pagination dan search untuk manajemen permission yang efisien

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `permission.controller.spec.ts`
- `permission.service.spec.ts`

## Dependencies

- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - Swagger documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation

## Notes

- Semua endpoint menggunakan JWT authentication
- createdBy dan updatedBy auto-filled dari JWT token jika tidak disediakan
- Timestamp menggunakan format ISO 8601
- Response format konsisten untuk semua endpoint
- Error handling terstandarisasi dengan format yang sama
- Permission code harus unik dalam sistem
- Soft delete digunakan (bukan hard delete)
- Mendukung many-to-many relationship dengan Role dan Menu
- Audit trail lengkap dengan createdBy dan updatedBy
- Validasi input yang ketat untuk mencegah data yang tidak valid
- Pagination, search, dan sorting yang powerful
- Query builder dengan validasi untuk mencegah SQL injection
- Endpoint ini menjadi dasar untuk sistem RBAC yang lengkap
- Data yang dihasilkan akan digunakan oleh RoleHasPermission dan MenuHasPermission
- Permission dapat digunakan untuk berbagai jenis akses (CRUD operations, special actions, etc.)
- Naming convention permission_code menggunakan UPPER_CASE dengan underscore
- Deskripsi permission membantu admin memahami fungsi setiap permission
- Soft delete memastikan data history tetap terjaga untuk audit trail
