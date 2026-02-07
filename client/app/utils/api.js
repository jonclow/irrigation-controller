/**
 * Centralized API fetch utility with proper error handling
 * Checks HTTP status codes and provides consistent error messages
 */

/**
 * Makes an API request and handles errors properly
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Resolves with parsed JSON data or rejects with Error
 */
export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // Parse JSON response (works for both success and error)
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, throw generic error
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Check if response was successful (2xx status)
    if (!response.ok) {
      // Backend returned an error response (e.g., HTTP 503)
      // Extract error message from backend response
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data.code;
      throw error;
    }

    // Success - return parsed data
    return data;

  } catch (error) {
    // Network error (no response from server)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error. Please check your connection and try again.');
      networkError.isNetworkError = true;
      throw networkError;
    }

    // Re-throw existing error (from status check above)
    throw error;
  }
}

/**
 * Helper for GET requests
 */
export async function apiGet(url) {
  return apiFetch(url, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function apiPost(url, data) {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * Helper for PUT requests
 */
export async function apiPut(url, data) {
  return apiFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete(url, data = null) {
  const options = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return apiFetch(url, options);
}
