import React, { useEffect, useState } from 'react';
import '../css/base.css';
import WeatherChip from './WeatherChip';
import { Link, Outlet } from 'react-router-dom';

function Weather({ socket }) {
  const [weather, setWeather] = useState({
    rain: 0,
    rain1: 0,
    rain24: 0,
    baro: 0,
    air_temp: 0,
    humid: 0,
    solar: 0,
    wind_mean: {
      sp: 0,
      dir: 0
    },
    wind_high: {
      sp: 0,
      dir: 0
    },
    wind_low: {
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
      fetch(`${BASE_URL}/weather/getDetailedWeather`)
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
        <div className="mt-5 mx-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5 border border-slate-400 rounded-lg p-0.5">
            <WeatherChip name={'baro'} value={`${weather.baro}`} />
            <WeatherChip name={'air_temp'} value={`${weather.air_temp} C`} />
            <WeatherChip name={'humid'} value={`${weather.humid} %`} />
            <WeatherChip name={'solar'} value={`${weather.solar}`} />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5 border border-slate-400 rounded-lg p-0.5">
            <div className="chip">10 min</div>
            <div className="chip">1 Hour</div>
            <div className="chip">24 Hour</div>
            <WeatherChip name={'rain'} value={`${weather.rain} mm`} />
            <WeatherChip name={'rain'} value={`${weather.rain1} mm`} />
            <WeatherChip name={'rain'} value={`${weather.rain24} mm`} />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5 border border-slate-400 rounded-lg p-0.5">
            <div className="chip">Low</div>
            <div className="chip">Mean</div>
            <div className="chip">Max</div>
            <WeatherChip name={'wind'} sp={weather.wind_low.sp} value={`${weather.wind_low.sp} kt`}
                         rot_deg={`${weather.wind_low.dir + 90}deg`}/>
            <WeatherChip name={'wind'} sp={weather.wind_mean.sp} value={`${weather.wind_mean.sp} kt`}
                         rot_deg={`${weather.wind_mean.dir + 90}deg`}/>
            <WeatherChip name={'wind'} sp={weather.wind_high.sp} value={`${weather.wind_high.sp} kt`}
                         rot_deg={`${weather.wind_high.dir + 90}deg`}/>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="chip"><Link to={'wind'}>Wind</Link></div>
            <div className="chip"><Link to={'wind'}>Rain</Link></div>
            <div className="chip"><Link to={'wind'}>Pressure</Link></div>
          </div>

          <Outlet />
        </div>

      </>
    )
  }
}

export default Weather;
