# Database Configuration Guide

Aplikasi ini mendukung dua mode koneksi database berdasarkan variabel `DB_HIT_SERVER` di file `.env`.

## Mode Koneksi Database

### 1. Local Database (DB_HIT_SERVER=OFF)
Ketika `DB_HIT_SERVER=OFF`, aplikasi akan menggunakan database lokal tanpa SSH tunnel.

**Konfigurasi yang diperlukan:**
```env
DB_HIT_SERVER=OFF
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=falaqmsi
POSTGRES_PASSWORD=your_local_password
POSTGRES_DB=msf_production
```

**Keuntungan:**
- Lebih cepat untuk development
- Tidak memerlukan koneksi internet ke server
- Tidak ada masalah SSH tunnel

### 2. Server Database (DB_HIT_SERVER=ON)
Ketika `DB_HIT_SERVER=ON`, aplikasi akan menggunakan database server melalui SSH tunnel.

**Konfigurasi yang diperlukan:**
```env
DB_HIT_SERVER=ON
SSH_HOST=162.11.0.232
SSH_PORT=22
SSH_USERNAME=msiserver
SSH_PASSWORD=m0t0r519ht5!@#
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=6543
POSTGRES_USER=sharedpg
POSTGRES_PASSWORD=pgpass
POSTGRES_DB=tid-project
```

**Keuntungan:**
- Menggunakan data production yang real-time
- Konsisten dengan environment production

## Cara Menggunakan

### Menggunakan Script Otomatis
```bash
# Untuk konfigurasi local database
./setup-db-config.sh local

# Untuk konfigurasi server database
./setup-db-config.sh server
```

### Manual Setup
1. Edit file `.env`
2. Set `DB_HIT_SERVER=OFF` untuk local atau `DB_HIT_SERVER=ON` untuk server
3. Sesuaikan konfigurasi database sesuai mode yang dipilih
4. Jalankan aplikasi: `npm run start:dev`

## Troubleshooting

### Error "password authentication failed"
- Pastikan password database lokal sudah benar
- Untuk local database, buat database `msf_production` jika belum ada
- Untuk server database, pastikan SSH tunnel berhasil dibuat

### Error "no matching key exchange algorithm"
- Ini terjadi pada mode server database
- SSH tunnel akan otomatis fallback ke manual tunnel jika tersedia
- Pastikan koneksi internet stabil

### Error "Unable to connect to the database"
- Periksa apakah PostgreSQL service berjalan (untuk local)
- Periksa koneksi SSH ke server (untuk server mode)
- Pastikan port tidak digunakan oleh aplikasi lain

## File yang Dimodifikasi

1. `src/app.module.ts` - Konfigurasi TypeORM berdasarkan DB_HIT_SERVER
2. `src/common/services/ssh-tunnel.service.ts` - Skip SSH tunnel jika DB_HIT_SERVER=OFF
3. `src/database/data-source.ts` - Konfigurasi DataSource berdasarkan mode
4. `setup-db-config.sh` - Script untuk setup otomatis
5. `env.example` - Contoh konfigurasi

## Log Messages

Aplikasi akan menampilkan log yang berbeda berdasarkan mode:

**Local Mode:**
```
🏠 Using LOCAL database configuration
SSH tunnel will be skipped
```

**Server Mode:**
```
🌐 Using SERVER database configuration
Setting up SSH tunnel...
✅ SSH tunnel established successfully
```
