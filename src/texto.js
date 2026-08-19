/**
 * Cuánto texto hay REALMENTE en el HTML que se sirve.
 *
 * ── POR QUÉ ESTO ES LA MEDIDA QUE IMPORTA ─────────────────────────────────
 *
 * Los rastreadores de IA no ejecutan JavaScript. Así que lo que "ven" no es tu
 * página: es la respuesta HTML tal cual sale del servidor. Si tu web pinta el
 * contenido en el navegador, aquí saldrán treinta palabras — y eso es
 * exactamente lo que ChatGPT tiene de ti.
 *
 * No hace falta un navegador ni un analizador de HTML para saberlo: basta con
 * quitar el marcado y contar. Menos dependencias y ninguna duda sobre qué se
 * está midiendo.
 */

const FUERA = /<(script|style|noscript|template|svg)[\s\S]*?<\/\1>/gi;

export function palabras(html) {
  const limpio = String(html)
    .replace(FUERA, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return limpio ? limpio.split(" ").length : 0;
}

/**
 * ¿El contenido lo pinta el navegador?
 *
 * Se busca la firma de una aplicación de una sola página: poco texto, un
 * contenedor vacío donde monta el marco de trabajo, y mucho JavaScript. Los
 * tres a la vez, porque cualquiera de ellos por separado da falsos positivos.
 */
export function pintadoConJs(html, n) {
  const raices = /<(div|main)[^>]*\bid=["'](root|app|__next|__nuxt|svelte)["'][^>]*>\s*<\/\1>/i.test(html);
  const scripts = (html.match(/<script/gi) || []).length;
  const pesado = html.length > 4000 && n < 120;
  return { sospecha: (raices && n < 300) || (pesado && scripts >= 3), raices, scripts };
}

/** Señales de que hay algo que citar: título, descripción y datos estructurados. */
export function señales(html) {
  return {
    titulo: (html.match(/<title[^>]*>([^<]{1,200})<\/title>/i) || [])[1]?.trim() || null,
    descripcion: (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})/i) || [])[1] || null,
    datosEstructurados: /application\/ld\+json/i.test(html),
    canonica: /rel=["']canonical["']/i.test(html),
  };
}
