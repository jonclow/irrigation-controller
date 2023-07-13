const WeatherService = require('../services/WeatherService');

module.exports = {
  getBasicWeather: async function (req, res) {
    return res.send(await WeatherService.getBasicWeather());
  },

  getDetailedWeather: async function (req, res) {
    return res.send(await WeatherService.getDetailedWeather());
  },

  getWindGraphData: async function (req, res) {
    return res.send(await WeatherService.getWindGraphData());
  },

  getBaroGraphData: async function (req, res) {
    return res.send(await WeatherService.getBaroGraphData());
  }

}
