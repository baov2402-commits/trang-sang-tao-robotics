import { createHmac, timingSafeEqual } from 'node:crypto';

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const entry = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false });
  }
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return res.status(503).json({ ok: false });
  const token = getCookie(req, 'robotics_admin_session');
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) <= Math.floor(Date.now() / 1000)) {
    return res.status(401).json({ ok: false });
  }
  const expected = createHmac('sha256', secret).update(expires).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ ok: false });
  }
  return res.status(200).json({ ok: true, role: 'admin', email: process.env.ADMIN_EMAIL || '', name: 'Quản trị viên' });
}
