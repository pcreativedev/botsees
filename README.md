# botsees

**What AI crawlers actually see of your site.** No dependencies, no account, no tracking.

```
npx botsees https://your-site.com
```

---

## The thing that made me write this

Our site publishes an `llms.txt`. Every SEO post in 2026 says you need one.

Then I read our own server logs:

```
GPTBot           209 requests
OAI-SearchBot      3 requests
/llms.txt          0 requests
```

**Zero.** GPTBot came 209 times and never once asked for the file everyone told
us to write. It went straight for `/themes/`, `/features/`, `/self-hosting/`
and the docs — the HTML.

That is the gap this tool exists for. Every other checker audits your
*configuration*. This one measures what the crawlers **actually do**.

## Two things almost nobody gets right

**1 · They don't run your JavaScript.**

GPTBot downloads JS on about 11.5% of requests and executes it never. ClaudeBot
downloads it on 23.8% and also never runs it. PerplexityBot, OAI-SearchBot and
Claude-SearchBot parse static HTML only. The one exception is Gemini, which
borrows Googlebot's renderer.

So if your content is painted in the browser, **it does not exist** for the
models. `botsees` counts the words in the HTML your server actually returns:

```
▲ Your page has 34 words in the served HTML,
  and the content is painted by JavaScript. AI crawlers do not run it.
```

**2 · Blocking training ≠ blocking citations, and people confuse them.**

`GPTBot`, `ClaudeBot` and `Google-Extended` train models. `OAI-SearchBot`,
`Claude-SearchBot` and `PerplexityBot` are the ones that **cite you** in
answers. A `robots.txt` copied off a blog usually blocks both — so you
disappear from ChatGPT and Perplexity while thinking you protected your work.

```
▲ You are blocking 2 CITATION crawlers: PerplexityBot, Claude-SearchBot
  Those don't train models — they're the ones that cite you.
```

## What it does

```
npx botsees https://your-site.com          audit: fetch as 11 crawlers, compare
npx botsees https://your-site.com --ci     exit 1 if something is broken
npx botsees https://your-site.com --json   pipe it to jq
npx botsees --log access.log          what the crawlers REALLY did
```

Per crawler it reports the HTTP status it gets, how many words of your page it
can read, and whether `robots.txt` lets it in — parsed properly, with group
specificity and longest-match precedence, not a `grep` for `Disallow`.

It also flags **cloaking**: serving a bot noticeably different HTML than a
browser gets.

### The log mode

Point it at an Apache or nginx access log and it tells you what happened,
not what should happen:

```
$ npx botsees --log /var/log/apache2/access.log

  GPTBot                 209 requests
         3  /
         2  /themes/
         2  /features/
  Googlebot               10 requests
         9  /robots.txt

  Nobody asked for /llms.txt.
  If you publish one and expect it to be read, that's your answer.
```

## About llms.txt

`botsees` checks whether you have one, and then tells you the truth: as of 2026
no major AI company has committed to reading it. Google has said explicitly it
does not use it for AI Overviews. It has a real use — coding agents like Cursor
and Claude fetching docs — but it is not how you get cited.

Having one costs nothing. Counting on it costs you.

## In CI

```yaml
- run: npx botsees https://your-site.com --ci
```

Fails the build if your content stops being readable, if you start blocking a
citation crawler, or if a bot starts getting a 403 that a browser doesn't.

## Why zero dependencies

It runs against your production site and inside your CI. Every dependency is
something that could break that, or read it. Node 18+, nothing else.

## License

MIT.
