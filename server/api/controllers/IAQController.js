const chalk = require('chalk');
const IAQService = require('../services/IAQService');

module.exports = {
  setIAQ: async function (req, res) {
    try {
      const { timestamp, device_id } = req.body;
      if (!timestamp || !device_id) {
        return res.status(422).json({ error: 'timestamp and device_id are required' });
      }
      const id = await IAQService.insertReading(req.body);
      return res.status(201).json({ success: true, id });
    } catch (error) {
      console.error(chalk.red('IAQController error:'), error.message);
      return res.status(500).json({ error: 'Database error' });
    }
  }
};
