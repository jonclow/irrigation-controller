import React from 'react';
import toggleOnIcon from '../assets/toggle-on.png';
import toggleOffIcon from '../assets/toggle-off.png';

function Valve(props) {
  const isActive = props.status !== 1;

  return (
    <button
      type={'button'}
      onClick={props.onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: 'clamp(20px, 4vw, 28px)',
        minHeight: 'clamp(140px, 20vw, 180px)',
        borderRadius: '16px',
        background: isActive
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, var(--color-bg-elevated) 100%)'
          : 'linear-gradient(135deg, var(--color-bg-elevated) 0%, rgba(26, 35, 50, 0.8) 100%)',
        border: isActive
          ? '2px solid var(--color-growth)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isActive
          ? '0 8px 24px rgba(16, 185, 129, 0.25), var(--shadow-card)'
          : 'var(--shadow-card)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(16px, 3vw, 20px)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.6s ease-out backwards'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = isActive
          ? '0 8px 24px rgba(16, 185, 129, 0.25), var(--shadow-card)'
          : 'var(--shadow-card)';
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        padding: '10px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={props.status === 1 ? toggleOffIcon : toggleOnIcon}
          alt={`${props.name} toggle`}
          style={{
            width: '100%',
            height: '100%',
            filter: 'brightness(1.3) contrast(1.1)'
          }}
        />
      </div>

      <span style={{
        textAlign: 'center',
        letterSpacing: '-0.01em'
      }}>
        {props.name}
      </span>

      {isActive && (
        <>
          <span style={{
            fontSize: 'clamp(10px, 2vw, 12px)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-growth)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '700',
            padding: '4px 12px',
            background: 'rgba(16, 185, 129, 0.2)',
            borderRadius: '6px'
          }}>
            RUNNING
          </span>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        </>
      )}
    </button>
  );
}

export default Valve;
