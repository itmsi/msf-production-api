#!/bin/bash

# Script untuk membuat SSH tunnel ke database server internal
# Jalankan script ini sebelum menjalankan aplikasi

echo "Setting up SSH tunnel to database server..."

# Konfigurasi SSH tunnel
SSH_HOST="162.11.0.232"
SSH_USER="msiserver"
SSH_PASSWORD="m0t0r519ht5!@#"
LOCAL_PORT="5433"
REMOTE_PORT="5432"

echo "Creating SSH tunnel..."
echo "Local port: $LOCAL_PORT -> Remote: $SSH_HOST:$REMOTE_PORT"
echo "SSH User: $SSH_USER"
echo ""

# Buat SSH tunnel dengan autossh jika tersedia, atau ssh biasa
if command -v autossh &> /dev/null; then
    echo "Using autossh for persistent tunnel..."
    autossh -M 0 -f -N -L $LOCAL_PORT:localhost:$REMOTE_PORT $SSH_USER@$SSH_HOST
else
    echo "Using standard ssh..."
    echo "Note: Install autossh for automatic reconnection: brew install autossh"
    ssh -f -N -L $LOCAL_PORT:localhost:$REMOTE_PORT $SSH_USER@$SSH_HOST
fi

# Tunggu sebentar untuk memastikan tunnel terbentuk
sleep 2

# Test koneksi tunnel
echo "Testing tunnel connection..."
if nc -z localhost $LOCAL_PORT; then
    echo "✅ SSH tunnel established successfully!"
    echo "Database accessible at: localhost:$LOCAL_PORT"
    echo ""
    echo "Update your .env file with:"
    echo "POSTGRES_HOST=localhost"
    echo "POSTGRES_PORT=$LOCAL_PORT"
else
    echo "❌ Failed to establish SSH tunnel"
    echo "Please check:"
    echo "1. SSH service is running on server"
    echo "2. Credentials are correct"
    echo "3. Network connectivity to server"
fi
