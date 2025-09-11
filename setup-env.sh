#!/bin/bash

# Script untuk setup environment ke server internal
# Jalankan script ini untuk mengatur environment variables

echo "Setting up environment for internal server..."

# Buat file .env jika belum ada
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Server Configuration
SERVER_HOST=162.11.0.232
SERVER_USERNAME=msiserver
SERVER_PASSWORD=m0t0r519ht5!@#

# Database Configuration
POSTGRES_HOST=162.11.0.232
POSTGRES_PORT=5432
POSTGRES_USER=sharedpg
POSTGRES_PASSWORD=pgpass
POSTGRES_DB=tid-project

# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration (jika diperlukan)
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Other configurations (sesuaikan sesuai kebutuhan)
CORS_ORIGIN=*
EOF
    echo ".env file created successfully!"
else
    echo ".env file already exists. Please check and update manually if needed."
fi

echo "Environment setup completed!"
echo ""
echo "To test database connection, run:"
echo "npm run migration:run"
echo ""
echo "To start the application, run:"
echo "npm run start:prod"
