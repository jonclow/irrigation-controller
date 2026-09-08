const chalk = require('chalk');
const IAQService = require('../services/IAQService');

const ALLOWED_HOURS = [4, 12, 24, 168, 720];

// Plausible ranges, mirroring the CHECK constraints on environmental_readings
// (valid_co2, valid_humidity, valid_iaq, valid_iaq_accuracy, valid_pm,
// valid_pressure, valid_temp_scd40/bme688/sht41). A value outside its range is a
// sensor fault (e.g. an SCD40 latched at 0 ppm), not real data — reject the POST
// here with a 422 so it never reaches the DB and can't trip the insert-failure path.
const IAQ_RANGES = {
  co2_ppm: [400, 5000],
  scd40_temp_c: [-40, 85],
  scd40_humidity_rh: [0, 100],
  bme688_temp_c: [-40, 85],
  bme688_humidity_rh: [0, 100],
  sht41_temp_c: [-40, 125],
  sht41_humidity_rh: [0, 100],
  pressure_hpa: [300, 1100],
  iaq: [0, 500],
  iaq_accuracy: [0, 3],
  pm2_5: [0, 1000],
};

function validateIAQRanges(body) {
  const problems = [];
  for (const [field, [min, max]] of Object.entries(IAQ_RANGES)) {
    const raw = body[field];
    if (raw === undefined || raw === null) continue; // absent is allowed (columns are nullable)
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) {
      problems.push(`${field}=${JSON.stringify(raw)} (expected ${min}..${max})`);
    }
  }
  return problems;
}

module.exports = {
  setIAQ: async function (req, res) {
    try {
      const { timestamp, device_id } = req.body;
      if (!timestamp || !device_id) {
        return res.status(422).json({ error: 'timestamp and device_id are required' });
      }
      const problems = validateIAQRanges(req.body);
      if (problems.length > 0) {
        console.warn(chalk.yellow(
          `setIAQ: rejecting out-of-range reading from ${device_id}: ${problems.join(', ')}`
        ));
        return res.status(422).json({ error: 'reading out of range', fields: problems });
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
