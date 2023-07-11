import React from 'react';

function WeatherChip({ name, sp, value, rot_deg }) {

  const getWindVector = (speed) => {
    let path;
    switch (true) {
      case speed <= 2:
        path = 'wind_speed/2';
        break;
      case speed <= 7:
        path = 'wind_speed/7';
        break;
      case speed <= 12:
        path = 'wind_speed/12';
        break;
      case speed <= 17:
        path = 'wind_speed/17';
        break;
      case speed <= 22:
        path = 'wind_speed/22';
        break;
      case speed <= 27:
        path = 'wind_speed/27';
        break;
      case speed <= 32:
        path = 'wind_speed/32';
        break;
      case speed <= 37:
        path = 'wind_speed/37';
        break;
      case speed <= 42:
        path = 'wind_speed/42';
        break;
      case speed <= 47:
        path = 'wind_speed/47';
        break;
      case speed <= 52:
        path = 'wind_speed/52';
        break;
      case speed <= 57:
        path = 'wind_speed/57';
        break;
      case speed <= 62:
        path = 'wind_speed/62';
        break;
      case speed <= 67:
        path = 'wind_speed/67';
        break;
      case speed <= 72:
        path = 'wind_speed/72';
        break;
      default:
        path = 'wind_speed/2';
    }

    return path;
  }

  return (
    <div className="chip">
      {
        name === 'wind' ?
          <img src={require(`../assets/${getWindVector(sp)}.png`)} alt={`${name}`} width="80" height="80" style={{ transform: `rotate(${rot_deg})` }} />
          : <img src={require(`../assets/${name}.png`)} alt={`${name}`} width="80" height="80" />
      }
      {value}
    </div>
  )
}

export default WeatherChip;
