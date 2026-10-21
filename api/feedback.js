/* /api/feedback — Figma-style page comments, stored as GitHub issues (label "feedback").
     GET  ?page=/agents          open comments on a page (pin anchors + text), cached for a few seconds
     GET  ?issue=12              the replies of one comment
     POST {comment, anchor, ...} new comment  -> issue #n
     POST {reply:true, issue, text}  reply    -> comment on issue #n (only issues labelled "feedback")
   Env (Vercel → Settings → Environment Variables):
     GITHUB_TOKEN   fine-grained token, repository access: this repo only, permission "Issues: Read and write"
     FEEDBACK_REPO  optional "owner/repo" (default uixslabpixel/havenlist)
     FEEDBACK_DRY_RUN=1  optional: POST returns the issue instead of creating it (local testing)
   There is no login: anyone who opens the site can comment. Limits keep it from being abused (see below). */
const CATS = { layout: "Tampilan", bug: "Bug", copy: "Teks", idea: "Ide" };
const PRIOS = { low: "Rendah", med: "Sedang", high: "Tinggi" };
const hits = new Map(); // "kind:ip" -> [timestamps]; best effort (per warm instance)
const MARK = /<!--hl-author:(.*?)-->\n?/;
const BLOCK = /```json feedback\n([\s\S]*?)\n```/;

function str(v, max) { return typeof v === "string" ? v.slice(0, max) : ""; }
function num(v, max) { v = Number(v); return Number.isFinite(v) ? Math.max(-1e6, Math.min(max || 1e6, Math.round(v))) : 0; }
function frac(v) { v = Number(v); return Number.isFinite(v) ? Math.max(0, Math.min(1, Math.round(v * 1000) / 1000)) : 0; }
/* No @-mentions or auto-links to other issues in what a visitor typed */
function defang(s) { return s.replace(/@/g, "@​").replace(/(^|\s)#(\d+)/g, "$1#​$2"); }
function name(v) { return str(v, 40).replace(/[\r\n]+/g, " ").replace(/-->|<!--/g, "").trim(); }
function slug(page) {
  const p = (page.split("?")[0].replace(/^\/+|\.html$/g, "") || "index").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return p.slice(0, 30) || "index";
}
function limited(kind, ip, max) {
  const now = Date.now(), win = 10 * 60 * 1000, key = kind + ":" + ip, list = (hits.get(key) || []).filter((t) => now - t < win);
  list.push(now); hits.set(key, list);
  if (hits.size > 800) hits.clear();
  return list.length > max;
}

function build(b) {
  const comment = str(b.comment, 2000).trim();
  if (!comment) return null;
  const category = CATS[b.category] ? b.category : "layout";
  const priority = PRIOS[b.priority] ? b.priority : "med";
  const page = str(b.page, 200); if (page[0] !== "/") return null;
  const el = b.element || {}, ev = b.env || {}, an = b.anchor || {};
  const element = { selector: str(el.selector, 300), tag: str(el.tag, 20), text: str(el.text, 100), section: str(el.section, 120), scrollY: num(el.scrollY) };
  const anchor = { selector: str(an.selector, 300), dx: frac(an.dx), dy: frac(an.dy), x: num(an.x, 100000), y: num(an.y, 100000) };
  const env = {
    w: num(ev.w, 10000), h: num(ev.h, 10000), dpr: num(ev.dpr, 10), bp: ["mobile", "tablet", "desktop"].includes(ev.bp) ? ev.bp : "desktop",
    touch: !!ev.touch, ua: str(ev.ua, 200)
  };
  const author = name(b.author);
  const data = { page, title: str(b.title, 120), category, priority, author, comment, anchor, element, env };
  const title = defang("[" + slug(page) + "] " + CATS[category] + ": " + comment.replace(/\s+/g, " ").slice(0, 70));
  const quote = defang(comment).split("\n").map((l) => "> " + l).join("\n");
  const body = [
    "**Dari:** " + defang(author || "Anonim") + " · **Halaman:** `" + page + "` · **Layar:** " + env.bp + " " + env.w + "×" + env.h + (env.touch ? " (sentuh)" : ""),
    "**Jenis:** " + CATS[category] + " · **Prioritas:** " + PRIOS[priority],
    "**Bagian:** " + defang(element.section || "-") + " — `" + element.selector.replace(/`/g, "'") + "`",
    element.text ? "**Teks elemen:** " + JSON.stringify(defang(element.text)) : "",
    "", quote, "",
    "<details><summary>Data teknis</summary>", "", "```json feedback", JSON.stringify(data, null, 2).replace(/```/g, "'''"), "```", "", "</details>"
  ].filter((l, i) => l !== "" || i > 3).join("\n");
  const labels = ["feedback", "page:" + slug(page), "device:" + env.bp, "cat:" + category, "prio:" + priority];
  return { title, body, labels };
}

/* What a visitor may see of an issue: anchor, text, author, kind — never UA/viewport details */
function publicItem(issue) {
  const m = BLOCK.exec(issue.body || "");
  if (!m) return null;
  let d; try { d = JSON.parse(m[1]); } catch (e) { return null; }
  return {
    page: d.page, item: {
      n: issue.number, anchor: d.anchor || { selector: "", dx: 0, dy: 0, x: 0, y: 0 }, text: d.comment, author: d.author || "Anonim",
      cat: d.category, prio: d.priority, at: issue.created_at, replies: issue.comments || 0
    }
  };
}

module.exports = async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN, repo = process.env.FEEDBACK_REPO || "uixslabpixel/havenlist";
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const gh = (path, init) => fetch("https://api.github.com/repos/" + repo + path, Object.assign({}, init, {
    headers: Object.assign({
      Authorization: "Bearer " + token, Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "havenlist-feedback", "Content-Type": "application/json"
    }, (init || {}).headers)
  }));

  if (req.method === "GET") {
    if (!token) return res.status(503).json({ error: "not-configured" });
    if (limited("get", ip, 120)) return res.status(429).json({ error: "rate-limited" });
    const q = req.query || {};
    try {
      if (q.issue) {
        const n = parseInt(q.issue, 10);
        if (!(n > 0)) return res.status(400).json({ error: "bad-request" });
        const ir = await gh("/issues/" + n);
        const issue = await ir.json();
        if (!ir.ok || !(issue.labels || []).some((l) => l.name === "feedback") || issue.state !== "open") return res.status(404).json({ error: "not-found" });
        const cr = await gh("/issues/" + n + "/comments?per_page=100");
        const list = await cr.json();
        const comments = (Array.isArray(list) ? list : []).map((c) => {
          const m = MARK.exec(c.body || "");
          return { author: m ? m[1] : "Tim Havenlist", text: (c.body || "").replace(MARK, "").slice(0, 1500), at: c.created_at };
        });
        res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
        return res.status(200).json({ comments });
      }
      const page = str(q.page, 200); if (page[0] !== "/") return res.status(400).json({ error: "bad-request" });
      const r = await gh("/issues?state=open&labels=" + encodeURIComponent("feedback,page:" + slug(page)) + "&per_page=100&sort=created&direction=asc");
      const list = await r.json();
      if (!r.ok) return res.status(502).json({ error: "github" });
      const items = (Array.isArray(list) ? list : []).filter((i) => !i.pull_request).map(publicItem).filter((x) => x && x.page === page).map((x) => x.item);
      res.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
      return res.status(200).json({ items });
    } catch (e) {
      return res.status(502).json({ error: "github" });
    }
  }

  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "method" }); }
  if (!token) return res.status(503).json({ error: "not-configured" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== "object") return res.status(400).json({ error: "bad-request" });

  try {
    if (b.reply === true) {
      if (limited("reply", ip, 30)) return res.status(429).json({ error: "rate-limited" });
      const n = parseInt(b.issue, 10), text = str(b.text, 1000).trim();
      if (!(n > 0) || !text) return res.status(400).json({ error: "bad-request" });
      const ir = await gh("/issues/" + n);
      const issue = await ir.json();
      if (!ir.ok || !(issue.labels || []).some((l) => l.name === "feedback") || issue.state !== "open") return res.status(404).json({ error: "not-found" });
      const body = "<!--hl-author:" + name(b.author) + "-->\n" + defang(text);
      if (process.env.FEEDBACK_DRY_RUN === "1") return res.status(200).json({ ok: true, dryRun: { body } });
      const r = await gh("/issues/" + n + "/comments", { method: "POST", body: JSON.stringify({ body }) });
      if (!r.ok) return res.status(502).json({ error: "github" });
      return res.status(200).json({ ok: true });
    }

    if (limited("post", ip, 10)) return res.status(429).json({ error: "rate-limited" });
    const issue = build(b);
    if (!issue) return res.status(400).json({ error: "bad-request" });
    if (process.env.FEEDBACK_DRY_RUN === "1") return res.status(200).json({ ok: true, number: 0, dryRun: issue });
    const r = await gh("/issues", { method: "POST", body: JSON.stringify(issue) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "github" });
    return res.status(200).json({ ok: true, number: j.number, url: j.html_url });
  } catch (e) {
    return res.status(502).json({ error: "github" });
  }
};
