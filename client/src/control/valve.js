function Valve(props) {
  return (
    <button className="valve" style={{backgroundColor: props.colour}} onClick={props.onClick}>
      {props.name}
    </button>
  );
}
export default Valve;
