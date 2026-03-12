const { Client } = require('pg');
const chalk = require('chalk');
const dbErrorTracker = require('../utils/dbErrorTracker');

const IAQService = {
  insertReading: async function (data) {
    const operationName = 'iaq_insert';
    const client = new Client();

    try {
      await client.connect();

      const result = await client.query(`
        INSERT INTO environmental_readings (
          timestamp, device_id,
          co2_ppm, scd40_temp_c, scd40_humidity_rh,
          iaq, iaq_accuracy, eco2_ppm, bvoc_ppm,
          bme688_temp_c, bme688_humidity_rh, pressure_hpa,
          pm1_0, pm2_5, pm4, pm10,
          sht41_temp_c, sht41_humidity_rh,
          wifi_rssi, free_heap, uptime_seconds
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING id
      `, [
        data.timestamp, data.device_id,
        data.co2_ppm ?? null, data.scd40_temp_c ?? null, data.scd40_humidity_rh ?? null,
        data.iaq ?? null, data.iaq_accuracy ?? null, data.eco2_ppm ?? null, data.bvoc_ppm ?? null,
        data.bme688_temp_c ?? null, data.bme688_humidity_rh ?? null, data.pressure_hpa ?? null,
        data.pm1_0 ?? null, data.pm2_5 ?? null, data.pm4 ?? null, data.pm10 ?? null,
        data.sht41_temp_c ?? null, data.sht41_humidity_rh ?? null,
        data.wifi_rssi ?? null, data.free_heap ?? null, data.uptime_seconds ?? null
      ]);

      dbErrorTracker.recordSuccess(operationName);
      return result.rows[0].id;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'write', error);
      if (shouldExit) process.exit(1);
      throw error;

    } finally {
      await client.end();
    }
  }
};

module.exports = IAQService;
