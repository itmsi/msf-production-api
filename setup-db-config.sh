#!/bin/bash

# Script untuk mengatur konfigurasi database berdasarkan DB_HIT_SERVER
# Usage: ./setup-db-config.sh [local|server]

echo "=== Database Configuration Setup ==="
echo ""

# Check if argument provided
if [ $# -eq 0 ]; then
    echo "Pilih konfigurasi database:"
    echo "1. Local Database (DB_HIT_SERVER=OFF)"
    echo "2. Server Database (DB_HIT_SERVER=ON)"
    echo ""
    read -p "Pilih opsi (1-2): " choice
    
    case $choice in
        1) MODE="local" ;;
        2) MODE="server" ;;
        *) echo "❌ Invalid option"; exit 1 ;;
    esac
else
    MODE=$1
fi

# Backup existing .env file
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Existing .env file backed up"
fi

# Create .env file based on mode
if [ "$MODE" = "local" ]; then
    echo "🏠 Setting up LOCAL database configuration..."
    cat > .env << 'EOF'
# Database Connection Mode
DB_HIT_SERVER=OFF

# Local Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=falaqmsi
POSTGRES_PASSWORD=your_local_password
POSTGRES_DB=msf_production

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Other configurations
CORS_ORIGIN=*
EOF
    echo "✅ Local database configuration created"
    echo ""
    echo "📝 Please update POSTGRES_PASSWORD in .env file with your local database password"
    
elif [ "$MODE" = "server" ]; then
    echo "🌐 Setting up SERVER database configuration..."
    cat > .env << 'EOF'
# Database Connection Mode
DB_HIT_SERVER=ON

# Server Configuration
SERVER_HOST=162.11.0.232
SERVER_USERNAME=msiserver
SERVER_PASSWORD=m0t0r519ht5!@#

# SSH Tunnel Configuration
SSH_HOST=162.11.0.232
SSH_PORT=22
SSH_USERNAME=msiserver
SSH_PASSWORD=m0t0r519ht5!@#
DB_HOST=127.0.0.1
DB_PORT=5432
LOCAL_TUNNEL_PORT=6543

# Database Configuration (Server via SSH tunnel)
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=6543
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
    echo "✅ Server database configuration created"
    echo ""
    echo "🚀 SSH tunnel will be automatically created when starting the application"
fi

echo ""
echo "📋 Configuration Summary:"
echo "   Mode: $MODE"
echo "   DB_HIT_SERVER: $(grep DB_HIT_SERVER .env | cut -d'=' -f2)"
echo "   Database Host: $(grep POSTGRES_HOST .env | cut -d'=' -f2)"
echo "   Database Port: $(grep POSTGRES_PORT .env | cut -d'=' -f2)"
echo ""
echo "✅ Configuration setup complete!"
echo ""
echo "Next steps:"
if [ "$MODE" = "local" ]; then
    echo "1. Update POSTGRES_PASSWORD in .env file"
    echo "2. Make sure your local PostgreSQL is running"
    echo "3. Run: npm run start:dev"
else
    echo "1. Make sure you have SSH access to the server"
    echo "2. Run: npm run start:dev"
    echo "3. SSH tunnel will be created automatically"
fi
