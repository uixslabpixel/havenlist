/* POST /api/feedback — files a feedback comment as a GitHub issue.
   Env (Vercel → Settings → Environment Variables):
     FEEDBACK_CODE   secret that unlocks the widget (?feedback=CODE)
     GITHUB_TOKEN    fine-grained token, repository access: this repo only, permission "Issues: Read and write"
     FEEDBACK_REPO   optional, "owner/repo" (default uixslabpixel/havenlist)
     FEEDBACK_DRY_RUN=1  optional, returns the issue instead of creating it (local testing) */
const crypto = require("crypto");

const CATS = { layout: "Tampilan", bug: "Bug", copy: "Teks", idea: "Ide" };
const PRIOS = { low: "Rendah", med: "Sedang", high: "Tinggi" };
const hits = new Map(); // ip -> [timestamps]; best effort (per warm instance)

function same(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest();
  const y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
function str(v, max) { return typeof v === "string" ? v.slice(0, max) : ""; }
function num(v, max) { v = Number(v); return Number.isFinite(v) ? Math.max(-1e6, Math.min(max || 1e6, Math.round(v))) : 0; }
/* No @-mentions or auto-links to other issues in what a visitor typed */
function defang(s) { return s.replace(/@/g, "@​").replace(/(^|\s)#(\d+)/g, "$1#​$2"); }
function slug(page) {
  const p = (page.split("?")[0].replace(/^\/+|\.html$/g, "") || "index").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return p.slice(0, 30) || "index";
}

function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 500) hits.clear();
  return list.length > 30;
}

function build(b) {
  const comment = str(b.comment, 2000).trim();
  if (!comment) return null;
  const category = CATS[b.category] ? b.category : "layout";
  const priority = PRIOS[b.priority] ? b.priority : "med";
  const page = str(b.page, 200); if (page[0] !== "/") return null;
  const el = b.element || {}, ev = b.env || {}, r = el.rect || {};
  const element = {
    selector: str(el.selector, 300), tag: str(el.tag, 20), text: str(el.text, 100), section: str(el.section, 120),
    rect: { x: num(r.x), y: num(r.y), w: num(r.w), h: num(r.h) }, scrollY: num(el.scrollY)
  };
  const env = {
    w: num(ev.w, 10000), h: num(ev.h, 10000), dpr: num(ev.dpr, 10), bp: ["mobile", "tablet", "desktop"].includes(ev.bp) ? ev.bp : "desktop",
    touch: !!ev.touch, ua: str(ev.ua, 200)
  };
  const data = { page, title: str(b.title, 120), category, priority, comment, element, env };
  const title = defang("[" + slug(page) + "] " + CATS[category] + ": " + comment.replace(/\s+/g, " ").slice(0, 70));
  const quote = defang(comment).split("\n").map((l) => "> " + l).join("\n");
  const body = [
    "**Halaman:** `" + page + "` · **Layar:** " + env.bp + " " + env.w + "×" + env.h + (env.touch ? " (sentuh)" : ""),
    "**Jenis:** " + CATS[category] + " · **Prioritas:** " + PRIOS[priority],
    "**Bagian:** " + defang(element.section || "-") + " — `" + element.selector.replace(/`/g, "'") + "`",
    element.text ? "**Teks elemen:** " + JSON.stringify(defang(element.text)) : "",
    "", quote, "",
    "<details><summary>Data teknis</summary>", "", "```json feedback", JSON.stringify(data, null, 2).replace(/```/g, "'''"), "```", "", "</details>"
  ].filter((l, i) => l !== "" || i > 3).join("\n");
  const labels = ["feedback", "page:" + slug(page), "device:" + env.bp, "cat:" + category, "prio:" + priority];
  return { title, body, labels };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method" }); }
  const code = process.env.FEEDBACK_CODE, token = process.env.GITHUB_TOKEN;
  if (!code || !token) return res.status(503).json({ error: "not-configured" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== "object") return res.status(400).json({ error: "bad-request" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  if (limited(ip)) return res.status(429).json({ error: "rate-limited" });
  if (!same(b.code || "", code)) return res.status(401).json({ error: "unauthorized" });

  const issue = build(b);
  if (!issue) return res.status(400).json({ error: "bad-request" });
  if (process.env.FEEDBACK_DRY_RUN === "1") return res.status(200).json({ ok: true, number: 0, dryRun: issue });

  try {
    const repo = process.env.FEEDBACK_REPO || "uixslabpixel/havenlist";
    const r = await fetch("https://api.github.com/repos/" + repo + "/issues", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token, Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "havenlist-feedback", "Content-Type": "application/json"
      },
      body: JSON.stringify(issue)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: "github" });
    return res.status(200).json({ ok: true, number: j.number, url: j.html_url });
  } catch (e) {
    return res.status(502).json({ error: "github" });
  }
};
