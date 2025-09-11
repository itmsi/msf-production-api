#!/bin/bash

# Script Debug SSH Tunnel
# Script ini membantu mengidentifikasi masalah koneksi SSH tunnel

echo "=== SSH Tunnel Debug Tool ==="
echo ""

# Check current configuration
echo "📋 Current Configuration:"
if [ -f .env ]; then
    echo "SSH_HOST: $(grep SSH_HOST .env | cut -d'=' -f2)"
    echo "SSH_USERNAME: $(grep SSH_USERNAME .env | cut -d'=' -f2)"
    echo "POSTGRES_HOST: $(grep POSTGRES_HOST .env | cut -d'=' -f2)"
    echo "POSTGRES_PORT: $(grep POSTGRES_PORT .env | cut -d'=' -f2)"
else
    echo "❌ File .env tidak ditemukan"
fi

echo ""
echo "🔍 Testing SSH Connection..."

# Test SSH connection
SSH_HOST=$(grep SSH_HOST .env | cut -d'=' -f2 2>/dev/null || echo "162.11.0.232")
SSH_USERNAME=$(grep SSH_USERNAME .env | cut -d'=' -f2 2>/dev/null || echo "msiserver")

echo "Testing SSH connection to: $SSH_USERNAME@$SSH_HOST"

# Test SSH connection with timeout
timeout 10 ssh -o ConnectTimeout=5 -o BatchMode=yes $SSH_USERNAME@$SSH_HOST "echo 'SSH connection test successful'" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed"
    echo ""
    echo "💡 Possible issues:"
    echo "1. SSH service not running on server"
    echo "2. Wrong credentials"
    echo "3. Network connectivity issues"
    echo "4. Firewall blocking SSH port"
fi

echo ""
echo "🔍 Testing Database Connection..."

# Test database connection
POSTGRES_HOST=$(grep POSTGRES_HOST .env | cut -d'=' -f2 2>/dev/null || echo "162.11.0.232")
POSTGRES_PORT=$(grep POSTGRES_PORT .env | cut -d'=' -f2 2>/dev/null || echo "5432")
POSTGRES_USER=$(grep POSTGRES_USER .env | cut -d'=' -f2 2>/dev/null || echo "postgres")
POSTGRES_DB=$(grep POSTGRES_DB .env | cut -d'=' -f2 2>/dev/null || echo "tid-project")

echo "Testing database connection to: $POSTGRES_USER@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"

# Test database connection
PGPASSWORD=$(grep POSTGRES_PASSWORD .env | cut -d'=' -f2 2>/dev/null || echo "pgpass") \
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT version();" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo ""
    echo "💡 Possible issues:"
    echo "1. Database service not running"
    echo "2. Wrong database credentials"
    echo "3. Database not accessible from this network"
    echo "4. Need SSH tunnel for database access"
fi

echo ""
echo "🔧 Solutions:"
echo "1. Setup SSH tunnel: ./manage-auto-tunnel.sh"
echo "2. Fix credentials: ./fix-db-credentials.sh"
echo "3. Test manual SSH: ssh $SSH_USERNAME@$SSH_HOST"
echo "4. Check server status with admin"
