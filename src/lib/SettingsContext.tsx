/**
 * Global settings context — fetches cloud-synced UserSettings on mount,
 * applies font-size + reduce-motion to <html>, exposes setter that re-syncs.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, fetchSettings, saveSettings, type UserSettings } from './userSettings';

interface Ctx {
  settings: UserSettings;
  update: (patch: Partial<UserSettings>) => Promise<void>;
  loaded: boolean;
}

const SettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  update: async () => {},
  loaded: false,
});

const FONT_PX: Record<UserSettings['font_size'], string> = {
  small: '14px',
  normal: '16px',
  large: '18px',
};

function applyToDocument(s: UserSettings) {
  const root = document.documentElement;
  root.style.fontSize = FONT_PX[s.font_size];
  if (s.reduce_motion) root.setAttribute('data-reduce-motion', 'true');
  else root.removeAttribute('data-reduce-motion');
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSettings().then((s) => {
      setSettings(s);
      applyToDocument(s);
      setLoaded(true);
    });
  }, []);

  const update = async (patch: Partial<UserSettings>) => {
    const merged = await saveSettings(patch);
    setSettings(merged);
    applyToDocument(merged);
  };

  return (
    <SettingsContext.Provider value={{ settings, update, loaded }}>{children}</SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
