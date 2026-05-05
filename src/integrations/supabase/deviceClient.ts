/**
 * Device-scoped Supabase client. Sends x-device-id on every request so RLS
 * (current_device_id()) authorises rows for this anonymous browser.
 *
 * IMPORTANT: do NOT edit the auto-generated client.ts. This is a separate
 * client used for device-scoped tables (exam_attempts, question_stats,
 * question_notes, user_settings, active_session).
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getDeviceId } from '@/lib/deviceId';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const deviceId = getDeviceId();

export const cloud = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'x-device-id': deviceId } },
  realtime: { params: { eventsPerSecond: 5 } },
});
