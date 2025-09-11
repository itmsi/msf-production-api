#!/bin/bash

# Script untuk mengelola environment dan SSH tunnel
# Script ini membantu memilih antara direct connection atau SSH tunnel

echo "=== Database Connection Manager ==="
echo ""
echo "Pilih metode koneksi:"
echo "1. Direct Connection (langsung ke server)"
echo "2. SSH Tunnel (melalui SSH)"
echo "3. Test Connection"
echo "4. Stop SSH Tunnel"
echo ""

read -p "Pilih opsi (1-4): " choice

case $choice in
    1)
        echo "Setting up direct connection..."
        cp .env .env.backup 2>/dev/null || true
        cat > .env << 'EOF'
# Server Configuration
SERVER_HOST=162.11.0.232
SERVER_USERNAME=msiserver
SERVER_PASSWORD=m0t0r519ht5!@#

# Database Configuration (Direct)
POSTGRES_HOST=162.11.0.232
POSTGRES_PORT=5432
POSTGRES_USER=sharedpg
POSTGRES_PASSWORD=pgpass
POSTGRES_DB=tid-project

# Application Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Other configurations
CORS_ORIGIN=*
EOF
        echo "✅ Direct connection configured"
        echo "Run: npm run migration:run"
        ;;
    2)
        echo "Setting up SSH tunnel..."
        cp .env .env.backup 2>/dev/null || true
        cp .env.tunnel .env
        echo "✅ SSH tunnel configuration ready"
        echo "Run: ./ssh-tunnel.sh"
        echo "Then: npm run migration:run"
        ;;
    3)
        echo "Testing database connection..."
        if [ -f .env ]; then
            echo "Using current .env configuration..."
            npm run migration:run
        else
            echo "❌ No .env file found. Please configure connection first."
        fi
        ;;
    4)
        echo "Stopping SSH tunnel..."
        ./stop-tunnel.sh
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac
