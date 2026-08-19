/**
 * Modo registro: qué hicieron los rastreadores DE VERDAD.
 *
 * ── POR QUÉ ESTE MODO ES EL QUE NO TIENE NADIE ────────────────────────────
 *
 * Todo lo demás audita tu configuración: si tu robots.txt permite, si tu HTML
 * lleva texto. Está bien, pero es una predicción. El registro de tu servidor no
 * predice nada: dice lo que pasó.
 *
 * Y ahí aparecen cosas que ninguna auditoría ve. Por ejemplo, que publicas un
 * `llms.txt` y el rastreador entró doscientas veces sin pedirlo ni una.
 */
import { readFileSync } from "node:fs";
import { BOTS } from "./bots.js";

const LINEA = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^" ]*)[^"]*" (\d{3}) (\S+)(?: "([^"]*)" "([^"]*)")?/;

export function analizarRegistro(rutas) {
  const porBot = new Map();
  const pedido = new Map();      // qué rutas pidió cada bot
  let lineas = 0;

  for (const ruta of rutas) {
    let texto;
    try { texto = readFileSync(ruta, "utf8"); }
    catch (e) { return { error: `Cannot read ${ruta}: ${e.message}` }; }

    for (const l of texto.split("\n")) {
      const m = LINEA.exec(l);
      if (!m) continue;
      lineas++;
      const [, , , , url, codigo, , , ua = ""] = m;
      for (const b of BOTS) {
        if (!ua.includes(b.id)) continue;
        const d = porBot.get(b.id) ?? { bot: b, n: 0, errores: 0, rutas: new Map() };
        d.n++;
        if (Number(codigo) >= 400) d.errores++;
        d.rutas.set(url, (d.rutas.get(url) ?? 0) + 1);
        porBot.set(b.id, d);
        pedido.set(url, true);
        break;
      }
    }
  }

  return {
    lineas,
    bots: [...porBot.values()].sort((a, b) => b.n - a.n),
    // Lo interesante: ficheros que existen para los bots y que nadie pide.
    pidieronLlms: [...pedido.keys()].some((u) => u.startsWith("/llms")),
    pidieronRobots: [...pedido.keys()].some((u) => u.startsWith("/robots.txt")),
  };
}
