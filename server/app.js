require('dotenv').config();
const http = require('http');
const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { createTerminus } = require('@godaddy/terminus');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const ValveService = require('./api/services/ValveService');
const ScheduleService = require('./api/services/ScheduleService');
const WeatherService = require('./api/services/WeatherService');
const _ = require("lodash");

const app = express();
const server = http.createServer(app);
const socket = require('socket.io')(server, {
  cors: {
    origin: process.env.SOCKET_CLIENT,
    methods: ['GET', 'POST']
  }
});
const serialPort = new SerialPort({ path: '/dev/ttyACM0', baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/schedule', require('./api/routes/scheduleRouter'));
app.use('/valve', require('./api/routes/valveRouter'));
app.use('/weather', require('./api/routes/weatherRouter'));

app.set('valve_state', ValveService.initValveControl());
app.set('socket', socket);

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

socket.on('connection', (sock) => {
  console.log(chalk.yellow(`------------ Socket Client Connected: ${sock.id}`));
});
serialPort.on('open', () => console.log(chalk.yellow('Serial Port Open')));
parser.on('data', addWeatherReading);

cron.schedule('* * * * *', () => ScheduleService.scheduleCheckAndRun(app));

const port = process.env.LISTEN_PORT;

server.listen(port, async () => {
  console.log(`------------ Express up. Port: ${chalk.green(port)}`);
});
