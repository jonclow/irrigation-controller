function DurationSlider(props) {
  return (
    <div className={"slider-container"}>
      <input type="range" min={1} max={60} value={props.duration} className="slider" onChange={props.onChange} />
      <p>Duration: {props.duration} min</p>
    </div>
  );
}
export default DurationSlider;
