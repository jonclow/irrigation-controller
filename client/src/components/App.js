import React from 'react';
import '../css/base.css';
import water_drop from '../assets/water_drop.svg';
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
} from 'react-router-dom';
import io from 'socket.io-client';
import Schedule from './Schedule';
import NotFound from './NotFound';
import Control from './Control';
import Weather from './Weather';
import Footer from "./Footer";

class App extends React.Component {

  constructor(props) {
    super(props);
    this.socket = io('http://192.168.20.59:3001');
  }

  render() {
    return (
      <div className="App">
        <Router>
          <header className="App-header bg-slate-600/75">
            <img src={water_drop} className="App-logo" alt="logo"/>
            <nav>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/schedule">Schedule</Link>
                </li>
                <li>
                  <Link to="/weather">Weather</Link>
                </li>
              </ul>
            </nav>
          </header>

          <Routes>
            <Route path="/schedule/*" element={<Schedule />} />
            <Route path="/weather/*" element={<Weather socket={this.socket} />} />
            <Route path="/" element={<Control socket={this.socket} />} />
            <Route element={NotFound}/>
          </Routes>
        </Router>
        <Footer />
      </div>
    );
  }
}

export default App;
