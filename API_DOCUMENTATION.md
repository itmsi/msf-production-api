# MSF Production API Documentation

## Overview
MSF Production API adalah sistem manajemen produksi dengan fitur user management yang lengkap menggunakan Role-Based Access Control (RBAC).

## Base URL
```
http://localhost:9526/api
```

## Authentication
Semua endpoint dilindungi dengan JWT Bearer Token.
```
Authorization: Bearer <your-jwt-token>
```

## Swagger Documentation
```
http://localhost:9526/api/docs
```

---

## 1. Permission Management

### Base Path: `/permissions`

#### Create Permission
```http
POST /permissions
```

**Request Body:**
```json
{
  "permission_name": "Create User",
  "permission_code": "CREATE_USER",
  "description": "Permission untuk membuat user baru",
  "createdBy": 1
}
```

**Response:**
```json
{
  "id": 1,
  "permission_name": "Create User",
  "permission_code": "CREATE_USER",
  "description": "Permission untuk membuat user baru",
  "createdAt": "2025-08-14T14:30:00.000Z",
  "createdBy": 1,
  "updatedAt": "2025-08-14T14:30:00.000Z",
  "updatedBy": null
}
```

#### Get All Permissions
```http
GET /permissions
```

#### Get Permission by ID
```http
GET /permissions/:id
```

#### Update Permission
```http
PATCH /permissions/:id
```

**Request Body:**
```json
{
  "permission_name": "Create User Updated",
  "permission_code": "CREATE_USER_UPDATED",
  "description": "Permission yang sudah diupdate",
  "updatedBy": 1
}
```

#### Delete Permission (Soft Delete)
```http
DELETE /permissions/:id
```

---

## 2. Menu Management

### Base Path: `/menus`

#### Create Menu
```http
POST /menus
```

**Request Body:**
```json
{
  "parent_id": null,
  "menu_name": "User Management",
  "menu_code": "USER_MANAGEMENT",
  "icon": "user",
  "url": "/users",
  "is_parent": true,
  "sort_order": 1,
  "status": "active",
  "permissionIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "id": 1,
  "parent_id": null,
  "menu_name": "User Management",
  "menu_code": "USER_MANAGEMENT",
  "icon": "user",
  "url": "/users",
  "is_parent": true,
  "sort_order": 1,
  "status": "active",
  "createdAt": "2025-08-14T14:30:00.000Z",
  "createdBy": 1,
  "updatedAt": "2025-08-14T14:30:00.000Z",
  "updatedBy": null,
  "children": [],
  "permissions": []
}
```

#### Get All Menus
```http
GET /menus
```

#### Get Menu Tree Structure
```http
GET /menus/tree
```

#### Get Menu by ID
```http
GET /menus/:id
```

#### Update Menu
```http
PATCH /menus/:id
```

#### Delete Menu (Soft Delete)
```http
DELETE /menus/:id
```

---

## 3. Menu Has Permission Management

### Base Path: `/menu-has-permissions`

#### Create Menu Permission
```http
POST /menu-has-permissions
```

**Request Body:**
```json
{
  "menu_id": 1,
  "permission_id": 1,
  "createdBy": 1
}
```

#### Get All Menu Permissions
```http
GET /menu-has-permissions
```

#### Get Permissions by Menu ID
```http
GET /menu-has-permissions/by-menu/:menuId
```

#### Get Menus by Permission ID
```http
GET /menu-has-permissions/by-permission/:permissionId
```

#### Get Menu Permission by ID
```http
GET /menu-has-permissions/:id
```

#### Update Menu Permission
```http
PATCH /menu-has-permissions/:id
```

#### Delete Menu Permission
```http
DELETE /menu-has-permissions/:id
```

---

## 4. Role Management

### Base Path: `/roles`

#### Create Role
```http
POST /roles
```

**Request Body:**
```json
{
  "role_code": "ADMIN",
  "position_name": "Administrator",
  "role_parent": "",
  "sites_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "role_code": "ADMIN",
  "position_name": "Administrator",
  "role_parent": "",
  "sites_id": 1,
  "createdAt": "2025-08-14T14:30:00.000Z",
  "createdBy": null,
  "updatedAt": "2025-08-14T14:30:00.000Z",
  "updatedBy": null
}
```

#### Get All Roles
```http
GET /roles
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by position name

#### Get Role by ID
```http
GET /roles/:id
```

#### Update Role
```http
PUT /roles/:id
```

#### Delete Role (Soft Delete)
```http
DELETE /roles/:id
```

---

## 5. Role Has Permission Management

### Base Path: `/role-has-permissions`

#### Create Role Permission
```http
POST /role-has-permissions
```

**Request Body:**
```json
{
  "role_id": 1,
  "mhp_id": 1,
  "permission_id": 1,
  "createdBy": 1
}
```

#### Get All Role Permissions
```http
GET /role-has-permissions
```

#### Get Permissions by Role ID
```http
GET /role-has-permissions/by-role/:roleId
```

#### Get Roles by Permission ID
```http
GET /role-has-permissions/by-permission/:permissionId
```

#### Get Role Permissions by Menu Has Permission ID
```http
GET /role-has-permissions/by-menu-has-permission/:mhpId
```

#### Get Role Permission by ID
```http
GET /role-has-permissions/:id
```

#### Update Role Permission
```http
PATCH /role-has-permissions/:id
```

#### Delete Role Permission
```http
DELETE /role-has-permissions/:id
```

---

## 6. User Role Management

### Base Path: `/user-roles`

#### Create User Role
```http
POST /user-roles
```

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 1,
  "createdBy": 1
}
```

#### Assign Role to User
```http
POST /user-roles/assign
```

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 1
}
```

#### Remove Role from User
```http
POST /user-roles/remove
```

**Request Body:**
```json
{
  "user_id": 1,
  "role_id": 1
}
```

#### Get All User Roles
```http
GET /user-roles
```

#### Get Roles by User ID
```http
GET /user-roles/by-user/:userId
```

#### Get Users by Role ID
```http
GET /user-roles/by-role/:roleId
```

#### Get User Role by ID
```http
GET /user-roles/:id
```

#### Update User Role
```http
PATCH /user-roles/:id
```

#### Delete User Role
```http
DELETE /user-roles/:id
```

---

## 7. Existing Modules

### Users Management
- **Base Path**: `/users`
- **Features**: CRUD operations for users

### Sites Management
- **Base Path**: `/sites`
- **Features**: CRUD operations for sites

### Employee Management
- **Base Path**: `/employees`
- **Features**: CRUD operations for employees

### Brand Management
- **Base Path**: `/brands`
- **Features**: CRUD operations for brands

### Unit Type Management
- **Base Path**: `/unit-types`
- **Features**: CRUD operations for unit types

### Activities Management
- **Base Path**: `/activities`
- **Features**: CRUD operations for activities

### Population Management
- **Base Path**: `/populations`
- **Features**: CRUD operations for populations

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Bad request",
  "data": {
    "error": true,
    "path": "/api/endpoint",
    "timestamp": "2025-08-14T14:30:00.000Z"
  }
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "data": {
    "error": true,
    "path": "/api/endpoint",
    "timestamp": "2025-08-14T14:30:00.000Z"
  }
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "data": {
    "error": true,
    "path": "/api/endpoint",
    "timestamp": "2025-08-14T14:30:00.000Z"
  }
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Resource already exists",
  "data": {
    "error": true,
    "path": "/api/endpoint",
    "timestamp": "2025-08-14T14:30:00.000Z"
  }
}
```

---

## Database Schema

### Master Tables (m_*)
- `m_permission`: Permissions/perizinan
- `m_menu`: Menu dengan hierarki
- `m_role`: Role/jabatan
- `m_user`: User/akun
- `m_sites`: Site/lokasi
- `m_employee`: Karyawan
- `m_brand`: Brand/merek
- `m_unit_type`: Tipe unit
- `m_activities`: Aktivitas
- `m_population`: Populasi

### Relation Tables (r_*)
- `r_menu_has_permission`: Relasi menu-permission
- `r_role_has_permission`: Relasi role-permission
- `r_user_role`: Relasi user-role

---

## Security Features

1. **JWT Authentication**: Semua endpoint dilindungi
2. **Role-Based Access Control**: Akses berdasarkan role
3. **Soft Delete**: Data tidak benar-benar dihapus
4. **Audit Trail**: Mencatat user yang membuat/mengupdate/menghapus
5. **Input Validation**: Validasi menggunakan class-validator
6. **Unique Constraints**: Mencegah duplikasi data

---

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm atau yarn

### Installation
```bash
npm install
```

### Environment Variables
```env
PORT=9526
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
JWT_SECRET=your_jwt_secret
```

### Running the Application
```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start:prod
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Seeding Data
```bash
npm run seed
```

---

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

---

## API Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP
- **File upload endpoints**: 10 requests per minute per IP

---

## Support

Untuk bantuan teknis atau pertanyaan, silakan hubungi tim development atau buat issue di repository.
