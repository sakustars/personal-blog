import { authConfig, createSessionCookie, json, readSession } from "./auth/_utils";

type ProfileInput = {
  name?: unknown;
  bio?: unknown;
  location?: unknown;
  website?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function website(value: unknown) {
  const normalized = text(value, 160);
  if (!normalized) return "";
  try {
    const url = new URL(normalized.includes("://") ? normalized : `https://${normalized}`);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function onRequest(context: any) {
  const request = context.request as Request;
  const { sessionSecret } = authConfig(context.env);
  if (!sessionSecret) return json({ error: "session_not_configured" }, { status: 503 });

  const session = await readSession(request, sessionSecret);
  if (!session) return json({ error: "unauthorized" }, { status: 401 });

  if (request.method === "GET") return json({ profile: session });
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, { status: 405, headers: { Allow: "GET, POST" } });
  }

  let input: ProfileInput;
  try {
    input = await request.json() as ProfileInput;
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  const nextWebsite = website(input.website);
  if (nextWebsite === null) return json({ error: "invalid_website" }, { status: 400 });

  const updated = {
    ...session,
    name: text(input.name, 60) || session.login,
    bio: text(input.bio, 180) || null,
    location: text(input.location, 80) || null,
    website: nextWebsite || null,
  };
  const headers = new Headers();
  headers.append("Set-Cookie", await createSessionCookie(updated, sessionSecret));
  return json({ profile: updated }, { headers });
}
