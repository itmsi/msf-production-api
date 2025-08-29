# CURL Examples untuk Activities API

## Filter Status Multiple

### Contoh 1: Filter dengan multiple status (idle dan delay) - Comma-separated
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle,delay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 1b: Filter dengan multiple status (idle dan delay) - Array format
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=idle&status_multiple[]=delay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 2: Filter dengan multiple status (working dan breakdown) - Comma-separated
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=working,breakdown' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 2b: Filter dengan multiple status (working dan breakdown) - Array format
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=working&status_multiple[]=breakdown' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 3: Filter dengan multiple status dan sorting - Comma-separated
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle,delay&sortBy=name&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 3b: Filter dengan multiple status dan sorting - Array format
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=idle&status_multiple[]=delay&sortBy=name&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 4: Filter dengan multiple status dan search - Comma-separated
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle,delay&search=loading' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 4b: Filter dengan multiple status dan search - Array format
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=idle&status_multiple[]=delay&search=loading' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 5: Filter dengan multiple status dan name filter - Comma-separated
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle,delay&name=Barge' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Contoh 5b: Filter dengan multiple status dan name filter - Array format
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=idle&status_multiple[]=delay&name=Barge' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

## URL Encoding untuk Karakter Khusus

### Menggunakan %2c untuk koma (Comma-separated format)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle%2cdelay%2cbreakdown' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

## Kombinasi Filter

### Filter status dan status_multiple bersamaan - Comma-separated
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status=working&status_multiple=idle,delay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

### Filter status dan status_multiple bersamaan - Array format
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status=working&status_multiple[]=idle&status_multiple[]=delay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGVyYWRtaW4iLCJzdWIiOjEsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTY0Mzg0MDQsImV4cCI6MTc1NjUyNDgwNH0.uMBqxQZwCtfHSzM4iAGQV4EuL7Zyn66Ea6CqgovmUzg'
```

## Catatan Penting
- Filter `status_multiple` mendukung dua format input:
  - **Comma-separated**: `status_multiple=idle,delay,breakdown`
  - **Array format**: `status_multiple[]=idle&status_multiple[]=delay&status_multiple[]=breakdown`
- URL encoding diperlukan untuk karakter khusus (contoh: `%2c` untuk koma)
- Swagger UI akan menampilkan multiple input fields untuk memilih status
- Filter ini dapat dikombinasikan dengan filter lainnya
- Jika menggunakan filter `status` dan `status_multiple` bersamaan, akan menggunakan logika AND
