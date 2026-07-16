export async function onRequestPost(context) {
  const { request, env } = context;

  const listing = await request.json();

  await env.DB.prepare(`
    INSERT INTO listings (
      id,
      title,
      category,
      branch,
      year,
      campus,
      description,
      price,
      item_condition,
      seller_name,
      seller_phone,
      seller_email,
      created_at,
      sold
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  .bind(
    listing.id,
    listing.title,
    listing.category,
    listing.branch,
    listing.year,
    listing.campus,
    listing.description,
    listing.price,
    listing.condition,
    listing.sellerName,
    listing.sellerPhone,
    listing.sellerEmail,
    listing.createdAt,
    0
  )
  .run();

  return Response.json({
    success: true
  });
}