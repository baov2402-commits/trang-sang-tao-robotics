// Lớp đồng bộ dữ liệu thật giữa các tài khoản & thiết bị:
// 1. Hỗ trợ Firebase Realtime Database URL (nếu người dùng/Admin nhập)
// 2. Hỗ trợ Cloudflare Pages Function (/api/sync với ROBOTICS_KV)
// 3. Hỗ trợ BroadcastChannel cho đồng bộ tức thì giữa các tab cùng trình duyệt

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('robotics_realtime_sync') : null;

export async function pushSharedState(payload, firebaseUrl) {
  try {
    channel?.postMessage({ type: 'SYNC_STATE', payload });
  } catch {
    // ignore
  }

  if (firebaseUrl && firebaseUrl.startsWith('https://')) {
    const cleanUrl = firebaseUrl.replace(/\/+$/, '');
    try {
      await fetch(`${cleanUrl}/robotics_state.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, updatedAt: Date.now() }),
      });
      return { mode: 'firebase', ok: true };
    } catch {
      // fallback
    }
  }

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.ok) return { mode: 'cloudflare-kv', ok: true };
  } catch {
    // local dev without Pages Functions
  }

  return { mode: 'local', ok: true };
}

export async function pullSharedState(firebaseUrl) {
  if (firebaseUrl && firebaseUrl.startsWith('https://')) {
    const cleanUrl = firebaseUrl.replace(/\/+$/, '');
    try {
      const res = await fetch(`${cleanUrl}/robotics_state.json`, { cache: 'no-store' });
      const data = await res.json();
      if (data) return { mode: 'firebase', data };
    } catch {
      // ignore
    }
  }

  try {
    const res = await fetch('/api/sync', { cache: 'no-store' });
    const json = await res.json();
    if (json?.enabled && json?.data) {
      return { mode: 'cloudflare-kv', data: json.data };
    }
  } catch {
    // ignore
  }

  return { mode: 'local', data: null };
}

export function subscribeTabSync(callback) {
  if (!channel) return () => {};
  const handler = (ev) => {
    if (ev.data?.type === 'SYNC_STATE') {
      callback(ev.data.payload);
    }
  };
  channel.addEventListener('message', handler);
  return () => channel.removeEventListener('message', handler);
}
