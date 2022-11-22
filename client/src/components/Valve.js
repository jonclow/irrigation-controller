import water_drop from '../assets/water_drop.svg';
function Valve(props) {
  return (
    <button className="valve" style={{backgroundColor: props.colour}} onClick={props.onClick}>
      {props.name}
      <img src={water_drop} className="valve-active" style={{visibility: props.status === 1 ? 'hidden' : 'visible'}} alt="water drop"/>
    </button>
  );
}
export default Valve;
