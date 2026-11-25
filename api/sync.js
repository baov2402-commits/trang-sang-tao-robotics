// Vercel Serverless Function: /api/sync
// Hỗ trợ đồng bộ qua Vercel KV / Upstash Redis REST (KV_REST_API_URL & KV_REST_API_TOKEN)
// Nếu chưa gắn KV, trả về enabled: false để app dùng BroadcastChannel hoặc Firebase URL.

export default async function handler(req, res) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(200).json({
      enabled: false,
      ok: false,
      message: 'Chưa gắn Vercel KV (hoặc dùng Firebase Realtime URL trong Admin).',
    });
  }

  const headers = {
    Authorization: `Bearer ${kvToken}`,
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${kvUrl}/get/robotics_shared_state`, { headers });
      const json = await r.json();
      const parsed = json?.result ? JSON.parse(json.result) : null;
      return res.status(200).json({ enabled: true, data: parsed });
    } catch (err) {
      return res.status(200).json({ enabled: false, error: String(err) });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = JSON.stringify(req.body || {});
      await fetch(`${kvUrl}/set/robotics_shared_state`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ ok: false, error: String(err) });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
