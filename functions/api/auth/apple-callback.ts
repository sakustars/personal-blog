import { clearStateCookie, createSessionCookie, getCookie, json, parseState, providerConfig } from "./_utils";

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJson(value: string) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as Record<string, unknown>;
}

async function verifyAppleIdentityToken(token: string, clientId: string, nonce: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const header = decodeJson(parts[0]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") return null;

  const keysResponse = await fetch("https://appleid.apple.com/auth/keys");
  if (!keysResponse.ok) return null;
  const { keys } = await keysResponse.json() as { keys: Array<JsonWebKey & { kid?: string }> };
  const jwk = keys.find(key => key.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    decodeBase64Url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!validSignature) return null;

  const claims = decodeJson(parts[1]);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const now = Math.floor(Date.now() / 1000);
  if (
    claims.iss !== "https://appleid.apple.com" ||
    !audience.includes(clientId) ||
    Number(claims.exp || 0) < now ||
    claims.nonce !== nonce ||
    typeof claims.sub !== "string"
  ) return null;
  return claims;
}

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const form = request.method === "POST" ? await request.formData() : url.searchParams;
  const code = String(form.get("code") || "");
  const state = parseState(String(form.get("state") || ""));
  const savedState = getCookie(request, "apple_oauth_state");
  const { clientId, clientSecret, sessionSecret } = providerConfig(context.env, "apple");

  if (!code || !state || !savedState || savedState !== state.nonce) {
    return new Response("Invalid or expired Apple login state. Please try again.", { status: 400 });
  }
  if (!clientId || !clientSecret || !sessionSecret) {
    return new Response("Apple login is not configured: missing OAuth/session environment variables.", { status: 503 });
  }

  const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: `${url.origin}/api/auth/apple-callback` }),
  });
  const tokenData = await tokenResponse.json() as { id_token?: string; error?: string };
  const claims = tokenData.id_token ? await verifyAppleIdentityToken(tokenData.id_token, clientId, state.nonce) : null;
  if (!tokenResponse.ok || !claims) return json({ error: tokenData.error || "invalid_identity_token" }, { status: 400 });

  let suppliedName = "";
  const rawUser = form.get("user");
  if (rawUser) {
    try {
      const parsed = JSON.parse(String(rawUser)) as { name?: { firstName?: string; lastName?: string } };
      suppliedName = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(" ");
    } catch { /* Apple only supplies this once; identity is still verified by the signed token. */ }
  }
  const email = typeof claims.email === "string" ? claims.email : null;
  const name = suppliedName || email?.split("@")[0] || "Apple user";
  const headers = new Headers({ Location: state.returnTo });
  headers.append("Set-Cookie", clearStateCookie("apple"));
  headers.append("Set-Cookie", await createSessionCookie({
    provider: "apple", subject: String(claims.sub), login: email || String(claims.sub), name, email,
  }, sessionSecret));
  return new Response(null, { status: 302, headers });
}
