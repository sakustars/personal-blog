function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
export async function onRequest(context: any) {
  const session = readCookie(context.request, "carleight_user");
  if (!session) return Response.json(null, { status: 401 });
  try { return Response.json(JSON.parse(atob(session))); } catch { return Response.json(null, { status: 401 }); }
}
