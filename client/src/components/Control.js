import React, { useEffect, useState } from 'react';
import '../css/base.css';
import DurationSlider from './DurationSlider';
import Valve from './Valve';
import WeatherChip from './WeatherChip'

function Control({ socket }) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [valves, setValves] = useState([]);
  const [weather, setWeather] = useState({
    rain: 0,
    baro: 0,
    air_temp: 0,
    humid: 0,
    solar: 0,
    wind_mean: {
      sp: 0,
      dir: 0
    }
  });
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
        <div className="w-6/6 mx-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-md">
            <WeatherChip name={'rain'} value={`${weather.rain} mm`} />
            <WeatherChip name={'baro'} value={`${weather.baro} hPa`} />
            <WeatherChip name={'air_temp'} value={`${weather.air_temp} C`} />
            <WeatherChip name={'humid'} value={`${weather.humid} %`} />
            <WeatherChip name={'solar'} value={`${weather.solar} kWh/m2`} />
            <WeatherChip name={'wind'} value={`${weather.wind_mean.sp} kt --> ${weather.wind_mean.dir}`} />
          </div>
          <div>
            <DurationSlider onChange={durationSliderChange} duration={duration} />
            <div className={'grid grid-cols-2 xs:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4'}>
              {valves.map((value) => renderValveControl(value))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Control;
