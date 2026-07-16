export async function onRequestPost(context) {
  const { request, env } = context;

  const { id } = await request.json();

  await env.DB.prepare(`
    DELETE FROM listings
    WHERE id = ?
  `)
  .bind(id)
  .run();

  return Response.json({
    success: true
  });
}