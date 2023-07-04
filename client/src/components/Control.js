import React, { useEffect, useState } from 'react';
import '../css/base.css';
import DurationSlider from "./DurationSlider";
import Valve from './Valve';
import { clsx } from 'clsx';

function Control({ socket }) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [valves, setValves] = useState([]);
  const [weather, setWeather] = useState({});
  const [duration, setDuration] = useState(10);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  socket.on('valve-update', (update) => {
    setValves(update);
  });

  socket.on('weather-update', (update) => {
    setWeather({
      ...weather,
      ...update
    });
  });

  useEffect(() => {
    (async () => await Promise.all([
      fetch(`${BASE_URL}/valve/getValveState`)
        .then(res => res.json())
        .then(
          (result) => {
            setValves(result);
          },
          (error) => {
            setError(error);
          }
        ),
      fetch(`${BASE_URL}/weather/getBasicWeather`)
        .then(res => res.json())
        .then(
          (result) => {
            setWeather(result);
          },
          (error) => {
            setError(error);
          }
        )
    ]))();

    setIsLoaded(true)
  }, [BASE_URL]);

  const toggleValveClick = (id) => {
    setIsLoaded(false);

    fetch(`${BASE_URL}/valve/toggleValve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        duration: duration,
      })
    })
      .then(res => res.json())
      .then(
        (result) => {
          setValves(result);
          setIsLoaded(true);
        },
        (error) => {
          setError(error);
          setIsLoaded(true);
        }
      );
  }

  const durationSliderChange = (e) => setDuration(e.target.value);

  const renderValveControl = (value) => {
    return (
      <Valve
        key={value.id}
        name={value.name}
        status={value.status}
        onClick={() => toggleValveClick(value.id)}
      />
    );
  }

  if (error) {
    return (<div>Error: {error.message}</div>);
  } else if (!isLoaded) {
    return (<div>Loading...</div>);
  } else {
    return (
      <>
        <div className="grid grid-cols-3 gap-4 mb-md">
          <div>Rain: {weather.rain} mm</div>
          <div>Baro: {weather.baro} hPa</div>
          <div>Temp: {weather.air_temp} C</div>
          <div>Humid: {weather.humid} %</div>
          <div>Solar: {weather.solar} x</div>
          <div>Wind: {weather.wind_mean?.sp} -- {weather.wind_mean?.dir}</div>
        </div>
        <div>
          <DurationSlider onChange={durationSliderChange} duration={duration} />
          <div className={clsx(
            'w-6/6 mx-5 grid gap-4',
            valves.length <=2 && 'grid-cols-2 grid-rows-1',
            valves.length <= 4 && 'grid-cols-2 grid-rows-2',
            valves.length > 4 && 'grid-cols-3 grid-rows-4'
          )}>
            {valves.map((value) => renderValveControl(value))}
          </div>
        </div>
      </>
    );
  }
}

export default Control;
