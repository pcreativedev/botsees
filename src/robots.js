/**
 * `robots.txt`, interpretado como lo interpreta un rastreador.
 *
 * ── POR QUÉ NO VALE UN `includes("Disallow: /")` ──────────────────────────
 *
 * Porque la regla de verdad tiene tres partes que casi nadie implementa y que
 * cambian el resultado:
 *
 *   1. **Los grupos.** Las reglas cuelgan del `User-agent` que las precede, y
 *      varias líneas `User-agent` seguidas comparten el mismo bloque.
 *   2. **Gana el más específico.** Si hay un grupo para `GPTBot`, el grupo `*`
 *      NO se le aplica. Ni se mezclan.
 *   3. **Gana la ruta más larga.** Entre `Disallow: /` y `Allow: /blog/`, para
 *      `/blog/x` manda el `Allow`, porque su patrón es más largo.
 *
 * Sin esto se contesta «bloqueado» a quien tiene permiso y al revés, que es
 * exactamente el error que esta herramienta existe para cazar.
 */

/** Convierte un patrón de robots (`*` y `$`) en expresión regular. */
function aRegex(patron) {
  const esc = patron.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const cuerpo = esc.replace(/\*/g, ".*").replace(/\\\$$/, "$");
  return new RegExp("^" + cuerpo);
}

export function analizar(texto) {
  const grupos = [];
  let actual = null;
  let esperandoAgentes = false;

  for (const linea of String(texto).split(/\r?\n/)) {
    const limpia = linea.replace(/#.*$/, "").trim();
    if (!limpia) continue;
    const [clave, ...resto] = limpia.split(":");
    const valor = resto.join(":").trim();
    const k = clave.trim().toLowerCase();

    if (k === "user-agent") {
      // Varios `User-agent` seguidos comparten bloque; el primero tras una
      // regla abre uno nuevo.
      if (!esperandoAgentes || !actual) {
        actual = { agentes: [], reglas: [] };
        grupos.push(actual);
        esperandoAgentes = true;
      }
      actual.agentes.push(valor.toLowerCase());
    } else if ((k === "allow" || k === "disallow") && actual) {
      esperandoAgentes = false;
      if (valor !== "" || k === "disallow") {
        actual.reglas.push({ permite: k === "allow", patron: valor || "/" , vacia: valor === "" });
      }
    }
  }
  return grupos;
}

/** ¿Puede este agente pedir esta ruta? */
export function permite(grupos, agente, ruta) {
  const a = agente.toLowerCase();
  // El grupo más específico que le nombre; si ninguno, el comodín.
  const suyo = grupos.find((g) => g.agentes.some((x) => x !== "*" && a.includes(x)));
  const grupo = suyo ?? grupos.find((g) => g.agentes.includes("*"));
  if (!grupo) return { permitido: true, motivo: "no hay reglas para él" };

  let mejor = null;
  for (const r of grupo.reglas) {
    if (r.vacia) continue;                       // `Disallow:` a secas = todo permitido
    if (!aRegex(r.patron).test(ruta)) continue;
    // Gana la ruta más larga; a igual longitud, gana `Allow`.
    if (!mejor || r.patron.length > mejor.patron.length ||
        (r.patron.length === mejor.patron.length && r.permite)) mejor = r;
  }
  if (!mejor) return { permitido: true, motivo: "ninguna regla le aplica" };
  return {
    permitido: mejor.permite,
    motivo: `${mejor.permite ? "Allow" : "Disallow"}: ${mejor.patron}` +
            (suyo ? ` (grupo propio)` : ` (grupo *)`),
  };
}
