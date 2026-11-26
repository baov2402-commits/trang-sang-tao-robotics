import { createHmac, timingSafeEqual } from 'node:crypto';

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!adminEmail || !adminPassword || !sessionSecret) {
    return res.status(503).json({ ok: false, error: 'Admin authentication is not configured.' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const expectedEmail = adminEmail.trim().toLowerCase();
  const emailA = Buffer.from(email);
  const emailB = Buffer.from(expectedEmail);
  const passA = Buffer.from(password);
  const passB = Buffer.from(adminPassword);
  const emailMatches = emailA.length === emailB.length && timingSafeEqual(emailA, emailB);
  const passwordMatches = passA.length === passB.length && timingSafeEqual(passA, passB);

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials.' });
  }

  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = String(expires);
  const token = `${payload}.${sign(payload, sessionSecret)}`;
  res.setHeader('Set-Cookie', `robotics_admin_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`);
  return res.status(200).json({ ok: true, role: 'admin', name: 'Quản trị viên' });
}
