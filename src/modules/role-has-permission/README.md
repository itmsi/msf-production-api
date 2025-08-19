# Role Has Permission Module

Modul ini menangani manajemen role has permissions dalam sistem MSF Production. Role Has Permission adalah tabel junction yang menghubungkan Roles dengan Menu Has Permission dan Permission, memungkinkan sistem untuk memberikan multiple permissions kepada satu role atau satu permission kepada multiple roles (many-to-many relationship).

## Endpoints

### 1. GET /api/role-has-permissions

Mendapatkan semua data role has permissions dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `role_id` (optional): Filter berdasarkan role ID
- `mhp_id` (optional): Filter berdasarkan menu has permission ID
- `permission_id` (optional): Filter berdasarkan permission ID
- `sortBy` (optional): Field untuk sorting (id, role_id, mhp_id, permission_id, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/role-has-permissions?page=1&limit=10&role_id=1&permission_id=2&sortBy=createdAt&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get role permissions successfully",
  "data": [
    {
      "id": 1,
      "role_id": 1,
      "mhp_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "role": {
        "id": 1,
        "name": "Admin",
        "description": "Administrator role",
        "slug": "admin"
      },
      "menuHasPermission": {
        "id": 1,
        "menu_id": 1,
        "permission_id": 1,
        "menu_name": "Dashboard",
        "permission_name": "read"
      },
      "permission": {
        "id": 1,
        "name": "read",
        "description": "Read permission",
        "slug": "read"
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

### 2. GET /api/role-has-permissions/:id

Mendapatkan data role has permission berdasarkan ID.

**Path Parameters:**
- `id`: ID role has permission (number)

**Contoh Request:**
```bash
GET /api/role-has-permissions/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get role permission successfully",
  "data": {
    "id": 1,
    "role_id": 1,
    "mhp_id": 1,
    "permission_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1,
    "role": {
      "id": 1,
      "name": "Admin",
      "description": "Administrator role",
      "slug": "admin"
    },
    "menuHasPermission": {
      "id": 1,
      "menu_id": 1,
      "permission_id": 1,
      "menu_name": "Dashboard",
      "permission_name": "read"
    },
    "permission": {
      "id": 1,
      "name": "read",
      "description": "Read permission",
      "slug": "read"
    }
  }
}
```

### 3. GET /api/role-has-permissions/by-role/:roleId

Mendapatkan semua permissions berdasarkan role ID.

**Path Parameters:**
- `roleId`: ID role yang akan dicari permissionsnya (number)

**Contoh Request:**
```bash
GET /api/role-has-permissions/by-role/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get role permissions by role ID successfully",
  "data": [
    {
      "id": 1,
      "role_id": 1,
      "mhp_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "menuHasPermission": {
        "id": 1,
        "menu_id": 1,
        "permission_id": 1,
        "menu_name": "Dashboard",
        "permission_name": "read"
      },
      "permission": {
        "id": 1,
        "name": "read",
        "description": "Read permission",
        "slug": "read"
      }
    }
  ]
}
```

### 4. GET /api/role-has-permissions/by-permission/:permissionId

Mendapatkan semua roles berdasarkan permission ID.

**Path Parameters:**
- `permissionId`: ID permission yang akan dicari rolesnya (number)

**Contoh Request:**
```bash
GET /api/role-has-permissions/by-permission/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get role permissions by permission ID successfully",
  "data": [
    {
      "id": 1,
      "role_id": 1,
      "mhp_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "role": {
        "id": 1,
        "name": "Admin",
        "description": "Administrator role",
        "slug": "admin"
      },
      "menuHasPermission": {
        "id": 1,
        "menu_id": 1,
        "permission_id": 1,
        "menu_name": "Dashboard",
        "permission_name": "read"
      }
    }
  ]
}
```

### 5. GET /api/role-has-permissions/by-menu-has-permission/:mhpId

Mendapatkan semua roles berdasarkan menu has permission ID.

**Path Parameters:**
- `mhpId`: ID menu has permission yang akan dicari rolesnya (number)

**Contoh Request:**
```bash
GET /api/role-has-permissions/by-menu-has-permission/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get role permissions by menu has permission ID successfully",
  "data": [
    {
      "id": 1,
      "role_id": 1,
      "mhp_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "role": {
        "id": 1,
        "name": "Admin",
        "description": "Administrator role",
        "slug": "admin"
      },
      "permission": {
        "id": 1,
        "name": "read",
        "description": "Read permission",
        "slug": "read"
      }
    }
  ]
}
```

### 6. POST /api/role-has-permissions

Membuat role has permission baru (memberikan permission kepada role untuk menu tertentu).

**Request Body:**
```json
{
  "role_id": 1,
  "mhp_id": 1,
  "permission_id": 1,
  "createdBy": 1
}
```

**Field Validation:**
- `role_id`: Number, required, min: 1
- `mhp_id`: Number, required, min: 1
- `permission_id`: Number, required, min: 1
- `createdBy`: Number, optional, min: 1 (auto-filled dari JWT token)

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Role permission created successfully",
  "data": {
    "id": 1,
    "role_id": 1,
    "mhp_id": 1,
    "permission_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 7. PUT /api/role-has-permissions/:id

Mengupdate data role has permission berdasarkan ID.

**Path Parameters:**
- `id`: ID role has permission yang akan diupdate (number)

**Request Body:**
```json
{
  "role_id": 1,
  "mhp_id": 2,
  "permission_id": 1,
  "updatedBy": 1
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Role permission updated successfully",
  "data": {
    "id": 1,
    "role_id": 1,
    "mhp_id": 2,
    "permission_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 8. DELETE /api/role-has-permissions/:id

Menghapus data role has permission berdasarkan ID (hard delete).

**Path Parameters:**
- `id`: ID role has permission yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/role-has-permissions/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Role permission deleted successfully",
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
  "message": "Role permission not found",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Role permission combination already exists",
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

### Role Has Permission Entity
```typescript
{
  id: number;           // Primary key, auto increment
  role_id: number;      // Foreign key ke tabel roles
  mhp_id: number;       // Foreign key ke tabel menu_has_permission
  permission_id: number; // Foreign key ke tabel permissions
  createdAt: Date;      // Timestamp pembuatan
  createdBy: number;    // ID user yang membuat record
  updatedAt: Date;      // Timestamp update terakhir
  updatedBy: number;    // ID user yang terakhir mengupdate record
  role: Role;           // Relation ke Roles entity
  menuHasPermission: MenuHasPermission; // Relation ke MenuHasPermission entity
  permission: Permission; // Relation ke Permission entity
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

### Menu Has Permission DTO
```typescript
{
  id: number;
  menu_id: number;
  permission_id: number;
  menu_name: string;
  permission_name: string;
}
```

### Permission DTO
```typescript
{
  id: number;
  name: string;
  description: string;
  slug: string;
}
```

## Business Rules

1. **Unique Combination**: Kombinasi role_id, mhp_id, dan permission_id harus unik dalam sistem
2. **Hard Delete**: Data benar-benar dihapus dari database (tidak soft delete)
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Filtering**: Filter berdasarkan role_id, mhp_id, dan permission_id (exact match)
6. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi
7. **Audit Trail**: Menyimpan informasi createdBy dan updatedBy
8. **Foreign Key Constraint**: role_id, mhp_id, dan permission_id harus merujuk ke record yang valid
9. **Three-way Relationship**: Menghubungkan Role, Menu Has Permission, dan Permission dalam satu record

## Examples

### Assign Multiple Permissions to Role

```bash
# Assign read permission for Dashboard menu to Admin role
curl -X POST http://localhost:3000/api/role-has-permissions \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"role_id": 1, "mhp_id": 1, "permission_id": 1}'

# Assign write permission for Dashboard menu to Admin role
curl -X POST http://localhost:3000/api/role-has-permissions \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"role_id": 1, "mhp_id": 1, "permission_id": 2}'
```

### Get Role's Permissions

```bash
# Get all permissions for Admin role (role_id = 1)
curl "http://localhost:3000/api/role-has-permissions/by-role/1" \
  -H "Authorization: Bearer <jwt_token>"
```

### Get Roles with Specific Permission

```bash
# Get all roles with read permission (permission_id = 1)
curl "http://localhost:3000/api/role-has-permissions/by-permission/1" \
  -H "Authorization: Bearer <jwt_token>"
```

### Get Roles for Specific Menu-Permission Combination

```bash
# Get all roles that have read permission for Dashboard menu (mhp_id = 1)
curl "http://localhost:3000/api/role-has-permissions/by-menu-has-permission/1" \
  -H "Authorization: Bearer <jwt_token>"
```

### Filter and Paginate

```bash
# Get role has permissions with pagination and filtering
curl "http://localhost:3000/api/role-has-permissions?page=1&limit=5&role_id=1&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Role Permission

```bash
# Update role has permission to use different menu has permission
curl -X PUT http://localhost:3000/api/role-has-permissions/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"mhp_id": 2, "permission_id": 1}'
```

### Remove Role Permission

```bash
# Remove specific role has permission
curl -X DELETE http://localhost:3000/api/role-has-permissions/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `role-has-permission.controller.spec.ts`
- `role-has-permission.service.spec.ts`

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
- Kombinasi role_id, mhp_id, dan permission_id harus unik
- Hard delete digunakan (bukan soft delete)
- Mendukung three-way relationship antara Role, Menu Has Permission, dan Permission
- Audit trail lengkap dengan createdBy dan updatedBy
- Validasi foreign key untuk memastikan data integrity
- Pagination, filtering, dan sorting yang powerful
- Query builder dengan left join untuk performance yang optimal
