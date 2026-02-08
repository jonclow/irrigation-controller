import { useEffect, useState } from 'react';
import '../css/base.css';
import DurationSlider from './DurationSlider';
import Valve from './Valve';

function Control({ socket }) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [valves, setValves] = useState([]);
  const [duration, setDuration] = useState(10);
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  socket.on('valve-update', (update) => {
    setValves(update);
  });

  useEffect(() => {
    setIsLoaded(false);

    fetch(`${BASE_URL}/valve/getValveState`)
      .then(res => res.json())
      .then(
        (result) => {
          setValves(result);
          setIsLoaded(true);
        },
        (error) => {
          console.error('Failed to fetch valve state:', error);
          setError(error);
          setIsLoaded(true);
          // Set default values when backend is not available
          setValves([]);
        }
      );
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
        color: 'var(--color-growth)',
        fontSize: '20px'
      }}>
        Loading valve controls...
      </div>
    );
  } else {
    return (
      <>
        <div className="w-full px-4 sm:px-6 md:px-8">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 6vw, 42px)',
            fontWeight: '800',
            marginBottom: '6px',
            paddingBottom: '4px',
            background: 'linear-gradient(135deg, var(--color-growth), var(--color-water-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Valve Control
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            fontSize: 'clamp(11px, 2.5vw, 14px)',
            marginBottom: 'clamp(20px, 5vw, 28px)'
          }}>
            Manual irrigation zone management
          </p>

          <DurationSlider onChange={durationSliderChange} duration={duration} />

          <div className={'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-6'}>
            {valves.map((value) => renderValveControl(value))}
          </div>
        </div>
      </>
    );
  }
}

export default Control;
