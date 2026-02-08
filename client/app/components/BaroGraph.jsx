import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetchData } from '../hooks/useFetchData';
import DataStateWrapper from './DataStateWrapper';

function BaroGraph() {
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  const { data: baroData, isLoaded, error } = useFetchData(
    `${BASE_URL}/weather/getBaroGraphData`,
    [],
    result => result.baro_data || []
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
            Pressure: {payload[0].value} hPa
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DataStateWrapper
      isLoaded={isLoaded}
      error={error}
      isEmpty={baroData.length === 0}
      dataType="pressure data"
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
          Barometric Pressure (24 Hours)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={baroData}
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
            domain={[980, 1020]}
            label={{ value: 'Pressure (hPa)', angle: -90, position: 'insideLeft', fill: 'var(--color-earth-light)' }}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="baro"
            stroke="var(--color-earth-light)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-earth)', r: 3 }}
            activeDot={{ r: 6, fill: 'var(--color-earth-light)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </DataStateWrapper>
  );
}

export default BaroGraph;
