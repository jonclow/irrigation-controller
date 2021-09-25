const express = require('express');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const path = require('path');

const scheduleRouter = require('./api/routes/scheduleRouter');
const valveRouter = require('./api/routes/valveRouter');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use('/schedule', scheduleRouter);
app.use('/valve', valveRouter);
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.set('valve_state', require('./api/services/ValveService').initValveControl());
app.listen(port, () => {
  console.log(`----------------- Express up. Port: ${chalk.green(port)} -----------------`);
});
