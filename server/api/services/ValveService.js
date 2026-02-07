const _ = require('lodash');

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
    }
    // const GPIO = require('onoff').Gpio;

    return _.map(require('../config/valve'), (valve) => ({
      ...valve,
      pinControl: new GPIO(valve.gpio_pin, 'high'),
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
