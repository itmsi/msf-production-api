# Menu Module

Modul untuk mengelola menu dan permission dalam sistem.

## API Endpoints

### 1. Create Menu (POST `/api/menus`)

Membuat menu baru dengan permission yang opsional.

#### ⚠️ **PENTING: Gunakan `parent_id: null` untuk menu root, jangan gunakan `0`**

#### Request Body

```json
{
  "parent_id": null,           // null untuk menu root, atau ID menu yang valid untuk sub-menu
  "menu_name": "User Management",
  "menu_code": "USER_MANAGEMENT",
  "icon": "user",
  "url": "/users",
  "is_parent": false,
  "sort_order": 1,
  "status": "active",
  "module": "production",
  "createdBy": 1,
  "permissionIds": [1]        // Opsional: array permission ID yang valid
}
```

#### Contoh Request

**Menu Root (tanpa parent):**
```bash
curl -X 'POST' 'http://localhost:9526/api/menus' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "parent_id": null,
    "menu_name": "User Management",
    "menu_code": "USER_MANAGEMENT",
    "icon": "user",
    "url": "/users",
    "is_parent": false,
    "sort_order": 1,
    "status": "active",
    "module": "production",
    "createdBy": 1,
    "permissionIds": [1]
  }'
```

**Sub Menu (dengan parent):**
```bash
curl -X 'POST' 'http://localhost:9526/api/menus' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "parent_id": 1,
    "menu_name": "User List",
    "menu_code": "USER_LIST",
    "icon": "list",
    "url": "/users/list",
    "is_parent": false,
    "sort_order": 1,
    "status": "active",
    "module": "production",
    "createdBy": 1,
    "permissionIds": [1, 2]
  }'
```

#### Response

**Success (201):**
```json
{
  "statusCode": 201,
  "message": "Menu created successfully",
  "data": {
    "id": 70,
    "parent_id": null,
    "menu_name": "User Management",
    "menu_code": "USER_MANAGEMENT",
    "icon": "user",
    "url": "/users",
    "is_parent": false,
    "sort_order": 1,
    "status": "active",
    "module": "production",
    "createdAt": "2025-08-18T08:41:58.142Z",
    "createdBy": 1,
    "updatedAt": "2025-08-18T08:41:58.142Z",
    "updatedBy": null,
    "deletedAt": null,
    "deletedBy": null
  }
}
```

**Error (500) - Parent ID tidak valid:**
```json
{
  "statusCode": 500,
  "message": "Failed to create menu",
  "data": {
    "error": true,
    "path": "/api/menus",
    "timestamp": "2025-08-18T08:40:49.408Z"
  }
}
```

### 2. Get All Menus (GET `/api/menus`)

Mengambil daftar menu dengan pagination dan filtering.

#### Query Parameters

- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah item per halaman (default: 10)
- `search`: Kata kunci pencarian untuk menu_name atau menu_code
- `module`: Filter berdasarkan module (spare-part, production)
- `status`: Filter berdasarkan status (active, inactive)
- `is_parent`: Filter berdasarkan is_parent (true, false)
- `parent_id`: Filter berdasarkan parent_id
- `sortBy`: Field untuk sorting (default: sort_order)
- `sortOrder`: Urutan sorting (ASC, DESC, default: ASC)

#### Contoh Request

```bash
curl -X 'GET' 'http://localhost:9526/api/menus?page=1&limit=10&module=production&status=active' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3. Get Menu Tree (GET `/api/menus/tree`)

Mengambil struktur hierarki menu.

```bash
curl -X 'GET' 'http://localhost:9526/api/menus/tree' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 4. Get Menus by Module (GET `/api/menus/module/:module`)

Mengambil semua menu untuk module tertentu.

```bash
curl -X 'GET' 'http://localhost:9526/api/menus/module/production' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 5. Get Menu by ID (GET `/api/menus/:id`)

Mengambil menu berdasarkan ID.

```bash
curl -X 'GET' 'http://localhost:9526/api/menus/70' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 6. Update Menu (PUT `/api/menus/:id`)

Mengupdate menu yang sudah ada.

```bash
curl -X 'PUT' 'http://localhost:9526/api/menus/70' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "menu_name": "Updated User Management",
    "sort_order": 2
  }'
```

### 7. Delete Menu (DELETE `/api/menus/:id`)

Soft delete menu (mark sebagai deleted tapi tetap ada di database).

```bash
curl -X 'DELETE' 'http://localhost:9526/api/menus/70' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Field Descriptions

### CreateMenuDto

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `parent_id` | `number \| null` | ❌ | ID menu parent (null untuk root) | `null` |
| `menu_name` | `string` | ✅ | Nama menu | `"User Management"` |
| `menu_code` | `string` | ✅ | Kode menu (unik) | `"USER_MANAGEMENT"` |
| `icon` | `string` | ❌ | Icon menu (Material Icons) | `"user"` |
| `url` | `string` | ❌ | URL menu | `"/users"` |
| `is_parent` | `boolean` | ❌ | Apakah menu parent | `false` |
| `sort_order` | `number` | ❌ | Urutan menu | `1` |
| `status` | `enum` | ❌ | Status menu | `"active"` |
| `module` | `enum` | ❌ | Module menu | `"production"` |
| `createdBy` | `number` | ❌ | ID user yang membuat | `1` |
| `permissionIds` | `number[]` | ❌ | Array permission ID | `[1, 2]` |

### Enums

#### MenuStatus
- `active` - Menu aktif
- `inactive` - Menu tidak aktif

#### MenuModuleType
- `spare-part` - Module spare part
- `production` - Module production

## Common Issues & Solutions

### 1. Error 500: "Failed to create menu"

**Penyebab:** Biasanya terjadi karena `parent_id: 0` yang tidak valid.

**Solusi:** Gunakan `parent_id: null` untuk menu root.

```json
// ❌ SALAH
"parent_id": 0

// ✅ BENAR
"parent_id": null
```

### 2. Error 409: "Menu code already exists"

**Penyebab:** Menu code sudah ada di database.

**Solusi:** Gunakan menu code yang unik atau update menu yang sudah ada.

### 3. Error 400: Validation error

**Penyebab:** Data yang dikirim tidak sesuai dengan validasi.

**Solusi:** Periksa semua field required dan format data.

### 4. Permission tidak ter-assign

**Penyebab:** Permission ID tidak ada di database.

**Solusi:** Pastikan permission ID valid dengan mengecek tabel `m_permission`.

## Database Schema

### Tabel `m_menu`
- Primary key: `id`
- Foreign key: `parent_id` → `m_menu.id`
- Unique constraint: `menu_code`

### Tabel `r_menu_has_permission`
- Foreign key: `menu_id` → `m_menu.id`
- Foreign key: `permission_id` → `m_permission.id`
- Unique constraint: `(menu_id, permission_id)`

## Testing

Untuk testing, gunakan data yang sudah ada di database:

```bash
# Cek permission yang tersedia
psql -h localhost -U falaqmsi -d tid-project-mix -c "SELECT * FROM m_permission;"

# Cek menu yang sudah ada
psql -h localhost -U falaqmsi -d tid-project-mix -c "SELECT * FROM m_menu LIMIT 5;"
```
