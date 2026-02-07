#!/bin/bash

# Stop script for Irrigation Controller Backend API
# Frontend runs separately on NAS via Docker

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Stopping Backend API..."

STOPPED=0

# Stop API server
if [ -f logs/api.pid ]; then
    API_PID=$(cat logs/api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        echo "Stopping API server (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
        sleep 1
        # Force kill if still running
        if ps -p $API_PID > /dev/null 2>&1; then
            kill -9 $API_PID 2>/dev/null || true
        fi
        STOPPED=1
    fi
    rm logs/api.pid
fi

if [ $STOPPED -eq 0 ]; then
    echo "No running API process found"

    # Check for any orphaned API process
    API_PROC=$(pgrep -f "node.*server/app.js" || true)

    if [ ! -z "$API_PROC" ]; then
        echo "Found orphaned API process (PID: $API_PROC), killing..."
        kill $API_PROC 2>/dev/null || true
    fi
else
    echo "✓ Backend API stopped"
fi
