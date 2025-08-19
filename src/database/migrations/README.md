# Database Migrations

Dokumentasi ini menjelaskan semua file migrasi database yang telah dibuat berdasarkan Entity-Relationship Diagram (ERD).

## Daftar Migrasi

### Migrasi Dasar (1700000000000 - 1700000000019)
- **1700000000000-CreateTableMSites.ts** - Tabel master sites
- **1700000000000-CreateTableTBMRole.ts** - Tabel master role
- **1700000000001-CreateTableTBMEmployee.ts** - Tabel master employee
- **1700000000003-CreateTableTBMUser.ts** - Tabel master user
- **1700000000004-CreateTableMOperationPoints.ts** - Tabel master operation points
- **1700000000005-CreateTableMBarge.ts** - Tabel master barge
- **1700000000006-CreateTableRInputBarge.ts** - Tabel relasi input barge
- **1700000000007-CreateTableRBaseDataPro.ts** - Tabel relasi base data production
- **1700000000008-CreateTableM_Brand.ts** - Tabel master brand
- **1700000000008-CreateTableMActivities.ts** - Tabel master activities
- **1700000000010-CreateTableMUnitType.ts** - Tabel master unit type
- **1700000000012-CreateTableMPopulation.ts** - Tabel master population
- **1700000000013-CreateTableRFuel.ts** - Tabel relasi fuel
- **1700000000013-CreateTableRLossTime.ts** - Tabel relasi loss time
- **1700000000014-CreateTableRPlanProduction.ts** - Tabel relasi plan production
- **1700000000015-CreateTableRPlanWorkingHour.ts** - Tabel relasi plan working hour
- **1700000000016-CreateTableTB_R_CCR_Hauling.ts** - Tabel relasi CCR hauling
- **1700000000017-CreateTableTB_R_CCR_Hauling_Problem.ts** - Tabel relasi CCR hauling problem
- **1700000000018-CreateTableTB_R_CCR_Barging.ts** - Tabel relasi CCR barging
- **1700000000019-CreateTableTB_R_CCR_Barging_Problem.ts** - Tabel relasi CCR barging problem

### Migrasi Sistem RBAC (1700000000020 - 1700000000024)
- **1700000000020-CreateTableTB_R_User_Role.ts** - Tabel junction user-role (many-to-many)
- **1700000000021-CreateTableTB_M_Permission.ts** - Tabel master permission
- **1700000000022-CreateTableTB_M_Menu.ts** - Tabel master menu dengan hierarchical structure
- **1700000000023-CreateTableTB_R_Menu_Has_Permission.ts** - Tabel junction menu-permission
- **1700000000024-CreateTableTB_R_Role_Has_Permission.ts** - Tabel junction role-menu-permission

### Migrasi Update (1700000000025 - 1700000000028)
- **1700000000025-UpdateTableTBMUserRemoveRoleId.ts** - Update tabel user: hapus kolom roleId
- **1700000000026-AddModuleColumnToMenu.ts** - Tambah kolom module ke tabel menu
- **1700000000027-AddSparePartMenus.ts** - Tambah menu spare part
- **1700000000028-UpdateTableRPlanWorkingHour.ts** - Update tabel plan working hour sesuai skema baru

### Migrasi Tambahan (1700000000026)
- **1700000000026-CreateTableTB_R_Barge_Loading.ts** - Tabel relasi barge loading

## Struktur RBAC (Role-Based Access Control)

Sistem RBAC yang diimplementasikan menggunakan struktur berikut:

```
User (m_user) ←→ Role (m_role) ←→ Permission (m_permission)
   ↕                    ↕                    ↕
   └── User_Role ──────┘                    ↕
                        └── Role_Has_Permission ─── Menu_Has_Permission
                                                              ↕
                                                        Menu (m_menu)
```

### Penjelasan Tabel RBAC:

1. **m_user** - Tabel user yang terhubung dengan employee
2. **m_role** - Tabel role yang mendefinisikan posisi/jabatan
3. **m_permission** - Tabel permission yang mendefinisikan hak akses
4. **m_menu** - Tabel menu dengan struktur hierarchical (parent-child)
5. **r_user_role** - Junction table untuk relasi many-to-many user-role
6. **r_menu_has_permission** - Junction table untuk relasi many-to-many menu-permission
7. **r_role_has_permission** - Junction table untuk relasi role-menu-permission

## Relasi Hierarchical Menu

Tabel `m_menu` menggunakan self-referencing foreign key pada kolom `parent_id` untuk membuat struktur menu hierarchical:

- Menu parent memiliki `is_parent = true` dan `parent_id = null`
- Menu child memiliki `is_parent = false` dan `parent_id` merujuk ke ID menu parent

## Constraints dan Validasi

- Semua tabel junction memiliki unique constraint untuk mencegah duplikasi
- Foreign key constraints menggunakan CASCADE untuk delete dan update
- Self-referencing foreign key pada menu menggunakan SET NULL untuk delete

## Cara Menjalankan Migrasi

```bash
# Jalankan semua migrasi
npm run migration:run

# Rollback migrasi terakhir
npm run migration:revert

# Generate migrasi baru
npm run migration:generate -- -n NamaMigrasi

# Create migrasi kosong
npm run migration:create -- -n NamaMigrasi
```

## Urutan Eksekusi

Migrasi harus dijalankan sesuai urutan timestamp untuk memastikan foreign key constraints dapat dibuat dengan benar:

1. Tabel master (m_*) harus dibuat terlebih dahulu
2. Tabel relasi (r_*) dibuat setelah tabel master
3. Tabel junction untuk RBAC dibuat setelah semua tabel master
4. Update/alter table dilakukan terakhir
