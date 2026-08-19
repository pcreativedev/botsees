#!/usr/bin/env node
/**
 * botsees — lo que los rastreadores de IA ven de tu web.
 *
 *   npx botsees https://tu-web.com
 *   npx botsees --registro /var/log/apache2/access.log
 *   npx botsees https://tu-web.com --ci      (sale con 1 si hay problemas)
 *   npx botsees https://tu-web.com --json
 */
import { auditar } from "../src/auditar.js";
import { informe, problemas, gris, rojo, verde, fuerte } from "../src/informe.js";
import { analizarRegistro } from "../src/registro.js";
import { enIngles } from "../src/salida.js";

const args = process.argv.slice(2);
const tiene = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const url = args.find((a) => !a.startsWith("-") && a !== (valor("--log") ?? valor("--registro")));

if (tiene("--help") || (!url && !(tiene("--log") || tiene("--registro")))) {
  console.log(`
  ${fuerte("botsees")} · what AI crawlers actually see of your site

  ${gris("AI crawlers do not run JavaScript. This measures what they")}
  ${gris("really receive, and who you are blocking by accident.")}

  npx botsees https://your-site.com
  npx botsees https://your-site.com --ci     exit 1 if something is broken
  npx botsees https://your-site.com --json   pipe it to jq
  npx botsees --log access.log               what the crawlers REALLY did
`);
  process.exit(0);
}

if ((tiene("--log") || tiene("--registro"))) {
  const rutas = args.slice((args.includes("--log") ? args.indexOf("--log") : args.indexOf("--registro")) + 1).filter((a) => !a.startsWith("-"));
  const r = analizarRegistro(rutas);
  if (r.error) { console.error(rojo("  " + r.error)); process.exit(2); }
  if (tiene("--json")) { console.log(JSON.stringify(enIngles(r), null, 2)); process.exit(0); }

  console.log(`\n  ${fuerte("botsees --log")} ${gris(`· ${r.lineas.toLocaleString("en-US")} lines read`)}\n`);
  if (!r.bots.length) {
    console.log(gris("  No AI crawler has been here yet.\n"));
    process.exit(0);
  }
  for (const b of r.bots) {
    const top = [...b.rutas.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3);
    console.log(`  ${fuerte(b.bot.id.padEnd(20))}${String(b.n).padStart(6)} request${b.n === 1 ? "" : "s"}` +
                (b.errores ? rojo(`  ${b.errores} errored`) : ""));
    for (const [u, n] of top) console.log(gris(`      ${String(n).padStart(4)}  ${u}`));
  }
  console.log();
  if (!r.pidieronLlms) {
    console.log(`  ${fuerte("Nobody asked for /llms.txt.")}`);
    console.log(gris("  If you publish one and expect it to be read, that is your answer.\n"));
  }
  process.exit(0);
}

const a = await auditar(url.startsWith("http") ? url : "https://" + url);
if (a.error) { console.error(rojo("  " + a.error)); process.exit(2); }
if (tiene("--json")) { console.log(JSON.stringify(enIngles(a), null, 2)); process.exit(0); }

console.log(informe(a));
const p = problemas(a);
if (tiene("--ci")) {
  if (p.length) {
    console.log(rojo(`  ${p.length} problem(s):`));
    for (const x of p) console.log(rojo("    · " + x));
    console.log();
    process.exit(1);
  }
  console.log(verde("  All clear.\n"));
}
