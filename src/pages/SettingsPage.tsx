import { Settings as SettingsIcon, Trash2, Cloud } from 'lucide-react';
import { clearHistory } from '@/lib/examHistory';
import { deviceId } from '@/integrations/supabase/deviceClient';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="w-4 h-4 text-success" />
          <h2 className="text-sm font-semibold">Cloud sync</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Your progress is stored anonymously under this device identity. Keep this ID to access your data from another browser session — there is no password recovery.
        </p>
        <div className="bg-muted rounded-md px-3 py-2 font-mono text-xs break-all select-all">{deviceId}</div>
      </section>

      <section className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
        <h2 className="text-sm font-semibold mb-2 text-destructive">Danger zone</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Permanently delete all local exam history and question stats on this device. Cloud copies on this device-id remain unless explicitly removed.
        </p>
        <button
          onClick={() => {
            if (confirm('Clear all local exam history and stats? This cannot be undone.')) {
              clearHistory();
              window.location.reload();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-destructive text-destructive-foreground font-semibold hover:opacity-90"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear local history
        </button>
      </section>
    </div>
  );
}
