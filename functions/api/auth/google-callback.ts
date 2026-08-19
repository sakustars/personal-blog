import { clearStateCookie, createSessionCookie, getCookie, json, parseState, providerConfig } from "./_utils";

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = parseState(url.searchParams.get("state"));
  const savedState = getCookie(request, "google_oauth_state");
  const { clientId, clientSecret, sessionSecret } = providerConfig(context.env, "google");

  if (!code || !state || !savedState || savedState !== state.nonce) {
    return new Response("Invalid or expired Google login state. Please try again.", { status: 400 });
  }
  if (!clientId || !clientSecret || !sessionSecret) {
    return new Response("Google login is not configured: missing OAuth/session environment variables.", { status: 503 });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: `${url.origin}/api/auth/google-callback` }),
  });
  const tokenData = await tokenResponse.json() as { access_token?: string; error?: string; error_description?: string };
  if (!tokenResponse.ok || !tokenData.access_token) {
    return json({ error: tokenData.error || "token_exchange_failed", message: tokenData.error_description || "Google OAuth token exchange failed" }, { status: 400 });
  }

  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  if (!userResponse.ok) return new Response("Failed to load Google profile.", { status: 502 });
  const user = await userResponse.json() as { sub: string; email?: string; name?: string; picture?: string };
  if (!user.sub) return new Response("Google did not return a stable account identifier.", { status: 502 });

  const headers = new Headers({ Location: state.returnTo });
  headers.append("Set-Cookie", clearStateCookie("google"));
  headers.append("Set-Cookie", await createSessionCookie({
    provider: "google", subject: user.sub, login: user.email || user.sub,
    name: user.name || user.email || "Google user", avatar_url: user.picture || null, email: user.email || null,
  }, sessionSecret));
  return new Response(null, { status: 302, headers });
}
