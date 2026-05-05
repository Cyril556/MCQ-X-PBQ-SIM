/**
 * Anonymous device identity. A single UUID stored in localStorage that scopes
 * every cloud row to this browser via the x-device-id header + RLS policy.
 */
const KEY = 'secplus-device-id';

function uuid(): string {
  // crypto.randomUUID is available in all modern browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  // Fallback (very unlikely path)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(KEY, id);
  }
  return id;
}
