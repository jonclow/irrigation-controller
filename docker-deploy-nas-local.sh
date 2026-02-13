#!/bin/bash

# Deploy Irrigation Frontend to Asustor NAS via Docker
# Local Build Strategy: Build image locally with Node 24 LTS, transfer to NAS
# Usage: ./docker-deploy-nas-local.sh [--no-test]

set -e

NAS_HOST="nas"
DEPLOY_DIR="/volume1/home/jonclow/irrigation"
IMAGE_NAME="irrigation-frontend"
IMAGE_TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
NAS_ARCH="linux/amd64"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================"
echo "  Irrigation Frontend - Local Build Deploy"
echo "  Build: Local (Node 24 LTS)"
echo "  Target: Asustor NAS (Docker)"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.nas.yml" ] || [ ! -d "client" ]; then
    echo -e "${RED}✗${NC} Error: Must run from project root directory"
    exit 1
fi

# Parse arguments
SKIP_TEST="false"
if [ "$1" == "--no-test" ]; then
    SKIP_TEST="true"
    echo -e "${YELLOW}ℹ${NC}  Skipping local image test"
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
echo "Node version: $(node --version)"
echo "Docker version: $(docker --version | cut -d' ' -f3 | tr -d ',')"
echo ""

# Push to git
echo -e "${GREEN}📤${NC} Pushing to git remote..."
if git push origin "$BRANCH"; then
    echo -e "${GREEN}✓${NC} Pushed to remote"
else
    echo -e "${YELLOW}⚠${NC}  Warning: Failed to push to remote (continuing anyway)"
fi
echo ""

# Build image locally
echo -e "${BLUE}🔨${NC} Building Docker image locally..."
echo "Platform: $NAS_ARCH"
echo "This may take 2-3 minutes..."
echo ""

cd client

if docker build --platform "$NAS_ARCH" -t "$FULL_IMAGE" . ; then
    echo ""
    echo -e "${GREEN}✓${NC} Image built successfully"
else
    echo -e "${RED}✗${NC} Build failed"
    exit 1
fi

cd ..

# Check image size
IMAGE_SIZE=$(docker images "$FULL_IMAGE" --format "{{.Size}}")
echo -e "${GREEN}📦${NC} Image size: $IMAGE_SIZE"
echo ""

# Test image locally (optional)
if [ "$SKIP_TEST" == "false" ]; then
    echo -e "${BLUE}🧪${NC} Testing image locally..."

    # Start container for quick test
    TEST_CONTAINER="irrigation-test-$$"
    docker run -d \
        --name "$TEST_CONTAINER" \
        -p 3333:3000 \
        -e VITE_BASE_URL=http://192.168.20.59:3001 \
        "$FULL_IMAGE" > /dev/null

    # Wait for container to be ready
    sleep 5

    # Test endpoint
    if curl -f -s http://localhost:3333 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Local test passed"
    else
        echo -e "${YELLOW}⚠${NC}  Local test failed (continuing anyway)"
    fi

    # Cleanup test container
    docker stop "$TEST_CONTAINER" > /dev/null 2>&1
    docker rm "$TEST_CONTAINER" > /dev/null 2>&1
    echo ""
fi

# Test NAS connectivity
echo -e "${GREEN}🔗${NC} Testing connection to NAS..."
if ! ssh -o ConnectTimeout=5 "$NAS_HOST" 'echo "Connected"' >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Cannot connect to NAS at $NAS_HOST"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected to NAS"
echo ""

# Save and transfer image
echo -e "${BLUE}📤${NC} Transferring image to NAS..."
echo "Saving image to tarball..."

TEMP_TAR="/tmp/${IMAGE_NAME}-${COMMIT}.tar.gz"

docker save "$FULL_IMAGE" | gzip > "$TEMP_TAR"
TAR_SIZE=$(du -h "$TEMP_TAR" | cut -f1)
echo -e "${GREEN}✓${NC} Tarball created: $TAR_SIZE"

echo "Uploading to NAS..."
if scp -q "$TEMP_TAR" "$NAS_HOST:/tmp/" ; then
    echo -e "${GREEN}✓${NC} Image uploaded to NAS"
else
    echo -e "${RED}✗${NC} Failed to upload image"
    rm "$TEMP_TAR"
    exit 1
fi

# Cleanup local tarball
rm "$TEMP_TAR"
echo ""

# Deploy on NAS
echo -e "${BLUE}🐳${NC} Deploying on NAS..."
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

    echo -e "\${BLUE}📥\${NC} Loading image into Docker..."
    if docker load < /tmp/${IMAGE_NAME}-${COMMIT}.tar.gz ; then
        echo -e "\${GREEN}✓\${NC} Image loaded"
    else
        echo -e "\${RED}✗\${NC} Failed to load image"
        exit 1
    fi

    # Cleanup tarball
    rm /tmp/${IMAGE_NAME}-${COMMIT}.tar.gz
    echo ""

    # Clean up dangling images from previous deployments
    echo -e "\${YELLOW}🧹\${NC} Cleaning up old images..."
    DANGLING=\$(docker images --filter 'dangling=true' -q --no-trunc)
    if [ -n "\$DANGLING" ]; then
        echo "\$DANGLING" | xargs docker rmi 2>/dev/null || true
        echo -e "\${GREEN}✓\${NC} Old images cleaned"
    else
        echo -e "\${GREEN}✓\${NC} No dangling images to clean"
    fi
    echo ""

    # Stop existing container
    echo -e "\${YELLOW}🛑\${NC} Stopping existing container (if any)..."
    docker compose -f docker-compose.nas.yml down 2>/dev/null || true
    echo ""

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
    echo "Built with: Node $(node --version)"
    echo "Image size: $IMAGE_SIZE"
    echo ""
    echo "Access frontend at:"
    echo "  http://irrigation.local/"
    echo "  http://192.168.20.92/"
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
