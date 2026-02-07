#!/bin/bash

# Deploy Irrigation Controller Frontend to NAS Server
# Usage: ./deploy-nas-frontend.sh

set -e

# Configuration
NAS_HOST="nas"  # Uses SSH config alias
NAS_DIR="/volume1/Web/irrigation-frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "  Deploying Frontend to NAS"
echo "============================================"
echo ""
echo "Target: $NAS_HOST"
echo "Directory: $NAS_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "irrigation.service" ] || [ ! -d "client" ]; then
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

# Test NAS connectivity
echo -e "${GREEN}🔗${NC} Testing connection to NAS..."
if ! ssh -o ConnectTimeout=5 "$NAS_HOST" 'echo "Connected"' >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Cannot connect to NAS at $NAS_HOST"
    echo "  Check that:"
    echo "  - NAS is powered on"
    echo "  - SSH is enabled"
    echo "  - Hostname/IP is correct"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected to NAS"
echo ""

# Deploy frontend to NAS
echo -e "${GREEN}🚀${NC} Starting frontend deployment..."
echo ""

ssh -t "$NAS_HOST" bash << ENDSSH
    set -e

    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m'

    echo -e "\${GREEN}📁${NC} Navigating to project directory..."
    cd $NAS_DIR || {
        echo -e "\${RED}✗${NC} Directory $NAS_DIR not found"
        echo "  Create it first and clone/sync the client code"
        exit 1
    }

    echo -e "\${GREEN}⬇️${NC}  Pulling latest changes..."
    git fetch origin
    git pull origin $BRANCH

    echo ""
    echo -e "\${GREEN}📦${NC} Installing dependencies..."
    npm install --production

    echo ""
    echo -e "\${YELLOW}🔨 Building frontend (this takes 2-5 minutes)...${NC}"
    echo "Started at: \$(date '+%H:%M:%S')"

    if npm run build; then
        echo -e "\${GREEN}✓${NC} Build completed at: \$(date '+%H:%M:%S')"
    else
        echo -e "\${RED}✗${NC} Build failed"
        exit 1
    fi

    # Verify build output
    if [ ! -f "build/server/index.js" ]; then
        echo -e "\${RED}✗${NC} Build output not found: build/server/index.js"
        exit 1
    fi

    echo ""
    echo -e "\${GREEN}🔄${NC} Restarting irrigation-frontend service..."
    if sudo systemctl restart irrigation-frontend.service; then
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
    sudo systemctl status irrigation-frontend.service --no-pager -l || true

    echo ""
    echo -e "\${GREEN}🔍${NC} Checking process..."
    ps aux | grep -E "node.*build/server/index.js" | grep -v grep || echo "Warning: Process not found"

    echo ""
    echo -e "\${GREEN}🌐${NC} Testing frontend endpoint..."
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo -e "\${GREEN}✓${NC} Frontend responding on port 3000"
    else
        echo -e "\${RED}✗${NC} Frontend not responding on port 3000"
    fi

    echo ""
    echo -e "\${GREEN}✓${NC} Frontend deployment complete!"
ENDSSH

DEPLOY_EXIT=$?

echo ""
if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "============================================"
    echo -e "${GREEN}✓ NAS frontend deployment successful${NC}"
    echo "============================================"
    echo ""
    echo "Access frontend via:"
    echo "  NAS nginx: http://<nas-ip>"
    echo "  Direct: http://<nas-ip>:3000"
    echo ""
    echo "To view logs:"
    echo "  ssh $NAS_HOST 'sudo journalctl -u irrigation-frontend.service -f'"
else
    echo "============================================"
    echo -e "${RED}✗ NAS frontend deployment failed${NC}"
    echo "============================================"
    echo ""
    echo "To troubleshoot:"
    echo "  ssh $NAS_HOST"
    echo "  cd $NAS_DIR"
    echo "  sudo journalctl -u irrigation-frontend.service -n 100"
    exit 1
fi
