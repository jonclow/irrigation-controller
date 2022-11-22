import React from 'react';
import '../css/base.css';
import { SocketContext } from "../socket-context";
import DurationSlider from "./DurationSlider";
import Valve from './Valve';

class Control extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      valves: [],
      duration: 10,
    };
  }

  componentDidMount() {
    const socket = this.context;
    socket.on('valve-update', (update) => {
      this.setState({
        valves: update,
      });
    });

    fetch('/valve/getValveState')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            valves: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: error,
          });
        }
      );
  }

  handleClick(id) {
    fetch('/valve/toggleValve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        duration: this.state.duration,
      })
    })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            valves: result
          });
        },
        (error) => {
          this.setState({
            error: error,
          });
        }
      );
  }

  durationSliderChange = (e) => this.setState({
    duration: e.target.value,
  });

  renderValveControl(value) {
    return (
      <Valve
        key={value.id}
        name={value.name}
        colour={value.status === 0 ? 'DarkGreen' : 'Coral'}
        status={value.status}
        onClick={() => this.handleClick(value.id)}
      />
    );
  }

  render() {
    if (this.state.error) {
      return <div>Error: {this.state.error.message}</div>;
    } else if (!this.state.isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <DurationSlider onChange={this.durationSliderChange} duration={this.state.duration} />
          {this.state.valves.map((value) => this.renderValveControl(value))}
        </div>
      );
    }
  }
}

Control.contextType = SocketContext;

export default Control;
