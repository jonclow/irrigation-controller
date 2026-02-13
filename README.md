# Irrigation Controller

Smart irrigation system with web-based control interface, automated scheduling, and weather integration.

## Architecture

**Split Deployment:**
- **Frontend (NAS):** React Router 7 SSR in Docker container, proxied via custom nginx
- **Backend (Pi):** Node.js Express API with PostgreSQL, serial port control for valves

```
Browser → Nginx (NAS:80) → Docker (localhost:3000) → API (Pi:3001) → Hardware
```

### Frontend - Asustor NAS (192.168.20.92)
- **Stack:** React 19 + React Router 7 (SSR) + Recharts + Socket.IO Client
- **Deployment:** Docker container (irrigation-frontend)
- **Reverse Proxy:** Custom nginx instance on NAS host
- **Location:** `/volume1/home/jonclow/irrigation/`
- **Access:** `http://irrigation.home/` or `http://192.168.20.92/`
- **Auto-restart:** Docker (unless-stopped), nginx (manual or cron)

### Backend - Raspberry Pi 4 (192.168.20.59)
- **Stack:** Node.js 22 (NVM) + Express + Socket.IO + PostgreSQL
- **Service:** systemd (`irrigation.service`)
- **Location:** `~/irrigation-controller/`
- **Hardware:** Serial port control for 5-zone valve system
- **Access:** `http://192.168.20.59:3001/`

## NAS Deployment Files

All files in `/volume1/home/jonclow/irrigation/`:

```
/volume1/home/jonclow/irrigation/
├── nginx.conf              # Nginx proxy configuration (persistent)
├── docker-compose.nas.yml  # Docker container definition
├── start-nginx.sh          # Start nginx proxy script
├── stop-nginx.sh           # Stop nginx proxy script
├── README.md               # Detailed documentation (on NAS)
├── nginx.pid               # Nginx process ID (generated)
├── nginx-access.log        # Access logs (generated)
└── nginx-error.log         # Error logs (generated)
```

## First-Time Setup

### NAS (Frontend)

1. **Disable Web Center** (prevents config regeneration):
   - Open ADM → Web Center → Web Server
   - Uncheck "Enable the web server"
   - Click Apply

2. **Deploy the container**:
   ```bash
   cd ~/redmercury/irrigate
   ./docker-deploy-nas-local.sh
   ```

3. **Start nginx**:
   ```bash
   ssh nas
   cd /volume1/home/jonclow/irrigation
   sudo ./start-nginx.sh
   ```

4. **(Optional) Auto-start nginx on boot**:
   ```bash
   ssh nas
   sudo crontab -e
   # Add: @reboot sleep 30 && /volume1/home/jonclow/irrigation/start-nginx.sh
   ```

### Pi (Backend)

```bash
# On Pi, install systemd service:
sudo cp irrigation.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable irrigation
sudo systemctl start irrigation
```

## Daily Operations

### Deploy Frontend Updates

From your development machine:

```bash
cd ~/redmercury/irrigate
git commit -am "Your changes"
./docker-deploy-nas-local.sh
```

**What happens:**
1. Builds Docker image locally with Node 24 LTS
2. Tests image locally on port 3333
3. Transfers compressed image to NAS (~129MB)
4. Loads image on NAS
5. Restarts container
6. Cleans up old dangling images

**Note:** Nginx continues running, only the Docker container restarts.

### Deploy Backend Updates

From your development machine:

```bash
cd ~/redmercury/irrigate
git commit -am "Your changes"
./deploy-pi-backend.sh
```

**What happens:**
1. Pushes to git
2. SSHs to Pi, pulls latest changes
3. Installs npm dependencies
4. Rebuilds native modules (serialport) for Node 22
5. Restarts systemd service

### Manage Nginx (NAS)

```bash
# Start
ssh nas "cd /volume1/home/jonclow/irrigation && sudo ./start-nginx.sh"

# Stop
ssh nas "cd /volume1/home/jonclow/irrigation && sudo ./stop-nginx.sh"

# Restart (after config changes)
ssh nas "cd /volume1/home/jonclow/irrigation && sudo ./stop-nginx.sh && sudo ./start-nginx.sh"

# View logs
ssh nas "tail -f /volume1/home/jonclow/irrigation/nginx-access.log"
ssh nas "tail -f /volume1/home/jonclow/irrigation/nginx-error.log"

# Check status
ssh nas "ps aux | grep nginx | grep irrigation"
```

### Manage Docker Container (NAS)

```bash
ssh nas
cd /volume1/home/jonclow/irrigation

# View status
docker compose -f docker-compose.nas.yml ps

# Restart
docker compose -f docker-compose.nas.yml restart

# View logs
docker compose -f docker-compose.nas.yml logs -f

# Stop
docker compose -f docker-compose.nas.yml down

# Start
docker compose -f docker-compose.nas.yml up -d
```

### Manage Backend Service (Pi)

```bash
# View logs
ssh irrigation 'sudo journalctl -u irrigation -f'

# Restart
ssh irrigation 'sudo systemctl restart irrigation'

# Status
ssh irrigation 'sudo systemctl status irrigation'

# Stop
ssh irrigation 'sudo systemctl stop irrigation'

# Start
ssh irrigation 'sudo systemctl start irrigation'
```

## Configuration Changes

### Modify Nginx Config

1. Edit the config:
   ```bash
   ssh nas
   vi /volume1/home/jonclow/irrigation/nginx.conf
   ```

2. Test configuration:
   ```bash
   sudo /usr/builtin/sbin/nginx -t -c /volume1/home/jonclow/irrigation/nginx.conf
   ```

3. Restart nginx:
   ```bash
   sudo ./stop-nginx.sh && sudo ./start-nginx.sh
   ```

### Update Docker Container Settings

1. Edit docker-compose:
   ```bash
   ssh nas
   vi /volume1/home/jonclow/irrigation/docker-compose.nas.yml
   ```

2. Restart container:
   ```bash
   docker compose -f docker-compose.nas.yml down
   docker compose -f docker-compose.nas.yml up -d
   ```

## Project Structure

```
irrigate/
├── client/                      # Frontend React app
│   ├── app/                     # React Router 7 routes & components
│   │   ├── components/          # React components
│   │   ├── css/                 # Stylesheets
│   │   ├── routes/              # Route definitions
│   │   ├── root.tsx             # Root layout
│   │   └── socket.ts            # Socket.IO client
│   ├── public/                  # Static assets (favicon, manifest)
│   ├── Dockerfile               # Docker build config
│   ├── vite.config.ts           # Vite configuration
│   └── package.json
├── server/                      # Backend API
│   ├── api/                     # Controllers, services, models
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   └── models/              # Data models
│   ├── config/                  # Configuration files
│   ├── app.js                   # Express server entry
│   └── package.json
├── docker-compose.nas.yml       # Docker config for NAS
├── docker-deploy-nas-local.sh   # Deploy frontend to NAS (local build)
├── deploy-pi-backend.sh         # Deploy backend to Pi
├── irrigation.service           # Systemd service for Pi
├── start-systemd.sh             # Backend startup (called by systemd)
└── stop.sh                      # Backend shutdown (called by systemd)
```

## Environment Variables

### Frontend

Built into Docker image during build (from `.env.production`):
```
VITE_BASE_URL=http://192.168.20.59:3001
```

### Backend

Located in `server/.env` on Pi:
- Database connection details
- Serial port configuration
- API keys (if any)

## Troubleshooting

### Frontend Issues (NAS)

**502 Bad Gateway / Site Not Accessible:**

1. Check nginx is running:
   ```bash
   ssh nas "ps aux | grep nginx | grep irrigation"
   ```

2. Check container is running:
   ```bash
   ssh nas "docker ps | grep irrigation"
   ```

3. Test internal connectivity:
   ```bash
   ssh nas "curl -I http://localhost:80"        # Should reach nginx
   ssh nas "curl -I http://localhost:3000"      # Should reach container
   ```

4. View logs:
   ```bash
   ssh nas "tail -50 /volume1/home/jonclow/irrigation/nginx-error.log"
   ssh nas "docker logs irrigation-frontend --tail=50"
   ```

5. Restart both services:
   ```bash
   ssh nas "cd /volume1/home/jonclow/irrigation && sudo ./stop-nginx.sh && docker compose -f docker-compose.nas.yml restart && sudo ./start-nginx.sh"
   ```

**Nginx Won't Start:**

- Check port 80 isn't in use: `ssh nas "sudo netstat -tlnp | grep ':80 '"`
- Verify binary exists: `ssh nas "ls -la /usr/builtin/sbin/nginx"`
- Test config: `ssh nas "sudo /usr/builtin/sbin/nginx -t -c /volume1/home/jonclow/irrigation/nginx.conf"`

**Favicon Showing 404:**

1. Clear browser cache (Ctrl+Shift+R)
2. Test favicon: `curl -I http://irrigation.home/favicon.ico`
3. Check file in container:
   ```bash
   ssh nas "docker exec irrigation-frontend ls -la /app/build/client/ | grep favicon"
   ```

### Backend Issues (Pi)

**API Not Responding:**

1. Check service status:
   ```bash
   ssh irrigation 'sudo systemctl status irrigation'
   ```

2. View recent logs:
   ```bash
   ssh irrigation 'sudo journalctl -u irrigation -n 100'
   ```

3. Test API directly:
   ```bash
   curl http://192.168.20.59:3001/weather/getBasicWeather
   ```

4. Restart service:
   ```bash
   ssh irrigation 'sudo systemctl restart irrigation'
   ```

**Serial Port Issues:**

1. Check port exists:
   ```bash
   ssh irrigation 'ls -la /dev/ttyACM0'
   ```

2. Check user permissions:
   ```bash
   ssh irrigation 'groups'  # Should include dialout
   ssh irrigation 'sudo usermod -a -G dialout $USER'  # Add if missing
   ```

3. Check service has access:
   ```bash
   ssh irrigation 'sudo journalctl -u irrigation | grep -i serial'
   ```

**Node Version Issues:**

The backend uses Node 22 via NVM. If you see Node 18 errors:

1. Verify NVM is sourced in systemd:
   ```bash
   ssh irrigation 'sudo systemctl cat irrigation | grep nvm'
   ```

2. Check Node version in service:
   ```bash
   ssh irrigation 'sudo journalctl -u irrigation | grep "Using Node"'
   ```

3. Rebuild native modules:
   ```bash
   ssh irrigation 'cd ~/irrigation-controller && npm rebuild'
   ```

## API Endpoints

### Health Check
`GET http://192.168.20.59:3001/health`

### Weather Data
`GET http://192.168.20.59:3001/weather/getBasicWeather`

Returns:
```json
{
  "dtg": "2026-02-12T08:17:52.513Z",
  "rain": 0,
  "baro": 1000.42,
  "air_temp": 18.5,
  "humid": 100,
  "solar": 27,
  "wind_mean": {"sp": 7, "dir": 17},
  "wind_high": {"sp": 15, "dir": 49},
  "wind_low": {"sp": 2, "dir": 41},
  "rain1": "0.0",
  "rain24": "2.3",
  "rain48": "177.4",
  "rainweek": "1046.5",
  "serialStatus": {
    "connected": true,
    "reconnecting": false,
    "attempts": 0,
    "port": "/dev/ttyACM0"
  }
}
```

## System Benefits

✅ **Permanent Configuration** - Nginx config won't be overwritten by ADM
✅ **Simple Management** - Start/stop scripts, no complex networking
✅ **Organized** - All files in one location on NAS
✅ **Modern Stack** - React 19, Node 24 (frontend), Node 22 (backend)
✅ **Resource Efficient** - Frontend on NAS (more RAM), backend on Pi (hardware access)
✅ **Standard Ports** - Port 80 for web, no :8080 in URLs
✅ **WebSocket Support** - Real-time valve status and weather updates

## Notes

- Pi has limited RAM (908MB) - frontend moved to NAS for resource management
- Nginx provides security layer (rate limiting, headers, request filtering)
- Docker container only exposed to localhost, accessed via nginx proxy
- Socket.IO connections proxied with WebSocket upgrade support
- Frontend build time ~6 seconds locally, ~2 minutes on NAS (if building remotely)
- Backend uses systemd for auto-restart on Pi
- Web Center is disabled to prevent nginx config regeneration
- Local Docker builds use Node 24 LTS for better compatibility
