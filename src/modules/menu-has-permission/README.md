# Menu Has Permission Module

Modul ini menangani manajemen menu has permissions dalam sistem MSF Production. Menu Has Permission adalah tabel junction yang menghubungkan Menu dengan Permission, memungkinkan sistem untuk memberikan multiple permissions kepada satu menu atau satu permission kepada multiple menus (many-to-many relationship).

## Endpoints

### 1. GET /api/menu-has-permissions

Mendapatkan semua data menu has permissions dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `menu_id` (optional): Filter berdasarkan menu ID
- `permission_id` (optional): Filter berdasarkan permission ID
- `sortBy` (optional): Field untuk sorting (id, menu_id, permission_id, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/menu-has-permissions?page=1&limit=10&menu_id=1&permission_id=2&sortBy=createdAt&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get menu permissions successfully",
  "data": [
    {
      "id": 1,
      "menu_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "menu": {
        "id": 1,
        "name": "Dashboard",
        "slug": "dashboard",
        "url": "/dashboard",
        "icon": "fas fa-dashboard",
        "sort_order": 1,
        "module": "dashboard"
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

### 2. GET /api/menu-has-permissions/:id

Mendapatkan data menu has permission berdasarkan ID.

**Path Parameters:**
- `id`: ID menu has permission (number)

**Contoh Request:**
```bash
GET /api/menu-has-permissions/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get menu permission successfully",
  "data": {
    "id": 1,
    "menu_id": 1,
    "permission_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1,
    "menu": {
      "id": 1,
      "name": "Dashboard",
      "slug": "dashboard",
      "url": "/dashboard",
      "icon": "fas fa-dashboard",
      "sort_order": 1,
      "module": "dashboard"
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

### 3. GET /api/menu-has-permissions/by-menu/:menuId

Mendapatkan semua permissions berdasarkan menu ID.

**Path Parameters:**
- `menuId`: ID menu yang akan dicari permissionsnya (number)

**Contoh Request:**
```bash
GET /api/menu-has-permissions/by-menu/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get menu permissions by menu ID successfully",
  "data": [
    {
      "id": 1,
      "menu_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
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

### 4. GET /api/menu-has-permissions/by-permission/:permissionId

Mendapatkan semua menus berdasarkan permission ID.

**Path Parameters:**
- `permissionId`: ID permission yang akan dicari menusnya (number)

**Contoh Request:**
```bash
GET /api/menu-has-permissions/by-permission/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get menu permissions by permission ID successfully",
  "data": [
    {
      "id": 1,
      "menu_id": 1,
      "permission_id": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "updatedBy": 1,
      "menu": {
        "id": 1,
        "name": "Dashboard",
        "slug": "dashboard",
        "url": "/dashboard",
        "icon": "fas fa-dashboard",
        "sort_order": 1,
        "module": "dashboard"
      }
    }
  ]
}
```

### 5. POST /api/menu-has-permissions

Membuat menu has permission baru (memberikan permission kepada menu).

**Request Body:**
```json
{
  "menu_id": 1,
  "permission_id": 1,
  "createdBy": 1
}
```

**Field Validation:**
- `menu_id`: Number, required, min: 1
- `permission_id`: Number, required, min: 1
- `createdBy`: Number, optional, min: 1 (auto-filled dari JWT token)

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Menu permission created successfully",
  "data": {
    "id": 1,
    "menu_id": 1,
    "permission_id": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 6. PUT /api/menu-has-permissions/:id

Mengupdate data menu has permission berdasarkan ID.

**Path Parameters:**
- `id`: ID menu has permission yang akan diupdate (number)

**Request Body:**
```json
{
  "menu_id": 1,
  "permission_id": 2,
  "updatedBy": 1
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Menu permission updated successfully",
  "data": {
    "id": 1,
    "menu_id": 1,
    "permission_id": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": 1
  }
}
```

### 7. DELETE /api/menu-has-permissions/:id

Menghapus data menu has permission berdasarkan ID (hard delete).

**Path Parameters:**
- `id`: ID menu has permission yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/menu-has-permissions/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Menu permission deleted successfully",
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
  "message": "Menu permission not found",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Menu permission combination already exists",
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

### Menu Has Permission Entity
```typescript
{
  id: number;           // Primary key, auto increment
  menu_id: number;      // Foreign key ke tabel menus
  permission_id: number; // Foreign key ke tabel permissions
  createdAt: Date;      // Timestamp pembuatan
  createdBy: number;    // ID user yang membuat record
  updatedAt: Date;      // Timestamp update terakhir
  updatedBy: number;    // ID user yang terakhir mengupdate record
  menu: Menu;           // Relation ke Menu entity
  permission: Permission; // Relation ke Permission entity
}
```

### Menu DTO
```typescript
{
  id: number;
  name: string;
  slug: string;
  url: string;
  icon: string;
  sort_order: number;
  module: string;
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

1. **Unique Combination**: Kombinasi menu_id dan permission_id harus unik dalam sistem
2. **Hard Delete**: Data benar-benar dihapus dari database (tidak soft delete)
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Filtering**: Filter berdasarkan menu_id dan permission_id (exact match)
6. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi
7. **Audit Trail**: Menyimpan informasi createdBy dan updatedBy
8. **Foreign Key Constraint**: menu_id dan permission_id harus merujuk ke record yang valid
9. **Many-to-Many Relationship**: Menghubungkan Menu dan Permission dalam satu record

## Examples

### Assign Multiple Permissions to Menu

```bash
# Assign read permission to Dashboard menu
curl -X POST http://localhost:3000/api/menu-has-permissions \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_id": 1, "permission_id": 1}'

# Assign write permission to Dashboard menu
curl -X POST http://localhost:3000/api/menu-has-permissions \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"menu_id": 1, "permission_id": 2}'
```

### Get Menu's Permissions

```bash
# Get all permissions for Dashboard menu (menu_id = 1)
curl "http://localhost:3000/api/menu-has-permissions/by-menu/1" \
  -H "Authorization: Bearer <jwt_token>"
```

### Get Menus with Specific Permission

```bash
# Get all menus with read permission (permission_id = 1)
curl "http://localhost:3000/api/menu-has-permissions/by-permission/1" \
  -H "Authorization: Bearer <jwt_token>"
```

### Filter and Paginate

```bash
# Get menu has permissions with pagination and filtering
curl "http://localhost:3000/api/menu-has-permissions?page=1&limit=5&menu_id=1&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Menu Permission

```bash
# Update menu has permission to use different permission
curl -X PUT http://localhost:3000/api/menu-has-permissions/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"permission_id": 2}'
```

### Remove Menu Permission

```bash
# Remove specific menu has permission
curl -X DELETE http://localhost:3000/api/menu-has-permissions/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `menu-has-permission.controller.spec.ts`
- `menu-has-permission.service.spec.ts`

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
- Kombinasi menu_id dan permission_id harus unik
- Hard delete digunakan (bukan soft delete)
- Mendukung many-to-many relationship antara Menu dan Permission
- Audit trail lengkap dengan createdBy dan updatedBy
- Validasi foreign key untuk memastikan data integrity
- Pagination, filtering, dan sorting yang powerful
- Query builder dengan left join untuk performance yang optimal
- Endpoint ini menjadi dasar untuk sistem RBAC yang menghubungkan menu dengan permission
- Data yang dihasilkan akan digunakan oleh Role Has Permission untuk sistem otorisasi lengkap
