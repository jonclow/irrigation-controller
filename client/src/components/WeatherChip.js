import React from 'react';

function WeatherChip({ name, value }) {

  return (
    <div className="chip">
      <img src={require(`../assets/${name}.png`)} alt={`${name}`} width="80" height="80" />
      {value}
    </div>
  )
}

export default WeatherChip;
