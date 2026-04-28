// functions/proxy/[[path]].js

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Reconstruir la URL destino desde el path Y el search
  // El router de CF colapsa https:// → https:/ entonces lo reparamos
  let raw = url.pathname.replace(/^\/proxy\//, "");

  // Reparar protocolo colapsado: "https:/algo" → "https://algo"
  raw = raw.replace(/^(https?):\/([^/])/, "$1://$2");

  if (!raw.startsWith("http")) {
    return new Response("URL inválida. Usa: /proxy/https://sitio.com", { status: 400 });
  }

  const targetUrl = raw + (url.search || "");

  let req;
  try {
    req = new Request(targetUrl, {
      method: context.request.method,
      headers: (() => {
        const h = new Headers(context.request.headers);
        h.set("Host", new URL(targetUrl).host);
        h.delete("cf-connecting-ip");
        h.delete("cf-ipcountry");
        h.delete("cf-ray");
        h.delete("x-forwarded-for");
        return h;
      })(),
      body: ["GET", "HEAD"].includes(context.request.method) ? null : context.request.body,
      redirect: "follow",
    });
  } catch (e) {
    return new Response("Error construyendo request: " + e.message, { status: 400 });
  }

  let res;
  try {
    res = await fetch(req);
  } catch (e) {
    return new Response("Error fetching: " + e.message, { status: 502 });
  }

  const contentType = res.headers.get("content-type") || "";
  const origin = url.origin;

  if (contentType.includes("text/html")) {
    let html = await res.text();
    const targetOrigin = new URL(targetUrl).origin;

    // Reescribir URLs absolutas para que pasen por el proxy
    html = html.replaceAll(targetOrigin, `${origin}/proxy/${targetOrigin}`);

    const newHeaders = new Headers(res.headers);
    newHeaders.delete("content-security-policy");
    newHeaders.delete("x-frame-options");
    newHeaders.set("content-type", "text/html; charset=utf-8");

    return new Response(html, {
      status: res.status,
      headers: newHeaders,
    });
  }

  const newHeaders = new Headers(res.headers);
  newHeaders.delete("content-security-policy");
  newHeaders.delete("x-frame-options");

  return new Response(res.body, {
    status: res.status,
    headers: newHeaders,
  });
}
