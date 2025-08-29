export type City = {
  id?: number;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type CurrentWeather = {
  temperature: number;
  apparent: number;
  humidity: number;
  precip: number;
  windSpeed: number;
  windDir: number;
  isDay: boolean;
  code: number;
  timeISO: string;
  pressure?: number;
  visibility?: number;
};

export type HourlyData = {
  timeISO: string[];
  temperature: number[];
  humidity: number[];
};

export type DailyData = {
  timeISO: string[];
  tmax: number[];
  tmin: number[];
  sunrise: string[];
  sunset: string[];
  weatherCode: number[];
};
