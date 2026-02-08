import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFetchData } from '../hooks/useFetchData';
import DataStateWrapper from './DataStateWrapper';

function WindGraph() {
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  const { data: windData, isLoaded, error } = useFetchData(
    `${BASE_URL}/weather/getWindGraphData`,
    [],
    result => result.wind_data || []
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(26, 35, 50, 0.95)',
          border: '1px solid rgba(163, 137, 91, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'var(--font-body)',
          fontSize: '13px'
        }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '600' }}>
            {payload[0].payload.date_time}
          </p>
          <p style={{ color: 'var(--color-earth-light)', margin: '4px 0' }}>
            Speed: {payload[0].value} kt
          </p>
          {payload[1] && (
            <p style={{ color: 'var(--color-water-light)', margin: '4px 0' }}>
              Direction: {payload[1].value}°
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <DataStateWrapper
      isLoaded={isLoaded}
      error={error}
      isEmpty={windData.length === 0}
      dataType="wind data"
      loadingColor="var(--color-earth-light)"
    >
      <div style={{
        background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
        borderRadius: '16px',
        padding: 'clamp(16px, 3vw, 24px)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: '700',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          Wind History (24 Hours)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={windData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="date_time"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Speed (kt)', angle: -90, position: 'insideLeft', fill: 'var(--color-earth-light)' }}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Direction (°)', angle: 90, position: 'insideRight', fill: 'var(--color-water-light)' }}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              paddingTop: '12px'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sp"
            name="Speed"
            stroke="var(--color-earth-light)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-earth)', r: 3 }}
            activeDot={{ r: 5, fill: 'var(--color-earth-light)' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dir"
            name="Direction"
            stroke="var(--color-water-light)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-water)', r: 3 }}
            activeDot={{ r: 5, fill: 'var(--color-water-light)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </DataStateWrapper>
  );
}

export default WindGraph;
