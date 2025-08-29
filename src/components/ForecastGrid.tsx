import type { DailyData } from '../types';
import type { Unit } from '../utils/format';
import { weatherCodeLabel } from '../utils/weatherCodes';

type Props = { tz?: string; unit: Unit; daily: DailyData };

export function ForecastGrid({ tz, unit, daily }: Props) {
  const days = daily.timeISO.map((d, i) => ({
    day: new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: tz }).format(new Date(d)),
    max: daily.tmax[i],
    min: daily.tmin[i],
    label: weatherCodeLabel(daily.weatherCode[i]),
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
  }));
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {days.map((d, i) => (
        <div key={i} className="rounded-2xl border border-base-300 bg-base-100 p-3 text-center shadow-sm">
          <div className="text-sm font-semibold">{d.day}</div>
          <div className="text-xs opacity-70">{d.label}</div>
          <div className="mt-2 text-lg">
            <span className="font-semibold">{Math.round(d.max)}°</span>
            <span className="opacity-70"> / {Math.round(d.min)}°</span>
          </div>
          <div className="mt-1 text-[10px] opacity-70">
            <div>↑ {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute:'2-digit', hour12:false, timeZone: tz }).format(new Date(d.sunrise))}</div>
            <div>↓ {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute:'2-digit', hour12:false, timeZone: tz }).format(new Date(d.sunset))}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
