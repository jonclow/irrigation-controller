#!/bin/bash

# Deploy Irrigation Frontend to Asustor NAS via Docker
# Usage: ./docker-deploy-nas.sh [--build|--no-build]

set -e

NAS_HOST="nas"
DEPLOY_DIR="/volume1/Web/irrigation-frontend"
COMPOSE_FILE="docker-compose.nas.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================"
echo "  Irrigation Frontend - Docker Deployment"
echo "  Target: Asustor NAS (Docker)"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "$COMPOSE_FILE" ] || [ ! -d "client" ]; then
    echo -e "${RED}✗${NC} Error: Must run from project root directory"
    exit 1
fi

# Parse arguments
BUILD_IMAGE="true"
if [ "$1" == "--no-build" ]; then
    BUILD_IMAGE="false"
    echo -e "${YELLOW}ℹ${NC}  Skipping image build (using existing image)"
    echo ""
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

# Push to git
echo -e "${GREEN}📤${NC} Pushing to git remote..."
if git push origin "$BRANCH"; then
    echo -e "${GREEN}✓${NC} Pushed to remote"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Failed to push to remote (continuing anyway)"
fi
echo ""

# Test NAS connectivity
echo -e "${GREEN}🔗${NC} Testing connection to NAS..."
if ! ssh -o ConnectTimeout=5 "$NAS_HOST" 'echo "Connected"' >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Cannot connect to NAS at $NAS_HOST"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected to NAS"
echo ""

# Create/update deployment directory
echo -e "${GREEN}📁${NC} Setting up deployment directory on NAS..."
ssh "$NAS_HOST" "mkdir -p $DEPLOY_DIR"

# Sync files to NAS
echo -e "${GREEN}📦${NC} Syncing files to NAS..."
rsync -avz --delete --exclude 'node_modules' --exclude 'build' --exclude '.react-router' \
  client/ \
  docker-compose.nas.yml \
  "$NAS_HOST:$DEPLOY_DIR/"

echo -e "${GREEN}✓${NC} Files synced"
echo ""

# Deploy on NAS
echo -e "${BLUE}🐳${NC} Deploying on NAS via Docker..."
echo ""

ssh -t "$NAS_HOST" sh << ENDSSH
    set -e

    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    BLUE='\033[0;34m'
    NC='\033[0m'

    cd $DEPLOY_DIR

    # Check Docker
    if ! docker --version >/dev/null 2>&1; then
        echo -e "\${RED}✗\${NC} Docker not available"
        exit 1
    fi

    echo -e "\${BLUE}Docker version:\${NC} \$(docker --version)"
    echo ""

    # Stop existing container if running
    echo -e "\${YELLOW}🛑\${NC} Stopping existing container (if any)..."
    docker compose -f docker-compose.nas.yml down 2>/dev/null || true
    echo ""

    if [ "$BUILD_IMAGE" == "true" ]; then
        # Build new image
        echo -e "\${BLUE}🔨\${NC} Building Docker image..."
        echo "This may take 3-5 minutes..."
        echo ""

        if docker compose -f docker-compose.nas.yml build --no-cache; then
            echo ""
            echo -e "\${GREEN}✓\${NC} Image built successfully"
        else
            echo -e "\${RED}✗\${NC} Build failed"
            exit 1
        fi
        echo ""
    fi

    # Start container
    echo -e "\${GREEN}🚀\${NC} Starting container..."
    if docker compose -f docker-compose.nas.yml up -d; then
        echo -e "\${GREEN}✓\${NC} Container started"
    else
        echo -e "\${RED}✗\${NC} Failed to start container"
        exit 1
    fi
    echo ""

    # Wait for container to be healthy
    echo -e "\${YELLOW}⏳\${NC} Waiting for container to be ready..."
    sleep 5

    # Check container status
    echo ""
    echo -e "\${GREEN}📊\${NC} Container status:"
    docker compose -f docker-compose.nas.yml ps
    echo ""

    # Check logs
    echo -e "\${BLUE}📋\${NC} Recent logs:"
    docker compose -f docker-compose.nas.yml logs --tail=20
    echo ""

    # Test endpoint
    echo -e "\${GREEN}🌐\${NC} Testing endpoint..."
    if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "\${GREEN}✓\${NC} Frontend responding on port 3000"
    else
        echo -e "\${RED}✗\${NC} Frontend not responding"
        echo "Check logs: docker compose -f $DEPLOY_DIR/docker-compose.nas.yml logs -f"
    fi

    echo ""
    echo -e "\${GREEN}✓\${NC} Deployment complete!"
ENDSSH

DEPLOY_EXIT=$?

echo ""
if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "============================================"
    echo -e "${GREEN}✓ Deployment successful${NC}"
    echo "============================================"
    echo ""
    echo "Access frontend at:"
    echo "  Direct: http://<nas-ip>:3000"
    echo "  (Configure nginx to proxy to port 3000)"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    ssh $NAS_HOST 'cd $DEPLOY_DIR && docker compose -f docker-compose.nas.yml logs -f'"
    echo "  Restart:      ssh $NAS_HOST 'cd $DEPLOY_DIR && docker compose -f docker-compose.nas.yml restart'"
    echo "  Stop:         ssh $NAS_HOST 'cd $DEPLOY_DIR && docker compose -f docker-compose.nas.yml down'"
    echo "  Status:       ssh $NAS_HOST 'cd $DEPLOY_DIR && docker compose -f docker-compose.nas.yml ps'"
    echo ""
else
    echo "============================================"
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "============================================"
    echo ""
    echo "Check logs:"
    echo "  ssh $NAS_HOST 'cd $DEPLOY_DIR && docker compose -f docker-compose.nas.yml logs'"
    exit 1
fi
