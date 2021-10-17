import React from 'react';
import ValveState from './valveState';
import './home.css';
import { SocketContext } from "../socket-context";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      valves: props.valves,
    };
  }

  componentDidMount() {
    let socket = this.context;
    socket.on('valve-update', (update) => {
      this.setState({
        valves: update,
      });
    });
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

Home.contextType = SocketContext;

export default Home;
