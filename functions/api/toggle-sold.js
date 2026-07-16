export async function onRequestPost(context) {
  const { request, env } = context;

  const { id, sold } = await request.json();

  await env.DB.prepare(`
    UPDATE listings
    SET sold = ?
    WHERE id = ?
  `)
  .bind(sold ? 1 : 0, id)
  .run();

  return Response.json({
    success: true
  });
}