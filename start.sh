#!/bin/bash

# Simple start script (alternative to PM2)
# Starts both API and frontend servers

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load environment variables
export NODE_ENV=production
export PORT=3000

# Create logs directory
mkdir -p logs

echo "Starting Irrigation Controller..."

# Check if build exists
if [ ! -f "client/build/server/index.js" ]; then
    echo "ERROR: Frontend build not found. Run ./deploy.sh first"
    exit 1
fi

# Start API server in background
echo "Starting API server (port 3001)..."
node server/app.js > logs/api.log 2>&1 &
API_PID=$!
echo "API server started (PID: $API_PID)"

# Save PID
echo $API_PID > logs/api.pid

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

# Save PID
echo $FRONTEND_PID > logs/frontend.pid

# Wait a moment
sleep 2

# Check if frontend is still running
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo "ERROR: Frontend server failed to start. Check logs/frontend.log"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "✓ Irrigation system started successfully"
echo ""
echo "  Frontend: http://192.168.20.59:3000"
echo "  API:      http://192.168.20.59:3001"
echo ""
echo "  Logs:"
echo "    tail -f logs/api.log"
echo "    tail -f logs/frontend.log"
echo ""
echo "  To stop: ./stop.sh"
echo ""
