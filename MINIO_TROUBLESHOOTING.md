# MinIO Troubleshooting Guide

## Overview
Dokumen ini berisi panduan troubleshooting untuk masalah MinIO yang menyebabkan `download_url` null pada response error file.

## Masalah yang Ditemukan
Response error file menunjukkan:
```json
"error_file": {
  "download_url": null,
  "message": "File error gagal diupload ke cloud storage. Silakan periksa data error di response details."
}
```

## Penyebab Masalah
1. **MinIO tidak berjalan** - Service MinIO tidak aktif
2. **Konfigurasi salah** - Endpoint, credentials, atau bucket tidak sesuai
3. **Network issue** - Tidak bisa connect ke MinIO server
4. **Bucket tidak ada** - Bucket `msf-production` belum dibuat

## Solusi

### 1. Cek Status MinIO
Gunakan endpoint baru untuk mengecek status:
```bash
curl -X GET "http://localhost:9526/api/populations/minio/status" \
  -H "Authorization: Bearer <your_jwt_token>"
```

### 2. Pastikan MinIO Berjalan
```bash
# Cek apakah MinIO container berjalan (jika menggunakan Docker)
docker ps | grep minio

# Atau cek service MinIO
systemctl status minio
```

### 3. Test Koneksi Manual
```bash
# Test endpoint MinIO
curl -I http://localhost:9000

# Test dengan credentials
curl -u minioadmin:minioadmin http://localhost:9000
```

### 4. Buat Bucket yang Diperlukan
```bash
# Menggunakan MinIO client
mc mb local/msf-production

# Atau melalui MinIO console di browser
# Buka http://localhost:9000 dan login dengan minioadmin:minioadmin
```

### 5. Periksa Environment Variables
Pastikan file `.env` berisi:
```env
MINIO_ENDPOINT=http://localhost:9000
MINIO_BUCKET_NAME=msf-production
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY_ID=minioadmin
MINIO_SECRET_ACCESS_KEY=minioadmin
```

### 6. Restart Application
Setelah mengubah konfigurasi:
```bash
npm run start:dev
```

## Log yang Perlu Diperhatikan

### S3Service Logs
```
[PopulationService] Initializing S3Service with endpoint: http://localhost:9000, bucket: msf-production, region: us-east-1
[PopulationService] Error file uploaded successfully: population_import_error/2025-01-20T10-30-00-000Z_import_error_1737355800000.csv
```

### Error Logs
```
[PopulationService] Failed to upload error file import_error_1737355800000.csv: Error: Failed to upload file: connect ECONNREFUSED 127.0.0.1:9000
[PopulationService] MinIO tidak tersedia, menggunakan fallback response
```

## Testing

### 1. Test Upload File
```bash
# Upload file test ke MinIO
curl -X POST "http://localhost:9526/api/populations/import" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@sample-import.csv"
```

### 2. Cek Response
Response yang berhasil seharusnya:
```json
{
  "error_file": {
    "download_url": "http://localhost:9000/msf-production/population_import_error/...",
    "message": "File error telah diupload ke cloud storage. Silakan download dan perbaiki data sebelum import ulang."
  }
}
```

## Fallback Behavior
Jika MinIO tidak tersedia, sistem akan:
1. Tetap memproses validasi data
2. Return response dengan `download_url: null`
3. Memberikan pesan error yang informatif
4. Data error tetap tersedia di `details` response

## Monitoring
Untuk monitoring jangka panjang:
1. Setup health check endpoint untuk MinIO
2. Implement alerting jika MinIO down
3. Log semua upload attempts dan failures
4. Setup backup storage solution

## Support
Jika masalah masih berlanjut:
1. Periksa log aplikasi lengkap
2. Test koneksi MinIO secara manual
3. Periksa firewall dan network configuration
4. Hubungi administrator sistem
