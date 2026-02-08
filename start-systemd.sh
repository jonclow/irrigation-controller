#!/bin/bash

# Systemd-compatible start script for Backend API
# Frontend runs separately on NAS via Docker

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load NVM to use correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Load environment variables
export NODE_ENV=production

# Create logs directory
mkdir -p logs

echo "Starting Irrigation Controller Backend API..."

# Cleanup function
cleanup() {
    echo "Shutting down backend API..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start API server in background
echo "Starting API server (port 3001)..."
node server/app.js > logs/api.log 2>&1 &
API_PID=$!
echo "API server started (PID: $API_PID)"

# Wait for API to be ready
sleep 3

# Check if API is still running
if ! ps -p $API_PID > /dev/null; then
    echo "ERROR: API server failed to start. Check logs/api.log"
    exit 1
fi

echo "✓ Backend API started successfully"
echo "  API: http://localhost:3001"

# Monitor process - if it dies, exit (systemd will restart)
while true; do
    if ! ps -p $API_PID > /dev/null 2>&1; then
        echo "ERROR: API server (PID: $API_PID) has stopped unexpectedly"
        exit 1
    fi
    sleep 5
done
