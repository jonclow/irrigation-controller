const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const ValveService = require('./api/services/ValveService');
const scheduleRouter = require('./api/routes/scheduleRouter');
const valveRouter = require('./api/routes/valveRouter');

const app = express();
const server = http.createServer(app);
const socket = new Server(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use('/schedule', scheduleRouter);
app.use('/valve', valveRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.set('valve_state', ValveService.initValveControl());
app.set('socket', socket);

function onSignal () {
  console.log('Starting cleanup...');
  return Promise.all([
    ValveService.gracefulShutdown(app),
  ]);
}

createTerminus(server, {
  signals: ['SIGINT', 'SIGTERM'],
  onSignal,
});

socket.on('connection', (socket) => {
  console.log('Client connected');
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`----------------- Express up. Port: ${chalk.green(port)} -----------------`);
});
