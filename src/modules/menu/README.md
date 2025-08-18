# Menu Module

Modul ini menangani manajemen menu dalam sistem.

## Fitur

- CRUD operasi untuk menu
- Hierarki menu (parent-child relationship)
- Manajemen permission untuk setiap menu
- Filtering berdasarkan module
- Tree structure untuk navigasi

## Struktur Database

### Tabel: `m_menu`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | `int` | Primary Key, Auto Increment |
| `parent_id` | `int` | ID menu parent (nullable) |
| `menu_name` | `varchar(100)` | Nama menu |
| `menu_code` | `varchar(50)` | Kode unik menu |
| `icon` | `varchar(100)` | Icon menu (nullable) |
| `url` | `varchar(255)` | URL menu (nullable) |
| `is_parent` | `boolean` | Apakah menu parent |
| `sort_order` | `int` | Urutan menu |
| `status` | `enum` | Status menu (active/inactive) |
| `module` | `enum` | Module menu (spare-part/production) |
| `createdAt` | `timestamp` | Waktu pembuatan |
| `createdBy` | `int` | ID user yang membuat |
| `updatedAt` | `timestamp` | Waktu update |
| `updatedBy` | `int` | ID user yang mengupdate |
| `deletedAt` | `timestamp` | Waktu soft delete |
| `deletedBy` | `int` | ID user yang menghapus |

### Enum Values

#### MenuStatus
- `active` - Menu aktif
- `inactive` - Menu tidak aktif

#### MenuModuleType
- `spare-part` - Menu untuk modul spare part
- `production` - Menu untuk modul production

## API Endpoints

### Menu Management
- `POST /menus` - Membuat menu baru
- `GET /menus` - Mendapatkan semua menu
- `GET /menus/:id` - Mendapatkan menu berdasarkan ID
- `PUT /menus/:id` - Update menu
- `DELETE /menus/:id` - Soft delete menu

### Menu Tree
- `GET /menus/tree` - Mendapatkan struktur tree menu
- `GET /menus/tree/module/:module` - Mendapatkan tree menu berdasarkan module

### Menu by Module
- `GET /menus/module/:module` - Mendapatkan menu berdasarkan module

## Contoh Penggunaan

### Membuat Menu Production
```json
{
  "menu_name": "Production Dashboard",
  "menu_code": "PROD_DASHBOARD",
  "icon": "dashboard",
  "url": "/production/dashboard",
  "is_parent": false,
  "sort_order": 1,
  "module": "production",
  "permissionIds": [1, 2, 3]
}
```

### Membuat Menu Spare Part
```json
{
  "menu_name": "Spare Part Inventory",
  "menu_code": "SP_INVENTORY",
  "icon": "inventory",
  "url": "/spare-part/inventory",
  "is_parent": false,
  "sort_order": 1,
  "module": "spare-part",
  "permissionIds": [4, 5, 6]
}
```

## Relasi

- **Menu** ↔ **MenuHasPermission** (One-to-Many)
- **Menu** ↔ **Menu** (Self-referencing untuk parent-child)
- **Menu** ↔ **Permission** (Many-to-Many melalui MenuHasPermission)

## Catatan

- Menu dengan `is_parent = true` tidak memiliki URL
- Menu child harus memiliki `parent_id` yang valid
- Setiap menu dapat memiliki multiple permissions
- Module digunakan untuk memisahkan menu berdasarkan konteks aplikasi
