import toggleOnIcon from '../assets/toggle-on.png';
import toggleOffIcon from '../assets/toggle-off.png';

function ValveChip({ name, state }) {
  const isActive = state !== 1;
  return (
    <div className={`chip ${isActive ? 'valve-active' : ''}`}>
      <img src={state === 1 ? toggleOffIcon : toggleOnIcon} alt={`${name}`} width="80" height="80"/>
      <span style={{
        flex: 1,
        fontFamily: 'var(--font-display)',
        fontWeight: '600',
        fontSize: 'clamp(14px, 3vw, 18px)'
      }}>
        {name}
      </span>
      {isActive && (
        <span style={{
          fontSize: 'clamp(10px, 2vw, 12px)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-growth)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: '700'
        }}>
          ACTIVE
        </span>
      )}
    </div>
  );
}

export default ValveChip;
