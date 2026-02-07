#!/bin/bash

# Irrigation Controller Deployment Script
# Builds and deploys the React Router 7 frontend

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Irrigation Controller Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm version: $(npm --version)"

# Create logs directory
echo ""
echo "Creating logs directory..."
mkdir -p logs
print_status "Logs directory ready"

# Install root dependencies
echo ""
echo "Installing server dependencies..."
npm install
print_status "Server dependencies installed"

# Install client dependencies
echo ""
echo "Installing client dependencies..."
cd client
npm install
print_status "Client dependencies installed"

# Build client
echo ""
echo "Building production frontend..."
npm run build
print_status "Frontend built successfully"

cd ..

# Verify build output
if [ ! -f "client/build/server/index.js" ]; then
    print_error "Build failed: client/build/server/index.js not found"
    exit 1
fi
print_status "Build verification passed"

# Check if PM2 is installed
echo ""
if command -v pm2 &> /dev/null; then
    print_status "PM2 is installed"

    read -p "Deploy using PM2? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Deploying with PM2..."

        # Stop existing processes
        pm2 stop irrigate-api irrigate-frontend 2>/dev/null || true

        # Start processes
        pm2 start ecosystem.config.js

        # Save PM2 process list
        pm2 save

        print_status "PM2 deployment complete"
        echo ""
        pm2 status
        echo ""
        echo "Useful commands:"
        echo "  pm2 status                - Check process status"
        echo "  pm2 logs                  - View all logs"
        echo "  pm2 logs irrigate-api     - View API logs"
        echo "  pm2 logs irrigate-frontend - View frontend logs"
        echo "  pm2 restart all           - Restart all processes"
        echo "  pm2 monit                 - Monitor processes"
    fi
else
    print_warning "PM2 is not installed"
    echo ""
    echo "To install PM2 globally:"
    echo "  sudo npm install -g pm2"
    echo ""
    echo "Then run this script again or start manually:"
    echo "  pm2 start ecosystem.config.js"
fi

echo ""
echo "=========================================="
print_status "Deployment script complete"
echo "=========================================="
echo ""
echo "Frontend: http://192.168.20.59:3000"
echo "API:      http://192.168.20.59:3001"
echo ""
