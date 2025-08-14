# Employee Module

Modul untuk mengelola data karyawan (employee) dalam sistem MSF Production API.

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete employee
- **Search & Filter**: Pencarian berdasarkan nama, departemen, posisi, dan status
- **Pagination**: Support untuk pagination dengan limit dan offset
- **Soft Delete**: Penghapusan data secara soft (tidak menghapus dari database)
- **Validation**: Validasi input menggunakan class-validator
- **Swagger Documentation**: API documentation lengkap dengan Swagger

## Entity

### Employee Entity

```typescript
@Entity('m_employee')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  department: string;

  @Column()
  position: string;

  @Column()
  nip: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'resign', 'on-leave'],
    default: 'active'
  })
  status: string;

  @Column({ nullable: true })
  salary: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Virtual property untuk nama lengkap
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

## DTOs

### CreateEmployeeDto
- `firstName`: Nama depan karyawan (required)
- `lastName`: Nama belakang karyawan (required)
- `department`: Departemen karyawan (required)
- `position`: Posisi/jabatan karyawan (required)
- `nip`: Nomor Induk Pegawai (required, unique)
- `status`: Status karyawan (enum: active, inactive, resign, on-leave)
- `salary`: Gaji karyawan (optional)

### UpdateEmployeeDto
- Semua field optional untuk partial update
- Validasi NIP uniqueness jika diupdate

### EmployeeResponseDto
- Response format yang konsisten dengan field lengkap
- Include virtual property `name` (nama lengkap)
- Timestamp fields (createdAt, updatedAt)

### GetEmployeesQueryDto
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah item per halaman (default: 10)
- `search`: Pencarian berdasarkan nama, departemen, atau posisi
- `department`: Filter berdasarkan departemen
- `status`: Filter berdasarkan status

## Endpoints

### Base URL: `/api/employees`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new employee | ✅ JWT |
| GET | `/` | Get all employees with pagination & filters | ✅ JWT |
| GET | `/by-department/:department` | Get employees by department | ✅ JWT |
| GET | `/by-status/:status` | Get employees by status | ✅ JWT |
| GET | `/:id` | Get employee by ID | ✅ JWT |
| PUT | `/:id` | Update employee | ✅ JWT |
| DELETE | `/:id` | Soft delete employee | ✅ JWT |

## Service Methods

### EmployeeService

- `create(createEmployeeDto)`: Membuat employee baru
- `findAll(query)`: Mendapatkan semua employee dengan pagination dan filter
- `findOne(id)`: Mendapatkan employee berdasarkan ID
- `update(id, updateEmployeeDto)`: Update employee
- `remove(id)`: Soft delete employee
- `findByNip(nip)`: Mencari employee berdasarkan NIP
- `findByDepartment(department)`: Mendapatkan employee berdasarkan departemen
- `findByStatus(status)`: Mendapatkan employee berdasarkan status

## Business Logic

### Validation Rules
- NIP harus unique (tidak boleh duplikat)
- Status harus sesuai enum yang didefinisikan
- Soft delete untuk menjaga data integrity

### Search & Filter
- Case-insensitive search menggunakan ILIKE
- Support untuk multiple field search (nama, departemen, posisi)
- Filter berdasarkan departemen dan status
- Pagination dengan order by ID descending

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "message": "Get employees successfully",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation error",
  "error": true,
  "timestamp": "2025-08-14T15:11:37.757Z"
}
```

## Usage Examples

### Create Employee
```bash
curl -X POST http://localhost:9526/api/employees \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "department": "IT",
    "position": "Software Engineer",
    "nip": 123456789,
    "status": "active",
    "salary": "5000000"
  }'
```

### Get Employees with Search
```bash
curl "http://localhost:9526/api/employees?search=john&department=IT&page=1&limit=5" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Update Employee
```bash
curl -X PUT http://localhost:9526/api/employees/1 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Software Engineer",
    "salary": "7500000"
  }'
```

## Dependencies

- **NestJS**: Framework utama
- **TypeORM**: Database ORM
- **class-validator**: Input validation
- **class-transformer**: Object transformation
- **Swagger**: API documentation

## Database

### Table: `m_employee`
- Primary key: `id`
- Unique constraint: `nip`
- Soft delete: `deletedAt` column
- Audit fields: `createdAt`, `updatedAt`

### Indexes
- `id` (Primary Key)
- `nip` (Unique)
- `department` (for filtering)
- `status` (for filtering)
- `deletedAt` (for soft delete queries)

## Security

- **JWT Authentication**: Semua endpoint memerlukan valid JWT token
- **Input Validation**: Validasi input menggunakan class-validator
- **SQL Injection Protection**: Menggunakan TypeORM query builder
- **Soft Delete**: Data tidak benar-benar dihapus dari database

## Error Handling

- **400 Bad Request**: Validation error atau input tidak valid
- **401 Unauthorized**: JWT token tidak valid atau tidak ada
- **404 Not Found**: Employee tidak ditemukan
- **409 Conflict**: NIP sudah ada
- **500 Internal Server Error**: Error server yang tidak terduga

## Testing

Modul ini dapat di-test menggunakan:
- Unit tests dengan Jest
- Integration tests dengan TestContainer
- API tests dengan Swagger UI
- Manual testing dengan Postman/curl

## Future Enhancements

- **Bulk Operations**: Import/export employee data
- **Advanced Search**: Full-text search dengan Elasticsearch
- **Audit Trail**: Tracking perubahan data employee
- **File Upload**: Upload foto employee
- **Reporting**: Generate laporan employee
- **Integration**: Integrasi dengan sistem HR external
