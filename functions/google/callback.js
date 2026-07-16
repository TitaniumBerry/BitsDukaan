async function createSession(user) {
  return btoa(
    JSON.stringify({
      email: user.email,
      name: user.name,
      ts: Date.now()
    })
  );
}

export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", {
      status: 400
    });
  }

  const redirectUri = `${url.origin}/google/callback`;

  const tokenRes = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    }
  );

  const tokenData = await tokenRes.json();

  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    }
  );

  const user = await userRes.json();

  if (
    !user.email ||
    !user.email
      .toLowerCase()
      .endsWith("@pilani.bits-pilani.ac.in")
  ) {
    return new Response(
      "Only BITS Pilani accounts are allowed.",
      { status: 403 }
    );
  }

  const session = await createSession(user);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie":
        `session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    }
  });
}