#!/bin/bash

# Stop script for Irrigation Controller

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Stopping Irrigation Controller..."

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

# Stop frontend server
if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 1
        # Force kill if still running
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null || true
        fi
        STOPPED=1
    fi
    rm logs/frontend.pid
fi

if [ $STOPPED -eq 0 ]; then
    echo "No running processes found"

    # Check for any node processes that might be our servers
    API_PROC=$(pgrep -f "node.*server/app.js" || true)
    FRONTEND_PROC=$(pgrep -f "node.*build/server/index.js" || true)

    if [ ! -z "$API_PROC" ]; then
        echo "Found orphaned API process (PID: $API_PROC), killing..."
        kill $API_PROC 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PROC" ]; then
        echo "Found orphaned frontend process (PID: $FRONTEND_PROC), killing..."
        kill $FRONTEND_PROC 2>/dev/null || true
    fi
else
    echo "✓ Irrigation system stopped"
fi
