const WeatherService = require('../services/WeatherService');
const chalk = require('chalk');
const { DEFAULT_WEATHER, EMPTY_GRAPH_DATA, EMPTY_BARO_DATA, EMPTY_RAIN_DATA } = require('../utils/defaultData');

module.exports = {
  getBasicWeather: async function (req, res) {
    try {
      const data = await WeatherService.getBasicWeather();
      return res.send(data);
    } catch (error) {
      console.error(chalk.red('WeatherController.getBasicWeather error:'), error.message);
      // Service already handles errors and returns defaults, but catch anyway
      return res.status(200).send({ ...DEFAULT_WEATHER });
    }
  },

  getDetailedWeather: async function (req, res) {
    try {
      const data = await WeatherService.getDetailedWeather();

      // Include serial port status for initial frontend load
      const serialPortManager = req.app.get('serialPortManager');
      const serialStatus = serialPortManager ? serialPortManager.getStatus() : { connected: false, reconnecting: false, attempts: 0 };

      return res.send({
        ...data,
        serialStatus
      });
    } catch (error) {
      console.error(chalk.red('WeatherController.getDetailedWeather error:'), error.message);
      return res.status(200).send({
        ...DEFAULT_WEATHER,
        serialStatus: { connected: false, reconnecting: false, attempts: 0 }
      });
    }
  },

  getWindGraphData: async function (req, res) {
    try {
      const data = await WeatherService.getWindGraphData();
      return res.send(data);
    } catch (error) {
      console.error(chalk.red('WeatherController.getWindGraphData error:'), error.message);
      return res.status(200).send({ ...EMPTY_GRAPH_DATA });
    }
  },

  getBaroGraphData: async function (req, res) {
    try {
      const data = await WeatherService.getBaroGraphData();
      return res.send(data);
    } catch (error) {
      console.error(chalk.red('WeatherController.getBaroGraphData error:'), error.message);
      return res.status(200).send({ ...EMPTY_BARO_DATA });
    }
  },

  getRainGraphData: async function (req, res) {
    try {
      const data = await WeatherService.getRainGraphData();
      return res.send(data);
    } catch (error) {
      console.error(chalk.red('WeatherController.getRainGraphData error:'), error.message);
      return res.status(200).send({ ...EMPTY_RAIN_DATA });
    }
  }

}
