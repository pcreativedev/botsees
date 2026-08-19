/**
 * La frontera entre el código y el mundo.
 *
 * Por dentro esto está escrito en español. Por fuera es una herramienta en
 * inglés, y `--json` es un CONTRATO: en cuanto alguien lo mete en un `jq` o en
 * un script de CI, cambiarle una clave le rompe la tubería. Así que la
 * traducción vive aquí, en un único sitio, y se aplica justo antes de imprimir.
 *
 * Si añades un campo nuevo a un informe, añádelo también a este mapa. Lo que no
 * esté aquí sale en español y se nota.
 */
const CLAVES = {
  // Auditoría
  navegador: "browser",
  palabras: "words",
  sospecha: "suspected",
  raices: "emptyRoots",
  meta: "meta",
  titulo: "title",
  descripcion: "description",
  datosEstructurados: "structuredData",
  canonica: "canonical",
  existe: "present",
  grupos: "groups",
  filas: "crawlers",
  quien: "who",
  para: "purpose",
  estado: "status",
  permitido: "allowed",
  motivo: "reason",
  nota: "note",
  distinto: "differs",
  // Modo --log
  lineas: "lines",
  errores: "errors",
  rutas: "paths",
  pidieronLlms: "requestedLlmsTxt",
  pidieronRobots: "requestedRobotsTxt",
};

/** Traduce las claves de un informe, recursivamente, sin tocar los valores. */
export function enIngles(v) {
  if (v instanceof Map) return enIngles(Object.fromEntries(v));
  if (Array.isArray(v)) return v.map(enIngles);
  if (v === null || typeof v !== "object") return v;
  const salida = {};
  for (const [k, x] of Object.entries(v)) salida[CLAVES[k] ?? k] = enIngles(x);
  return salida;
}
