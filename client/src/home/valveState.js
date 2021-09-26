import water_drop from '../assets/water_drop.svg';
function ValveState(props) {
  return (
    <span className="state-dot" style={{backgroundColor: props.colour}}>
      <p>{props.name}</p>
      <img src={water_drop} className="state-active" style={{visibility: props.status === 1 ? 'hidden' : 'visible'}} alt="water drop"/>
    </span>
  );
}
export default ValveState;
