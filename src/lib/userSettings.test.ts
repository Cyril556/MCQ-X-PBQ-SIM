import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS, loadSettingsLocal } from '@/lib/userSettings';

describe('userSettings', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing stored', () => {
    expect(loadSettingsLocal()).toEqual(DEFAULT_SETTINGS);
  });

  it('merges stored partial settings with defaults', () => {
    localStorage.setItem('secplus-user-settings', JSON.stringify({ font_size: 'large' }));
    const s = loadSettingsLocal();
    expect(s.font_size).toBe('large');
    expect(s.daily_minutes_goal).toBe(DEFAULT_SETTINGS.daily_minutes_goal);
  });

  it('falls back to defaults on corrupt JSON', () => {
    localStorage.setItem('secplus-user-settings', '{not json');
    expect(loadSettingsLocal()).toEqual(DEFAULT_SETTINGS);
  });
});
