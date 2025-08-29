import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { HourlyData } from '../types';
import type { Unit } from '../utils/format';

type Props = { tz?: string; unit: Unit; hourly: HourlyData };

export function HourlyChart({ tz, unit, hourly }: Props) {
  const data = (hourly.timeISO || []).slice(0, 24).map((t, i) => ({
    time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', hour12: false, timeZone: tz }).format(new Date(t)),
    temp: hourly.temperature[i],
    humidity: hourly.humidity[i]
  }));
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Next 24 Hours</h2>
        <span className="text-xs opacity-70">{unit === 'imperial' ? '°F' : '°C'}</span>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temp" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
