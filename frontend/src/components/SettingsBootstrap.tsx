import {useEffect} from 'react';
import {useAuthStore} from '../store/useAuthStore';
import {applySettings, useSettingsStore} from '../store/useSettingsStore';

export default function SettingsBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const load = useSettingsStore((state) => state.load);
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    applySettings(settings);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = () => applySettings(settings);
    media.addEventListener('change', syncSystemTheme);
    return () => media.removeEventListener('change', syncSystemTheme);
  }, [settings]);

  useEffect(() => {
    if (isAuthenticated) void load();
  }, [isAuthenticated, load]);

  return null;
}
