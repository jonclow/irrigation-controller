import { clsx } from 'clsx';
import React from 'react';

function Valve(props) {
  return (
    <button type={'button'} className={clsx('h-150 w-150 px-20 rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700 bg-slate-300', !props.status && 'border border-slate-700 rounded-md')} onClick={props.onClick}>
      {props.name}
      <img src={require(`../assets/toggle-${props.status === 1 ? 'off' : 'on'}.png`)} alt={`${props.name} toggle`} width="80" height="80"/>
    </button>
  );
}
export default Valve;
