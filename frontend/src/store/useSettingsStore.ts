import {create} from 'zustand';
import {apiRequest} from '../lib/api';

export interface UserSettings {
  themePreference: 'system' | 'dark' | 'light';
  displayDensity: 'comfortable' | 'compact';
  fontScale: 'small' | 'normal' | 'large';
  autoOpenChatbot: boolean;
  notifySocial: boolean;
  notifyMarketplace: boolean;
  notifyMessages: boolean;
}

const defaults: UserSettings = {
  themePreference: 'system',
  displayDensity: 'comfortable',
  fontScale: 'normal',
  autoOpenChatbot: false,
  notifySocial: true,
  notifyMarketplace: true,
  notifyMessages: true,
};

const storageKey = 'carhub_settings';

const readStoredSettings = (): UserSettings => {
  try {
    return {...defaults, ...JSON.parse(localStorage.getItem(storageKey) ?? '{}')};
  } catch {
    return defaults;
  }
};

export const applySettings = (settings: UserSettings) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolvedTheme = settings.themePreference === 'system'
    ? (prefersDark ? 'dark' : 'light')
    : settings.themePreference;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.density = settings.displayDensity;
  document.documentElement.dataset.fontScale = settings.fontScale;
};

interface SettingsState {
  settings: UserSettings;
  isLoaded: boolean;
  load: () => Promise<void>;
  save: (settings: UserSettings) => Promise<void>;
  resetLocal: () => void;
}

const initialSettings = readStoredSettings();
applySettings(initialSettings);

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: initialSettings,
  isLoaded: false,

  async load() {
    try {
      const settings = await apiRequest<UserSettings>('/users/me/settings');
      localStorage.setItem(storageKey, JSON.stringify(settings));
      applySettings(settings);
      set({settings, isLoaded: true});
    } catch {
      set({isLoaded: true});
    }
  },

  async save(settings) {
    const saved = await apiRequest<UserSettings>('/users/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
    localStorage.setItem(storageKey, JSON.stringify(saved));
    applySettings(saved);
    set({settings: saved, isLoaded: true});
  },

  resetLocal() {
    localStorage.removeItem(storageKey);
    applySettings(defaults);
    set({settings: defaults, isLoaded: false});
  },
}));
