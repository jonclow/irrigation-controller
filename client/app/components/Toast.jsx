import React, { useEffect } from 'react';

/**
 * Toast notification component for user feedback
 * Auto-dismisses after 5 seconds
 *
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'info'
 * @param {function} onClose - Callback when toast closes
 */
function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
          border: '#10b981',
          icon: '✓'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
          border: '#f87171',
          icon: '✕'
        };
      case 'info':
        return {
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(8, 145, 178, 0.95))',
          border: '#06b6d4',
          icon: 'ℹ'
        };
      default:
        return {
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
          border: '#f87171',
          icon: '✕'
        };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      minWidth: '300px',
      maxWidth: '500px',
      padding: '16px 24px',
      background: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
      animation: 'fadeInUp 0.3s ease-out',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        flexShrink: 0
      }}>
        {colors.icon}
      </div>
      <div style={{ flex: 1 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0',
          lineHeight: '1',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
