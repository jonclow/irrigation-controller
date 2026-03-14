const { Client } = require('pg');
const chalk = require('chalk');
const dbErrorTracker = require('../utils/dbErrorTracker');

const IAQService = {
  getLatestReading: async function () {
    const operationName = 'iaq_get_latest';
    const client = new Client();

    try {
      await client.connect();

      const result = await client.query(`
        SELECT
          timestamp,
          TO_CHAR(timestamp AT TIME ZONE 'pacific/auckland', 'DD Mon HH24:MI') AS date_time,
          co2_ppm, iaq, iaq_accuracy, eco2_ppm, bvoc_ppm,
          pm1_0, pm2_5, pm4, pm10,
          sht41_temp_c, sht41_humidity_rh,
          pressure_hpa
        FROM environmental_readings
        ORDER BY timestamp DESC
        LIMIT 1
      `);

      dbErrorTracker.recordSuccess(operationName);
      return result.rows[0] || null;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);
      if (shouldExit) process.exit(1);
      throw error;

    } finally {
      await client.end();
    }
  },

  getHistory: async function (hours) {
    const operationName = 'iaq_get_history';
    const client = new Client();

    try {
      await client.connect();

      let table, cols;
      if (hours <= 12) {
        table = 'environmental_readings';
        cols = `timestamp,
          TO_CHAR(timestamp AT TIME ZONE 'pacific/auckland', 'DD Mon HH24:MI') AS date_time,
          co2_ppm, iaq, pm2_5, sht41_temp_c, sht41_humidity_rh`;
      } else if (hours <= 168) {
        table = 'environmental_readings_5min';
        cols = `timestamp,
          TO_CHAR(timestamp AT TIME ZONE 'pacific/auckland', 'DD Mon HH24:MI') AS date_time,
          co2_ppm_avg AS co2_ppm, iaq_avg AS iaq, pm2_5_avg AS pm2_5,
          sht41_temp_avg AS sht41_temp_c, sht41_humidity_avg AS sht41_humidity_rh`;
      } else {
        table = 'environmental_readings_hourly';
        cols = `timestamp,
          TO_CHAR(timestamp AT TIME ZONE 'pacific/auckland', 'DD Mon HH24:MI') AS date_time,
          co2_ppm_avg AS co2_ppm, iaq_avg AS iaq, pm2_5_avg AS pm2_5,
          sht41_temp_avg AS sht41_temp_c, sht41_humidity_avg AS sht41_humidity_rh`;
      }

      const result = await client.query(`
        SELECT ${cols}
        FROM ${table}
        WHERE timestamp >= NOW() - ($1::int * INTERVAL '1 hour')
        ORDER BY timestamp ASC
      `, [hours]);

      dbErrorTracker.recordSuccess(operationName);
      return result.rows;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);
      if (shouldExit) process.exit(1);
      throw error;

    } finally {
      await client.end();
    }
  },

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
