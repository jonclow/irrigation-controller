// Shared default weather structure used across components
export const defaultWeather = {
  rain: 0,
  rain1: 0,
  rain24: 0,
  rain48: 0,
  rainweek: 0,
  baro: 0,
  air_temp: 0,
  humid: 0,
  solar: 0,
  wind_mean: { sp: 0, dir: 0 },
  wind_high: { sp: 0, dir: 0 },
  wind_low: { sp: 0, dir: 0 },
  min_wind_24: { date_time: '', sp: 0, dir: 0 },
  max_wind_24: { date_time: '', sp: 0, dir: 0 }
};

// List of nested object keys that need deep merging
const nestedKeys = ['wind_mean', 'wind_high', 'wind_low', 'min_wind_24', 'max_wind_24'];

/**
 * Safely merges weather data with defaults, handling nested objects
 * @param {Object} data - New weather data to merge
 * @param {Object} previous - Previous weather state (optional)
 * @returns {Object} Merged weather object
 */
export function mergeWeatherData(data, previous = defaultWeather) {
  const merged = { ...previous, ...data };

  // Deep merge nested wind objects
  nestedKeys.forEach(key => {
    if (data[key]) {
      merged[key] = { ...previous[key], ...data[key] };
    }
  });

  return merged;
}
