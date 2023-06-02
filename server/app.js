require('dotenv').config();
const http = require('http');
const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const { createTerminus } = require('@godaddy/terminus');
const ValveService = require('./api/services/ValveService');
const ScheduleService = require('./api/services/ScheduleService');
const scheduleRouter = require('./api/routes/scheduleRouter');
const valveRouter = require('./api/routes/valveRouter');

const app = express();
const server = http.createServer(app);
const socket = require('socket.io')(server, {
  cors: {
    origin: 'http://192.168.20.54',
    methods: ['GET', 'POST']
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/schedule', scheduleRouter);
app.use('/valve', valveRouter);

app.set('valve_state', ValveService.initValveControl());
app.set('socket', socket);

function onSignal () {
  console.log(chalk.blue('Starting cleanup...'));
  return Promise.all([
    ValveService.gracefulShutdown(app),
    // ScheduleService.gracefulShutdown(),
  ]);
}

createTerminus(server, {
  signals: ['SIGINT', 'SIGTERM'],
  onSignal,
});

socket.on('connection', () => {
  console.log(chalk.yellow('Client connected'));
});

cron.schedule('* * * * *', () => ScheduleService.scheduleCheckAndRun(app));

const port = process.env.PORT || 3001;

server.listen(port, async () => {
  console.log(`----------------- Express up. Port: ${chalk.green(port)} -----------------`);
});
