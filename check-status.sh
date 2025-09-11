#!/bin/bash

# Script untuk memeriksa status SSH tunnel dan aplikasi
echo "=== Application & SSH Tunnel Status ==="
echo ""

# Check if application is running
echo "🔍 Checking application status..."
if pgrep -f "node dist/main" > /dev/null; then
    echo "✅ Application is running"
    APP_PID=$(pgrep -f "node dist/main")
    echo "   PID: $APP_PID"
else
    echo "❌ Application is not running"
fi

echo ""

# Check SSH tunnel port
echo "🔍 Checking SSH tunnel port..."
TUNNEL_PORT=6543
if lsof -i :$TUNNEL_PORT >/dev/null 2>&1; then
    echo "✅ Port $TUNNEL_PORT is in use (SSH tunnel likely active)"
    lsof -i :$TUNNEL_PORT
else
    echo "❌ Port $TUNNEL_PORT is not in use (SSH tunnel not active)"
fi

echo ""

# Check database connection through tunnel
echo "🔍 Testing database connection through tunnel..."
if [ -f .env ]; then
    source .env
    if command -v psql >/dev/null 2>&1; then
        PGPASSWORD=$POSTGRES_PASSWORD psql -h 127.0.0.1 -p 6543 -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 'Connection successful' as status;" 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Database connection through tunnel successful"
        else
            echo "❌ Database connection through tunnel failed"
        fi
    else
        echo "⚠️  psql not available, cannot test database connection"
    fi
else
    echo "❌ .env file not found"
fi

echo ""

# Check application logs for SSH tunnel messages
echo "🔍 Checking for SSH tunnel messages in application logs..."
if pgrep -f "node dist/main" > /dev/null; then
    echo "Application is running. Check console output for:"
    echo "  - 'Creating SSH tunnel...'"
    echo "  - 'SSH connection established'"
    echo "  - '✅ SSH tunnel established successfully'"
    echo "  - 'Database accessible at: localhost:6543'"
else
    echo "Application not running. Start with: npm run start:prod"
fi

echo ""
echo "🔧 Troubleshooting steps:"
echo "1. If SSH tunnel not active: Check SSH credentials and server connectivity"
echo "2. If database connection failed: Check database credentials"
echo "3. If application not running: Check for errors in console"
echo "4. For manual SSH tunnel: ./ssh-tunnel.sh"
