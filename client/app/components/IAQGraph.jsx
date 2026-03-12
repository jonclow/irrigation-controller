import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetchData } from '../hooks/useFetchData';
import DataStateWrapper from './DataStateWrapper';

const METRICS = [
  { key: 'co2_ppm',           label: 'CO₂',      color: 'var(--color-air)',          axis: 'left' },
  { key: 'iaq',               label: 'IAQ',       color: 'var(--color-sun)',          axis: 'right' },
  { key: 'pm2_5',             label: 'PM2.5',     color: 'var(--color-water)',        axis: 'right' },
  { key: 'sht41_temp_c',      label: 'Temp',      color: 'var(--color-earth-light)',  axis: 'right' },
  { key: 'sht41_humidity_rh', label: 'Humidity',  color: 'var(--color-growth)',       axis: 'right' },
];

function IAQGraph({ hours }) {
  const [activeMetrics, setActiveMetrics] = useState(['co2_ppm']);
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

  const { data: history, isLoaded, error } = useFetchData(
    `${BASE_URL}/iaq/getIAQHistory?hours=${hours}`,
    [],
  );

  function toggleMetric(key) {
    setActiveMetrics(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : [...prev, key]
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(26, 35, 50, 0.95)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'var(--font-body)',
          fontSize: '13px'
        }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '600' }}>
            {payload[0]?.payload?.date_time}
          </p>
          {payload.map(p => {
            const metric = METRICS.find(m => m.key === p.dataKey);
            return (
              <p key={p.dataKey} style={{ color: metric?.color || p.color, margin: '4px 0' }}>
                {metric?.label ?? p.dataKey}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const hasLeft  = activeMetrics.some(k => METRICS.find(m => m.key === k)?.axis === 'left');
  const hasRight = activeMetrics.some(k => METRICS.find(m => m.key === k)?.axis === 'right');

  return (
    <>
      {/* Metric selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => toggleMetric(m.key)}
            style={{
              padding: '5px 14px',
              borderRadius: '20px',
              border: activeMetrics.includes(m.key) ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.1)',
              background: activeMetrics.includes(m.key) ? `${m.color}22` : 'transparent',
              color: activeMetrics.includes(m.key) ? m.color : 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <DataStateWrapper
        isLoaded={isLoaded}
        error={error}
        isEmpty={history.length === 0}
        dataType="IAQ history"
        loadingColor="var(--color-air)"
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
          borderRadius: '16px',
          padding: 'clamp(16px, 3vw, 24px)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '32px',
        }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date_time"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                stroke="rgba(255,255,255,0.2)"
              />
              {hasLeft && (
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  stroke="rgba(255,255,255,0.2)"
                  label={{ value: 'CO₂ (ppm)', angle: -90, position: 'insideLeft', fill: 'var(--color-air)', fontSize: 11 }}
                />
              )}
              {hasRight && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  stroke="rgba(255,255,255,0.2)"
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => (
                <Line
                  key={m.key}
                  yAxisId={m.axis}
                  type="monotone"
                  dataKey={m.key}
                  stroke={m.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: m.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DataStateWrapper>
    </>
  );
}

export default IAQGraph;
