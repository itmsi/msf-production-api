# Employee Module

Modul ini menangani manajemen employee dalam sistem MSF Production. Employee adalah karyawan yang bekerja di perusahaan dengan berbagai informasi seperti nama, department, posisi, NIP, dan status.

## Endpoints

### 1. GET /api/employees

Mendapatkan semua data employee dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Pencarian umum di field firstName, lastName, department, position
- `department` (optional): Filter berdasarkan department (partial match)
- `status` (optional): Filter berdasarkan status (active, inactive, resign, on-leave)
- `sortBy` (optional): Field untuk sorting (id, firstName, lastName, department, position, nip, status, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC atau DESC)

**Contoh Request:**
```bash
GET /api/employees?page=1&limit=10&search=john&department=IT&status=active&sortBy=firstName&sortOrder=ASC
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get employees successfully",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "department": "IT",
      "position": "Software Engineer",
      "nip": 123456789,
      "status": "active",
      "salary": "5000000",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 2. GET /api/employees/:id

Mendapatkan data employee berdasarkan ID.

**Path Parameters:**
- `id`: ID employee (number)

**Contoh Request:**
```bash
GET /api/employees/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get employee successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "department": "IT",
    "position": "Software Engineer",
    "nip": 123456789,
    "status": "active",
    "salary": "5000000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. GET /api/employees/by-department/:department

Mendapatkan semua employee berdasarkan department.

**Path Parameters:**
- `department`: Nama department (string)

**Contoh Request:**
```bash
GET /api/employees/by-department/IT
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get employees by department successfully",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "department": "IT",
      "position": "Software Engineer",
      "nip": 123456789,
      "status": "active",
      "salary": "5000000",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. GET /api/employees/by-status/:status

Mendapatkan semua employee berdasarkan status.

**Path Parameters:**
- `status`: Status employee (active, inactive, resign, on-leave)

**Contoh Request:**
```bash
GET /api/employees/by-status/active
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Get employees by status successfully",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "department": "IT",
      "position": "Software Engineer",
      "nip": 123456789,
      "status": "active",
      "salary": "5000000",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 5. POST /api/employees

Membuat employee baru dengan validasi duplikasi NIP.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "department": "IT",
  "position": "Software Engineer",
  "nip": 123456789,
  "status": "active",
  "salary": "5000000"
}
```

**Field Validation:**
- `firstName`: String, required, min: 1, max: 100 karakter
- `lastName`: String, required, min: 1, max: 100 karakter
- `department`: String, required, min: 1, max: 100 karakter
- `position`: String, required, min: 1, max: 100 karakter
- `nip`: Number, required, min: 100000000, max: 999999999
- `status`: Enum, required (active, inactive, resign, on-leave)
- `salary`: String, optional, min: 1, max: 20 karakter

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Employee created successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "department": "IT",
    "position": "Software Engineer",
    "nip": 123456789,
    "status": "active",
    "salary": "5000000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. PUT /api/employees/:id

Mengupdate data employee berdasarkan ID.

**Path Parameters:**
- `id`: ID employee yang akan diupdate (number)

**Request Body:**
```json
{
  "firstName": "John Updated",
  "position": "Senior Software Engineer",
  "salary": "6000000"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Employee updated successfully",
  "data": {
    "id": 1,
    "firstName": "John Updated",
    "lastName": "Doe",
    "name": "John Updated Doe",
    "department": "IT",
    "position": "Senior Software Engineer",
    "nip": 123456789,
    "status": "active",
    "salary": "6000000",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. DELETE /api/employees/:id

Menghapus data employee berdasarkan ID (soft delete).

**Path Parameters:**
- `id`: ID employee yang akan dihapus (number)

**Contoh Request:**
```bash
DELETE /api/employees/1
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Employee deleted successfully",
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
  "message": "Employee not found",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "NIP already exists",
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

### Employee Entity
```typescript
{
  id: number;           // Primary key, auto increment
  firstName: string;    // Nama depan (max 100 karakter)
  lastName: string;     // Nama belakang (max 100 karakter)
  department: string;   // Department (max 100 karakter)
  position: string;     // Posisi/jabatan (max 100 karakter)
  nip: number;          // NIP/Employee ID (9 digit)
  status: string;       // Status employee (active, inactive, resign, on-leave)
  salary: string;       // Gaji (optional, max 20 karakter)
  createdAt: Date;      // Timestamp pembuatan
  updatedAt: Date;      // Timestamp update terakhir
  deletedAt: Date;      // Timestamp soft delete (nullable)
  name: string;         // Virtual property: firstName + lastName
}
```

### Employee Status Values
- `active` - Karyawan aktif
- `inactive` - Karyawan tidak aktif
- `resign` - Karyawan sudah resign
- `on-leave` - Karyawan sedang cuti

## Business Rules

1. **NIP Unik**: NIP (Employee ID) harus unik dalam sistem
2. **Soft Delete**: Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
3. **Validation**: Semua input harus divalidasi sesuai dengan constraint yang ditentukan
4. **Pagination**: Limit maksimal adalah 100 data per halaman
5. **Search**: Pencarian dilakukan di field firstName, lastName, department, position
6. **Filtering**: Filter berdasarkan department (partial match) dan status (exact match)
7. **Sorting**: Sorting berdasarkan field yang diizinkan dengan validasi

## Examples

### Create Multiple Employees

```bash
# Create first employee
curl -X POST http://localhost:3000/api/employees \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "department": "IT", "position": "Software Engineer", "nip": 123456789, "status": "active", "salary": "5000000"}'

# Create second employee
curl -X POST http://localhost:3000/api/employees \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jane", "lastName": "Smith", "department": "HR", "position": "HR Manager", "nip": 987654321, "status": "active", "salary": "8000000"}'
```

### Search and Filter

```bash
# Search for employees containing "john"
curl "http://localhost:3000/api/employees?search=john" \
  -H "Authorization: Bearer <jwt_token>"

# Filter by department and sort by name
curl "http://localhost:3000/api/employees?department=IT&sortBy=firstName&sortOrder=ASC" \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Employee

```bash
curl -X PUT http://localhost:3000/api/employees/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John Updated", "position": "Senior Software Engineer", "salary": "6000000"}'
```

## Testing

Untuk testing endpoint ini, gunakan file test yang tersedia:
- `employee.controller.spec.ts`
- `employee.service.spec.ts`

## Dependencies

- `@nestjs/common` - NestJS core functionality
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/swagger` - Swagger documentation
- `class-validator` - Input validation
- `class-transformer` - Data transformation

## Notes

- Semua endpoint menggunakan JWT authentication
- Data yang di-soft delete tidak akan muncul di query findAll
- Timestamp menggunakan format ISO 8601
- Response format konsisten untuk semua endpoint
- Error handling terstandarisasi dengan format yang sama
- NIP harus unik untuk menghindari duplikasi
- Virtual property `name` otomatis digenerate dari firstName + lastName
