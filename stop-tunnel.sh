#!/bin/bash

# Script untuk menghentikan SSH tunnel
# Jalankan script ini untuk membersihkan tunnel yang aktif

echo "Stopping SSH tunnels..."

# Hentikan semua proses SSH tunnel yang terkait dengan port 5433
pkill -f "ssh.*5433:localhost:5432"

# Hentikan autossh jika ada
pkill -f "autossh.*5433:localhost:5432"

echo "SSH tunnels stopped."
echo "You can now start a new tunnel with: ./ssh-tunnel.sh"
