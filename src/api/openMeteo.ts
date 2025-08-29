import type { City, CurrentWeather, HourlyData, DailyData } from '../types';

const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(name: string, count = 8): Promise<City[]> {
  const url = `${GEO}?name=${encodeURIComponent(name)}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const json = await res.json();
  const results: City[] = (json.results || []).map((r: any) => ({
    id: r.id, name: r.name, country: r.country,
    latitude: r.latitude, longitude: r.longitude, timezone: r.timezone
  }));
  return results;
}

export async function getBundle(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: 'auto',
    current: [
      'temperature_2m','apparent_temperature','relative_humidity_2m','precipitation',
      'weather_code','wind_speed_10m','wind_direction_10m','is_day','surface_pressure',
      'visibility'
    ].join(','),
    hourly: ['temperature_2m','relative_humidity_2m'].join(','),
    daily: ['weather_code','temperature_2m_max','temperature_2m_min','sunrise','sunset'].join(','),
    forecast_days: '7'
  });
  const res = await fetch(`${FORECAST}?${params.toString()}`);
  if (!res.ok) throw new Error('Forecast fetch failed');
  const j = await res.json();

  const current: CurrentWeather = {
    temperature: j.current.temperature_2m,
    apparent: j.current.apparent_temperature,
    humidity: j.current.relative_humidity_2m,
    precip: j.current.precipitation,
    windSpeed: j.current.wind_speed_10m,
    windDir: j.current.wind_direction_10m,
    isDay: Boolean(j.current.is_day),
    code: j.current.weather_code,
    timeISO: j.current.time,
    pressure: j.current.surface_pressure,
    visibility: j.current.visibility
  };

  const hourly: HourlyData = {
    timeISO: j.hourly.time,
    temperature: j.hourly.temperature_2m,
    humidity: j.hourly.relative_humidity_2m,
  };

  const daily: DailyData = {
    timeISO: j.daily.time,
    tmax: j.daily.temperature_2m_max,
    tmin: j.daily.temperature_2m_min,
    sunrise: j.daily.sunrise,
    sunset: j.daily.sunset,
    weatherCode: j.daily.weather_code
  };

  const tz = j.timezone;
  return { current, hourly, daily, timezone: tz };
}
