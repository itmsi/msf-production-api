# Update Department dan Employee Module

## Ringkasan Perubahan

Dokumen ini menjelaskan perubahan yang telah dibuat untuk menambahkan tabel `m_departments` dan mengupdate tabel `m_employee` sesuai dengan permintaan.

## Migrasi Database

### 1. Migrasi Tabel m_departments (1700000000054-CreateTableMDepartments.ts)

Membuat tabel baru `m_departments` dengan struktur:
- `id` (integer, auto increment, PK)
- `name` (varchar(255))
- `description` (varchar(255), nullable)
- `createdAt` (timestamp, default current_timestamp)
- `createdBy` (integer, FK to m_users.id)
- `updatedAt` (timestamp, default current_timestamp)
- `updatedBy` (integer, FK to m_users.id)
- `deletedAt` (timestamp, nullable)
- `deletedBy` (integer, FK to m_users.id)

### 2. Migrasi Update Tabel m_employee (1700000000055-UpdateTableMEmployee.ts)

Mengupdate tabel `m_employee` dengan perubahan:
- **Menambahkan kolom**: `department_id` (integer, FK to m_departments.id)
- **Menghapus kolom**: `department` (varchar(100))
- **Mengubah tipe data**: `nip` dari `int` menjadi `varchar(255)`

## Modul Department

### Entity (src/modules/department/entities/department.entity.ts)
- Entity Department dengan relasi OneToMany ke Employee
- Menggunakan decorator TypeORM untuk mapping database
- Include soft delete functionality

### DTO (src/modules/department/dto/department.dto.ts)
- `CreateDepartmentDto`: Untuk membuat department baru
- `UpdateDepartmentDto`: Untuk update department
- `DepartmentResponseDto`: Response format
- `GetDepartmentsQueryDto`: Query parameters untuk pagination dan search

### Service (src/modules/department/department.service.ts)
- CRUD operations lengkap
- Validasi unique name
- Pagination dan search functionality
- Soft delete support

### Controller (src/modules/department/department.controller.ts)
- REST API endpoints dengan JWT authentication
- Swagger documentation
- Error handling

### Module (src/modules/department/department.module.ts)
- TypeORM integration
- Export service untuk digunakan di module lain

## Update Modul Employee

### Entity (src/modules/employee/entities/employee.entity.ts)
- **Perubahan**: 
  - `department` (string) → `departmentId` (number, nullable)
  - `nip` (number) → `nip` (string)
  - Menambahkan relasi ManyToOne ke Department
- **Relasi**: `@ManyToOne(() => Department, (department) => department.employees)`

### DTO (src/modules/employee/dto/employee.dto.ts)
- **Perubahan**:
  - `department` → `departmentId` (number)
  - `nip` dari number → string
  - Menambahkan `departmentName` di response
- **Validasi**: Update validation rules sesuai tipe data baru

### Service (src/modules/employee/employee.service.ts)
- **Perubahan**:
  - Inject Department repository
  - Validasi department existence saat create/update
  - Update query builder untuk join dengan department
  - Update response mapping untuk include department name
  - Update method signatures (nip: string, departmentId: number)

### Module (src/modules/employee/employee.module.ts)
- **Perubahan**: Import Department entity untuk TypeORM

## Update App Module

### src/app.module.ts
- Menambahkan `DepartmentModule` ke imports

## API Endpoints

### Department Endpoints
- `POST /departments` - Create department
- `GET /departments` - Get all departments (with pagination & search)
- `GET /departments/:id` - Get department by ID
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department (soft delete)

### Employee Endpoints (Updated)
- `POST /employees` - Create employee (now requires departmentId)
- `GET /employees` - Get all employees (with department info)
- `GET /employees/:id` - Get employee by ID (with department info)
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee (soft delete)

## Breaking Changes

1. **Employee API**:
   - Field `department` (string) → `departmentId` (number)
   - Field `nip` (number) → `nip` (string)
   - Response sekarang include `departmentName`

2. **Database Schema**:
   - Tabel `m_employee` tidak lagi memiliki kolom `department`
   - Kolom `nip` sekarang varchar(255) bukan integer
   - Relasi foreign key ke tabel `m_departments`

## Cara Menjalankan Migrasi

```bash
# Jalankan migrasi
npm run migration:run

# Atau jika menggunakan TypeORM CLI
npx typeorm migration:run
```

## Testing

Setelah migrasi dijalankan, pastikan:
1. Tabel `m_departments` berhasil dibuat
2. Tabel `m_employee` berhasil diupdate
3. API endpoints berfungsi dengan baik
4. Relasi antara employee dan department berfungsi

## Catatan Penting

- Pastikan data existing di kolom `department` sudah di-migrate ke tabel `m_departments` sebelum menjalankan migrasi
- NIP yang sebelumnya berupa number sekarang harus berupa string
- Semua API yang menggunakan employee endpoint perlu diupdate untuk menggunakan `departmentId` instead of `department`
