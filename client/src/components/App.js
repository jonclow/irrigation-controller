import React from 'react';
import '../css/base.css';
import water_drop from "../assets/water_drop.svg";
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch
} from "react-router-dom";
import { SocketContext, socket } from '../socket-context';
import Schedule from "./Schedule";
import NotFound from "./NotFound";
import Control from "./Control";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Router>
          <header className="App-header">
            <img src={water_drop} className="App-logo" alt="logo"/>
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
            <Route component={NotFound}/>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
