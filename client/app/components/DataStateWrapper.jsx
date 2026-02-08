
/**
 * Reusable component for handling loading, error, and empty states
 * @param {boolean} isLoaded - Whether data has finished loading
 * @param {Error} error - Error object if fetch failed
 * @param {boolean} isEmpty - Whether data array is empty
 * @param {string} dataType - Name of data type for messages (e.g., "wind data")
 * @param {string} loadingColor - CSS color variable for loading message
 * @param {ReactNode} children - Content to render when data is ready
 */
function DataStateWrapper({ isLoaded, error, isEmpty, dataType, loadingColor = 'var(--color-text-muted)', children }) {
  if (!isLoaded) {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        padding: '40px 20px',
        textAlign: 'center',
        color: loadingColor,
        fontSize: '16px'
      }}>
        Loading {dataType}...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: 'var(--font-body)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '14px'
      }}>
        Unable to load {dataType}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{
        fontFamily: 'var(--font-body)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '14px'
      }}>
        No {dataType} available
      </div>
    );
  }

  return children;
}

export default DataStateWrapper;
