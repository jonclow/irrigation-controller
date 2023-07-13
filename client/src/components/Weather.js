import React, { useEffect, useState } from 'react';
import '../css/base.css';
import WeatherChip from './WeatherChip';
import { Link, Outlet, useLoaderData } from 'react-router-dom';

function Weather({ socket }) {
  const [weather, setWeather] = useState({
    rain1: 0,
    rain24: 0,
    rain48: 0,
    rainWeek: 0,
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

  const wx_data = useLoaderData();

  socket.on('weather-update', (update) => {
    setWeather({
      ...weather,
      ...update
    });
  });

  useEffect(() => {
    setWeather(wx_data)
  }, []);

  return (
    <>
      <div className="mt-5 mx-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5 border border-slate-400 rounded-lg p-0.5">
          <WeatherChip name={'baro'} value={`${weather.baro}`} />
          <WeatherChip name={'air_temp'} value={`${weather.air_temp} C`} />
          <WeatherChip name={'humid'} value={`${weather.humid} %`} />
          <WeatherChip name={'solar'} value={`${weather.solar}`} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5 border border-slate-400 rounded-lg p-0.5">
          <div>1 Hour</div>
          <div>24 Hour</div>
          <div>48 Hour</div>
          <div>Week</div>
          <WeatherChip name={'rain'} value={`${weather.rain1} mm`} />
          <WeatherChip name={'rain'} value={`${weather.rain24} mm`} />
          <WeatherChip name={'rain'} value={`${weather.rain48} mm`} />
          <WeatherChip name={'rain'} value={`${weather.rainWeek} mm`} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5 border border-slate-400 rounded-lg p-0.5">
          <div>Low</div>
          <div>Mean</div>
          <div>Max</div>
          <WeatherChip name={'wind'} sp={weather.wind_low.sp} value={`${weather.wind_low.sp} kt`}
                       rot_deg={`${weather.wind_low.dir + 90}deg`}/>
          <WeatherChip name={'wind'} sp={weather.wind_mean.sp} value={`${weather.wind_mean.sp} kt`}
                       rot_deg={`${weather.wind_mean.dir + 90}deg`}/>
          <WeatherChip name={'wind'} sp={weather.wind_high.sp} value={`${weather.wind_high.sp} kt`}
                       rot_deg={`${weather.wind_high.dir + 90}deg`}/>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border border-slate-400 rounded-lg p-0.5">
          <div className="chip"><Link to={'wind'}>Wind</Link></div>
          <div className="chip"><Link to={'baro'}>Pressure</Link></div>
        </div>

        <Outlet />
      </div>

    </>
  )
}

export default Weather;
