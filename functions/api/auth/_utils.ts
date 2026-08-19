export type GithubUser = {
  login: string;
  name?: string | null;
  avatar_url?: string | null;
  html_url?: string | null;
  email?: string | null;
};

export type SessionPayload = GithubUser & {
  iat: number;
  exp: number;
};

const SESSION_COOKIE = "carleight_session";
const STATE_COOKIE = "github_oauth_state";
const LEGACY_COOKIE = "carleight_user";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function base64UrlEncode(input: ArrayBuffer | Uint8Array | string) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(signature);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

function getSessionSecret(env: Record<string, string | undefined>) {
  return env.AUTH_SESSION_SECRET || env.GITHUB_CLIENT_SECRET;
}

export function authConfig(env: Record<string, string | undefined>) {
  return {
    clientId: env.GITHUB_CLIENT_ID || env.PUBLIC_GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    sessionSecret: getSessionSecret(env),
  };
}

export function getCookie(request: Request, name: string) {
  return readCookie(request, name);
}

export function createStateCookie(state: string) {
  return `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

export function clearStateCookie() {
  return `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function createSessionCookie(user: GithubUser, secret: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    login: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url || null,
    html_url: user.html_url || null,
    email: user.email || null,
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(secret, body);
  return `${SESSION_COOKIE}=${body}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookies() {
  return [
    `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    `${LEGACY_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  ];
}

export async function readSession(request: Request, secret: string) {
  const value = readCookie(request, SESSION_COOKIE);
  if (!value) return null;

  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = await hmac(secret, body);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload;
    if (!payload.login || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function safeReturnTo(value: string | null) {
  if (!value) return "/";
  try {
    const url = new URL(value, "https://carleight.local");
    if (url.origin !== "https://carleight.local") return "/";
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return "/";
  }
}

export { SESSION_COOKIE, STATE_COOKIE };
