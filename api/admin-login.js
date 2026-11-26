import { timingSafeEqual } from 'node:crypto';

// Admin credentials are configured only in Vercel Environment Variables:
// ADMIN_EMAIL and ADMIN_PASSWORD. Never commit either value.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return res.status(503).json({ ok: false, error: 'Admin authentication is not configured.' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const expectedEmail = adminEmail.trim().toLowerCase();
  const a = Buffer.from(email);
  const b = Buffer.from(expectedEmail);
  const p = Buffer.from(password);
  const q = Buffer.from(adminPassword);

  const emailMatches = a.length === b.length && timingSafeEqual(a, b);
  const passwordMatches = p.length === q.length && timingSafeEqual(p, q);

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials.' });
  }

  return res.status(200).json({
    ok: true,
    role: 'admin',
    name: 'Quản trị viên',
  });
}
