// Vercel Serverless Function: /api/gemini
// Keep GEMINI_API_KEY only in Vercel Environment Variables. Never expose it to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: 'Gemini chưa được cấu hình. Hãy thêm GEMINI_API_KEY trong Vercel Environment Variables.',
    });
  }

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) {
    return res.status(400).json({ ok: false, error: 'Prompt không được để trống.' });
  }
  if (prompt.length > 12000) {
    return res.status(413).json({ ok: false, error: 'Prompt vượt quá giới hạn 12.000 ký tự.' });
  }

  try {
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
    if (!response.ok) {
      return res.status(response.status === 429 ? 429 : 502).json({
        ok: false,
        error: 'Gemini chưa thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.',
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return res.status(502).json({ ok: false, error: 'Gemini không trả về nội dung.' });
    }
    return res.status(200).json({ ok: true, text });
  } catch {
    return res.status(502).json({ ok: false, error: 'Không thể kết nối Gemini.' });
  }
}
