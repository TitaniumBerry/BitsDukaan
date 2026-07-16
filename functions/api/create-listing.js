export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const listing = await request.json();

    const result = await env.DB.prepare(`
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
      listing.desc,
      listing.price,
      listing.condition,
      listing.sellerName,
      listing.sellerPhone,
      listing.sellerEmail,
      listing.createdAt,
      0
    )
    .run();

    return new Response(
      JSON.stringify({ success: true, result }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || String(err),
        stack: err?.stack || null
      }, null, 2),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}