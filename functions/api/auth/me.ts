import { authConfig, clearSessionCookies, json, readSession } from "./_utils";

export async function onRequest(context: any) {
  const request = context.request as Request;
  const { sessionSecret } = authConfig(context.env);

  if (!sessionSecret) {
    return json({ authenticated: false, user: null }, { status: 200 });
  }

  const session = await readSession(request, sessionSecret);
  if (!session) {
    const headers = new Headers();
    for (const cookie of clearSessionCookies()) headers.append("Set-Cookie", cookie);
    return json({ authenticated: false, user: null }, { status: 200, headers });
  }

  return json({
    authenticated: true,
    user: {
      login: session.login,
      name: session.name || session.login,
      avatar_url: session.avatar_url,
      html_url: session.html_url,
      email: session.email,
    },
  });
}
