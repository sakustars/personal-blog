export async function onRequest() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": "carleight_user=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
  });
}
