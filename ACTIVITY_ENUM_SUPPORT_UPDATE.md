# UPDATE ACTIVITY ENUM - ADD SUPPORT VALUE

## Ringkasan Perubahan

Perubahan ini menambahkan nilai enum baru 'support' ke kolom `activity` pada tabel `r_base_data_pro`.

## File yang Diubah

### 1. Migrasi Database
- **File**: `src/database/migrations/1756885070000-AddSupportToActivityEnum.ts`
- **Perubahan**: Menambahkan nilai 'support' ke ENUM `enum_activity`

### 2. Entity
- **File**: `src/modules/base-data-production/entities/base-data-pro.entity.ts`
- **Perubahan**: Menambahkan `SUPPORT = 'support'` ke enum `ActivityType`

### 3. Service
- **File**: `src/modules/base-data-production/base-data-production.service.ts`
- **Perubahan**: Menambahkan case 'support' di method `getActivityDisplayName()`

### 4. Dokumentasi
- **File**: `src/modules/base-data-production/README.md`
- **Perubahan**: Memperbarui dokumentasi untuk mencakup nilai enum baru

## Detail Implementasi

### Migrasi Database
```sql
ALTER TYPE enum_activity ADD VALUE 'support'
```

### Entity Update
```typescript
export enum ActivityType {
  HAULING = 'hauling',
  BARGING = 'barging',
  DIRECT = 'direct',
  SUPPORT = 'support', // Nilai baru
}
```

### Service Update
```typescript
private getActivityDisplayName(activity: string | null): string {
  if (!activity) return 'N/A';
  
  switch (activity.toLowerCase()) {
    case 'hauling':
      return 'Hauling';
    case 'barging':
      return 'Barging';
    case 'direct':
      return 'Direct';
    case 'support':
      return 'Support'; // Case baru
    default:
      return activity;
  }
}
```

## Impact

1. **Database**: Kolom `activity` di tabel `r_base_data_pro` sekarang menerima nilai 'support'
2. **API**: Endpoint base-data-production dapat menerima dan mengembalikan nilai 'support' untuk kolom activity
3. **Validation**: Validasi DTO otomatis mendukung nilai enum baru
4. **Display**: Method `getActivityDisplayName()` akan menampilkan 'Support' untuk nilai 'support'

## Testing

Untuk memverifikasi perubahan:

1. **Database**: Cek bahwa enum `enum_activity` memiliki nilai 'support'
2. **API**: Test endpoint POST dengan activity: 'support'
3. **Response**: Pastikan response menampilkan 'Support' untuk nilai 'support'

## Rollback

Jika diperlukan rollback, migrasi menyediakan method `down()` yang akan:
1. Membuat ENUM baru tanpa nilai 'support'
2. Update kolom untuk menggunakan ENUM baru
3. Drop ENUM lama

**Catatan**: Rollback ini kompleks dan memerlukan backup data karena PostgreSQL tidak mendukung penghapusan nilai ENUM secara langsung.
