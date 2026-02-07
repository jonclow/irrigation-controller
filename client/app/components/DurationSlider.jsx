function DurationSlider(props) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
      borderRadius: '16px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      marginBottom: 'clamp(20px, 4vw, 32px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <label style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em'
        }}>
          Run Duration
        </label>
        <div style={{
          fontFamily: 'var(--font-data)',
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: '700',
          color: 'var(--color-water-light)',
          padding: '8px 20px',
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          minWidth: '120px',
          textAlign: 'center'
        }}>
          {props.duration} <span style={{ fontSize: '0.7em', color: 'var(--color-text-muted)' }}>mins</span>
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={props.duration}
          className="slider"
          onChange={props.onChange}
          style={{ width: '100%' }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: 'clamp(10px, 2vw, 12px)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)'
        }}>
          <span>5 min</span>
          <span>60 min</span>
        </div>
      </div>
    </div>
  );
}
export default DurationSlider;
