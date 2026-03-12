import { useEffect, useState } from 'react';
import WeatherChip from './WeatherChip';
import ValveChip from './ValveChip';
import ConnectionStatus from './ConnectionStatus';
import '../css/base.css';
import { defaultWeather, mergeWeatherData } from '../utils/weatherDefaults';
import { apiGet } from '../utils/api';

function co2Status(ppm) {
  if (!ppm) return null;
  if (ppm < 800) return { label: 'Good', color: 'var(--color-growth)' };
  if (ppm < 1200) return { label: 'Moderate', color: 'var(--color-sun)' };
  return { label: 'Poor', color: '#f87171' };
}

function iaqStatus(score) {
  if (score == null) return null;
  if (score <= 50) return { label: 'Good', color: 'var(--color-growth)' };
  if (score <= 100) return { label: 'Moderate', color: 'var(--color-sun)' };
  if (score <= 200) return { label: 'Poor', color: '#fb923c' };
  return { label: 'Bad', color: '#f87171' };
}

function pm25Status(val) {
  if (val == null) return null;
  if (val < 12) return { label: 'Good', color: 'var(--color-growth)' };
  if (val < 35) return { label: 'Moderate', color: 'var(--color-sun)' };
  return { label: 'Poor', color: '#f87171' };
}

function Home({ socket }) {
  const [valves, setValves] = useState([]);
  const [weather, setWeather] = useState(defaultWeather);
  const [iaq, setIaq] = useState(null);
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

  socket.on('iaq-update', (update) => {
    setIaq(prev => prev ? { ...prev, ...update } : update);
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
        const [valvesData, weatherData, iaqData] = await Promise.all([
          apiGet(`${BASE_URL}/valve/getValveState`),
          apiGet(`${BASE_URL}/weather/getBasicWeather`),
          apiGet(`${BASE_URL}/iaq/getLatestIAQ`).catch(() => null)
        ]);

        setValves(valvesData);
        setWeather(mergeWeatherData(weatherData));
        setIaq(iaqData);

        // Set initial serial status from API response if available
        if (weatherData.serialStatus) {
          setSerialStatus({
            connected: weatherData.serialStatus.connected,
            reconnecting: weatherData.serialStatus.reconnecting || false,
            attempts: weatherData.serialStatus.attempts || 0
          });
        }

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

          {iaq && (
            <>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 4.5vw, 28px)',
                fontWeight: '700',
                marginBottom: 'clamp(12px, 3vw, 16px)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em'
              }}>
                Indoor Air Quality
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
                {/* CO2 */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
                  borderRadius: '16px',
                  padding: 'clamp(14px, 3vw, 20px)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>CO₂</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(18px, 4vw, 26px)', color: 'var(--color-air)', fontWeight: '700' }}>
                    {iaq.co2_ppm != null ? Math.round(iaq.co2_ppm) : '–'}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '4px', fontWeight: '400' }}>ppm</span>
                  </div>
                  {co2Status(iaq.co2_ppm) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: co2Status(iaq.co2_ppm).color, display: 'inline-block' }} />
                      <span style={{ fontSize: '11px', color: co2Status(iaq.co2_ppm).color }}>{co2Status(iaq.co2_ppm).label}</span>
                    </div>
                  )}
                </div>
                {/* IAQ Score */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
                  borderRadius: '16px',
                  padding: 'clamp(14px, 3vw, 20px)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>IAQ Score</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(18px, 4vw, 26px)', color: 'var(--color-air)', fontWeight: '700' }}>
                    {iaq.iaq != null ? Math.round(iaq.iaq) : '–'}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '4px', fontWeight: '400' }}>/500</span>
                  </div>
                  {iaqStatus(iaq.iaq) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: iaqStatus(iaq.iaq).color, display: 'inline-block' }} />
                      <span style={{ fontSize: '11px', color: iaqStatus(iaq.iaq).color }}>{iaqStatus(iaq.iaq).label}</span>
                    </div>
                  )}
                </div>
                {/* PM2.5 */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
                  borderRadius: '16px',
                  padding: 'clamp(14px, 3vw, 20px)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>PM2.5</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(18px, 4vw, 26px)', color: 'var(--color-air)', fontWeight: '700' }}>
                    {iaq.pm2_5 != null ? Number(iaq.pm2_5).toFixed(1) : '–'}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '4px', fontWeight: '400' }}>µg/m³</span>
                  </div>
                  {pm25Status(iaq.pm2_5) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: pm25Status(iaq.pm2_5).color, display: 'inline-block' }} />
                      <span style={{ fontSize: '11px', color: pm25Status(iaq.pm2_5).color }}>{pm25Status(iaq.pm2_5).label}</span>
                    </div>
                  )}
                </div>
                {/* Temp / Humidity */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
                  borderRadius: '16px',
                  padding: 'clamp(14px, 3vw, 20px)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Indoor Temp / Humidity</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(16px, 3.5vw, 22px)', color: 'var(--color-air)', fontWeight: '700' }}>
                    {iaq.sht41_temp_c != null ? Number(iaq.sht41_temp_c).toFixed(1) : '–'}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '2px', fontWeight: '400' }}>°C</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 6px' }}>/</span>
                    {iaq.sht41_humidity_rh != null ? Math.round(iaq.sht41_humidity_rh) : '–'}
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '2px', fontWeight: '400' }}>%</span>
                  </div>
                </div>
              </div>
            </>
          )}

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
