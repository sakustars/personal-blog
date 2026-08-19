import { clearSessionCookies, safeReturnTo } from "./_utils";

export async function onRequest(context: any) {
  const request = context.request as Request;
  const url = new URL(request.url);
  const headers = new Headers({ Location: safeReturnTo(url.searchParams.get("return_to") || request.headers.get("Referer")) });
  for (const cookie of clearSessionCookies()) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 302, headers });
}
