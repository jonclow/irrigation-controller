import React from 'react';
import rainIcon from '../assets/rain.png';
import baroIcon from '../assets/baro.png';
import airTempIcon from '../assets/air_temp.png';
import humidIcon from '../assets/humid.png';
import solarIcon from '../assets/solar.png';

const iconMap = {
  rain: rainIcon,
  baro: baroIcon,
  air_temp: airTempIcon,
  humid: humidIcon,
  solar: solarIcon,
};

function WeatherChip({ name, sp, value, rot_deg }) {

  const getWindVector = (speed) => {
    let speedValue;
    switch (true) {
      case speed <= 2:
        speedValue = 2;
        break;
      case speed <= 7:
        speedValue = 7;
        break;
      case speed <= 12:
        speedValue = 12;
        break;
      case speed <= 17:
        speedValue = 17;
        break;
      case speed <= 22:
        speedValue = 22;
        break;
      case speed <= 27:
        speedValue = 27;
        break;
      case speed <= 32:
        speedValue = 32;
        break;
      case speed <= 37:
        speedValue = 37;
        break;
      case speed <= 42:
        speedValue = 42;
        break;
      case speed <= 47:
        speedValue = 47;
        break;
      case speed <= 52:
        speedValue = 52;
        break;
      case speed <= 57:
        speedValue = 57;
        break;
      case speed <= 62:
        speedValue = 62;
        break;
      case speed <= 67:
        speedValue = 67;
        break;
      case speed <= 72:
        speedValue = 72;
        break;
      default:
        speedValue = 2;
    }

    // Use a simple path that works consistently on both server and client
    return `/app/assets/wind_speed/${speedValue}.png`;
  }

  return (
    <div className="chip">
      {
        name === 'wind' ?
          <img src={getWindVector(sp)} alt={`${name}`} width="80" height="80" style={{ transform: `rotate(${rot_deg})` }} />
          : <img src={iconMap[name]} alt={`${name}`} width="80" height="80" />
      }
      {value}
    </div>
  )
}

export default WeatherChip;
