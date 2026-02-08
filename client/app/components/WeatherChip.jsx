import rainIcon from '../assets/rain.png';
import baroIcon from '../assets/baro.png';
import airTempIcon from '../assets/air_temp.png';
import humidIcon from '../assets/humid.png';
import solarIcon from '../assets/solar.png';

// Import wind speed icons
import wind2 from '../assets/wind_speed/2.png';
import wind7 from '../assets/wind_speed/7.png';
import wind12 from '../assets/wind_speed/12.png';
import wind17 from '../assets/wind_speed/17.png';
import wind22 from '../assets/wind_speed/22.png';
import wind27 from '../assets/wind_speed/27.png';
import wind32 from '../assets/wind_speed/32.png';
import wind37 from '../assets/wind_speed/37.png';
import wind42 from '../assets/wind_speed/42.png';
import wind47 from '../assets/wind_speed/47.png';
import wind52 from '../assets/wind_speed/52.png';
import wind57 from '../assets/wind_speed/57.png';
import wind62 from '../assets/wind_speed/62.png';
import wind67 from '../assets/wind_speed/67.png';
import wind72 from '../assets/wind_speed/72.png';

const iconMap = {
  rain: rainIcon,
  baro: baroIcon,
  air_temp: airTempIcon,
  humid: humidIcon,
  solar: solarIcon,
};

function WeatherChip({ name, sp, value, rot_deg }) {
  // Wind speed icon map
  const windSpeedIcons = {
    2: wind2,
    7: wind7,
    12: wind12,
    17: wind17,
    22: wind22,
    27: wind27,
    32: wind32,
    37: wind37,
    42: wind42,
    47: wind47,
    52: wind52,
    57: wind57,
    62: wind62,
    67: wind67,
    72: wind72
  };

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

    return windSpeedIcons[speedValue];
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
