import React, { useEffect, useState } from 'react';
import '../css/base.css';
import WeatherChip from './WeatherChip';

function Weather({ socket }) {
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
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  socket.on('weather-update', (update) => {
    setWeather({
      ...weather,
      ...update
    });
  });

  useEffect(() => {
    (async () => await Promise.all([
      fetch(`${BASE_URL}/weather/getBasicWeather`)
        .then(res => res.json())
        .then((result) => {
            setWeather(result);
          },
          (error) => {
            setError(error);
          }
        )
        .then(() => setIsLoaded(true))
    ]))();
  }, [BASE_URL]);

  if (error) {
    return (<div>Error: {error.message}</div>);
  } else if (!isLoaded) {
    return (<div>Loading...</div>);
  } else {
    return (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-md mt-5">
          <WeatherChip name={'rain'} value={`${weather.rain} mm`} />
          <WeatherChip name={'baro'} value={`${weather.baro} hPa`} />
          <WeatherChip name={'air_temp'} value={`${weather.air_temp} C`} />
          <WeatherChip name={'humid'} value={`${weather.humid} %`} />
          <WeatherChip name={'solar'} value={`${weather.solar} kWh/m2`} />
          <WeatherChip name={'wind'} value={`${weather.wind_mean.sp} -- ${weather.wind_mean.dir}`} />
        </div>
      </>
    )
  }
}

export default Weather;
