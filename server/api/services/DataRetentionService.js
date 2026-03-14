const { Client } = require('pg');
const chalk = require('chalk');
const dbErrorTracker = require('../utils/dbErrorTracker');

const DataRetentionService = {
  aggregateReadings: async function (windowHours = 2) {
    const operationName = 'iaq_data_retention_aggregate';
    const client = new Client();

    try {
      await client.connect();

      await client.query(
        `SELECT aggregate_to_5min((NOW() - ($1 * INTERVAL '1 hour'))::timestamp, NOW()::timestamp)`,
        [windowHours]
      );
      await client.query(
        `SELECT aggregate_to_hourly((NOW() - ($1 * INTERVAL '1 hour'))::timestamp, NOW()::timestamp)`,
        [windowHours]
      );

      console.log(chalk.green(`[DataRetention] aggregateReadings complete (window: ${windowHours}h)`));
      dbErrorTracker.recordSuccess(operationName);

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'cron', error);
      if (shouldExit) process.exit(1);

    } finally {
      await client.end();
    }
  },

  purgeOldReadings: async function (retentionDays = 90) {
    const operationName = 'iaq_data_retention_purge';
    const client = new Client();

    try {
      await client.connect();

      const result = await client.query(
        `DELETE FROM environmental_readings WHERE timestamp < NOW() - ($1 * INTERVAL '1 day')`,
        [retentionDays]
      );

      console.log(chalk.green(`[DataRetention] purgeOldReadings complete — deleted ${result.rowCount} rows older than ${retentionDays} days`));
      dbErrorTracker.recordSuccess(operationName);

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'cron', error);
      if (shouldExit) process.exit(1);

    } finally {
      await client.end();
    }
  },

  aggregateWeatherReadings: async function (windowHours = 2) {
    const operationName = 'weather_data_retention_aggregate';
    const client = new Client();

    try {
      await client.connect();

      await client.query(
        `SELECT aggregate_weather_to_hourly(NOW() - ($1 * INTERVAL '1 hour'), NOW())`,
        [windowHours]
      );

      console.log(chalk.green(`[DataRetention] aggregateWeatherReadings complete (window: ${windowHours}h)`));
      dbErrorTracker.recordSuccess(operationName);

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'cron', error);
      if (shouldExit) process.exit(1);

    } finally {
      await client.end();
    }
  },

  purgeOldWeatherReadings: async function (retentionDays = 365) {
    const operationName = 'weather_data_retention_purge';
    const client = new Client();

    try {
      await client.connect();

      const result = await client.query(
        `DELETE FROM weather WHERE dtg < NOW() - ($1 * INTERVAL '1 day')`,
        [retentionDays]
      );

      console.log(chalk.green(`[DataRetention] purgeOldWeatherReadings complete — deleted ${result.rowCount} rows older than ${retentionDays} days`));
      dbErrorTracker.recordSuccess(operationName);

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'cron', error);
      if (shouldExit) process.exit(1);

    } finally {
      await client.end();
    }
  }
};

module.exports = DataRetentionService;
