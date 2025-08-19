# User Role Module

Modul ini menangani manajemen user roles dalam sistem MSF Production. User Role adalah tabel junction yang menghubungkan Users dengan Roles, memungkinkan sistem untuk memberikan multiple roles kepada satu user atau satu role kepada multiple users (many-to-many relationship).

## Endpoints

### 1. GET /api/user-roles

Mendapatkan semua data user roles dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `user_id` (optional): Filter berdasarkan user ID
- `role_id` (optional): Filter berdasarkan role ID
- `sortBy` (optional): Field untuk sorting (id, user_id, role_id, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/user-roles?page=1&limit=10&user_id=1&role_id=2&sortBy=createdAt&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get user roles successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "role_id": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "user": {
        "id": 1,
        "email": "john@example.com",
        "name": "John Doe",
        "status": "active"
      },
      "role": {
        "id": 2,
        "name": "Manager",
        "description": "Manager role",
        "slug": "manager"
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

### 2. GET /api/user-roles/:id

Mendapatkan data user role berdasarkan ID.

**Path Parameters:**
- `id`: ID user role (number)

**Contoh Request:**
```bash
GET /api/user-roles/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get user role successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "role_id": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1,
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "status": "active"
    },
    "role": {
      "id": 2,
      "name": "Manager",
      "description": "Manager role",
      "slug": "manager"
    }
  }
}
```

### 3. GET /api/user-roles/by-user/:userId

Mendapatkan semua roles berdasarkan user ID.

**Path Parameters:**
- `userId`: ID user yang akan dicari rolenya (number)

**Contoh Request:**
```bash
GET /api/user-roles/by-user/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get user roles by user ID successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "role_id": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "role": {
        "id": 2,
        "name": "Manager",
        "description": "Manager role",
        "slug": "manager"
      }
    }
  ]
}
```

### 4. GET /api/user-roles/by-role/:roleId

Mendapatkan semua users berdasarkan role ID.

**Path Parameters:**
- `roleId`: ID role yang akan dicari usernya (number)

**Contoh Request:**
```bash
GET /api/user-roles/by-role/2
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get user roles by role ID successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "role_id": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "user": {
        "id": 1,
        "email": "john@example.com",
        "name": "John Doe",
        "status": "active"
      }
    }
  ]
}
```

### 5. POST /api/user-roles

Membuat user role baru (memberikan role kepada user).

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 2,
  "createdBy": 1
}
```

**Field Validation:**
- `user_id`: Number, required, min: 1
- `role_id`: Number, required, min: 1
- `createdBy`: Number, optional, min: 1 (auto-filled dari JWT token)

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "User role created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "role_id": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1,
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "status": "active"
    },
    "role": {
      "id": 2,
      "name": "Manager",
      "description": "Manager role",
      "slug": "manager"
    }
  }
}
```

### 6. POST /api/user-roles/assign

Memberikan role kepada user (alternative endpoint).

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 2
}
```

**Field Validation:**
- `user_id`: Number, required, min: 1
- `role_id`: Number, required, min: 1

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "User role created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "role_id": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 7. POST /api/user-roles/remove

Mencabut role dari user.

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 2
}
```

**Field Validation:**
- `user_id`: Number, required, min: 1
- `role_id`: Number, required, min: 1

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Role removed from user successfully",
  "data": null
}
```

### 8. PUT /api/user-roles/:id

Mengupdate data user role berdasarkan ID.

**Path Parameters:**
- `id`: ID user role yang akan diupdate (number)

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 3,
  "updatedBy": 1
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "User role updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "role_id": 3,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 9. DELETE /api/user-roles/:id

Menghapus data user role berdasarkan ID (hard delete).

**Path Parameters:**
- `id`: ID user role yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/user-roles/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "User role deleted successfully",
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
  "message": "User role not found",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "User role combination already exists",
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

### User Role Entity
```typescript
{
  id: number;           // Primary key, auto increment
  user_id: number;      // Foreign key ke tabel users
  role_id: number;      // Foreign key ke tabel roles
  createdAt: Date;      // Timestamp pembuatan
  createdBy: number;    // ID user yang membuat record
  updatedAt: Date;      // Timestamp update terakhir
  updatedBy: number;    // ID user yang terakhir mengupdate record
  user: User;           // Relation ke Users entity
  role: Role;           // Relation ke Roles entity
}
```

### User DTO
```typescript
{
  id: number;
  email: string;
  name: string;
  status: string;
}
```

### Role DTO
```typescript
{
  id: number;
  name: string;
  description: string;
  slug: string;
}
```

## Business Rules

1. **Unique Combination**: Kombinasi user_id dan role_id harus unik dalam sistem
2. **Hard Delete**: Data benar-benar dihapus dari database (tidak soft delete)
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Filtering**: Filter berdasarkan user_id dan role_id (exact match)
6. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi
7. **Audit Trail**: Menyimpan informasi createdBy dan updatedBy
8. **Foreign Key Constraint**: user_id dan role_id harus merujuk ke record yang valid

## Examples

### Assign Multiple Roles to User

```bash
# Assign Manager role to user
curl -X POST http://localhost:3000/api/user-roles/assign \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "role_id": 2}'

# Assign Admin role to same user
curl -X POST http://localhost:3000/api/user-roles/assign \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "role_id": 1}'
```

### Get User's Roles

```bash
# Get all roles for user ID 1
curl "http://localhost:3000/api/user-roles/by-user/1" \
  -H "Authorization: Bearer <jwt_token>"
```

### Get Users with Specific Role

```bash
# Get all users with Manager role (role_id = 2)
curl "http://localhost:3000/api/user-roles/by-role/2" \
  -H "Authorization: Bearer <jwt_token>"
```

### Filter and Paginate

```bash
# Get user roles with pagination and filtering
curl "http://localhost:3000/api/user-roles?page=1&limit=5&user_id=1&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Remove Role from User

```bash
# Remove Manager role from user
curl -X POST http://localhost:3000/api/user-roles/remove \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "role_id": 2}'
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `user-role.controller.spec.ts`
- `user-role.service.spec.ts`

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
- Kombinasi user_id dan role_id harus unik
- Hard delete digunakan (bukan soft delete)
- Mendukung many-to-many relationship antara Users dan Roles
- Audit trail lengkap dengan createdBy dan updatedBy
- Validasi foreign key untuk memastikan data integrity
