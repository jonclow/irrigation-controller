import React, { useState, useRef, useEffect } from 'react';

/**
 * Weather station connection status indicator
 * Shows real-time serial port connection state
 * Click to view detailed connection information
 *
 * @param {boolean} connected - Whether serial port is connected
 * @param {boolean} reconnecting - Whether reconnection is in progress
 * @param {number} attempts - Number of reconnection attempts (optional)
 */
function ConnectionStatus({ connected, reconnecting, attempts = 0 }) {
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = useRef(null);

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

  // Close details when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDetails]);

  return (
    <div style={{ position: 'relative' }} ref={detailsRef}>
      <div
        onClick={() => setShowDetails(!showDetails)}
        style={{
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
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{
          fontSize: '14px',
          animation: status.pulse ? 'pulse 2s ease-in-out infinite' : 'none'
        }}>
          {status.icon}
        </span>
        <span>{status.text}</span>
        <span style={{
          fontSize: '10px',
          opacity: 0.6,
          marginLeft: '4px'
        }}>
          {showDetails ? '▲' : '▼'}
        </span>
      </div>

      {showDetails && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: '0',
          minWidth: '240px',
          padding: '12px 16px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontWeight: '700',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--color-border)'
          }}>
            Connection Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>Status:</span>
              <span style={{
                color: status.color,
                fontWeight: '600'
              }}>
                {connected ? 'Connected' : reconnecting ? 'Reconnecting' : 'Disconnected'}
              </span>
            </div>

            {reconnecting && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>Attempts:</span>
                <span style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {attempts}
                </span>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>Serial Port:</span>
              <span style={{
                color: 'var(--color-text-primary)',
                fontWeight: '600',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}>
                /dev/ttyACM0
              </span>
            </div>

            <div style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '10px',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              {connected ? 'Real-time data streaming' : reconnecting ? 'Attempting to reconnect...' : 'No data available'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;
