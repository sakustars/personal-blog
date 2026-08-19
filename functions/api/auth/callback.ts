import {
  authConfig,
  clearStateCookie,
  createSessionCookie,
  getCookie,
  json,
  parseState,
} from "./_utils";

async function fetchPrimaryEmail(accessToken: string) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "carleight-blog",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) return null;
  const emails = (await response.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
  return emails.find(email => email.primary && email.verified)?.email || null;
}

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return new Response(`GitHub OAuth failed: ${error}`, { status: 400 });

  const code = url.searchParams.get("code");
  const state = parseState(url.searchParams.get("state"));
  const savedState = getCookie(request, "github_oauth_state");
  const { clientId, clientSecret, sessionSecret } = authConfig(context.env);

  if (!code || !state || !savedState || savedState !== state.nonce) {
    return new Response("Invalid or expired GitHub login state. Please try logging in again.", { status: 400 });
  }

  if (!clientId || !clientSecret || !sessionSecret) {
    return new Response("GitHub login is not configured: missing OAuth/session environment variables.", { status: 500 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${url.origin}/api/auth/callback`,
    }),
  });
  const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string; error_description?: string };

  if (!tokenResponse.ok || !tokenData.access_token) {
    return json({ error: tokenData.error || "token_exchange_failed", message: tokenData.error_description || "GitHub OAuth token exchange failed" }, { status: 400 });
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "carleight-blog",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!userResponse.ok) return new Response("Failed to load GitHub profile.", { status: 502 });

  const user = (await userResponse.json()) as {
    login: string;
    name?: string | null;
    avatar_url?: string | null;
    html_url?: string | null;
    email?: string | null;
  };
  const email = user.email || await fetchPrimaryEmail(tokenData.access_token);

  const headers = new Headers({ Location: state.returnTo });
  headers.append("Set-Cookie", clearStateCookie());
  headers.append("Set-Cookie", await createSessionCookie({ ...user, email, provider: "github", subject: user.login }, sessionSecret));

  return new Response(null, { status: 302, headers });
}
