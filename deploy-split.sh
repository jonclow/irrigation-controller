#!/bin/bash

# Deploy Irrigation Controller (Split Deployment)
# Frontend to NAS, Backend to Pi
# Usage: ./deploy-split.sh

set -e

NAS_HOST="nas"  # Uses SSH config alias

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================"
echo "  Irrigation Controller"
echo "  Split Deployment"
echo "============================================"
echo ""
echo "Architecture:"
echo "  📱 Frontend → NAS ($NAS_HOST)"
echo "  🔧 Backend  → Pi (jon@192.168.20.59)"
echo ""

# Prompt for deployment targets
echo "What do you want to deploy?"
echo "  1) Both (NAS frontend + Pi backend)"
echo "  2) NAS frontend only"
echo "  3) Pi backend only"
echo ""
read -p "Choice (1-3): " -n 1 -r CHOICE
echo ""
echo ""

case $CHOICE in
    1)
        echo -e "${BLUE}Deploying to both NAS and Pi...${NC}"
        echo ""

        # Check git status once
        if [[ -n $(git status -s) ]]; then
            echo -e "${YELLOW}⚠${NC}  Warning: You have uncommitted changes"
            git status -s
            echo ""
            read -p "Continue? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi

        # Push to git once
        echo -e "${GREEN}📤${NC} Pushing to git remote..."
        git push origin $(git branch --show-current)
        echo ""

        # Deploy to Pi first (backend)
        echo "=========================================="
        echo "  Step 1/2: Deploying Backend to Pi"
        echo "=========================================="
        ./deploy-pi-backend.sh

        echo ""
        echo "=========================================="
        echo "  Step 2/2: Deploying Frontend to NAS"
        echo "=========================================="
        ./deploy-nas-frontend.sh "$NAS_HOST"

        echo ""
        echo "============================================"
        echo -e "${GREEN}✓ Full deployment complete!${NC}"
        echo "============================================"
        echo ""
        echo "Access: http://<nas-ip>"
        echo "  ↓ Nginx reverse proxy"
        echo "  Frontend SSR (NAS:3000)"
        echo "    ↓ API calls"
        echo "    Backend API (Pi:3001)"
        ;;
    2)
        echo -e "${BLUE}Deploying frontend to NAS only...${NC}"
        echo ""
        ./deploy-nas-frontend.sh "$NAS_HOST"
        ;;
    3)
        echo -e "${BLUE}Deploying backend to Pi only...${NC}"
        echo ""
        ./deploy-pi-backend.sh
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
