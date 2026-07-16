export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const redirectUri = `${url.origin}/google/callback`;

  const googleUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth"
  );

  googleUrl.searchParams.set(
    "client_id",
    env.GOOGLE_CLIENT_ID
  );
  googleUrl.searchParams.set(
    "redirect_uri",
    redirectUri
  );
  googleUrl.searchParams.set(
    "response_type",
    "code"
  );
  googleUrl.searchParams.set(
    "scope",
    "openid email profile"
  );
  googleUrl.searchParams.set(
    "prompt",
    "select_account"
  );

  return Response.redirect(
    googleUrl.toString(),
    302
  );
}