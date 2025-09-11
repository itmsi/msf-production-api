#!/bin/bash

# Script untuk membuat SSH tunnel manual dan menjalankan aplikasi
# Script ini menggunakan pendekatan yang lebih sederhana dan reliable

echo "=== Manual SSH Tunnel + Application ==="
echo ""

# Check if tunnel already exists
if lsof -i :6543 >/dev/null 2>&1; then
    echo "⚠️  Port 6543 already in use. Stopping existing tunnel..."
    pkill -f "ssh.*6543:127.0.0.1:5432"
    sleep 2
fi

# Create SSH tunnel
echo "🔧 Creating SSH tunnel..."
ssh -f -N -L 6543:127.0.0.1:5432 msiserver@162.11.0.232 &
TUNNEL_PID=$!

# Wait for tunnel to establish
echo "⏳ Waiting for tunnel to establish..."
sleep 3

# Check if tunnel is active
if lsof -i :6543 >/dev/null 2>&1; then
    echo "✅ SSH tunnel created successfully"
    echo "   PID: $TUNNEL_PID"
    echo "   Port: localhost:6543 -> 127.0.0.1:5432"
    
    # Test database connection through tunnel
    echo ""
    echo "🔍 Testing database connection through tunnel..."
    PGPASSWORD=pgpass psql -h 127.0.0.1 -p 6543 -U sharedpg -d tid-project -c "SELECT 'Tunnel test successful' as status;" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Database connection through tunnel successful"
        
        # Update environment for direct connection
        echo ""
        # echo "🔧 Updating environment for tunnel..."
        # cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        
        # # Update .env to use tunnel
        # sed -i.bak 's/POSTGRES_HOST=.*/POSTGRES_HOST=127.0.0.1/' .env
        # sed -i.bak 's/POSTGRES_PORT=.*/POSTGRES_PORT=6543/' .env
        
        # echo "✅ Environment updated for tunnel"
        
        # Start application
        echo ""
        echo "🚀 Starting application..."
        npm run start:prod
        
    else
        echo "❌ Database connection through tunnel failed"
        kill $TUNNEL_PID 2>/dev/null
        exit 1
    fi
    
else
    echo "❌ SSH tunnel creation failed"
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    kill $TUNNEL_PID 2>/dev/null
    echo "✅ Tunnel cleaned up"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Keep script running
echo ""
echo "📋 Application running with SSH tunnel"
echo "   Tunnel PID: $TUNNEL_PID"
echo "   Press Ctrl+C to stop"
echo ""

# Wait for application to finish
wait
