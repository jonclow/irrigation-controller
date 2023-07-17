import React, {useEffect, useState} from 'react';
import WeatherChip from './WeatherChip';
import ValveChip from './ValveChip';


function Home({ socket }) {
  const [valves, setValves] = useState([]);
  const [weather, setWeather] = useState({
    rain: 0,
    rain1: 0,
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

  socket.on('valve-update', (update) => {
    setValves(update);
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

  if (error) {
    return (<div>Error: {error.message}</div>);
  } else if (!isLoaded) {
    return (<div>Loading...</div>);
  } else {
    return (
      <>
        <div className="w-6/6 mx-5 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5 border border-slate-400 rounded-lg p-0.5">
            <WeatherChip key={'rain'} name={'rain'} value={`${weather.rain * 6} mm/hr`}/>
            <WeatherChip key={'baro'} name={'baro'} value={`${weather.baro}`}/>
            <WeatherChip key={'air_temp'} name={'air_temp'} value={`${weather.air_temp} C`}/>
            <WeatherChip key={'humid'} name={'humid'} value={`${weather.humid} %`}/>
            <WeatherChip key={'solar'} name={'solar'} value={`${weather.solar}`}/>
            <WeatherChip key={'wind'} name={'wind'} sp={weather.wind_mean.sp} value={`${weather.wind_mean.sp} kt`}
                         rot_deg={`${weather.wind_mean.dir + 90}deg`}/>
          </div>
          <div className={'grid grid-cols-2 lg:grid-cols-3 gap-4 border border-slate-400 rounded-lg p-0.5'}>
            {valves.map((value) => (<ValveChip key={value.name} name={value.name} state={value.status}/>))}
          </div>
        </div>
      </>
    );
  }
}

export default Home;
