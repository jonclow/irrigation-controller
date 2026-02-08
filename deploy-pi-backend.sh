#!/bin/bash

# Deploy Irrigation Controller Backend to Raspberry Pi
# Usage: ./deploy-pi-backend.sh

set -e

PI_HOST="irrigation"
PI_DIR="~/irrigation-controller"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "  Deploying Backend to Raspberry Pi"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "irrigation.service" ] || [ ! -d "server" ]; then
    echo -e "${RED}✗${NC} Error: Must run from project root directory"
    exit 1
fi

# Check git status
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠${NC}  Warning: You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current branch and commit
BRANCH=$(git branch --show-current)
COMMIT=$(git rev-parse --short HEAD)

echo "Branch: $BRANCH"
echo "Commit: $COMMIT"
echo ""

# Push to remote
echo -e "${GREEN}📤${NC} Pushing to git remote..."
if git push origin "$BRANCH"; then
    echo -e "${GREEN}✓${NC} Pushed to remote"
else
    echo -e "${RED}✗${NC} Failed to push to remote"
    exit 1
fi
echo ""

# Test Pi connectivity
echo -e "${GREEN}🔗${NC} Testing connection to Raspberry Pi..."
if ! ssh -o ConnectTimeout=5 "$PI_HOST" 'echo "Connected"' >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Cannot connect to Pi at $PI_HOST"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected to Pi"
echo ""

# Deploy backend to Pi
echo -e "${GREEN}🚀${NC} Starting backend deployment..."
echo ""

ssh -t "$PI_HOST" bash << ENDSSH
    set -e

    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m'

    echo -e "\${GREEN}📁${NC} Navigating to project directory..."
    cd $PI_DIR || {
        echo -e "\${RED}✗${NC} Directory $PI_DIR not found"
        exit 1
    }

    echo -e "\${GREEN}⬇️${NC}  Pulling latest changes..."
    git fetch origin
    git pull origin $BRANCH

    echo ""
    echo -e "\${GREEN}📦${NC} Installing backend dependencies..."
    npm install

    echo ""
    echo -e "\${GREEN}🔄${NC} Restarting irrigation service..."
    if sudo systemctl restart irrigation.service; then
        echo -e "\${GREEN}✓${NC} Service restarted"
    else
        echo -e "\${RED}✗${NC} Failed to restart service"
        exit 1
    fi

    echo ""
    echo -e "\${GREEN}⏳${NC} Waiting for service to start..."
    sleep 3

    echo ""
    echo -e "\${GREEN}📊${NC} Service status:"
    sudo systemctl status irrigation.service --no-pager -l || true

    echo ""
    echo -e "\${GREEN}🔍${NC} Checking process..."
    ps aux | grep -E "node.*server/app.js" | grep -v grep || echo "Warning: Process not found"

    echo ""
    echo -e "\${GREEN}🌐${NC} Testing API endpoint..."
    if curl -f http://localhost:3001/weather/getBasicWeather >/dev/null 2>&1; then
        echo -e "\${GREEN}✓${NC} API responding on port 3001"
    else
        echo -e "\${RED}✗${NC} API not responding on port 3001"
    fi

    echo ""
    echo -e "\${GREEN}💾${NC} Memory usage:"
    free -h | head -2

    echo ""
    echo -e "\${GREEN}✓${NC} Backend deployment complete!"
ENDSSH

DEPLOY_EXIT=$?

echo ""
if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "============================================"
    echo -e "${GREEN}✓ Pi backend deployment successful${NC}"
    echo "============================================"
    echo ""
    echo "API endpoint: http://192.168.20.59:3001"
    echo ""
    echo "To view logs:"
    echo "  ssh $PI_HOST 'sudo journalctl -u irrigation.service -f'"
else
    echo "============================================"
    echo -e "${RED}✗ Pi backend deployment failed${NC}"
    echo "============================================"
    echo ""
    echo "To troubleshoot:"
    echo "  ssh $PI_HOST"
    echo "  cd $PI_DIR"
    echo "  sudo journalctl -u irrigation.service -n 100"
    exit 1
fi
