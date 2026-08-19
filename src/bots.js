/**
 * Quién rastrea, y para qué.
 *
 * ── LA DISTINCIÓN QUE LE CUESTA LAS CITAS A MEDIO INTERNET ────────────────
 *
 * No todos los rastreadores de IA hacen lo mismo, y meterlos en el mismo saco
 * es el error más caro de esta materia:
 *
 *   · Los de ENTRENAMIENTO (GPTBot, ClaudeBot, Google-Extended) se llevan tu
 *     contenido para entrenar modelos. Bloquearlos es una decisión legítima.
 *   · Los de BÚSQUEDA (OAI-SearchBot, Claude-SearchBot, PerplexityBot) son los
 *     que te CITAN cuando alguien pregunta algo. Bloquearlos es desaparecer de
 *     las respuestas.
 *
 * Un `robots.txt` copiado de un blog suele bloquear los dos grupos. La gente
 * cree que está protegiendo su contenido del entrenamiento y lo que ha hecho
 * es borrarse de ChatGPT y de Perplexity.
 *
 * ── Y NINGUNO EJECUTA JAVASCRIPT ──────────────────────────────────────────
 *
 * Con una excepción: Gemini, que usa el motor de Googlebot. El resto lee el
 * HTML inicial y punto. GPTBot llega a DESCARGAR JavaScript en un 11,5 % de
 * las peticiones y ClaudeBot en un 23,8 %, pero no lo ejecutan ninguno de los
 * dos. Si tu contenido lo pinta el navegador, para ellos no existe.
 */

export const BOTS = [
  // ── Entrenamiento ──
  { id: "GPTBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
    quien: "OpenAI", para: "entrenamiento", js: false },
  { id: "ClaudeBot", ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    quien: "Anthropic", para: "entrenamiento", js: false },
  { id: "Google-Extended", ua: "Mozilla/5.0 (compatible; Google-Extended/1.0)",
    quien: "Google", para: "entrenamiento", js: false },
  { id: "Applebot-Extended", ua: "Mozilla/5.0 (compatible; Applebot-Extended/1.0)",
    quien: "Apple", para: "entrenamiento", js: false },
  { id: "meta-externalagent", ua: "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
    quien: "Meta", para: "entrenamiento", js: false },
  { id: "Bytespider", ua: "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
    quien: "ByteDance", para: "entrenamiento", js: false,
    nota: "Documentado ignorando robots.txt." },

  // ── Búsqueda: LOS QUE TE CITAN ──
  { id: "OAI-SearchBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    quien: "ChatGPT Search", para: "citas", js: false },
  { id: "Claude-SearchBot", ua: "Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +claudebot@anthropic.com)",
    quien: "Claude", para: "citas", js: false },
  { id: "PerplexityBot", ua: "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    quien: "Perplexity", para: "citas", js: false },
  { id: "ChatGPT-User", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    quien: "ChatGPT (a petición)", para: "citas", js: false,
    nota: "Se dispara cuando alguien pide leer TU página. Suele saltarse robots.txt." },

  // ── Buscador clásico, de referencia ──
  { id: "Googlebot", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    quien: "Google", para: "buscador", js: true,
    nota: "El único que renderiza. Gemini usa este motor." },
];

export const NAVEGADOR =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";
