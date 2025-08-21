# Peningkatan Error Message untuk Import Population CSV

## Overview
Telah dilakukan peningkatan pada error message untuk endpoint import population CSV agar lebih detail dan informatif, sesuai dengan permintaan user.

## Perubahan yang Dibuat

### 1. Validasi Field Required yang Lebih Lengkap
Sebelumnya hanya 5 field yang divalidasi sebagai required, sekarang semua field required divalidasi:

**Field yang Divalidasi:**
- `date_arrive` - Tanggal kedatangan wajib diisi
- `status` - Status wajib diisi  
- `unit_name` - Nama unit wajib diisi
- `no_unit` - Nomor unit wajib diisi
- `vin_number` - VIN number wajib diisi
- `no_unit_system` - Nomor unit sistem wajib diisi
- `serial_engine` - Serial engine wajib diisi
- `engine_brand` - Engine brand wajib diisi
- `activities_name` - Nama aktivitas wajib diisi
- `user_site` - User site wajib diisi
- `site_origin` - Site origin wajib diisi
- `remarks` - Remarks wajib diisi
- `site_name` - Nama site wajib diisi
- `company` - Company wajib diisi
- `tyre_type` - Tyre type wajib diisi

### 2. Validasi Engine Brand
Ditambahkan validasi untuk field `engine_brand` yang sebelumnya tidak ada:
- Hanya menerima nilai: "cummins" atau "weichai"
- Error message: "Engine brand harus cummins atau weichai"

### 3. Error Message yang Lebih Detail
**Sebelum:**
```json
{
  "message": "4 field(s) tidak valid"
}
```

**Sesudah:**
```json
{
  "message": "4 field(s) tidak valid: \"status\": Status harus active atau inactive, \"engine_brand\": Engine brand harus cummins atau weichai, \"remarks\": Remarks harus RFU atau BD, \"tyre_type\": Tyre type harus 6x4 atau 8x4"
}
```

### 4. Format Error Message
- **Single Error**: `Field "status" tidak valid: Status harus active atau inactive`
- **Multiple Errors**: `3 field(s) tidak valid: "field1": message1, "field2": message2, "field3": message3`

## Contoh Response Error yang Diperbaiki

### Contoh 1: Single Field Error
```json
{
  "status": "error",
  "message": "Field \"status\" tidak valid: Status harus active atau inactive",
  "row": 1,
  "data": {
    "date_arrive": "2025-01-01",
    "status": "invalid_status",
    "unit_name": "Excavator",
    // ... data lainnya
  }
}
```

### Contoh 2: Multiple Fields Error
```json
{
  "status": "error", 
  "message": "3 field(s) tidak valid: \"date_arrive\": Format tanggal tidak valid (yyyy-mm-dd), \"unit_name\": Unit type \"InvalidUnit\" tidak ditemukan, \"tyre_type\": Tyre type harus 6x4 atau 8x4",
  "row": 2,
  "data": {
    "date_arrive": "invalid-date",
    "status": "active",
    "unit_name": "InvalidUnit",
    // ... data lainnya
  }
}
```

## File yang Dimodifikasi

### 1. `src/modules/population/population.service.ts`
- Method `validateCsvRow()` - Ditambahkan validasi lengkap untuk semua field required
- Method `validateCsvRow()` - Ditambahkan validasi engine_brand
- Method `validateCsvRow()` - Diperbaiki format error message agar lebih detail

### 2. `src/modules/population/README.md`
- Diperbarui contoh response error untuk menunjukkan format yang baru

## Testing

### File Test CSV
File `test-import-detail.csv` telah dibuat dengan data yang sengaja dibuat invalid untuk testing:

**Baris 1**: Multiple validation errors
- `status`: "invalid_status" (harus active/inactive)
- `engine_brand`: "invalid_brand" (harus cummins/weichai)  
- `remarks`: "invalid_remarks" (harus RFU/BD)
- `tyre_type`: "invalid_tyre" (harus 6x4/8x4)

**Baris 2**: Reference validation errors
- `unit_name`: "InvalidUnit" (tidak ada di database)
- `activities_name`: "InvalidActivity" (tidak ada di database)
- `site_name`: "InvalidSite" (tidak ada di database)

**Baris 3**: Data valid untuk comparison

### Cara Test
1. Jalankan aplikasi: `npm run start:dev`
2. Gunakan endpoint: `POST /populations/import/preview`
3. Upload file `test-import-detail.csv`
4. Response akan menunjukkan error message yang detail untuk setiap field

## Manfaat Perubahan

### 1. User Experience
- User langsung tahu field mana yang bermasalah
- User tahu nilai apa yang seharusnya digunakan
- Tidak perlu trial and error untuk mengetahui masalah

### 2. Debugging
- Developer bisa langsung identifikasi masalah
- Support team bisa memberikan solusi yang tepat
- Log error lebih informatif untuk monitoring

### 3. Data Quality
- Validasi yang lebih ketat memastikan data yang masuk berkualitas
- Semua field required terjamin terisi
- Format data sesuai standar yang ditentukan

## Kesimpulan

Dengan peningkatan ini, error message untuk import population CSV menjadi:
- **Lebih Detail**: Menunjukkan field spesifik yang bermasalah
- **Lebih Informatif**: Memberikan guidance nilai yang benar
- **Lebih Lengkap**: Semua field required divalidasi
- **Lebih User-Friendly**: Mudah dipahami dan diatasi

User sekarang akan mendapatkan feedback yang jelas tentang apa yang salah dan bagaimana memperbaikinya, sehingga proses import menjadi lebih efisien dan user-friendly.
