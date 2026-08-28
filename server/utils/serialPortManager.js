const { SerialPort } = require('serialport');
const { MockBinding } = require('@serialport/binding-mock');
const { ReadlineParser } = require('@serialport/parser-readline');
const chalk = require('chalk');

/**
 * Serial Port Manager
 * Manages serial port connection with automatic reconnection and health monitoring
 */

class SerialPortManager {
  constructor(config = {}) {
    this.serialPath = config.serialPath || '/dev/ttyACM0';
    this.baudRate = config.baudRate || 9600;
    this.maxReconnectDelay = config.maxReconnectDelay || 30000;
    this.isDevelopment = config.isDevelopment || false;

    this.serialPort = null;
    this.parser = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;

    this.socket = null;
    this.onDataCallback = null;

    // Initialize mock port for development
    if (this.isDevelopment) {
      MockBinding.createPort(this.serialPath, { echo: true, record: true });
    }
  }

  /**
   * Set socket.io instance for emitting status updates
   */
  setSocket(socketInstance) {
    this.socket = socketInstance;
  }

  /**
   * Set callback for incoming serial data
   */
  setDataCallback(callback) {
    this.onDataCallback = callback;
  }

  /**
   * Creates and returns a new serial port instance
   */
  createSerialPort() {
    const config = {
      path: this.serialPath,
      baudRate: this.baudRate
    };

    if (this.isDevelopment) {
      config.binding = MockBinding;
    }

    return new SerialPort(config);
  }

  /**
   * Sets up all event handlers for the serial port
   */
  setupSerialHandlers(port) {
    port.on('open', () => {
      console.log(chalk.yellow('Serial Port Open'));
      this.reconnectAttempts = 0; // Reset backoff counter on successful connection
      this.isReconnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Notify frontend of connection status
      if (this.socket) {
        this.socket.emit('serial-status', { connected: true, port: this.serialPath });
      }
    });

    port.on('error', (err) => {
      console.error(chalk.red('SerialPort Error:'), err.message);
      if (this.socket) {
        this.socket.emit('serial-status', { connected: false, error: err.message });
      }
      // An open() that failed (device not present yet) emits 'error' without a
      // matching 'close', so nothing else would retry. Schedule one here.
      if (!port.isOpen) {
        this.attemptReconnection();
      }
    });

    port.on('close', () => {
      console.log(chalk.red('Serial Port Closed - initiating reconnection...'));
      if (this.socket) {
        this.socket.emit('serial-status', { connected: false, reason: 'closed' });
      }
      this.attemptReconnection();
    });

    port.on('disconnect', () => {
      console.log(chalk.red('Serial Port Disconnected (USB unplugged?)'));
      if (this.socket) {
        this.socket.emit('serial-status', { connected: false, reason: 'disconnected' });
      }
    });
  }

  /**
   * Attempts to reconnect to serial port with exponential backoff.
   *
   * A pending `reconnectTimer` is the single source of truth for "a retry is
   * already scheduled". It is always nulled the instant the timer fires, so no
   * combination of flags can permanently block a reconnection (the bug that
   * previously wedged the backend whenever the weather-station Uno was reset:
   * `isReconnecting` was set and never cleared, and `recreateSerialConnection()`
   * bailed out on `isReconnecting && reconnectTimer` forever).
   */
  attemptReconnection() {
    if (this.reconnectTimer) {
      // A retry is already queued; let it run.
      return;
    }

    this.isReconnecting = true;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    console.log(chalk.yellow(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})...`));

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null; // this timer has fired; a new one may now be queued
      this.recreateSerialConnection();
    }, delay);
  }

  /**
   * Tears down the old port/parser and creates a fresh pair. Never returns early:
   * success is signalled asynchronously by the 'open' handler (which clears
   * isReconnecting and resets the backoff); failure surfaces via 'error'/'close'
   * or the synchronous catch below, both of which queue another attempt.
   */
  recreateSerialConnection() {
    this.reconnectAttempts++;

    // Drop listeners on the stale port/parser so handlers don't stack up across
    // repeated reconnects (each cycle would otherwise add another 'data' etc.).
    if (this.serialPort) {
      try {
        this.serialPort.removeAllListeners();
        if (this.serialPort.isOpen) this.serialPort.close(() => {});
      } catch (err) {
        console.error(chalk.yellow('Error tearing down old serial port:'), err.message);
      }
    }
    if (this.parser) {
      try { this.parser.removeAllListeners(); } catch (err) { /* noop */ }
    }

    try {
      this.serialPort = this.createSerialPort();
      this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      if (this.onDataCallback) {
        this.parser.on('data', this.onDataCallback);
      }

      this.setupSerialHandlers(this.serialPort);
      console.log(chalk.green('Serial port re-created; waiting for open event'));
    } catch (err) {
      console.error(chalk.red('Failed to recreate serial port:'), err.message);
      this.attemptReconnection();
    }
  }

  /**
   * Initialize serial port connection
   */
  initialize() {
    this.serialPort = this.createSerialPort();
    this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    if (this.onDataCallback) {
      this.parser.on('data', this.onDataCallback);
    }

    this.setupSerialHandlers(this.serialPort);

    console.log(this.isDevelopment
      ? chalk.yellow('⚠️ Using Mock SerialPort for /dev/ttyACM0 (WSL Environment)')
      : chalk.green('✓ Using Real Hardware SerialPort on /dev/ttyACM0')
    );
  }

  /**
   * Health check - returns connection status
   */
  healthCheck() {
    const isConnected = this.serialPort && this.serialPort.isOpen;

    // Emit status to all connected clients
    if (this.socket) {
      this.socket.emit('serial-status', {
        connected: isConnected,
        port: this.serialPath,
        reconnecting: this.isReconnecting,
        attempts: this.reconnectAttempts
      });
    }

    return {
      connected: isConnected,
      reconnecting: this.isReconnecting,
      attempts: this.reconnectAttempts
    };
  }

  /**
   * Perform health check and initiate reconnection if needed
   */
  performHealthCheck() {
    const status = this.healthCheck();

    if (status.connected) {
      console.log(chalk.green('✓ Health check: Serial port connected'));
      return;
    }

    if (this.reconnectTimer) {
      console.log(chalk.blue(`ℹ️ Health check: reconnect pending (attempt ${this.reconnectAttempts + 1})`));
      return;
    }

    // Port is not open and nothing is queued to fix it — re-arm. This is the
    // safety net that recovers from any missed 'close'/'error' edge.
    console.log(chalk.yellow('⚠️ Health check: serial port down with no retry pending - reconnecting'));
    this.attemptReconnection();
  }

  /**
   * Get current serial port instance
   */
  getSerialPort() {
    return this.serialPort;
  }

  /**
   * Get current parser instance
   */
  getParser() {
    return this.parser;
  }

  /**
   * Check if port is currently open
   */
  isOpen() {
    return this.serialPort && this.serialPort.isOpen;
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      connected: this.isOpen(),
      reconnecting: this.isReconnecting,
      attempts: this.reconnectAttempts,
      port: this.serialPath
    };
  }
}

module.exports = SerialPortManager;
