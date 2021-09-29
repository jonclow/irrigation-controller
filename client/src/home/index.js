import React from 'react';
import ValveState from "./valveState";
import './home.css';
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      valves: props.valves,
    };
  }

  renderValveState(value) {
    return (
      <ValveState
        name={value.name}
        colour={value.status === 0 ? 'Coral' : 'Aquamarine'}
        status={value.status}
      />
    );

  }

  render() {
    return (
      <div>
        {this.state.valves.map((value) => this.renderValveState(value))}
      </div>
    );
  }
}

export default Home;
