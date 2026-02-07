import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data with loading and error states
 * @param {string} url - API endpoint to fetch from
 * @param {*} defaultValue - Default value to use before data loads
 * @param {Function} transform - Optional transform function for the result
 * @returns {Object} { data, isLoaded, error }
 */
export function useFetchData(url, defaultValue = [], transform = null) {
  const [data, setData] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoaded(false);
    setError(null);

    fetch(url)
      .then(res => res.json())
      .then(result => {
        const finalData = transform ? transform(result) : result;
        setData(finalData);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error(`Failed to fetch data from ${url}:`, err);
        setError(err);
        setData(defaultValue);
        setIsLoaded(true);
      });
  }, [url]);

  return { data, isLoaded, error };
}
