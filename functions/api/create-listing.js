export async function onRequestPost(context) {
  return Response.json({
    success: true,
    route: "create-listing"
  });
}