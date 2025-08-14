# User Management Modules

Modul-modul ini menyediakan sistem manajemen user yang lengkap dengan role-based access control (RBAC).

## Struktur Modul

### 1. Permission Module (`/permissions`)
- **Entity**: `m_permission`
- **Fitur**: CRUD untuk permission/perizinan
- **Endpoint**:
  - `POST /permissions` - Buat permission baru
  - `GET /permissions` - Ambil semua permission
  - `GET /permissions/:id` - Ambil permission by ID
  - `PATCH /permissions/:id` - Update permission
  - `DELETE /permissions/:id` - Hapus permission (soft delete)

### 2. Menu Module (`/menus`)
- **Entity**: `m_menu`
- **Fitur**: CRUD untuk menu dengan hierarki parent-child
- **Endpoint**:
  - `POST /menus` - Buat menu baru
  - `GET /menus` - Ambil semua menu
  - `GET /menus/tree` - Ambil struktur menu tree
  - `GET /menus/:id` - Ambil menu by ID
  - `PATCH /menus/:id` - Update menu
  - `DELETE /menus/:id` - Hapus menu (soft delete)

### 3. Menu Has Permission Module (`/menu-has-permissions`)
- **Entity**: `r_menu_has_permission`
- **Fitur**: Relasi many-to-many antara menu dan permission
- **Endpoint**:
  - `POST /menu-has-permissions` - Buat relasi menu-permission
  - `GET /menu-has-permissions` - Ambil semua relasi
  - `GET /menu-has-permissions/by-menu/:menuId` - Ambil permission by menu ID
  - `GET /menu-has-permissions/by-permission/:permissionId` - Ambil menu by permission ID
  - `GET /menu-has-permissions/:id` - Ambil relasi by ID
  - `PATCH /menu-has-permissions/:id` - Update relasi
  - `DELETE /menu-has-permissions/:id` - Hapus relasi

### 4. Role Module (`/roles`)
- **Entity**: `m_role`
- **Fitur**: CRUD untuk role/jabatan
- **Endpoint**:
  - `POST /roles` - Buat role baru
  - `GET /roles` - Ambil semua role
  - `GET /roles/:id` - Ambil role by ID
  - `PATCH /roles/:id` - Update role
  - `DELETE /roles/:id` - Hapus role (soft delete)

### 5. Role Has Permission Module (`/role-has-permissions`)
- **Entity**: `r_role_has_permission`
- **Fitur**: Relasi many-to-many antara role dan permission melalui menu
- **Endpoint**:
  - `POST /role-has-permissions` - Buat relasi role-permission
  - `GET /role-has-permissions` - Ambil semua relasi
  - `GET /role-has-permissions/by-role/:roleId` - Ambil permission by role ID
  - `GET /role-has-permissions/by-permission/:permissionId` - Ambil role by permission ID
  - `GET /role-has-permissions/by-menu-has-permission/:mhpId` - Ambil role permission by menu has permission ID
  - `GET /role-has-permissions/:id` - Ambil relasi by ID
  - `PATCH /role-has-permissions/:id` - Update relasi
  - `DELETE /role-has-permissions/:id` - Hapus relasi

### 6. User Role Module (`/user-roles`)
- **Entity**: `r_user_role`
- **Fitur**: Relasi many-to-many antara user dan role
- **Endpoint**:
  - `POST /user-roles` - Buat relasi user-role
  - `POST /user-roles/assign` - Assign role ke user
  - `POST /user-roles/remove` - Hapus role dari user
  - `GET /user-roles` - Ambil semua relasi
  - `GET /user-roles/by-user/:userId` - Ambil role by user ID
  - `GET /user-roles/by-role/:roleId` - Ambil user by role ID
  - `GET /user-roles/:id` - Ambil relasi by ID
  - `PATCH /user-roles/:id` - Update relasi
  - `DELETE /user-roles/:id` - Hapus relasi

## Arsitektur RBAC

```
User → UserRole → Role → RoleHasPermission → MenuHasPermission → Menu + Permission
```

1. **User** memiliki **Role** melalui **UserRole**
2. **Role** memiliki **Permission** melalui **RoleHasPermission**
3. **Permission** terkait dengan **Menu** melalui **MenuHasPermission**
4. **Menu** dapat memiliki hierarki parent-child

## Fitur Keamanan

- **JWT Authentication**: Semua endpoint dilindungi dengan JWT
- **Soft Delete**: Data tidak benar-benar dihapus, hanya ditandai sebagai deleted
- **Audit Trail**: Mencatat user yang membuat/mengupdate/menghapus data
- **Unique Constraints**: Mencegah duplikasi data yang tidak diinginkan

## Penggunaan

### 1. Buat Permission
```bash
POST /api/permissions
{
  "permission_name": "Create User",
  "permission_code": "CREATE_USER",
  "description": "Permission untuk membuat user baru"
}
```

### 2. Buat Menu
```bash
POST /api/menus
{
  "menu_name": "User Management",
  "menu_code": "USER_MANAGEMENT",
  "icon": "user",
  "url": "/users",
  "is_parent": true,
  "sort_order": 1,
  "permissionIds": [1, 2, 3]
}
```

### 3. Assign Role ke User
```bash
POST /api/user-roles/assign
{
  "user_id": 1,
  "role_id": 1
}
```

## Database Schema

Semua tabel menggunakan konvensi penamaan:
- `m_*` untuk master data
- `r_*` untuk relasi data
- Field audit: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`

## Dependencies

- **@nestjs/typeorm**: ORM untuk database
- **@nestjs/swagger**: Dokumentasi API
- **class-validator**: Validasi DTO
- **class-transformer**: Transformasi data
