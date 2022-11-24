import water_drop from '../assets/water_drop.svg';
import { clsx } from 'clsx';

function Valve(props) {
  return (
    <button className={clsx('rounded-md drop-shadow-md hover:drop-shadow-xl shadow-slate-700', props.status && 'bg-red-600/75', !props.status && 'bg-green-600/75')} onClick={props.onClick}>
      {props.name}
      <img src={water_drop} className="valve-active" style={{visibility: props.status === 1 ? 'hidden' : 'visible'}} alt="water drop"/>
    </button>
  );
}
export default Valve;


//className={`rounded-md bg-${props.colour}`}
