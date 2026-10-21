/* Havenlist comments — leave a comment on any spot of any page, Figma style.
   The "Feedback" button (or the C key) switches comment mode on: click anywhere to drop a pin and write.
   Everyone sees the pins on the page and can reply. Comments are filed as GitHub issues through /api/feedback;
   the "feedback-triage" skill reads them back and fixes them. */
(function () {
  "use strict";
  var API = "/api/feedback";
  var KEY = "hl.feedback.name";
  var MINE = "hl.feedback.mine";
  var CATS = [["layout", "Tampilan"], ["bug", "Bug"], ["copy", "Teks"], ["idea", "Ide"]];
  var PRIOS = [["low", "Rendah"], ["med", "Sedang"], ["high", "Tinggi"]];

  /* ---------- helpers ---------- */
  function pageKey() {
    var p = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/index";
    return p + location.search;
  }
  function bp() { var w = window.innerWidth; return w <= 640 ? "mobile" : w <= 1024 ? "tablet" : "desktop"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function getName() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function setName(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function readMine() { try { return JSON.parse(localStorage.getItem(MINE)) || []; } catch (e) { return []; } }
  function writeMine(a) { try { localStorage.setItem(MINE, JSON.stringify(a.slice(-30))); } catch (e) {} }
  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " mnt lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    return Math.floor(s / 86400) + " hari lalu";
  }
  function json(url, opts) {
    return fetch(url, opts).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); });
  }

  /* Short, stable-ish CSS path: tag#id or tag.class, :nth-of-type when siblings share the tag */
  function selectorOf(el) {
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body && parts.length < 6) {
      var tag = el.tagName.toLowerCase(), part = tag;
      if (el.id && !/\d{3,}/.test(el.id)) { parts.unshift(tag + "#" + el.id); break; }
      var cls = Array.prototype.filter.call(el.classList, function (k) { return !/^(is-|has-|js-|fx-)/.test(k) && !/^\d/.test(k); }).slice(0, 2);
      if (cls.length) part += "." + cls.join(".");
      var parent = el.parentElement;
      if (parent) {
        var same = Array.prototype.filter.call(parent.children, function (s) { return s.tagName === el.tagName; });
        if (same.length > 1) part += ":nth-of-type(" + (same.indexOf(el) + 1) + ")";
      }
      parts.unshift(part);
      el = parent;
    }
    return parts.join(" > ");
  }
  function sectionOf(el) {
    var s = el.closest("section, header, footer, nav, main, [id]");
    if (!s) return "";
    var h = s.querySelector("h1, h2, h3");
    var name = s.id ? "#" + s.id : (s.className && typeof s.className === "string" ? "." + s.className.split(/\s+/)[0] : s.tagName.toLowerCase());
    return name + (h ? ' "' + h.textContent.trim().slice(0, 60) + '"' : "");
  }

  /* ---------- UI (Shadow DOM so page styles never leak in or out) ---------- */
  var host = document.createElement("div");
  host.id = "hl-feedback";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;font:400 14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1e1e1e;";
  var root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>" +
    "*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer}" +
    ".fab{pointer-events:auto;position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;background:#1e1e1e;color:#fff;font-weight:500;box-shadow:0 4px 14px rgba(0,0,0,.25)}" +
    ".fab[aria-pressed=true]{background:#e5484d}" +
    ".fab b[hidden]{display:none}.fab b{min-width:20px;height:20px;padding:0 6px;display:inline-grid;place-items:center;border-radius:10px;background:#e5484d;font-size:12px}.fab[aria-pressed=true] b{background:#fff;color:#e5484d}" +
    ".bar{pointer-events:none;position:fixed;top:12px;left:50%;transform:translateX(-50%);max-width:calc(100% - 24px);padding:10px 16px;background:#1e1e1e;color:#fff;border-radius:999px;font-weight:500;display:none;text-align:center}.bar.on{display:block}" +
    ".pin{pointer-events:auto;position:fixed;width:28px;height:28px;margin:-28px 0 0 -14px;display:grid;place-items:center;border-radius:50% 50% 50% 0;background:#e5484d;color:#fff;font:600 12px/1 system-ui,sans-serif;box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.3);border:0;padding:0;transform:rotate(-45deg)}" +
    ".pin>span{transform:rotate(45deg)}.pin.draft{background:#1e1e1e}.pin.on{background:#1e1e1e}" +
    ".card{pointer-events:auto;position:fixed;width:min(340px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;padding:16px;background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.28);display:none}.card.on{display:block}" +
    "@media(max-width:760px){.card{left:0!important;right:0!important;top:auto!important;bottom:0!important;width:100%;max-height:80vh;border-radius:20px 20px 0 0;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}.fab{left:auto;right:12px}}" +
    ".card h4{margin:0 0 2px;font-size:15px;line-height:1.3;font-weight:600}.sub{margin:0 0 10px;color:#6b6b68;font-size:12px;word-break:break-word}" +
    ".lab{display:block;margin:10px 0 6px;font-size:12px;color:#6b6b68}" +
    ".seg{display:flex;gap:6px;flex-wrap:wrap}.seg button{padding:6px 11px;border:1px solid #dcdcd8;border-radius:999px;background:#fff;font-size:13px}.seg button[aria-pressed=true]{background:#1e1e1e;border-color:#1e1e1e;color:#fff}" +
    "textarea,input{width:100%;padding:10px 12px;border:1px solid #dcdcd8;border-radius:12px;font:inherit;background:#fff}textarea{min-height:84px;resize:vertical}input{height:40px;border-radius:999px;padding:0 14px}textarea:focus,input:focus{outline:2px solid #1e1e1e;outline-offset:1px}" +
    ".row{display:flex;gap:8px;margin-top:12px}.row button{flex:1;height:42px;border-radius:999px;border:1px solid #dcdcd8;background:#fff;font-weight:500}.row .go{background:#1e1e1e;border-color:#1e1e1e;color:#fff}.row button:disabled{opacity:.5;cursor:default}" +
    ".err{margin:8px 0 0;color:#c4262b;font-size:12px}" +
    ".msg{padding:10px 0;border-top:1px solid #eee}.msgs>.msg:first-child{border-top:0;padding-top:0}.who{font-weight:600;font-size:13px}.who small{font-weight:400;color:#6b6b68;margin-left:6px}.txt{margin:2px 0 0;white-space:pre-wrap;word-break:break-word}" +
    ".tags{margin:0 0 8px;color:#6b6b68;font-size:12px}.x{float:right;border:0;background:none;font-size:20px;line-height:1;padding:0 2px;color:#6b6b68}" +
    ".toast{pointer-events:none;position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);padding:10px 16px;background:#1e1e1e;color:#fff;border-radius:999px;opacity:0;transition:opacity .2s}.toast.on{opacity:1}" +
    "</style>" +
    '<div class="pins"></div>' +
    '<button class="fab" type="button" aria-pressed="false" title="Komentar (C)"><span class="t">Feedback</span> <b hidden>0</b></button>' +
    '<div class="bar" role="status">Klik untuk berkomentar · Esc selesai</div>' +
    '<form class="card compose" aria-label="Komentar baru"><h4>Komentar baru</h4><p class="sub"></p>' +
    '<textarea class="ct" maxlength="2000" placeholder="Apa yang ingin diubah di sini?" aria-label="Komentar"></textarea>' +
    '<span class="lab">Jenis</span><div class="seg" data-k="cat"></div><span class="lab">Prioritas</span><div class="seg" data-k="prio"></div>' +
    '<span class="lab">Nama (opsional)</span><input class="nm" maxlength="40" autocomplete="name" placeholder="Nama Anda">' +
    '<p class="err" role="alert"></p><div class="row"><button type="button" data-a="cancel">Batal</button><button class="go" type="submit">Kirim</button></div></form>' +
    '<div class="card thread" aria-label="Thread komentar"></div>' +
    '<div class="toast" role="status"></div>';

  var $ = function (s) { return root.querySelector(s); };
  var fab = $(".fab"), bar = $(".bar"), pinsEl = $(".pins"), compose = $("form.compose"), thread = $(".thread"), toastEl = $(".toast");
  var ct = $(".ct"), nm = $(".nm"), err = compose.querySelector(".err"), go = compose.querySelector(".go"), sub = compose.querySelector(".sub");
  var form = { cat: "layout", prio: "med" };
  [["cat", CATS], ["prio", PRIOS]].forEach(function (pair) {
    var k = pair[0], wrap = $('.seg[data-k="' + k + '"]');
    wrap.innerHTML = pair[1].map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (form[k] === o[0]) + '">' + o[1] + "</button>"; }).join("");
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      form[k] = b.getAttribute("data-v");
      Array.prototype.forEach.call(wrap.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });

  var tT = 0;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove("on"); }, 2600); }
  function inUI(t) { return t === host || (t && host.contains && host.contains(t)); }

  /* ---------- comments on this page (everyone's), anchored to elements ---------- */
  var items = [];          // {n, anchor:{selector,dx,dy,x,y}, text, author, cat, prio, at, replies}
  var openN = null;        // thread currently open
  var draft = null;        // {anchor, element} while composing
  function resolve(a) {
    var el = null;
    try { el = a.selector ? document.querySelector(a.selector) : null; } catch (e) {}
    if (el) {
      var r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return { x: r.left + a.dx * r.width, y: r.top + a.dy * r.height };
      return null;
    }
    return { x: a.x - scrollX, y: a.y - scrollY };
  }
  function anchorOf(n) { for (var i = 0; i < items.length; i++) if (items[i].n === n) return items[i].anchor; return null; }
  function paintPins() {
    var list = items.map(function (it) { return { id: it.n, label: it.n, a: it.anchor, on: it.n === openN }; });
    if (draft) list.push({ id: "draft", label: "+", a: draft.anchor, on: true, draft: true });
    var html = "";
    list.forEach(function (p) {
      var pos = resolve(p.a);
      if (!pos) return;
      html += '<button type="button" class="pin' + (p.draft ? " draft" : "") + (p.on ? " on" : "") + '" data-id="' + p.id + '" aria-label="' + (p.draft ? "Komentar baru" : "Komentar " + p.label) + '" style="left:' + pos.x.toFixed(1) + "px;top:" + pos.y.toFixed(1) + 'px"><span>' + esc(p.label) + "</span></button>";
    });
    pinsEl.innerHTML = html;
    var n = items.length, b = fab.querySelector("b");
    b.hidden = !n; b.textContent = n;
  }
  function placeCard(card, anchor) {
    if (!card.classList.contains("on") || !anchor || innerWidth <= 760) return;
    var pos = resolve(anchor); if (!pos) return;
    var pw = 340, ph = card.offsetHeight || 320;
    var left = pos.x + 18 + pw <= innerWidth ? pos.x + 18 : pos.x - 18 - pw;
    var top = pos.y - 20;
    left = Math.min(Math.max(12, left), innerWidth - pw - 12);
    top = Math.min(Math.max(12, top), innerHeight - ph - 12);
    card.style.left = left + "px"; card.style.top = top + "px";
  }
  var raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0; paintPins();
      if (openN != null) placeCard(thread, anchorOf(openN));
      if (draft) placeCard(compose, draft.anchor);
    });
  }

  function load() {
    json(API + "?page=" + encodeURIComponent(pageKey())).then(function (r) {
      var server = (r.s === 200 && Array.isArray(r.j.items)) ? r.j.items : [];
      /* a comment sent a moment ago may not be in the cached list yet */
      var seen = {}; server.forEach(function (i) { seen[i.n] = 1; });
      readMine().forEach(function (m) { if (m.page === pageKey() && !seen[m.item.n] && Date.now() - m.at < 120000) server.push(m.item); });
      items = server; paintPins();
    }).catch(function () {});
  }

  /* ---------- comment mode ---------- */
  var mode = false;
  function setMode(on) {
    mode = on; fab.setAttribute("aria-pressed", String(on));
    fab.querySelector(".t").textContent = on ? "Selesai" : "Feedback";
    bar.classList.toggle("on", on);
    document.documentElement.style.cursor = on ? "crosshair" : "";
    document.removeEventListener("click", onPick, true);
    if (on) { closeThread(); closeCompose(); document.addEventListener("click", onPick, true); }
  }
  function onPick(e) {
    if (inUI(e.target) || (e.composedPath && e.composedPath().indexOf(host) > -1)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var x = e.clientX, y = e.clientY;
    var el = document.elementFromPoint(x, y);
    if (!el || inUI(el)) return;
    if (el === document.documentElement) el = document.body;
    var r = el.getBoundingClientRect();
    var dx = r.width ? Math.min(1, Math.max(0, (x - r.left) / r.width)) : 0, dy = r.height ? Math.min(1, Math.max(0, (y - r.top) / r.height)) : 0;
    draft = {
      anchor: { selector: selectorOf(el), dx: +dx.toFixed(3), dy: +dy.toFixed(3), x: Math.round(x + scrollX), y: Math.round(y + scrollY) },
      element: {
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").replace(/\s+/g, " ").trim().slice(0, 100),
        section: sectionOf(el)
      }
    };
    openCompose();
  }
  function openCompose() {
    closeThread();
    sub.textContent = draft.element.section ? draft.element.section + " · " + draft.element.tag : draft.anchor.selector;
    err.textContent = ""; ct.value = ""; nm.value = getName(); go.disabled = false; go.textContent = "Kirim";
    compose.classList.add("on"); paintPins(); placeCard(compose, draft.anchor);
    setTimeout(function () { ct.focus({ preventScroll: true }); }, 30);
  }
  function closeCompose() { compose.classList.remove("on"); if (draft) { draft = null; paintPins(); } }

  compose.addEventListener("click", function (e) { if (e.target.getAttribute("data-a") === "cancel") closeCompose(); });
  compose.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCompose(); e.stopPropagation(); });
  compose.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = ct.value.trim();
    if (!text) { err.textContent = "Tulis komentarnya dulu."; ct.focus(); return; }
    var name = nm.value.trim().slice(0, 40); setName(name);
    var d = draft;
    var payload = {
      comment: text, author: name, category: form.cat, priority: form.prio, page: pageKey(), title: document.title.slice(0, 120),
      anchor: d.anchor, element: { selector: d.anchor.selector, tag: d.element.tag, text: d.element.text, section: d.element.section, scrollY: Math.round(scrollY) },
      env: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1, bp: bp(), touch: matchMedia("(hover: none)").matches, ua: navigator.userAgent.slice(0, 200) }
    };
    go.disabled = true; go.textContent = "Mengirim…"; err.textContent = "";
    json(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(function (r) {
      if (r.s === 200 && r.j.ok) {
        var item = { n: r.j.number, anchor: d.anchor, text: text, author: name || "Anonim", cat: form.cat, prio: form.prio, at: new Date().toISOString(), replies: 0 };
        items.push(item);
        var mine = readMine(); mine.push({ page: pageKey(), at: Date.now(), item: item }); writeMine(mine);
        compose.classList.remove("on"); draft = null; paintPins(); toast("Terkirim · #" + item.n);
      } else {
        err.textContent = r.s === 429 ? "Terlalu sering. Coba lagi sebentar." : r.s === 503 ? "Server belum disetel (GITHUB_TOKEN)." : "Gagal mengirim. Komentar tetap di sini, coba lagi.";
        go.disabled = false; go.textContent = "Kirim";
      }
    }).catch(function () { err.textContent = "Tidak ada koneksi. Komentar tetap di sini, coba lagi."; go.disabled = false; go.textContent = "Kirim"; });
  });

  /* ---------- threads ---------- */
  function labelOf(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i][1]; return ""; }
  function msgHTML(who, at, text) { return '<div class="msg"><div class="who">' + esc(who) + "<small>" + esc(at ? ago(at) : "") + '</small></div><p class="txt">' + esc(text) + "</p></div>"; }
  function openThread(n) {
    var it = null; items.forEach(function (i) { if (i.n === n) it = i; });
    if (!it) return;
    closeCompose(); openN = n;
    thread.innerHTML = '<button type="button" class="x" data-a="close" aria-label="Tutup">×</button>' +
      '<p class="tags">#' + it.n + " · " + esc(labelOf(CATS, it.cat)) + " · " + esc(labelOf(PRIOS, it.prio)) + "</p>" +
      '<div class="msgs">' + msgHTML(it.author || "Anonim", it.at, it.text) + '<div class="replies">' + (it.replies ? '<p class="sub">Memuat balasan…</p>' : "") + "</div></div>" +
      '<form class="reply"><span class="lab">Balas</span><textarea maxlength="1000" placeholder="Tulis balasan…" aria-label="Balasan"></textarea>' +
      '<input class="rn" maxlength="40" placeholder="Nama (opsional)" value="' + esc(getName()) + '" style="margin-top:8px"><p class="err" role="alert"></p>' +
      '<div class="row"><button class="go" type="submit">Balas</button></div></form>';
    thread.classList.add("on"); paintPins(); placeCard(thread, it.anchor);
    if (it.replies) json(API + "?issue=" + n).then(function (r) {
      var box = thread.querySelector(".replies"); if (!box || openN !== n) return;
      box.innerHTML = (r.s === 200 && r.j.comments ? r.j.comments : []).map(function (c) { return msgHTML(c.author, c.at, c.text); }).join("");
    }).catch(function () {});
  }
  function closeThread() { if (openN == null) return; openN = null; thread.classList.remove("on"); paintPins(); }
  thread.addEventListener("click", function (e) { if (e.target.getAttribute("data-a") === "close") closeThread(); });
  thread.addEventListener("keydown", function (e) { if (e.key === "Escape") closeThread(); e.stopPropagation(); });
  thread.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, ta = f.querySelector("textarea"), text = ta.value.trim(), er = f.querySelector(".err"), btn = f.querySelector(".go");
    if (!text) { er.textContent = "Tulis balasannya dulu."; return; }
    var name = f.querySelector(".rn").value.trim().slice(0, 40); setName(name);
    var n = openN; btn.disabled = true; er.textContent = "";
    json(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reply: true, issue: n, text: text, author: name }) }).then(function (r) {
      btn.disabled = false;
      if (r.s === 200 && r.j.ok) {
        var box = thread.querySelector(".replies"); if (box) box.insertAdjacentHTML("beforeend", msgHTML(name || "Anonim", new Date().toISOString(), text));
        ta.value = ""; items.forEach(function (i) { if (i.n === n) i.replies = (i.replies || 0) + 1; }); toast("Balasan terkirim");
      } else { er.textContent = r.s === 429 ? "Terlalu sering. Coba lagi sebentar." : "Gagal mengirim. Coba lagi."; }
    }).catch(function () { btn.disabled = false; er.textContent = "Tidak ada koneksi."; });
  });
  pinsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".pin"); if (!b) return;
    var id = b.getAttribute("data-id"); if (id === "draft") return;
    e.stopPropagation();
    if (mode) setMode(false);
    var n = Number(id); if (openN === n) closeThread(); else openThread(n);
  });

  /* ---------- toggle, shortcuts, mount ---------- */
  fab.addEventListener("click", function (e) { e.stopPropagation(); setMode(!mode); });
  document.addEventListener("keydown", function (e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (e.key === "Escape") { if (mode) setMode(false); closeCompose(); closeThread(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "c" || e.key === "C") setMode(!mode);
  });
  /* tapping the page (outside the cards) closes an open thread */
  document.addEventListener("click", function (e) { if (!mode && openN != null && !inUI(e.target)) closeThread(); });

  function mount() {
    document.body.appendChild(host);
    load();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.documentElement);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
