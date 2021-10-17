import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import water_drop from './assets/water_drop.svg';
import './App.css';
import Home from "./home";
import Schedule from "./schedule";
import Control from "./control";
import { SocketContext, socket } from './socket-context';
// import socketIOClient from 'socket.io-client';
// import io from "socket.io-client";
//
// let io = socketIOClient();

class App extends React.Component {
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

  render() {
    const { error, isLoaded, valves } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="App">
          <Router>
            <header className="App-header">
              <img src={water_drop} className="App-logo" alt="logo" />
              <nav>
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/control">Control</Link>
                  </li>
                  <li>
                    <Link to="/schedule">Schedule</Link>
                  </li>
                </ul>
              </nav>
            </header>
            <Switch>
              <Route path="/control">
                <SocketContext.Provider value={socket}>
                  <Control valves={valves} />
                </SocketContext.Provider>
              </Route>
              <Route path="/schedule">
                <Schedule />
              </Route>
              <Route path="/">
                <SocketContext.Provider value={socket}>
                  <Home valves={valves} />
                </SocketContext.Provider>
              </Route>
            </Switch>
          </Router>
        </div>
      );
    }
  }
}

export default App;
