import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { City } from './types';
import { loadFavorites, saveFavorite, removeFavorite, loadPrefs, savePrefs, type Prefs } from './utils/storage';
import { getBundle, searchCities } from './api/openMeteo';
import { formatLocalTime, formatTemp, formatWind, Unit, degToCompass } from './utils/format';
import { weatherCodeLabel } from './utils/weatherCodes';
import { Sidebar } from './components/Sidebar';
import { HourlyChart } from './components/HourlyChart';
import { ForecastGrid } from './components/ForecastGrid';
import { Sun, Moon, MapPin, Plus, Minus } from 'lucide-react';

type Bundle = Awaited<ReturnType<typeof getBundle>>;

export default function App() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs());
  const [favorites, setFavorites] = useState<City[]>(loadFavorites());
  const [query, setQuery] = useState('');
  const [sugs, setSugs] = useState<City[]>([]);
  const [selected, setSelected] = useState<City | null>(favorites[0] || null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [status, setStatus] = useState<'idle'|'loading'|'ready'|'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (document.querySelector('html') as HTMLElement).setAttribute('data-theme', prefs.theme || 'light');
    savePrefs(prefs);
  }, [prefs]);

  // Debounced search
  useEffect(() => {
    if (!query) { setSugs([]); return; }
    const t = setTimeout(async () => {
      try { setSugs(await searchCities(query)); } catch { setSugs([]); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Load initial city (geolocate if none)
  useEffect(() => {
    if (selected) {
      void load(selected);
      return;
    }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const city: City = { name: 'My Location', latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setSelected(city);
        await load(city);
      }, () => {}, { enableHighAccuracy: true, timeout: 5000 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(city: City) {
    try {
      setStatus('loading'); setError(null);
      const b = await getBundle(city.latitude, city.longitude);
      setBundle(b);
      setStatus('ready');
    } catch (e: any) {
      setStatus('error'); setError(e?.message || 'Failed to fetch weather');
    }
  }

  function onPick(c: City) {
    setSelected(c);
    setSugs([]);
    setQuery(`${c.name}${c.country ? ', ' + c.country : ''}`);
    void load(c);
  }

  function toggleFavorite(c: City) {
    const exists = favorites.find(f => f.name === c.name && f.country === c.country && f.latitude === c.latitude);
    if (exists) {
      setFavorites(removeFavorite(c));
    } else {
      setFavorites(saveFavorite(c));
    }
  }

  const bgClass = useMemo(() => {
    if (!bundle) return 'bg-sky-animated';
    const code = bundle.current.code;
    if (code === 0 || code === 1) return 'bg-gradient-to-b from-blue-100 to-blue-300';
    if ([2,3,45,48].includes(code)) return 'bg-gradient-to-b from-slate-200 to-slate-400';
    if ([61,63,65,80,81,82].includes(code)) return 'bg-gradient-to-b from-sky-200 to-sky-500';
    if ([71,73,75,85,86].includes(code)) return 'bg-gradient-to-b from-slate-100 to-blue-200';
    if ([95,96,99].includes(code)) return 'bg-gradient-to-b from-amber-100 to-rose-300';
    return 'bg-sky-animated';
  }, [bundle]);

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 p-4">
        <Sidebar
          favorites={favorites}
          onPick={onPick}
          onRemove={(c) => setFavorites(removeFavorite(c))}
          query={query}
          setQuery={setQuery}
          suggestions={sugs}
          onSelectSuggestion={onPick}
          prefs={prefs}
          setPrefs={setPrefs}
        />

        <main className="rounded-2xl border border-base-300 bg-base-100/80 backdrop-blur p-4 md:p-6 shadow-xl">
          {status === 'idle' && <p className="text-sm opacity-70">Search or allow location to see weather.</p>}
          {status === 'loading' && <div className="skeleton h-48 w-full"></div>}
          {status === 'error' && <div className="alert alert-error"><span>{error}</span></div>}
          {status === 'ready' && bundle && selected && (
            <div className="space-y-6">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{selected.name}{selected.country ? `, ${selected.country}` : ''}</h1>
                  <p className="text-xs opacity-70">Updated {formatLocalTime(bundle.current.timeISO, bundle.timezone)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm" onClick={() => setPrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })}>
                    {prefs.theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
                    {prefs.theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                  <button className="btn btn-sm" onClick={() => setPrefs({ ...prefs, unit: (prefs.unit === 'metric' ? 'imperial' : 'metric') })}>
                    {prefs.unit === 'metric' ? '°C → °F' : '°F → °C'}
                  </button>
                  <button className="btn btn-sm" onClick={() => toggleFavorite(selected)}>
                    {favorites.find(f => f.name === selected.name && f.country === selected.country) ? <Minus size={16}/> : <Plus size={16}/>}
                    Fav
                  </button>
                </div>
              </header>

              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Metric label="Temp" value={formatTemp(bundle.current.temperature, prefs.unit)} />
                <Metric label="Feels like" value={formatTemp(bundle.current.apparent, prefs.unit)} />
                <Metric label="Humidity" value={`${bundle.current.humidity}%`} />
                <Metric label="Wind" value={`${formatWind(bundle.current.windSpeed, prefs.unit)} ${degToCompass(bundle.current.windDir)}`} />
                <Metric label="Precip" value={`${bundle.current.precip} mm`} />
                <Metric label="Condition" value={weatherCodeLabel(bundle.current.code)} />
              </section>

              <HourlyChart tz={bundle.timezone} unit={prefs.unit} hourly={bundle.hourly} />

              <ForecastGrid tz={bundle.timezone} unit={prefs.unit} daily={bundle.daily} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-base-300 bg-base-100 p-3 text-center shadow-sm">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </motion.div>
  );
}
