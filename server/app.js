require('dotenv').config();
const http = require('http');
const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { createTerminus } = require('@godaddy/terminus');

const ValveService = require('./api/services/ValveService');
const ScheduleService = require('./api/services/ScheduleService');
const WeatherService = require('./api/services/WeatherService');
const DataRetentionService = require('./api/services/DataRetentionService');
const SerialPortManager = require('./utils/serialPortManager');
const _ = require("lodash");

const app = express();
const server = http.createServer(app);
// Allow multiple origins for CORS (IP and hostname)
const allowedOrigins = process.env.NODE_ENV === 'development'
  ? ["http://localhost:3000"]
  : [
      process.env.SOCKET_CLIENT,
      process.env.ENV_MONITOR_CLIENT,
      "http://irrigation.local",
      "http://irrigation.home",
      "http://irrigation"
    ];

const socket = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Initialize Serial Port Manager
const serialPortManager = new SerialPortManager({
  serialPath: '/dev/ttyACM0',
  baudRate: 9600,
  maxReconnectDelay: 30000,
  isDevelopment: process.env.NODE_ENV === 'development'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/schedule', require('./api/routes/scheduleRouter'));
app.use('/valve', require('./api/routes/valveRouter'));
app.use('/weather', require('./api/routes/weatherRouter'));
app.use('/iaq', require('./api/routes/iaqRouter'));

app.set('valve_state', ValveService.initValveControl());
app.set('socket', socket);
app.set('serialPortManager', serialPortManager);

function onSignal () {
  console.log(chalk.blue('------------ Terminus Starting Cleanup...'));
  return Promise.all([
    ValveService.gracefulShutdown(app),
    // ScheduleService.gracefulShutdown(),
  ]);
}

async function addWeatherReading(data) {
  try {
    const parsedWxData = JSON.parse(data);

    console.log('Weather Data Payload:  ', parsedWxData);

    const reading = await WeatherService.addWeatherReading(parsedWxData);

    console.log('Weather Update Output:  ', reading);

    socket.emit('weather-update', reading);
  } catch (e) {
    console.log(`addWeatherReading - invalid JSON from weather station: ${data}`);
  }
}

createTerminus(server, {
  signals: ['SIGINT', 'SIGTERM'],
  onSignal,
});

// Configure serial port manager
serialPortManager.setSocket(socket);
serialPortManager.setDataCallback(addWeatherReading);
serialPortManager.initialize();

socket.on('connection', (sock) => {
  console.log(chalk.yellow(`------------ Socket Client Connected: ${sock.id}`));

  // Send current serial port status to newly connected client
  const status = serialPortManager.getStatus();
  sock.emit('serial-status', status);
});

// Cron job for irrigation schedules (every minute)
cron.schedule('* * * * *', () => ScheduleService.scheduleCheckAndRun(app));

// Cron health check for serial port (every minute as safety net)
cron.schedule('* * * * *', () => {
  serialPortManager.performHealthCheck();
});

// Hourly rolling aggregation: raw → 5-min and hourly aggregate tables
// Runs at :00 each hour with a 2-hour overlap window; ON CONFLICT DO NOTHING prevents dupes
cron.schedule('0 * * * *', () => DataRetentionService.aggregateReadings());

// Daily at 3:05 AM: purge raw readings older than 90 days (1 quarter retention)
cron.schedule('5 3 * * *', () => DataRetentionService.purgeOldReadings());

// Hourly weather aggregation: raw → weather_hourly table
// Runs at :10 past each hour (staggered from IAQ :00); 2h overlap window, ON CONFLICT DO NOTHING
cron.schedule('10 * * * *', () => DataRetentionService.aggregateWeatherReadings());

// Daily at 3:15 AM: purge raw weather older than 1 year (seasonal retention)
cron.schedule('15 3 * * *', () => DataRetentionService.purgeOldWeatherReadings());

const port = process.env.LISTEN_PORT;

server.listen(port, async () => {
  console.log(`------------ Express up. Port: ${chalk.green(port)}`);
});
