import { createStateCookie, encodeState, providerConfig, safeReturnTo } from "./_utils";

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const { clientId } = providerConfig(context.env, "google");
  if (!clientId) return new Response("Google login is not configured: missing GOOGLE_CLIENT_ID.", { status: 503 });

  const returnTo = safeReturnTo(url.searchParams.get("return_to") || request.headers.get("Referer"));
  const nonce = crypto.randomUUID();
  const target = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", `${url.origin}/api/auth/google-callback`);
  target.searchParams.set("response_type", "code");
  target.searchParams.set("scope", "openid email profile");
  target.searchParams.set("state", encodeState({ nonce, returnTo }));
  target.searchParams.set("prompt", "select_account");

  return new Response(null, {
    status: 302,
    headers: { Location: target.toString(), "Set-Cookie": createStateCookie(nonce, "google") },
  });
}
