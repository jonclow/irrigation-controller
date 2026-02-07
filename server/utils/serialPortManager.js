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
   * Attempts to reconnect to serial port with exponential backoff
   */
  attemptReconnection() {
    if (this.isReconnecting) {
      console.log(chalk.yellow('Reconnection already in progress, skipping...'));
      return;
    }

    this.isReconnecting = true;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);

    console.log(chalk.yellow(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})...`));

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      try {
        console.log(chalk.blue('Attempting serial port reconnection...'));

        // Close existing port if still open
        if (this.serialPort && this.serialPort.isOpen) {
          this.serialPort.close((err) => {
            if (err) console.error('Error closing port:', err.message);
            this.recreateSerialConnection();
          });
        } else {
          this.recreateSerialConnection();
        }
      } catch (err) {
        console.error(chalk.red('Reconnection failed:'), err.message);
        this.reconnectAttempts++;
        this.isReconnecting = false;

        // Retry with increased backoff
        if (this.reconnectAttempts < 10) { // Max 10 attempts before logging warning
          this.attemptReconnection();
        } else {
          console.error(chalk.red('⚠️ Max reconnection attempts reached. Will retry via health check.'));
          this.reconnectAttempts = 5; // Reset to moderate backoff for health check retries
          this.isReconnecting = false;
        }
      }
    }, delay);
  }

  /**
   * Recreates serial port and parser connections
   */
  recreateSerialConnection() {
    // Guard against simultaneous recreation attempts
    if (this.isReconnecting && this.reconnectTimer) {
      console.log(chalk.yellow('Recreation already scheduled, skipping duplicate attempt'));
      return;
    }

    try {
      // Create new serial port
      this.serialPort = this.createSerialPort();

      // Create new parser
      this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      if (this.onDataCallback) {
        this.parser.on('data', this.onDataCallback);
      }

      // Setup event handlers
      this.setupSerialHandlers(this.serialPort);

      this.reconnectAttempts++;
      console.log(chalk.green('Serial port recreated successfully'));
    } catch (err) {
      console.error(chalk.red('Failed to recreate serial port:'), err.message);
      this.reconnectAttempts++;
      this.isReconnecting = false;
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

    if (this.serialPort && !this.serialPort.isOpen && !this.isReconnecting) {
      console.log(chalk.yellow('⚠️ Health check detected closed serial port - initiating reconnection'));
      this.attemptReconnection();
    } else if (!this.serialPort && !this.isReconnecting) {
      console.log(chalk.red('⚠️ Health check found null serial port - recreating'));
      this.attemptReconnection();
    } else if (this.isReconnecting) {
      console.log(chalk.blue(`ℹ️ Health check: Reconnection in progress (attempt ${this.reconnectAttempts + 1})`));
    } else if (status.connected) {
      console.log(chalk.green('✓ Health check: Serial port connected'));
    }
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
