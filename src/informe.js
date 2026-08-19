/** El informe en el terminal. Sin colores si no hay TTY, para que sirva en CI. */
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (n, s) => (tty ? `\x1b[${n}m${s}\x1b[0m` : s);
export const gris = (s) => c(90, s), verde = (s) => c(32, s), rojo = (s) => c(31, s),
             ambar = (s) => c(33, s), fuerte = (s) => c(1, s);

const pad = (s, n) => String(s) + " ".repeat(Math.max(0, n - String(s).length));

export function informe(a) {
  const L = [];
  const P = (s = "") => L.push(s);

  P();
  P(`  ${fuerte("botsees")} ${gris("· what AI crawlers see of")} ${a.url}`);
  P();

  // ── El titular ──
  const citas = a.filas.filter((f) => f.para === "citas");
  const bloqueados = citas.filter((f) => !f.robots.permitido);
  const ve = a.filas.find((f) => f.id === "GPTBot")?.palabras ?? 0;

  if (a.js.sospecha) {
    P(`  ${rojo("▲")} Your page has ${fuerte(a.navegador.palabras + " words")} in the served HTML,`);
    P(`    and the content is painted by JavaScript. ${fuerte("AI crawlers do not run it.")}`);
    P(`    ${gris("GPTBot downloads JS on ~11.5% of requests and executes it never.")}`);
  } else {
    P(`  ${verde("✓")} The content is in the HTML: ${fuerte(a.navegador.palabras + " words")} a crawler can read.`);
  }
  P();

  if (bloqueados.length) {
    P(`  ${rojo("▲")} You are blocking ${fuerte(bloqueados.length + " CITATION crawler(s)")}: ` +
      bloqueados.map((b) => b.id).join(", "));
    P(`    ${gris("Those do not train models — they are the ones that cite you.")}`);
    P();
  }

  // ── La tabla ──
  P(`  ${gris(pad("CRAWLER", 20) + pad("WHO", 22) + pad("PURPOSE", 15) + pad("HTTP", 7) + pad("WORDS", 10) + "ROBOTS.TXT")}`);
  let grupo = "";
  for (const f of a.filas) {
    if (f.para !== grupo) { grupo = f.para; P(); }
    const est = f.estado === 200 ? verde(f.estado) : f.estado === 0 ? rojo("---") : ambar(f.estado);
    const rb = f.robots.permitido ? gris(f.robots.motivo) : rojo("BLOCKED · " + f.robots.motivo);
    P("  " + pad(f.id, 20) + gris(pad(f.quien, 22)) + pad(f.para, 15) +
      pad(est, 7 + (tty ? 9 : 0)) + pad(f.palabras || "-", 10) + rb);
    if (f.nota) P(gris("    " + f.nota));
    if (f.distinto) P(ambar(`    ▲ You serve it noticeably different HTML than a browser gets (cloaking).`));
  }
  P();

  // ── llms.txt, con la verdad por delante ──
  P(`  ${gris("─".repeat(74))}`);
  if (a.llms.existe) {
    P(`  ${gris("llms.txt")}  present (${a.llms.bytes} bytes).`);
    P(`  ${gris("Note: no major AI company has committed to reading it, and it does not")}`);
    P(`  ${gris("show up in server logs. Having one is fine; relying on it is not.")}`);
  } else {
    P(`  ${gris("llms.txt")}  missing — and not urgent: almost nobody requests it today.`);
    P(`  ${gris("What they all read is the HTML. Start there.")}`);
  }
  P();
  P(`  ${gris("Title:")} ${a.meta.titulo || rojo("missing")}`);
  P(`  ${gris("Description:")} ${a.meta.descripcion ? gris("yes") : ambar("missing")}   ` +
    `${gris("Structured data:")} ${a.meta.datosEstructurados ? gris("yes") : ambar("missing")}`);
  P();
  return L.join("\n");
}

/** Lo que decide si el CI pasa. */
export function problemas(a) {
  const p = [];
  if (a.js.sospecha) p.push("content depends on JavaScript");
  for (const f of a.filas) {
    if (f.para === "citas" && !f.robots.permitido) p.push(`${f.id} blocked in robots.txt`);
    if (f.estado >= 400) p.push(`${f.id} gets HTTP ${f.estado}`);
    if (f.distinto) p.push(`${f.id} gets different HTML (cloaking)`);
  }
  return p;
}
