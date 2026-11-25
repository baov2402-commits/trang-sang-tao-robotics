// Vercel Serverless Function: /api/gemini
// Đọc GEMINI_API_KEY từ Vercel -> Project Settings -> Environment Variables

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      ok: false,
      error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel Environment Variables.',
    });
  }

  try {
    const { prompt } = req.body || {};
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ ok: Boolean(text), text });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
