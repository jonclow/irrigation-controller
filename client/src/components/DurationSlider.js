function DurationSlider(props) {
  return (
    <div className="flex ml-5 my-5">
      <input type="range" min={1} max={60} value={props.duration} className="slider" onChange={props.onChange} />
      <div className="rounded-md drop-shadow-md w-40 mx-5 bg-slate-300">{props.duration} mins</div>
    </div>
  );
}
export default DurationSlider;
