import { City } from '../types';
import { Prefs } from '../utils/storage';
import { MapPin, Trash2 } from 'lucide-react';

type Props = {
  favorites: City[];
  onPick: (c: City) => void;
  onRemove: (c: City) => void;
  query: string;
  setQuery: (v: string) => void;
  suggestions: City[];
  onSelectSuggestion: (c: City) => void;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
};

export function Sidebar({ favorites, onPick, onRemove, query, setQuery, suggestions, onSelectSuggestion }: Props) {
  return (
    <aside className="rounded-2xl border border-base-300 bg-base-100/80 backdrop-blur p-4 shadow-xl">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Search City</span>
        </label>
        <input
          className="input input-bordered w-full"
          placeholder="e.g., Paris"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="menu bg-base-100 rounded-box mt-2 shadow">
            {suggestions.map((s, i) => (
              <li key={i}><a onClick={() => onSelectSuggestion(s)}><MapPin size={16}/>{s.name}{s.country ? `, ${s.country}` : ''}</a></li>
            ))}
          </ul>
        )}
      </div>

      {favorites.length > 0 && (
        <div className="mt-6">
          <div className="text-xs uppercase opacity-70 mb-2">Favorites</div>
          <ul className="space-y-2">
            {favorites.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => onPick(c)}><MapPin size={16}/>{c.name}{c.country ? `, ${c.country}` : ''}</button>
                <button className="btn btn-ghost btn-xs" onClick={() => onRemove(c)} title="Remove"><Trash2 size={14}/></button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
