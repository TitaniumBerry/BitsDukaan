export async function onRequest(context) {
  const cookie =
    context.request.headers.get("Cookie") || "";

  const match =
    cookie.match(/session=([^;]+)/);

  if (!match) {
    return new Response("Unauthorized", {
      status: 401
    });
  }

  try {
    const user = JSON.parse(
      atob(match[1])
    );

    return Response.json({
      email: user.email,
      name: user.name
    });
  } catch {
    return new Response("Unauthorized", {
      status: 401
    });
  }
}