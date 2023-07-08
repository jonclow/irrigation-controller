import React from 'react';

function ValveChip({ name, state }) {
  return (
    <div className="chip">
      <img src={require(`../assets/toggle-${state === 1 ? 'off' : 'on'}.png`)} alt={`${name}`} width="80" height="80"/>
      {name}
    </div>
  );
}

export default ValveChip;
