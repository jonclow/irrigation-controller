const chalk = require('chalk');

/**
 * Tracks consecutive database failures to distinguish between
 * transient issues (network blip) and persistent failures (DB truly down)
 */
class DatabaseErrorTracker {
  constructor() {
    this.failures = new Map(); // key: operation name, value: consecutive failure count
    this.lastSuccess = new Map(); // key: operation name, value: timestamp

    // Thresholds before system exit
    this.READ_THRESHOLD = 5;    // Read operations: tolerate more failures
    this.WRITE_THRESHOLD = 3;   // Write operations: fail faster (data integrity)
    this.CRON_THRESHOLD = 10;   // Cron jobs: most tolerant (can skip runs)
  }

  /**
   * Record a successful database operation
   * Resets failure counter for this operation
   */
  recordSuccess(operationName) {
    this.failures.set(operationName, 0);
    this.lastSuccess.set(operationName, Date.now());
  }

  /**
   * Record a database failure and check if threshold exceeded
   * Returns true if system should exit (persistent failure detected)
   */
  recordFailure(operationName, operationType, error) {
    const currentFailures = (this.failures.get(operationName) || 0) + 1;
    this.failures.set(operationName, currentFailures);

    const threshold = this.getThreshold(operationType);
    const lastSuccessTime = this.lastSuccess.get(operationName);
    const timeSinceSuccess = lastSuccessTime ? Date.now() - lastSuccessTime : null;

    console.error(chalk.red(`[DB Error] ${operationName} failed (${currentFailures}/${threshold}): ${error.message}`));

    if (timeSinceSuccess) {
      console.error(chalk.yellow(`  Last success: ${Math.round(timeSinceSuccess / 1000)}s ago`));
    }

    // Check if we've hit the threshold
    if (currentFailures >= threshold) {
      console.error(chalk.red.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.error(chalk.red.bold('⚠️  CRITICAL: DATABASE PERSISTENT FAILURE DETECTED'));
      console.error(chalk.red.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.error(chalk.red(`Operation: ${operationName}`));
      console.error(chalk.red(`Consecutive failures: ${currentFailures}`));
      console.error(chalk.red(`Error: ${error.message}`));
      console.error(chalk.red(`Error code: ${error.code || 'N/A'}`));

      if (error.code === 'ECONNREFUSED') {
        console.error(chalk.red('Database connection refused - PostgreSQL may be stopped'));
      } else if (error.code === 'ENOTFOUND') {
        console.error(chalk.red('Database host not found - check connection settings'));
      } else if (error.message.includes('authentication')) {
        console.error(chalk.red('Database authentication failed - check credentials'));
      } else if (error.message.includes('does not exist')) {
        console.error(chalk.red('Database schema error - table/column missing'));
      }

      console.error(chalk.red.bold('System will exit to alert operators and trigger restart'));
      console.error(chalk.red.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

      return true; // Signal to exit process
    }

    return false; // Continue operation
  }

  /**
   * Get failure threshold based on operation type
   */
  getThreshold(operationType) {
    switch (operationType) {
      case 'read':
        return this.READ_THRESHOLD;
      case 'write':
        return this.WRITE_THRESHOLD;
      case 'cron':
        return this.CRON_THRESHOLD;
      default:
        return this.READ_THRESHOLD;
    }
  }

  /**
   * Get current failure count for an operation
   */
  getFailureCount(operationName) {
    return this.failures.get(operationName) || 0;
  }

  /**
   * Check if an operation is currently failing
   */
  isCurrentlyFailing(operationName) {
    return (this.failures.get(operationName) || 0) > 0;
  }

  /**
   * Get status summary for monitoring
   */
  getStatus() {
    const status = {};
    for (const [operation, failures] of this.failures.entries()) {
      if (failures > 0) {
        status[operation] = {
          failures,
          lastSuccess: this.lastSuccess.get(operation),
        };
      }
    }
    return status;
  }

  /**
   * Reset all counters (use after confirmed recovery)
   */
  reset() {
    this.failures.clear();
    console.log(chalk.green('✓ Database error tracker reset'));
  }
}

// Singleton instance
const dbErrorTracker = new DatabaseErrorTracker();

module.exports = dbErrorTracker;
