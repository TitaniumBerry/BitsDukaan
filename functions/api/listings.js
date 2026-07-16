export async function onRequest(context) {
  const { env } = context;

  const result = await env.DB
    .prepare(`
      SELECT *
      FROM listings
      ORDER BY created_at DESC
    `)
    .all();

  return Response.json(result.results);
}
