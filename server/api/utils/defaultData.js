/**
 * Default/fallback data structures returned when database is unavailable
 * These prevent frontend errors while allowing transient DB issues to be handled gracefully
 */

const DEFAULT_WEATHER = {
  rain: 0,
  rain1: 0,
  rain24: 0,
  rain48: 0,
  rainweek: 0,
  baro: 1013, // Sea level standard pressure
  air_temp: 15, // Reasonable default temperature
  humid: 50,
  solar: 0,
  wind_mean: { sp: 0, dir: 0 },
  wind_high: { sp: 0, dir: 0 },
  wind_low: { sp: 0, dir: 0 },
  min_wind_24: { date_time: '', sp: 0, dir: 0 },
  max_wind_24: { date_time: '', sp: 0, dir: 0 },
};

const EMPTY_GRAPH_DATA = {
  wind_data: [],
  wind_data_high: [],
  wind_data_low: [],
};

const EMPTY_BARO_DATA = {
  baro_data: [],
};

const EMPTY_RAIN_DATA = {
  rain_data: [],
};

const EMPTY_SCHEDULES = [];

module.exports = {
  DEFAULT_WEATHER,
  EMPTY_GRAPH_DATA,
  EMPTY_BARO_DATA,
  EMPTY_RAIN_DATA,
  EMPTY_SCHEDULES,
};
