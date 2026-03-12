const chalk = require('chalk');
const IAQService = require('../services/IAQService');

const ALLOWED_HOURS = [4, 12, 24, 168, 720];

module.exports = {
  setIAQ: async function (req, res) {
    try {
      const { timestamp, device_id } = req.body;
      if (!timestamp || !device_id) {
        return res.status(422).json({ error: 'timestamp and device_id are required' });
      }
      const id = await IAQService.insertReading(req.body);
      req.app.get('socket').emit('iaq-update', req.body);
      return res.status(201).json({ success: true, id });
    } catch (error) {
      console.error(chalk.red('IAQController error:'), error.message);
      return res.status(500).json({ error: 'Database error' });
    }
  },

  getLatestIAQ: async function (req, res) {
    try {
      const reading = await IAQService.getLatestReading();
      return res.status(200).json(reading);
    } catch (error) {
      console.error(chalk.red('IAQController getLatestIAQ error:'), error.message);
      return res.status(500).json({ error: 'Database error' });
    }
  },

  getIAQHistory: async function (req, res) {
    try {
      const hours = parseInt(req.query.hours, 10) || 4;
      if (!ALLOWED_HOURS.includes(hours)) {
        return res.status(422).json({ error: `hours must be one of: ${ALLOWED_HOURS.join(', ')}` });
      }
      const history = await IAQService.getHistory(hours);
      return res.status(200).json(history);
    } catch (error) {
      console.error(chalk.red('IAQController getIAQHistory error:'), error.message);
      return res.status(500).json({ error: 'Database error' });
    }
  }
};
