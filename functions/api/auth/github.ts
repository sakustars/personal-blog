import { authConfig, createStateCookie, encodeState, safeReturnTo } from "./_utils";

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const { clientId } = authConfig(context.env);

  if (!clientId) {
    return new Response("GitHub login is not configured: missing GITHUB_CLIENT_ID.", { status: 500 });
  }

  const returnTo = safeReturnTo(url.searchParams.get("return_to") || request.headers.get("Referer"));
  const nonce = crypto.randomUUID();
  const state = encodeState({ nonce, returnTo });
  const target = new URL("https://github.com/login/oauth/authorize");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", `${url.origin}/api/auth/callback`);
  target.searchParams.set("scope", "read:user user:email");
  target.searchParams.set("state", state);
  target.searchParams.set("allow_signup", "true");

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Set-Cookie": createStateCookie(nonce),
    },
  });
}
