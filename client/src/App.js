import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import water_drop from './assets/water_drop.svg';
import './App.css';
import Schedule from "./schedule";
import Control from "./control";
import { SocketContext, socket } from './socket-context';

class App extends React.Component {

  render() {
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
                  <Link to="/schedule">Schedule</Link>
                </li>
              </ul>
            </nav>
          </header>
          <Switch>
            <Route path="/schedule">
              <Schedule />
            </Route>
            <Route path="/">
              <SocketContext.Provider value={socket}>
                <Control />
              </SocketContext.Provider>
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
