const _ = require('lodash');

const ValveService = {
  initValveControl: async function () {
    const GPIO = require('onoff').Gpio;

    return _.map(require('../config/valve'), (valve) => {
      return {
        ...valve,
        pinControl: new GPIO(valve.gpio_pin, 'out'),
        status: 0,
      };
    });

  },

  turnOffValveTimeout: async function(valveID, app) {
    await app.set('valve_state', _.map(await app.get('valve_state'), (valve) => {
      if (valve.id !== valveID) {
        return valve;
      }

      valve.pinControl.writeSync(0);
      if (_.has(valve, 'timeOutObject')) {
        delete valve.timeOutObject;
      }
      return {
        ...valve,
        status: valve.pinControl.readSync(),
      };
    }));
  },
};

module.exports = ValveService;
