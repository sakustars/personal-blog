function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = readCookie(request, "github_oauth_state");
  const clientId = context.env.GITHUB_CLIENT_ID || context.env.PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET;
  if (!code || !state || !savedState || state !== savedState) return new Response("Invalid GitHub OAuth state", { status: 400 });
  if (!clientId || !clientSecret) return new Response("Missing GitHub OAuth environment variables", { status: 500 });
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${url.origin}/api/auth/callback` }) });
  const tokenData = (await tokenResponse.json()) as any;
  if (!tokenData.access_token) return new Response("GitHub OAuth token exchange failed", { status: 400 });
  const userResponse = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json", "User-Agent": "carleight-blog" } });
  const user = (await userResponse.json()) as any;
  const session = btoa(JSON.stringify({ login: user.login, name: user.name, avatar_url: user.avatar_url, html_url: user.html_url }));
  const headers = new Headers({ Location: "/" });
  headers.append("Set-Cookie", "github_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  headers.append("Set-Cookie", `carleight_user=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  return new Response(null, { status: 302, headers });
}
