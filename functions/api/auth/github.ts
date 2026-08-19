export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const clientId = context.env.GITHUB_CLIENT_ID || context.env.PUBLIC_GITHUB_CLIENT_ID;
  if (!clientId) return new Response("Missing GITHUB_CLIENT_ID", { status: 500 });
  const state = crypto.randomUUID();
  const target = new URL("https://github.com/login/oauth/authorize");
  target.searchParams.set("client_id", clientId);
  target.searchParams.set("redirect_uri", `${url.origin}/api/auth/callback`);
  target.searchParams.set("scope", "read:user user:email");
  target.searchParams.set("state", state);
  return new Response(null, { status: 302, headers: { Location: target.toString(), "Set-Cookie": `github_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}
