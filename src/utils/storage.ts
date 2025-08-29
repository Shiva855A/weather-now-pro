import type { City } from '../types';
const FAV_KEY = 'wnp-favorites-v1';
const PREF_KEY = 'wnp-prefs-v1';

export const loadFavorites = (): City[] => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
};
export const saveFavorite = (city: City) => {
  const list = loadFavorites();
  if (!list.find(c => c.name === city.name && c.country === city.country)) {
    list.unshift(city);
    localStorage.setItem(FAV_KEY, JSON.stringify(list.slice(0, 10)));
  }
  return list;
};
export const removeFavorite = (city: City) => {
  const next = loadFavorites().filter(c => !(c.name === city.name && c.country === city.country));
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next;
};

export type Prefs = { unit: 'metric' | 'imperial'; theme?: string; };
export const loadPrefs = (): Prefs => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{"unit":"metric"}'); } catch { return { unit: 'metric' }; }
};
export const savePrefs = (prefs: Prefs) => localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
