#!/bin/bash

# Deploy Irrigation Controller to Raspberry Pi
# Usage: ./deploy-to-pi.sh

set -e

PI_HOST="jon@192.168.20.59"
PI_DIR="~/irrigation-controller"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================"
echo "  Deploying to Raspberry Pi"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "irrigation.service" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    echo -e "${RED}✗${NC} Error: Must run from project root directory"
    echo "  Current directory: $(pwd)"
    echo "  Expected: ~/redmercury/irrigate"
    exit 1
fi

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠${NC}  Warning: You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
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

# Check Pi connectivity
echo -e "${GREEN}🔗${NC} Testing connection to Raspberry Pi..."
if ! ssh -o ConnectTimeout=5 "$PI_HOST" 'echo "Connected"' >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Cannot connect to Pi at $PI_HOST"
    echo "  Check that:"
    echo "  - Pi is powered on"
    echo "  - Pi is connected to network"
    echo "  - SSH is enabled on Pi"
    echo "  - IP address is correct (192.168.20.59)"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected to Pi"
echo ""

# Deploy to Pi
echo -e "${GREEN}🚀${NC} Starting deployment on Raspberry Pi..."
echo ""

ssh -t "$PI_HOST" bash << ENDSSH
    set -e

    # Colors for remote output
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m'

    echo -e "\${GREEN}📁${NC} Navigating to project directory..."
    cd $PI_DIR || {
        echo -e "\${RED}✗${NC} Directory $PI_DIR not found on Pi"
        exit 1
    }

    echo -e "\${GREEN}⬇️${NC}  Pulling latest changes..."
    git fetch origin
    git pull origin $BRANCH

    echo ""
    echo -e "\${GREEN}📦${NC} Installing dependencies..."
    npm install --production

    cd client || {
        echo -e "\${RED}✗${NC} client directory not found"
        exit 1
    }
    npm install --production

    echo ""
    echo -e "\${YELLOW}🔨 Building frontend (this takes 3-10 minutes on Pi)...${NC}"
    echo "Started at: \$(date '+%H:%M:%S')"

    if npm run build; then
        echo -e "\${GREEN}✓${NC} Build completed at: \$(date '+%H:%M:%S')"
    else
        echo -e "\${RED}✗${NC} Build failed"
        echo "  Try increasing swap space if out of memory"
        exit 1
    fi

    # Verify build output
    if [ ! -f "build/server/index.js" ]; then
        echo -e "\${RED}✗${NC} Build output not found: build/server/index.js"
        exit 1
    fi

    cd ..

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
    sleep 5

    echo ""
    echo -e "\${GREEN}📊${NC} Service status:"
    sudo systemctl status irrigation.service --no-pager -l || true

    echo ""
    echo -e "\${GREEN}🔍${NC} Checking processes..."
    echo "Node processes running:"
    ps aux | grep -E "node.*(server/app.js|build/server/index.js)" | grep -v grep || echo "No node processes found!"

    echo ""
    echo -e "\${GREEN}🌐${NC} Testing endpoints..."

    # Test frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo -e "\${GREEN}✓${NC} Frontend responding on port 3000"
    else
        echo -e "\${RED}✗${NC} Frontend not responding on port 3000"
    fi

    # Test API
    if curl -f http://localhost:3001/weather/getBasicWeather >/dev/null 2>&1; then
        echo -e "\${GREEN}✓${NC} API responding on port 3001"
    else
        echo -e "\${RED}✗${NC} API not responding on port 3001"
    fi

    echo ""
    echo -e "\${GREEN}✓${NC} Deployment complete!"
ENDSSH

DEPLOY_EXIT=$?

echo ""
if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "============================================"
    echo -e "${GREEN}✓ Deployment finished successfully${NC}"
    echo "============================================"
    echo ""
    echo "Access points:"
    echo "  Frontend: http://192.168.20.59:3000"
    echo "  API:      http://192.168.20.59:3001"
    echo ""
    echo "To view logs:"
    echo "  ssh $PI_HOST 'sudo journalctl -u irrigation.service -f'"
else
    echo "============================================"
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "============================================"
    echo ""
    echo "To troubleshoot:"
    echo "  ssh $PI_HOST"
    echo "  cd $PI_DIR"
    echo "  sudo journalctl -u irrigation.service -n 100"
    exit 1
fi
