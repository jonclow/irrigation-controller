# Irrigation Controller

Smart irrigation system with web-based control interface, automated scheduling, and weather integration.

## Architecture

**Split Deployment:**
- **Frontend (NAS):** React Router 7 SSR served via Docker container + Apache reverse proxy
- **Backend (Pi):** Node.js Express API with PostgreSQL, serial port control for valves

```
Browser → Apache (NAS:80) → Docker (localhost:3000) → API (Pi:3001) → Hardware
```

## Current Setup

### Frontend - Asustor NAS (192.168.20.92)
- **Stack:** React 19 + React Router 7 (SSR) + Redux + Recharts
- **Deployment:** Docker container (irrigation-frontend)
- **Reverse Proxy:** Apache HTTP Server on port 80
- **Location:** `/volume1/Web/irrigation-frontend/`
- **Auto-restart:** Yes (Docker + Apache)

### Backend - Raspberry Pi 4 (192.168.20.59)
- **Stack:** Node.js + Express + Socket.IO + PostgreSQL
- **Service:** systemd (`irrigation.service`)
- **Location:** `~/irrigation-controller/`
- **Hardware:** Serial port control for 5-zone valve system

## Deployment

### First-Time Setup

**NAS (Frontend):**
```bash
cd ~/redmercury/irrigate
./setup-apache-proxy.sh          # One-time Apache configuration
./docker-deploy-nas.sh           # Deploy Docker container
```

**Pi (Backend):**
```bash
# On Pi, ensure systemd service is installed:
sudo cp irrigation.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable irrigation
sudo systemctl start irrigation
```

### Update Frontend (NAS)
```bash
cd ~/redmercury/irrigate
git commit -am "Your changes"
./docker-deploy-nas.sh
```

Deploys to NAS, builds Docker image, restarts container (~5 min).

### Update Backend (Pi)
```bash
cd ~/redmercury/irrigate
git commit -am "Your changes"
./deploy-pi-backend.sh
```

Syncs to Pi, restarts systemd service.

## Management

### Frontend (NAS)
```bash
# View logs
ssh nas 'docker logs irrigation-frontend -f'
ssh nas 'tail -f /volume1/.@plugins/AppCentral/httpd-2.4.43/data/logs/irrigation-access.log'

# Restart
ssh nas 'docker restart irrigation-frontend'
ssh nas '/volume1/.@plugins/AppCentral/httpd-2.4.43/CONTROL/start-stop.sh restart'

# Status
ssh nas 'docker ps | grep irrigation'
```

### Backend (Pi)
```bash
# View logs
ssh pi 'journalctl -u irrigation -f'

# Restart
ssh pi 'sudo systemctl restart irrigation'

# Status
ssh pi 'sudo systemctl status irrigation'
```

## Access

- **Web Interface:** http://192.168.20.92/
- **API Endpoint:** http://192.168.20.59:3001/
- **Health Check:** http://192.168.20.59:3001/health

## Key Files

```
irrigate/
├── client/                    # Frontend React app
│   ├── app/                   # React Router 7 routes & components
│   ├── Dockerfile             # Docker build config
│   └── package.json
├── server/                    # Backend API
│   ├── api/                   # Controllers, services, models
│   ├── app.js                 # Express server entry
│   └── package.json
├── docker-compose.nas.yml     # Docker config for NAS
├── docker-deploy-nas.sh       # Deploy frontend to NAS
├── deploy-pi-backend.sh       # Deploy backend to Pi
├── setup-apache-proxy.sh      # Configure Apache on NAS (one-time)
├── irrigation.service         # Systemd service for Pi
├── start-systemd.sh           # Backend startup (called by systemd)
└── stop.sh                    # Backend shutdown (called by systemd)
```

## Environment Variables

### Frontend (.env.production)
```
VITE_BASE_URL=http://192.168.20.59:3001
```

### Backend
- Database config in `server/config/`
- Serial port: `/dev/ttyUSB0`

## Notes

- Pi has 908MB RAM - frontend moved to NAS for resource management
- Apache provides security layer (rate limiting, headers, request filtering)
- Docker container only exposed to localhost, accessed via Apache proxy
- Socket.IO connections proxied through Apache with WebSocket support
- Frontend build time ~3-5 minutes on NAS
- Backend uses systemd for auto-restart on Pi

## Troubleshooting

**502 Bad Gateway:** Docker container not running
```bash
ssh nas 'docker ps | grep irrigation'
ssh nas 'docker logs irrigation-frontend'
```

**Backend API Down:** Check Pi service
```bash
ssh pi 'sudo systemctl status irrigation'
ssh pi 'journalctl -u irrigation -n 50'
```

**Serial Port Issues:** Check Pi permissions
```bash
ssh pi 'ls -la /dev/ttyUSB0'
ssh pi 'sudo usermod -a -G dialout $USER'
```
