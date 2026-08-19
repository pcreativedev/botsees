/** Pedir una URL como si fuéramos un rastreador concreto. */
export async function traer(url, ua, { timeout = 15000 } = {}) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, {
      headers: { "user-agent": ua, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    const cuerpo = await r.text();
    return { ok: true, estado: r.status, ms: Date.now() - t0, cuerpo,
             servidor: r.headers.get("server") || "", url: r.url };
  } catch (e) {
    return { ok: false, estado: 0, ms: Date.now() - t0, cuerpo: "", error: e.name === "AbortError" ? "sin respuesta a tiempo" : e.message };
  } finally {
    clearTimeout(reloj);
  }
}
