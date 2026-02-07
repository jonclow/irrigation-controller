#!/bin/bash

# Setup Apache as Reverse Proxy for Irrigation Controller
# Run this script to configure Apache on the Asustor NAS

set -e

NAS_HOST="nas"
APACHE_CONF_DIR="/volume1/.@plugins/AppCentral/httpd-2.4.43/data/conf"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================"
echo "  Apache Reverse Proxy Setup"
echo "  Irrigation Controller"
echo "============================================"
echo ""

# Check connectivity
echo -e "${GREEN}🔗${NC} Testing connection to NAS..."
if ! ssh -o ConnectTimeout=5 "$NAS_HOST" 'echo "Connected"' >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} Cannot connect to NAS"
    exit 1
fi
echo -e "${GREEN}✓${NC} Connected"
echo ""

# Deploy configuration
echo -e "${BLUE}📝${NC} Deploying Apache configuration..."
echo ""

ssh -t "$NAS_HOST" sh << 'ENDSSH'
    set -e

    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    NC='\033[0m'

    APACHE_CONF="/volume1/.@plugins/AppCentral/httpd-2.4.43/data/conf"

    # Enable required modules
    echo -e "${GREEN}📦${NC} Enabling required Apache modules..."

    cd "$APACHE_CONF/mods-enabled"

    # Enable proxy_http if not already enabled
    if [ ! -L proxy_http.conf ]; then
        ln -s ../mods-available/proxy_http.conf proxy_http.conf
        echo "  ✓ Enabled mod_proxy_http"
    else
        echo "  ✓ mod_proxy_http already enabled"
    fi

    # Enable rewrite if not already enabled
    if [ ! -L rewrite.conf ]; then
        ln -s ../mods-available/rewrite.conf rewrite.conf 2>/dev/null || echo "  ⚠ mod_rewrite may not be available"
    fi

    # Enable headers if not already enabled
    if [ ! -L headers.conf ]; then
        ln -s ../mods-available/headers.conf headers.conf 2>/dev/null || echo "  ⚠ mod_headers may not be available"
    fi

    echo ""

    # Create irrigation site configuration
    echo -e "${GREEN}📄${NC} Creating irrigation site configuration..."

    cat > "$APACHE_CONF/sites-available/irrigation" << 'EOF'
# Irrigation Controller - Apache Reverse Proxy Configuration

# Listen on port 80
Listen 80

<VirtualHost *:80>
    ServerName 192.168.20.92
    ServerAdmin jonclow@redmercury.co.nz

    # Reverse proxy to Docker container
    ProxyPreserveHost On
    ProxyPass /socket.io/ http://localhost:3000/socket.io/
    ProxyPassReverse /socket.io/ http://localhost:3000/socket.io/
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Proxy settings for WebSocket/Socket.IO
    <Location /socket.io/>
        ProxyPass http://localhost:3000/socket.io/
        ProxyPassReverse http://localhost:3000/socket.io/
        # Enable WebSocket proxying
        RewriteEngine On
        RewriteCond %{HTTP:Upgrade} =websocket [NC]
        RewriteRule /(.*)  ws://localhost:3000/socket.io/$1 [P,L]
    </Location>

    # Security headers
    <IfModule mod_headers.c>
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>

    # Logging
    ErrorLog /volume1/.@plugins/AppCentral/httpd-2.4.43/data/logs/irrigation-error.log
    CustomLog /volume1/.@plugins/AppCentral/httpd-2.4.43/data/logs/irrigation-access.log combined

    # Timeout settings
    ProxyTimeout 300
    Timeout 300
</VirtualHost>
EOF

    echo "  ✓ Created irrigation site config"
    echo ""

    # Disable default site
    echo -e "${YELLOW}🔧${NC} Disabling default site..."
    rm -f "$APACHE_CONF/sites-enabled/@default" 2>/dev/null || true
    echo "  ✓ Default site disabled"
    echo ""

    # Enable irrigation site
    echo -e "${GREEN}🔗${NC} Enabling irrigation site..."
    cd "$APACHE_CONF/sites-enabled"
    ln -sf ../sites-available/irrigation irrigation
    echo "  ✓ Irrigation site enabled"
    echo ""

    # Create logs directory if it doesn't exist
    mkdir -p /volume1/.@plugins/AppCentral/httpd-2.4.43/data/logs

    echo -e "${GREEN}✓${NC} Apache configuration complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy Docker container: ./docker-deploy-nas.sh"
    echo "  2. Start Apache (see instructions below)"
ENDSSH

echo ""
echo "============================================"
echo -e "${GREEN}✓ Apache configured successfully${NC}"
echo "============================================"
echo ""
echo "To start Apache on the NAS:"
echo ""
echo "Option 1: Via Asustor ADM (Recommended)"
echo "  1. Log into ADM at https://192.168.20.92:8014"
echo "  2. Go to App Central"
echo "  3. Find 'Apache Http Server'"
echo "  4. Click 'Start' or 'Enable'"
echo ""
echo "Option 2: Via Command Line (if available)"
echo "  ssh nas '/volume1/.@plugins/AppCentral/httpd-2.4.43/CONTROL/start-stop.sh start'"
echo ""
echo "After starting Apache:"
echo "  - Deploy Docker: ./docker-deploy-nas.sh"
echo "  - Access at: http://192.168.20.92/"
echo ""
