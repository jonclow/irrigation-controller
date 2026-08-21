const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// Recent RPi kernels register the header's GPIO chip at a non-zero sysfs base
// (e.g. 512 as of kernel 6.12, was 0 before) instead of assuming physical BCM
// pin numbers map 1:1 onto /sys/class/gpio/export. Look up the real base so
// valve.gpio_pin (a BCM pin number) still resolves to the correct sysfs GPIO.
const getGpioChipBase = () => {
  const gpioRoot = '/sys/class/gpio';
  const chips = fs.readdirSync(gpioRoot).filter((f) => f.startsWith('gpiochip'));

  for (const chip of chips) {
    const label = fs.readFileSync(path.join(gpioRoot, chip, 'label'), 'utf8').trim();
    if (label.startsWith('pinctrl-bcm')) {
      return parseInt(fs.readFileSync(path.join(gpioRoot, chip, 'base'), 'utf8').trim(), 10);
    }
  }

  return 0;
};

const ValveService = {
  toggleValves: async function (app, arrayOfValveIDs, duration) {
    const async = require('async');

    const appValveState = await async.map(
      await app.get('valve_state'),
      async (valveStateObj) => {
        if (arrayOfValveIDs.includes(valveStateObj.id)) {
          // Valve is not open - turn it on
          if (valveStateObj.pinControl.readSync() === 1) {
            valveStateObj.pinControl.writeSync(0);
            valveStateObj.timeOutObject = setTimeout(ValveService.turnOffValveTimeout, duration * 60000, valveStateObj.id, app);

            // Valve is already open - turn it off and cleanup the existing 'turn-off' timeout
          } else {
            valveStateObj.pinControl.writeSync(1);
            if (_.has(valveStateObj, 'timeOutObject')) {
              clearTimeout(valveStateObj.timeOutObject);
              delete valveStateObj.timeOutObject;
            }
          }

          return {
            ...valveStateObj,
            status: valveStateObj.pinControl.readSync(),
          }
        } else {
          return valveStateObj;
        }
      }
    );

    await app.set('valve_state', appValveState);

    return appValveState;
  },

  gracefulShutdown: async function (app) {
    _.each(await app.get('valve_state'), (valve) => {
      // Turn off
      valve.pinControl.writeSync(1);
      // Release GPIO resources
      valve.pinControl.unexport();
      // Cleanup any timers
      if (_.has(valve, 'timeOutObject')) {
        clearTimeout(valve.timeOutObject);
        delete valve.timeOutObject;
      }
    });

    console.log('ValveService.gracefulShutdown - Success');
  },

  initValveControl: async function () {
    let GPIO;
    let gpioBase = 0;
    if (process.platform === 'linux' && require('os').release().toLowerCase().includes('microsoft')) {
      // We are in WSL - Use a Mock
      console.log('⚠️ WSL Detected: Using Virtual GPIO Mock');
      GPIO = class MockGpio {
        constructor(pin, direction) {
          this.pin = pin;
          console.log(`[GPIO] Initialized Pin ${pin} as ${direction}`);
        }
        writeSync(value) {
          console.log(`[GPIO] Pin ${this.pin} set to: ${value}`);
        }
        unexport() {
          console.log(`[GPIO] Pin ${this.pin} unexported`);
        }
      };
    } else {
      // Real Linux/Raspberry Pi environment
      GPIO = require('onoff').Gpio;
      gpioBase = getGpioChipBase();
    }
    // const GPIO = require('onoff').Gpio;

    return _.map(require('../config/valve'), (valve) => ({
      ...valve,
      pinControl: new GPIO(gpioBase + valve.gpio_pin, 'high'),
      status: 1,
    }));

    // return _.map(require('../config/valve'), (valve) => {
    //   return {
    //     ...valve,
    //     // pinControl: new GPIO(valve.gpio_pin, 'high'),
    //     status: 1,
    //   };
    // });

  },

  turnOffValveTimeout: async function(valveID, app) {
    const valveState = _.map(await app.get('valve_state'), (valve) => {
      if (valve.id !== valveID) {
        return valve;
      }

      if (valve.pinControl.readSync() === 0) {
        valve.pinControl.writeSync(1);
      }

      if (_.has(valve, 'timeOutObject')) {
        delete valve.timeOutObject;
      }

      return {
        ...valve,
        status: valve.pinControl.readSync(),
      };
    });

    await app.set('valve_state', valveState);
    await app.get('socket').emit('valve-update', _.map(valveState, (valve) => _.pick(valve, ['id', 'name', 'status'])));
  },
};

module.exports = ValveService;
