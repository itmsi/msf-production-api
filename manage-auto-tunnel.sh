#!/bin/bash

# Script untuk mengelola SSH Tunnel Otomatis di NestJS
# Script ini membantu setup dan test SSH tunnel otomatis

echo "=== SSH Tunnel Otomatis Manager ==="
echo ""
echo "Pilih opsi:"
echo "1. Setup SSH Tunnel Otomatis"
echo "2. Test SSH Tunnel Otomatis"
echo "3. Start Aplikasi dengan SSH Tunnel"
echo "4. Check Status SSH Tunnel"
echo ""

read -p "Pilih opsi (1-4): " choice

case $choice in
    1)
        echo "Setting up SSH Tunnel Otomatis..."
        
        # Backup current .env
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
        
        # Copy auto-tunnel configuration
        cp .env.auto-tunnel .env
        
        echo "✅ SSH Tunnel Otomatis configured"
        echo ""
        echo "📋 Konfigurasi:"
        echo "- SSH Host: 162.11.0.232"
        echo "- SSH User: msiserver"
        echo "- Local Tunnel Port: 6543"
        echo "- Database akan accessible di: localhost:6543"
        echo ""
        echo "🚀 Jalankan: npm run start:prod"
        ;;
    2)
        echo "Testing SSH Tunnel Otomatis..."
        
        if [ ! -f .env ]; then
            echo "❌ File .env tidak ditemukan"
            echo "Jalankan setup dulu dengan opsi 1"
            exit 1
        fi
        
        echo "Building aplikasi..."
        npm run build
        
        echo "Testing koneksi..."
        timeout 30 npm run start:prod 2>&1 | head -20
        
        echo ""
        echo "💡 Jika melihat 'SSH tunnel established successfully', maka tunnel berhasil!"
        echo "💡 Jika ada error, periksa credentials SSH atau koneksi ke server"
        ;;
    3)
        echo "Starting aplikasi dengan SSH Tunnel Otomatis..."
        
        if [ ! -f .env ]; then
            echo "❌ File .env tidak ditemukan"
            echo "Jalankan setup dulu dengan opsi 1"
            exit 1
        fi
        
        echo "🚀 Starting aplikasi..."
        npm run start:prod
        ;;
    4)
        echo "Checking SSH Tunnel Status..."
        
        if [ -f .env ]; then
            echo "📋 Konfigurasi saat ini:"
            grep -E "^(SSH_|DB_|LOCAL_TUNNEL_|POSTGRES_)" .env | sed 's/^/  /'
        else
            echo "❌ File .env tidak ditemukan"
        fi
        
        echo ""
        echo "🔍 Checking tunnel port..."
        if lsof -i :6543 >/dev/null 2>&1; then
            echo "✅ Port 6543 sedang digunakan (kemungkinan tunnel aktif)"
        else
            echo "❌ Port 6543 tidak digunakan (tunnel tidak aktif)"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac
