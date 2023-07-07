import React from 'react';

function WeatherChip({ name, value, rot_deg }) {

  return (
    <div className="chip">
      {
        rot_deg ?
          <img src={require(`../assets/${name}.png`)} alt={`${name}`} width="80" height="80" style={{ transform: `rotate(${rot_deg})` }} />
          : <img src={require(`../assets/${name}.png`)} alt={`${name}`} width="80" height="80" />
      }
      {value}
    </div>
  )
}

export default WeatherChip;
