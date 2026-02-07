import React, {useEffect, useState} from 'react';
import WeatherChip from './WeatherChip';
import ValveChip from './ValveChip';
import ConnectionStatus from './ConnectionStatus';
import '../css/base.css';
import { defaultWeather, mergeWeatherData } from '../utils/weatherDefaults';
import { apiGet } from '../utils/api';

function Home({ socket }) {
  const [valves, setValves] = useState([]);
  const [weather, setWeather] = useState(defaultWeather);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [serialStatus, setSerialStatus] = useState({
    connected: false,
    reconnecting: false,
    attempts: 0
  });
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  socket.on('weather-update', (update) => {
    setWeather(prev => mergeWeatherData(update, prev));
  });

  socket.on('valve-update', (update) => {
    setValves(update);
  });

  socket.on('serial-status', (status) => {
    setSerialStatus({
      connected: status.connected,
      reconnecting: status.reconnecting || false,
      attempts: status.attempts || 0
    });
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [valvesData, weatherData] = await Promise.all([
          apiGet(`${BASE_URL}/valve/getValveState`),
          apiGet(`${BASE_URL}/weather/getBasicWeather`)
        ]);

        setValves(valvesData);
        setWeather(mergeWeatherData(weatherData));

      } catch (error) {
        console.error('Failed to load home data:', error);
        setError(error);
        // Keep defaults to maintain UI functionality
        setValves([]);
        setWeather(defaultWeather);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [BASE_URL]);

  if (error) {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Connection Error</h2>
        <p>{error.message}</p>
      </div>
    );
  } else if (!isLoaded) {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--color-water-light)',
        fontSize: '20px'
      }}>
        Loading system data...
      </div>
    );
  } else {
    return (
      <>
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: 'clamp(20px, 5vw, 32px)'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 6vw, 42px)',
                fontWeight: '800',
                marginBottom: '6px',
                paddingBottom: '4px',
                background: 'linear-gradient(135deg, var(--color-water-light), var(--color-growth))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                Environmental Monitor
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                fontSize: 'clamp(11px, 2.5vw, 14px)'
              }}>
                Real-time irrigation system status
              </p>
            </div>

            <ConnectionStatus
              connected={serialStatus.connected}
              reconnecting={serialStatus.reconnecting}
              attempts={serialStatus.attempts}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
            <WeatherChip key={'rain'} name={'rain'} value={`${Math.round(weather.rain * 6)} mm/hr`}/>
            <WeatherChip key={'baro'} name={'baro'} value={`${weather.baro}`}/>
            <WeatherChip key={'air_temp'} name={'air_temp'} value={`${weather.air_temp} C`}/>
            <WeatherChip key={'humid'} name={'humid'} value={`${weather.humid} %`}/>
            <WeatherChip key={'solar'} name={'solar'} value={`${weather.solar}`}/>
            <WeatherChip key={'wind'} name={'wind'} sp={weather.wind_mean.sp} value={`${weather.wind_mean.sp} kt`}
                         rot_deg={`${weather.wind_mean.dir + 90}deg`}/>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(18px, 4.5vw, 28px)',
            fontWeight: '700',
            marginBottom: 'clamp(12px, 3vw, 16px)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em'
          }}>
            Valve Controls
          </h2>

          <div className={'grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5'}>
            {valves.map((value) => (<ValveChip key={value.name} name={value.name} state={value.status}/>))}
          </div>
        </div>
      </>
    );
  }
}

export default Home;
