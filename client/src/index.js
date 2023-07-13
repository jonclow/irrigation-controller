import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import io from 'socket.io-client';
import Schedule from './components/Schedule';
import NotFound from './components/NotFound';
import Control from './components/Control';
import Weather from './components/Weather';
import Footer from './components/Footer';
import Home from "./components/Home";
import WindGraph from './components/WindGraph';
import NavBar from "./components/NavBar";
import BaroGraph from "./components/BaroGraph";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const socket = io('http://192.168.20.59:3001');

const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<NavBar socket={socket} />} >
      <Route path="/" element={<Home socket={socket} />} />
      <Route path="/control" element={<Control socket={socket} />} loader={() => fetch(`${BASE_URL}/valve/getValveState`)}/>,
      <Route path="/schedule/*" element={<Schedule />} />,
      <Route path="/weather" element={<Weather socket={socket} />} loader={() => fetch(`${BASE_URL}/weather/getDetailedWeather`)}>
        <Route path="wind" element={<WindGraph />} loader={() => fetch(`${BASE_URL}/weather/getWindGraphData`)} />
        <Route path="baro" element={<BaroGraph />} loader={() => fetch(`${BASE_URL}/weather/getBaroGraphData`)} />
      </Route>,
    </Route>,
    <Route element={NotFound}/>
  ])
);

createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router} />
    <Footer />
  </>
);
