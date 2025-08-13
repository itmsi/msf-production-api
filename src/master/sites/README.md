# Sites Module

Modul ini menangani operasi CRUD untuk sites dan operator points.

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete untuk sites
- **Operator Points Management**: Pengelolaan operator points (dumping/loading) untuk setiap site
- **Pagination**: Dukungan pagination untuk list data
- **Filtering**: Filter berdasarkan name, location
- **Search**: Pencarian umum di semua field
- **Sorting**: Sorting berdasarkan field tertentu
- **Soft Delete**: Data tidak benar-benar dihapus dari database

## Endpoints

### GET /sites
Mendapatkan semua data sites dengan pagination, filtering, dan sorting.

**Query Parameters:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10)
- `search`: Pencarian umum
- `name`: Filter berdasarkan nama site
- `location`: Filter berdasarkan lokasi site
- `sortBy`: Field untuk sorting
- `sortOrder`: Urutan sorting (ASC/DESC)

### GET /sites/:id
Mendapatkan data site berdasarkan ID beserta operator points.

### POST /sites
Membuat site baru beserta operator points.

**Request Body:**
```json
{
  "name": "Site Jakarta",
  "location": "Jakarta Selatan",
  "longitude": 106.8456,
  "latitude": -6.2088,
  "operator_point": [
    {
      "type": "dumping",
      "name": "Dumping Point A",
      "longitude": 106.8456,
      "latitude": -6.2088
    }
  ]
}
```

### PUT /sites/:id
Mengupdate data site beserta operator points.

### DELETE /sites/:id
Menghapus site (soft delete).

## Database Tables

### m_sites
- `id`: Primary key
- `name`: Nama site
- `location`: Lokasi site
- `longitude`: Longitude site
- `latitude`: Latitude site
- `createdAt`: Waktu pembuatan
- `updatedAt`: Waktu update
- `deletedAt`: Waktu soft delete

### m_operation_points
- `id`: Primary key
- `sites_id`: Foreign key ke m_sites
- `type`: Tipe operator point (dumping/loading)
- `name`: Nama operator point
- `longitude`: Longitude operator point
- `latitude`: Latitude operator point
- `createdAt`: Waktu pembuatan
- `updatedAt`: Waktu update
- `deletedAt`: Waktu soft delete

## Dependencies

- `@nestjs/common`
- `@nestjs/typeorm`
- `typeorm`
- `class-validator`
- `class-transformer`
- `@nestjs/swagger`

## Usage

```typescript
import { SitesModule } from './master/sites';

@Module({
  imports: [SitesModule],
})
export class AppModule {}
```
