# Modul Barge

Modul ini menyediakan fungsionalitas untuk mengelola data barge (kapal tongkang) dalam sistem.

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete data barge
- **Soft Delete**: Data tidak benar-benar dihapus dari database
- **Restore**: Memulihkan data yang sudah di-soft delete
- **Pagination**: Mendukung pagination untuk data yang banyak
- **Filtering**: Filter berdasarkan shipment, name, dan kapasitas
- **Search**: Pencarian umum di field shipment, name, dan remarks
- **Sorting**: Sorting berdasarkan field tertentu dengan urutan ASC/DESC
- **Validation**: Validasi input data dengan class-validator
- **Swagger Documentation**: Dokumentasi API yang lengkap

## Struktur Database

Tabel `m_barge` memiliki field berikut:

- `id`: Primary key auto increment
- `name`: Nama barge (varchar 255, nullable)
- `capacity`: Kapasitas barge dalam ton (int, nullable)
- `remarks`: Catatan tambahan (text, nullable)
- `createdAt`: Waktu pembuatan (timestamp)
- `createdBy`: ID user yang membuat (int, nullable)
- `updatedAt`: Waktu update (timestamp)
- `updatedBy`: ID user yang update (int, nullable)
- `deletedAt`: Waktu soft delete (timestamp, nullable)
- `deletedBy`: ID user yang delete (int, nullable)

## Endpoint API

### 1. GET /barges
Mendapatkan semua data barge dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)
- `search`: Pencarian umum di field name dan remarks
- `name`: Filter berdasarkan nama barge
- `minCapacity`: Filter berdasarkan kapasitas minimum
- `maxCapacity`: Filter berdasarkan kapasitas maksimum
- `sortBy`: Field untuk sorting (id, name, capacity, createdAt, updatedAt)
- `sortOrder`: Urutan sorting (ASC, DESC)

### 2. GET /barges/:id
Mendapatkan data barge berdasarkan ID.

**Path Parameters:**
- `id`: ID barge (number)

### 3. POST /barges
Membuat data barge baru.

**Request Body:**
```json
{
  "shipment": "Barge-001",
  "name": "Barge Kalimantan",
  "capacity": 1000,
  "remarks": "Barge untuk pengangkutan batu bara"
}
```

### 4. PUT /barges/:id
Mengupdate data barge berdasarkan ID.

**Path Parameters:**
- `id`: ID barge (number)

**Request Body:**
```json
{
  "name": "Barge Kalimantan Updated",
  "capacity": 1500
}
```

### 5. DELETE /barges/:id
Menghapus data barge secara soft delete.

**Path Parameters:**
- `id`: ID barge (number)

### 6. POST /barges/:id/restore
Memulihkan data barge yang sudah di-soft delete.

**Path Parameters:**
- `id`: ID barge (number)

## Validasi

- **shipment**: String dengan panjang 1-255 karakter
- **name**: String dengan panjang 1-255 karakter
- **capacity**: Number dengan range 1-999999
- **remarks**: String tanpa batasan panjang

## Keamanan

- Semua endpoint dilindungi dengan JWT Authentication
- Validasi input menggunakan class-validator
- SQL injection protection pada query builder
- Soft delete untuk mencegah kehilangan data

## Response Format

Semua response mengikuti format standar:

```json
{
  "statusCode": 200,
  "message": "Pesan response",
  "data": "Data response",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

## Error Handling

- **400**: Bad Request - Data tidak valid
- **401**: Unauthorized - Token tidak valid
- **404**: Not Found - Data tidak ditemukan
- **500**: Internal Server Error - Kesalahan server

## Penggunaan

1. Import `BargeModule` ke dalam `AppModule`
2. Pastikan JWT authentication sudah dikonfigurasi
3. Akses endpoint melalui `/barges`
4. Gunakan token JWT untuk autentikasi

## Contoh Penggunaan

```typescript
// Import module
import { BargeModule } from './modules/barge';

// Tambahkan ke AppModule
@Module({
  imports: [
    // ... other modules
    BargeModule,
  ],
})
export class AppModule {}
```
