import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetchData } from '../hooks/useFetchData';
import DataStateWrapper from './DataStateWrapper';

function RainGraph() {
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
  const { data: rainData, isLoaded, error } = useFetchData(
    `${BASE_URL}/weather/getRainGraphData`,
    [],
    result => result.rain_data || []
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(26, 35, 50, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontFamily: 'var(--font-body)',
          fontSize: '13px'
        }}>
          <p style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '600' }}>
            {payload[0].payload.rain_day}
          </p>
          <p style={{ color: 'var(--color-water-light)', margin: '4px 0' }}>
            Rainfall: {payload[0].value} mm
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
      isEmpty={rainData.length === 0}
      dataType="rainfall data"
      loadingColor="var(--color-water-light)"
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
          Daily Rainfall
        </h3>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={rainData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="rain_day"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <YAxis
            label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: 'var(--color-water-light)' }}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
            stroke="rgba(255, 255, 255, 0.2)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="total_rain"
            fill="var(--color-water)"
            radius={[8, 8, 0, 0]}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3))'
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    </DataStateWrapper>
  );
}

export default RainGraph;
