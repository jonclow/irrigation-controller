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
const BASE_URL = process.env.REACT_APP_BASE_URL;

const socket = io('http://192.168.20.59:3001');

const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<NavBar socket={socket} />} >
      <Route path="/" element={<Home socket={socket} />} />
      <Route path="/control" element={<Control socket={socket} />} />,
      <Route path="/schedule/*" element={<Schedule />} />,
      <Route path="/weather" element={<Weather socket={socket} />}>
        <Route path="wind" element={<WindGraph />} loader={() => fetch(`${BASE_URL}/weather/getWindGraphData`)} />
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
