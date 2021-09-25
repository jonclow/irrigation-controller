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
                    <Link to="/control">Valve Control</Link>
                  </li>
                  <li>
                    <Link to="/schedule">Irrigation Scheduling</Link>
                  </li>
                </ul>
              </nav>
            </header>
            <Switch>
              <Route path="/control">
                <Control valves={valves} />
              </Route>
              <Route path="/schedule">
                <Schedule />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Router>
        </div>
      );
    }
  }
}

export default App;
