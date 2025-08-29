export type Unit = 'metric' | 'imperial';

export const cToF = (c: number) => (c * 9) / 5 + 32;
export const kmhToMph = (k: number) => k * 0.621371;

export const formatTemp = (c: number, unit: Unit) =>
  unit === 'imperial' ? `${Math.round(cToF(c))}°F` : `${Math.round(c)}°C`;

export const formatWind = (k: number, unit: Unit) =>
  unit === 'imperial' ? `${Math.round(kmhToMph(k))} mph` : `${Math.round(k)} km/h`;

export const degToCompass = (deg: number) => {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const i = Math.round(deg / 22.5) % 16;
  return dirs[i];
};

export const formatLocalTime = (iso: string, tz?: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: 'short', hour12: false, timeZone: tz
  }).format(new Date(iso));
