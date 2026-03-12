import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';
import IAQGraph from './IAQGraph';

function statusFor(value, thresholds) {
  if (value == null) return null;
  for (const t of thresholds) {
    if (value <= t.max) return t;
  }
  return thresholds[thresholds.length - 1];
}

const CO2_THRESHOLDS = [
  { max: 800,  label: 'Good',     color: 'var(--color-growth)' },
  { max: 1200, label: 'Moderate', color: 'var(--color-sun)' },
  { max: 2000, label: 'Poor',     color: '#fb923c' },
  { max: Infinity, label: 'Bad',  color: '#f87171' },
];

const IAQ_THRESHOLDS = [
  { max: 50,  label: 'Good',     color: 'var(--color-growth)' },
  { max: 100, label: 'Moderate', color: 'var(--color-sun)' },
  { max: 200, label: 'Poor',     color: '#fb923c' },
  { max: Infinity, label: 'Bad', color: '#f87171' },
];

const PM25_THRESHOLDS = [
  { max: 12,  label: 'Good',     color: 'var(--color-growth)' },
  { max: 35,  label: 'Moderate', color: 'var(--color-sun)' },
  { max: Infinity, label: 'Poor', color: '#f87171' },
];

function StatusDot({ status }) {
  if (!status) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.color, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: '11px', color: status.color }}>{status.label}</span>
    </div>
  );
}

function MetricChip({ label, value, unit, status, wide = false }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
      borderRadius: '16px',
      padding: 'clamp(14px, 3vw, 20px)',
      border: '1px solid rgba(167, 139, 250, 0.2)',
      boxShadow: 'var(--shadow-card)',
      gridColumn: wide ? 'span 2' : undefined,
    }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-data)', fontSize: 'clamp(18px, 4vw, 26px)', color: 'var(--color-air)', fontWeight: '700' }}>
        {value ?? '–'}
        {unit && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '4px', fontWeight: '400' }}>{unit}</span>}
      </div>
      <StatusDot status={status} />
    </div>
  );
}

const TIME_RANGES = [
  { label: '4h',    hours: 4 },
  { label: '12h',   hours: 12 },
  { label: '24h',   hours: 24 },
  { label: 'Week',  hours: 168 },
  { label: 'Month', hours: 720 },
];

function IAQ({ socket }) {
  const [reading, setReading] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hours, setHours] = useState(4);
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  socket.on('iaq-update', (update) => {
    setReading(prev => prev ? { ...prev, ...update } : update);
  });

  useEffect(() => {
    apiGet(`${BASE_URL}/iaq/getLatestIAQ`)
      .then(data => { setReading(data); setIsLoaded(true); })
      .catch(() => setIsLoaded(true));
  }, [BASE_URL]);

  const r = reading;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div style={{ marginBottom: 'clamp(20px, 5vw, 32px)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 6vw, 42px)',
          fontWeight: '800',
          marginBottom: '6px',
          background: 'linear-gradient(135deg, var(--color-air), var(--color-air-dark))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          lineHeight: '1.2'
        }}>
          Indoor Air Quality
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'clamp(11px, 2.5vw, 14px)' }}>
          Arduino house environment monitor · SCD-40 · BME688 · SPS-30 · SHT41
        </p>
      </div>

      {/* Current Readings */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(18px, 4.5vw, 28px)',
        fontWeight: '700',
        marginBottom: 'clamp(12px, 3vw, 16px)',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.01em'
      }}>
        Current Readings
      </h2>

      {!isLoaded ? (
        <div style={{ fontFamily: 'var(--font-display)', padding: '40px 20px', textAlign: 'center', color: 'var(--color-air)', fontSize: '16px' }}>
          Loading readings...
        </div>
      ) : !r ? (
        <div style={{ fontFamily: 'var(--font-body)', padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          No readings available
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-4">
            <MetricChip label="CO₂" value={r.co2_ppm != null ? Math.round(r.co2_ppm) : null} unit="ppm" status={statusFor(r.co2_ppm, CO2_THRESHOLDS)} />
            <MetricChip label="IAQ Score" value={r.iaq != null ? Math.round(r.iaq) : null} unit="/500" status={statusFor(r.iaq, IAQ_THRESHOLDS)} />
            <MetricChip label="PM2.5" value={r.pm2_5 != null ? Number(r.pm2_5).toFixed(1) : null} unit="µg/m³" status={statusFor(r.pm2_5, PM25_THRESHOLDS)} />
            <MetricChip label="Temp / Humidity" value={
              r.sht41_temp_c != null
                ? `${Number(r.sht41_temp_c).toFixed(1)} °C / ${r.sht41_humidity_rh != null ? Math.round(r.sht41_humidity_rh) + ' %' : '–'}`
                : null
            } />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-8">
            <MetricChip label="PM1.0"     value={r.pm1_0    != null ? Number(r.pm1_0).toFixed(1)    : null} unit="µg/m³" />
            <MetricChip label="PM10"      value={r.pm10     != null ? Number(r.pm10).toFixed(1)     : null} unit="µg/m³" />
            <MetricChip label="bVOC"      value={r.bvoc_ppm != null ? Number(r.bvoc_ppm).toFixed(2) : null} unit="ppm" />
            <MetricChip label="eCO₂"      value={r.eco2_ppm != null ? Math.round(r.eco2_ppm)         : null} unit="ppm" />
            <MetricChip label="Pressure"  value={r.pressure_hpa != null ? Number(r.pressure_hpa).toFixed(1) : null} unit="hPa" />
            <MetricChip label="IAQ Accuracy" value={r.iaq_accuracy != null ? r.iaq_accuracy : null} />
          </div>

          {/* Threshold legend */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-text-muted)'
          }}>
            <span style={{ fontWeight: '600', marginRight: '4px' }}>Thresholds:</span>
            {[
              { label: 'Good',     color: 'var(--color-growth)' },
              { label: 'Moderate', color: 'var(--color-sun)' },
              { label: 'Poor',     color: '#fb923c' },
              { label: 'Bad',      color: '#f87171' },
            ].map(t => (
              <span key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                <span style={{ color: t.color }}>{t.label}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {/* History */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(18px, 4.5vw, 28px)',
        fontWeight: '700',
        marginBottom: 'clamp(12px, 3vw, 16px)',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.01em'
      }}>
        History
      </h2>

      {/* Time range selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {TIME_RANGES.map(tr => (
          <button
            key={tr.hours}
            onClick={() => setHours(tr.hours)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: hours === tr.hours ? '1px solid rgba(167, 139, 250, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: hours === tr.hours ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
              color: hours === tr.hours ? 'var(--color-air)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tr.label}
          </button>
        ))}
      </div>

      <IAQGraph hours={hours} />
    </div>
  );
}

export default IAQ;
