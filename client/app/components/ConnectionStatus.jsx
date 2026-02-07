import React from 'react';

/**
 * Weather station connection status indicator
 * Shows real-time serial port connection state
 *
 * @param {boolean} connected - Whether serial port is connected
 * @param {boolean} reconnecting - Whether reconnection is in progress
 * @param {number} attempts - Number of reconnection attempts (optional)
 */
function ConnectionStatus({ connected, reconnecting, attempts = 0 }) {
  const getStatus = () => {
    if (connected && !reconnecting) {
      return {
        icon: '●',
        text: 'Weather Station Connected',
        color: 'var(--color-growth)',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        pulse: false
      };
    } else if (reconnecting) {
      return {
        icon: '⟳',
        text: attempts > 0 ? `Reconnecting (attempt ${attempts})...` : 'Reconnecting...',
        color: 'var(--color-sun)',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        pulse: true
      };
    } else {
      return {
        icon: '○',
        text: 'Weather Station Disconnected',
        color: '#f87171',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        pulse: false
      };
    }
  };

  const status = getStatus();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: status.bgColor,
      border: `1px solid ${status.borderColor}`,
      borderRadius: '12px',
      fontFamily: 'var(--font-body)',
      fontSize: 'clamp(11px, 2vw, 13px)',
      fontWeight: '600',
      color: status.color,
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease'
    }}>
      <span style={{
        fontSize: '14px',
        animation: status.pulse ? 'pulse 2s ease-in-out infinite' : 'none'
      }}>
        {status.icon}
      </span>
      <span>{status.text}</span>
    </div>
  );
}

export default ConnectionStatus;
