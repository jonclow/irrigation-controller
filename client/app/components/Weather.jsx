import { useEffect, useState } from 'react';
import '../css/base.css';
import WeatherChip from './WeatherChip';
import ConnectionStatus from './ConnectionStatus';
import { Link, Outlet } from "react-router";
import { defaultWeather, mergeWeatherData } from '../utils/weatherDefaults';
import { apiGet } from '../utils/api';

function Weather({ socket }) {
  const [weather, setWeather] = useState(defaultWeather);
  const [windowDimensions, setWindowDimensions] = useState({});
  const [serialStatus, setSerialStatus] = useState({
    connected: false,
    reconnecting: false,
    attempts: 0
  });
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  socket.on('weather-update', (update) => {
    setWeather(prev => mergeWeatherData(update, prev));
  });

  socket.on('serial-status', (status) => {
    setSerialStatus({
      connected: status.connected,
      reconnecting: status.reconnecting || false,
      attempts: status.attempts || 0
    });
  });

  const updateWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    setWindowDimensions({ width, height });
  }

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const weatherData = await apiGet(`${BASE_URL}/weather/getDetailedWeather`);
        setWeather(mergeWeatherData(weatherData));

        // Set initial serial status from API response
        if (weatherData.serialStatus) {
          setSerialStatus({
            connected: weatherData.serialStatus.connected,
            reconnecting: weatherData.serialStatus.reconnecting || false,
            attempts: weatherData.serialStatus.attempts || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        // Keep default values when backend is not available
        setWeather(defaultWeather);
      }
    };

    loadWeather();
    updateWindowDimensions();

    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, [BASE_URL]);

  return (
    <>
      <div className="w-full px-4 sm:px-6 md:px-8">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: 'clamp(20px, 5vw, 28px)'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 6vw, 42px)',
              fontWeight: '800',
              marginBottom: '6px',
              paddingBottom: '4px',
              background: 'linear-gradient(135deg, var(--color-earth-light), var(--color-water-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: '1.2'
            }}>
              Weather Station
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontSize: 'clamp(11px, 2.5vw, 14px)'
            }}>
              Real-time environmental conditions
            </p>
          </div>

          <ConnectionStatus
            connected={serialStatus.connected}
            reconnecting={serialStatus.reconnecting}
            attempts={serialStatus.attempts}
          />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          Current Conditions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <WeatherChip name={'baro'} value={`${weather.baro}`} />
          <WeatherChip name={'air_temp'} value={`${weather.air_temp} C`} />
          <WeatherChip name={'humid'} value={`${weather.humid} %`} />
          <WeatherChip name={'solar'} value={`${weather.solar}`} />
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          Rainfall Accumulation
        </h2>
        {
          windowDimensions.width < 780 ? (
            <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>1 Hour</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>24 Hour</div>
              <WeatherChip name={'rain'} value={`${weather.rain1} mm`} />
              <WeatherChip name={'rain'} value={`${weather.rain24} mm`} />
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>48 Hour</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>Week</div>
              <WeatherChip name={'rain'} value={`${weather.rain48} mm`} />
              <WeatherChip name={'rain'} value={`${weather.rainweek} mm`} />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>1 Hour</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>24 Hour</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>48 Hour</div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>Week</div>
              <WeatherChip name={'rain'} value={`${weather.rain1} mm`} />
              <WeatherChip name={'rain'} value={`${weather.rain24} mm`} />
              <WeatherChip name={'rain'} value={`${weather.rain48} mm`} />
              <WeatherChip name={'rain'} value={`${weather.rainweek} mm`} />
            </div>
          )
        }
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          Wind Conditions
        </h2>
        <div style={{
          marginBottom: 'clamp(20px, 4vw, 28px)'
        }}>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: '8px',
              background: 'rgba(163, 137, 91, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(163, 137, 91, 0.2)'
            }}>Low</div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: '8px',
              background: 'rgba(163, 137, 91, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(163, 137, 91, 0.2)'
            }}>Mean</div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: '8px',
              background: 'rgba(163, 137, 91, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(163, 137, 91, 0.2)'
            }}>Max</div>
            <WeatherChip name={'wind'} sp={weather.wind_low.sp} value={windowDimensions.width < 780 ? `${weather.wind_low.sp}` : `${weather.wind_low.sp} kt`}
                         rot_deg={`${weather.wind_low.dir + 90}deg`}/>
            <WeatherChip name={'wind'} sp={weather.wind_mean.sp} value={windowDimensions.width < 780 ? `${weather.wind_mean.sp}` : `${weather.wind_mean.sp} kt`}
                         rot_deg={`${weather.wind_mean.dir + 90}deg`}/>
            <WeatherChip name={'wind'} sp={weather.wind_high.sp} value={windowDimensions.width < 780 ? `${weather.wind_high.sp}` : `${weather.wind_high.sp} kt`}
                         rot_deg={`${weather.wind_high.dir + 90}deg`}/>
          </div>
          {
            windowDimensions.width < 780 ? (
              <div className="grid grid-cols-1 gap-3">
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(163, 137, 91, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(163, 137, 91, 0.2)'
                }}>Min Last 24 hrs</div>
                <WeatherChip name={'wind'} sp={weather.min_wind_24.sp} value={`${weather.min_wind_24.sp} kt${weather.min_wind_24.date_time ? ' → ' + weather.min_wind_24.date_time : ''}`}
                             rot_deg={`${weather.min_wind_24.dir + 90}deg`}/>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(163, 137, 91, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(163, 137, 91, 0.2)'
                }}>Max Last 24 hrs</div>
                <WeatherChip name={'wind'} sp={weather.max_wind_24.sp} value={`${weather.max_wind_24.sp} kt${weather.max_wind_24.date_time ? ' → ' + weather.max_wind_24.date_time : ''}`}
                             rot_deg={`${weather.max_wind_24.dir + 90}deg`}/>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(163, 137, 91, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(163, 137, 91, 0.2)'
                }}>Min Last 24 hrs</div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(163, 137, 91, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(163, 137, 91, 0.2)'
                }}>Max Last 24 hrs</div>
                <WeatherChip name={'wind'} sp={weather.min_wind_24.sp} value={`${weather.min_wind_24.sp} kt${weather.min_wind_24.date_time ? ' → ' + weather.min_wind_24.date_time : ''}`}
                             rot_deg={`${weather.min_wind_24.dir + 90}deg`}/>
                <WeatherChip name={'wind'} sp={weather.max_wind_24.sp} value={`${weather.max_wind_24.sp} kt${weather.max_wind_24.date_time ? ' → ' + weather.max_wind_24.date_time : ''}`}
                             rot_deg={`${weather.max_wind_24.dir + 90}deg`}/>
              </div>
            )
          }
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          Historical Data
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Link to={'wind'} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: 'clamp(14px, 3vw, 16px)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(163, 137, 91, 0.15) 0%, var(--color-bg-elevated) 100%)',
              border: '1px solid rgba(163, 137, 91, 0.3)',
              color: 'var(--color-earth-light)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(163, 137, 91, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(163, 137, 91, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 137, 91, 0.2)';
            }}>
              Wind
            </button>
          </Link>
          <Link to={'baro'} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: 'clamp(14px, 3vw, 16px)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(163, 137, 91, 0.15) 0%, var(--color-bg-elevated) 100%)',
              border: '1px solid rgba(163, 137, 91, 0.3)',
              color: 'var(--color-earth-light)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(163, 137, 91, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(163, 137, 91, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 137, 91, 0.2)';
            }}>
              Pressure
            </button>
          </Link>
          <Link to={'rain'} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              padding: 'clamp(14px, 3vw, 16px)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(163, 137, 91, 0.15) 0%, var(--color-bg-elevated) 100%)',
              border: '1px solid rgba(163, 137, 91, 0.3)',
              color: 'var(--color-earth-light)',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(13px, 2.5vw, 15px)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(163, 137, 91, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(163, 137, 91, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 137, 91, 0.2)';
            }}>
              Rain
            </button>
          </Link>
        </div>
        <div style={{ minHeight: '400px', marginBottom: '24px' }}>
          <Outlet />
        </div>

      </div>
    </>
  )
}

export default Weather;
