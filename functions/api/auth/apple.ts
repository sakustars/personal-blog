import { createStateCookie, encodeState, providerConfig, safeReturnTo } from "./_utils";

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const { clientId } = providerConfig(context.env, "apple");
  if (!clientId) return new Response("Apple login is not configured: missing APPLE_CLIENT_ID.", { status: 503 });

  const returnTo = safeReturnTo(url.searchParams.get("return_to") || request.headers.get("Referer"));
  const nonce = crypto.randomUUID();
  const target = new URL("https://appleid.apple.com/auth/authorize");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", `${url.origin}/api/auth/apple-callback`);
  target.searchParams.set("response_type", "code id_token");
  target.searchParams.set("response_mode", "form_post");
  target.searchParams.set("scope", "name email");
  target.searchParams.set("state", encodeState({ nonce, returnTo }));
  target.searchParams.set("nonce", nonce);

  return new Response(null, {
    status: 302,
    headers: { Location: target.toString(), "Set-Cookie": createStateCookie(nonce, "apple") },
  });
}
