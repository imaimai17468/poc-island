#!/bin/bash
set -e

PORT=${1:-5173}

echo "Starting cloudflared tunnel for localhost:$PORT..."
echo "Press Ctrl+C to stop"
echo ""

cloudflared tunnel --url "http://localhost:$PORT"
