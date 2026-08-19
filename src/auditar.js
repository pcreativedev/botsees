import { BOTS, NAVEGADOR } from "./bots.js";
import { analizar, permite } from "./robots.js";
import { palabras, pintadoConJs, señales } from "./texto.js";
import { traer } from "./traer.js";

/**
 * La auditoría: pedir la página como cada rastreador y comparar con lo que ve
 * un navegador.
 *
 * El orden importa: primero el navegador, porque su cuenta de palabras es la
 * referencia contra la que se mide todo lo demás.
 */
export async function auditar(url) {
  const u = new URL(url);
  const ruta = u.pathname + u.search;

  const base = await traer(url, NAVEGADOR);
  if (!base.ok) return { error: `No responde: ${base.error}` };

  const nBase = palabras(base.cuerpo);
  const js = pintadoConJs(base.cuerpo, nBase);
  const meta = señales(base.cuerpo);

  // robots.txt
  const rob = await traer(new URL("/robots.txt", u).href, NAVEGADOR);
  const grupos = rob.ok && rob.estado === 200 ? analizar(rob.cuerpo) : [];

  // llms.txt — se comprueba, pero ver el informe: casi nadie lo pide.
  const llms = await traer(new URL("/llms.txt", u).href, NAVEGADOR);

  const filas = [];
  for (const b of BOTS) {
    const r = await traer(url, b.ua);
    const p = grupos.length ? permite(grupos, b.id, ruta) : { permitido: true, motivo: "no robots.txt" };
    filas.push({
      ...b,
      estado: r.estado,
      ms: r.ms,
      palabras: r.ok ? palabras(r.cuerpo) : 0,
      robots: p,
      // Servir algo distinto a un bot que a un navegador es «cloaking», y lo
      // penaliza todo el mundo. Aquí se detecta comparando tamaños.
      distinto: r.ok && Math.abs(r.cuerpo.length - base.cuerpo.length) > base.cuerpo.length * 0.25,
      error: r.error,
    });
  }

  return {
    url: base.url,
    navegador: { palabras: nBase, bytes: base.cuerpo.length, ms: base.ms },
    js,
    meta,
    robots: { existe: rob.estado === 200, grupos: grupos.length },
    llms: { existe: llms.estado === 200, bytes: llms.estado === 200 ? llms.cuerpo.length : 0 },
    filas,
  };
}
