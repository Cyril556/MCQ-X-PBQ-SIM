/**
 * User Settings — cloud-synced via user_settings table, with localStorage fallback.
 */
import { cloud, deviceId } from '@/integrations/supabase/deviceClient';

export interface UserSettings {
  default_mode: 'tutor' | 'sprint' | 'exam';
  daily_minutes_goal: number;
  weekly_question_target: number;
  target_exam_date: string | null; // YYYY-MM-DD
  font_size: 'small' | 'normal' | 'large';
  reduce_motion: boolean;
  amber_threshold_seconds: number;
  red_threshold_seconds: number;
  confidence_required: 'off' | 'optional' | 'required';
}

export const DEFAULT_SETTINGS: UserSettings = {
  default_mode: 'tutor',
  daily_minutes_goal: 30,
  weekly_question_target: 100,
  target_exam_date: null,
  font_size: 'normal',
  reduce_motion: false,
  amber_threshold_seconds: 1200,
  red_threshold_seconds: 300,
  confidence_required: 'optional',
};

const KEY = 'secplus-user-settings';

export function loadSettingsLocal(): UserSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function fetchSettings(): Promise<UserSettings> {
  try {
    const { data } = await cloud.from('user_settings').select('*').eq('device_id', deviceId).maybeSingle();
    if (data) {
      const merged = { ...DEFAULT_SETTINGS, ...data } as UserSettings;
      localStorage.setItem(KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn('[settings] fetch failed, using local', e);
  }
  return loadSettingsLocal();
}

export async function saveSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const merged = { ...loadSettingsLocal(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(merged));
  try {
    await cloud.from('user_settings').upsert(
      { device_id: deviceId, ...merged, updated_at: new Date().toISOString() },
      { onConflict: 'device_id' }
    );
  } catch (e) {
    console.warn('[settings] cloud save failed, kept local', e);
  }
  return merged;
}
