#!/bin/bash

# Systemd-compatible start script
# This script stays in foreground and monitors both processes

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load environment variables
export NODE_ENV=production
export PORT=3000

# Create logs directory
mkdir -p logs

echo "Starting Irrigation Controller (systemd mode)..."

# Check if build exists
if [ ! -f "client/build/server/index.js" ]; then
    echo "ERROR: Frontend build not found. Run 'cd client && npm run build' first"
    exit 1
fi

# Cleanup function
cleanup() {
    echo "Shutting down Irrigation Controller..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
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

# Start frontend server in background
echo "Starting frontend server (port 3000)..."
node client/build/server/index.js > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started (PID: $FRONTEND_PID)"

# Wait a moment
sleep 2

# Check if frontend is still running
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo "ERROR: Frontend server failed to start. Check logs/frontend.log"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

echo "✓ Irrigation system started successfully"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:3001"

# Monitor both processes - if either dies, exit (systemd will restart)
while true; do
    if ! ps -p $API_PID > /dev/null 2>&1; then
        echo "ERROR: API server (PID: $API_PID) has stopped unexpectedly"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "ERROR: Frontend server (PID: $FRONTEND_PID) has stopped unexpectedly"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    
    sleep 5
done
