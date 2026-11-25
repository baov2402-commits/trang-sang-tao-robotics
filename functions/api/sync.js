// Cloudflare Pages Function: /api/sync
// Để bật đồng bộ dữ liệu thật giữa nhiều máy trên Cloudflare Pages:
// Vào Cloudflare Dashboard -> Pages -> Settings -> Functions -> KV namespace bindings
// Thêm binding tên: ROBOTICS_KV

export async function onRequestGet({ env }) {
  if (!env.ROBOTICS_KV) {
    return new Response(
      JSON.stringify({ enabled: false, message: 'Chưa gắn ROBOTICS_KV binding' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const raw = await env.ROBOTICS_KV.get('shared_state');
  return new Response(raw || JSON.stringify({ enabled: true, data: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.ROBOTICS_KV) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Chưa gắn ROBOTICS_KV binding' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const body = await request.json();
  await env.ROBOTICS_KV.put('shared_state', JSON.stringify({ enabled: true, data: body, updatedAt: Date.now() }));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
