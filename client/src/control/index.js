import React from 'react';
import Valve from './valve';
import './control.css';
import { SocketContext } from "../socket-context";

class Control extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      valves: props.valves,
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

  renderValveControl(value) {
    return (
      <Valve
        name={value.name}
        colour={value.status === 0 ? 'Coral' : 'Aquamarine'}
        onClick={() => this.handleClick(value.id)}
      />
    );
  }

  render() {
    return (
      <div>
        {this.state.valves.map((value) => this.renderValveControl(value))}
      </div>
    );
  }
}

Control.contextType = SocketContext;

export default Control;
