/* Havenlist comments — leave a comment on any spot of any page, Figma style.
   The "Feedback" button (or the C key) switches comment mode on: click anywhere to drop a pin and write.
   Comments live in this browser (no server). The "Salin" button copies all open comments as text + data,
   to paste into the Claude chat; the "feedback-triage" skill recaps them and fixes them in parallel. */
(function () {
  "use strict";
  var KEY = "hl.feedback.items.v2";
  var NAME = "hl.feedback.name";
  var CATS = [["layout", "Tampilan"], ["bug", "Bug"], ["copy", "Teks"], ["idea", "Ide"]];
  var PRIOS = [["low", "Rendah"], ["med", "Sedang"], ["high", "Tinggi"]];

  /* ---------- helpers ---------- */
  function pageKey() {
    var p = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "") || "/index";
    return p + location.search;
  }
  function bp() { var w = window.innerWidth; return w <= 640 ? "mobile" : w <= 1024 ? "tablet" : "desktop"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function getName() { try { return localStorage.getItem(NAME) || ""; } catch (e) { return ""; } }
  function setName(v) { try { localStorage.setItem(NAME, v); } catch (e) {} }
  function loadAll() { try { var a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveAll(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function ago(ts) {
    var s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " mnt lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    return Math.floor(s / 86400) + " hari lalu";
  }
  function labelOf(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i][1]; return ""; }

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
    "*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer}[hidden]{display:none!important}" +
    ".dock{pointer-events:auto;position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;gap:8px}" +
    ".fab,.copy{height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;background:#1e1e1e;color:#fff;font-weight:500;box-shadow:0 4px 14px rgba(0,0,0,.25)}" +
    ".copy{background:#fff;color:#1e1e1e;border:1px solid #dcdcd8}" +
    ".fab[aria-pressed=true]{background:#e5484d}" +
    ".fab b{min-width:20px;height:20px;padding:0 6px;display:inline-grid;place-items:center;border-radius:10px;background:#e5484d;font-size:12px}.fab[aria-pressed=true] b{background:#fff;color:#e5484d}" +
    ".bar{pointer-events:none;position:fixed;top:12px;left:50%;transform:translateX(-50%);max-width:calc(100% - 24px);padding:10px 16px;background:#1e1e1e;color:#fff;border-radius:999px;font-weight:500;display:none;text-align:center}.bar.on{display:block}" +
    ".pin{pointer-events:auto;position:fixed;width:28px;height:28px;margin:-28px 0 0 -14px;display:grid;place-items:center;border-radius:50% 50% 50% 0;background:#e5484d;color:#fff;font:600 12px/1 system-ui,sans-serif;box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.3);border:0;padding:0;transform:rotate(-45deg)}" +
    ".pin>span{transform:rotate(45deg)}.pin.draft,.pin.on{background:#1e1e1e}" +
    ".card{pointer-events:auto;position:fixed;width:min(340px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;padding:16px;background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.28);display:none}.card.on{display:block}" +
    "@media(max-width:760px){.card{left:0!important;right:0!important;top:auto!important;bottom:0!important;width:100%;max-height:80vh;border-radius:20px 20px 0 0;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}.dock{left:auto;right:12px}}" +
    ".card h4{margin:0 0 2px;font-size:15px;line-height:1.3;font-weight:600}.sub{margin:0 0 10px;color:#6b6b68;font-size:12px;word-break:break-word}" +
    ".lab{display:block;margin:10px 0 6px;font-size:12px;color:#6b6b68}" +
    ".seg{display:flex;gap:6px;flex-wrap:wrap}.seg button{padding:6px 11px;border:1px solid #dcdcd8;border-radius:999px;background:#fff;font-size:13px}.seg button[aria-pressed=true]{background:#1e1e1e;border-color:#1e1e1e;color:#fff}" +
    "textarea,input{width:100%;padding:10px 12px;border:1px solid #dcdcd8;border-radius:12px;font:inherit;background:#fff}textarea{min-height:84px;resize:vertical}input{height:40px;border-radius:999px;padding:0 14px}textarea:focus,input:focus{outline:2px solid #1e1e1e;outline-offset:1px}" +
    ".row{display:flex;gap:8px;margin-top:12px}.row button{flex:1;height:42px;border-radius:999px;border:1px solid #dcdcd8;background:#fff;font-weight:500}.row .go{background:#1e1e1e;border-color:#1e1e1e;color:#fff}" +
    ".err{margin:8px 0 0;color:#c4262b;font-size:12px}" +
    ".who{font-weight:600;font-size:13px}.who small{font-weight:400;color:#6b6b68;margin-left:6px}.txt{margin:2px 0 0;white-space:pre-wrap;word-break:break-word}" +
    ".tags{margin:0 0 8px;color:#6b6b68;font-size:12px}.x{float:right;border:0;background:none;font-size:20px;line-height:1;padding:0 2px;color:#6b6b68}" +
    ".toast{pointer-events:none;position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:calc(100% - 24px);padding:10px 16px;background:#1e1e1e;color:#fff;border-radius:999px;opacity:0;transition:opacity .2s;text-align:center}.toast.on{opacity:1}" +
    "</style>" +
    '<div class="pins"></div>' +
    '<div class="dock"><button class="copy" type="button" hidden>Salin</button><button class="fab" type="button" aria-pressed="false" title="Komentar (C)"><span class="t">Feedback</span> <b hidden>0</b></button></div>' +
    '<div class="bar" role="status">Klik untuk berkomentar · Esc selesai</div>' +
    '<form class="card compose" aria-label="Komentar baru"><h4>Komentar baru</h4><p class="sub"></p>' +
    '<textarea class="ct" maxlength="2000" placeholder="Apa yang ingin diubah di sini?" aria-label="Komentar"></textarea>' +
    '<span class="lab">Jenis</span><div class="seg" data-k="cat"></div><span class="lab">Prioritas</span><div class="seg" data-k="prio"></div>' +
    '<span class="lab">Nama (opsional)</span><input class="nm" maxlength="40" autocomplete="name" placeholder="Nama Anda">' +
    '<p class="err" role="alert"></p><div class="row"><button type="button" data-a="cancel">Batal</button><button class="go" type="submit">Simpan</button></div></form>' +
    '<div class="card thread" aria-label="Komentar"></div>' +
    '<div class="toast" role="status"></div>';

  var $ = function (s) { return root.querySelector(s); };
  var fab = $(".fab"), copyBtn = $(".copy"), bar = $(".bar"), pinsEl = $(".pins"), compose = $("form.compose"), thread = $(".thread"), toastEl = $(".toast");
  var ct = $(".ct"), nm = $(".nm"), err = compose.querySelector(".err"), sub = compose.querySelector(".sub");
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
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove("on"); }, 3200); }
  function inUI(t) { return t === host || (t && host.contains && host.contains(t)); }

  /* ---------- comments (kept in this browser) ---------- */
  var all = loadAll();      // every comment, every page: {id, page, anchor, element, env, text, author, cat, prio, at, done}
  var openId = null;        // thread currently open
  var draft = null;         // {anchor, element} while composing
  function here() { return all.filter(function (c) { return c.page === pageKey() && !c.done; }); }
  function pending() { return all.filter(function (c) { return !c.done; }); }
  function byId(id) { for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
  function numberOf(c) { return pending().indexOf(c) + 1; }

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
  function paintPins() {
    var list = here().map(function (c) { return { id: c.id, label: numberOf(c), a: c.anchor, on: c.id === openId }; });
    if (draft) list.push({ id: "draft", label: "+", a: draft.anchor, on: true, draft: true });
    var html = "";
    list.forEach(function (p) {
      var pos = resolve(p.a);
      if (!pos) return;
      html += '<button type="button" class="pin' + (p.draft ? " draft" : "") + (p.on ? " on" : "") + '" data-id="' + p.id + '" aria-label="' + (p.draft ? "Komentar baru" : "Komentar " + p.label) + '" style="left:' + pos.x.toFixed(1) + "px;top:" + pos.y.toFixed(1) + 'px"><span>' + esc(p.label) + "</span></button>";
    });
    pinsEl.innerHTML = html;
    var n = pending().length, b = fab.querySelector("b");
    b.hidden = !n; b.textContent = n;
    copyBtn.hidden = !n; copyBtn.textContent = "Salin " + n;
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
      var c = openId && byId(openId);
      if (c) placeCard(thread, c.anchor);
      if (draft) placeCard(compose, draft.anchor);
    });
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
    err.textContent = ""; ct.value = ""; nm.value = getName();
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
    all.push({
      id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      page: pageKey(), title: document.title.slice(0, 120), text: text, author: name, cat: form.cat, prio: form.prio, at: Date.now(), done: false,
      anchor: d.anchor,
      element: { selector: d.anchor.selector, tag: d.element.tag, text: d.element.text, section: d.element.section, scrollY: Math.round(scrollY) },
      env: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1, bp: bp(), touch: matchMedia("(hover: none)").matches }
    });
    saveAll(all);
    compose.classList.remove("on"); draft = null; paintPins(); toast("Tersimpan · tekan Salin untuk kirim ke Claude");
  });

  /* ---------- threads ---------- */
  function openThread(id) {
    var c = byId(id); if (!c) return;
    closeCompose(); openId = id;
    thread.innerHTML = '<button type="button" class="x" data-a="close" aria-label="Tutup">×</button>' +
      '<p class="tags">#' + numberOf(c) + " · " + esc(labelOf(CATS, c.cat)) + " · " + esc(labelOf(PRIOS, c.prio)) + " · " + esc(c.env.bp) + " " + c.env.w + "×" + c.env.h + "</p>" +
      '<div class="who">' + esc(c.author || "Anonim") + "<small>" + esc(ago(c.at)) + '</small></div><p class="txt">' + esc(c.text) + "</p>" +
      '<div class="row"><button type="button" data-a="del">Hapus</button><button class="go" type="button" data-a="done">Selesai</button></div>';
    thread.classList.add("on"); paintPins(); placeCard(thread, c.anchor);
  }
  function closeThread() { if (openId == null) return; openId = null; thread.classList.remove("on"); paintPins(); }
  thread.addEventListener("click", function (e) {
    var a = e.target.getAttribute("data-a"), id = openId;
    if (a === "close") closeThread();
    if (a === "done" || a === "del") {
      var c = byId(id); if (!c) return;
      if (a === "done") c.done = true; else all.splice(all.indexOf(c), 1);
      saveAll(all); closeThread(); paintPins(); toast(a === "done" ? "Ditandai selesai" : "Dihapus");
    }
  });
  thread.addEventListener("keydown", function (e) { if (e.key === "Escape") closeThread(); e.stopPropagation(); });
  pinsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".pin"); if (!b) return;
    var id = b.getAttribute("data-id"); if (id === "draft") return;
    e.stopPropagation();
    if (mode) setMode(false);
    if (openId === id) closeThread(); else openThread(id);
  });

  /* ---------- copy for Claude ---------- */
  function exportText() {
    var list = pending();
    var byPage = {};
    list.forEach(function (c) { (byPage[c.page] = byPage[c.page] || []).push(c); });
    var lines = ["# Feedback Havenlist — " + list.length + " komentar", ""];
    Object.keys(byPage).forEach(function (p) {
      lines.push("## " + p);
      byPage[p].forEach(function (c) {
        lines.push(numberOf(c) + ". [" + labelOf(CATS, c.cat) + " · " + labelOf(PRIOS, c.prio) + " · " + c.env.bp + " " + c.env.w + "×" + c.env.h + (c.env.touch ? " sentuh" : "") + "] " + c.text.replace(/\s*\n\s*/g, " ") +
          "\n   bagian: " + (c.element.section || "-") + " — `" + c.element.selector + "`" + (c.author ? " (dari " + c.author + ")" : ""));
      });
      lines.push("");
    });
    var data = list.map(function (c) { return { n: numberOf(c), page: c.page, category: c.cat, priority: c.prio, comment: c.text, author: c.author, anchor: c.anchor, element: c.element, env: c.env }; });
    lines.push("```json feedback-batch", JSON.stringify(data), "```");
    return lines.join("\n");
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, fail) {
      var ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? ok() : fail(); } catch (e) { fail(e); } ta.remove();
    });
  }
  copyBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var n = pending().length;
    copyText(exportText()).then(function () { toast("Disalin · " + n + " komentar. Tempel ke chat Claude."); }, function () { toast("Gagal menyalin. Izinkan akses clipboard."); });
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
  document.addEventListener("click", function (e) { if (!mode && openId != null && !inUI(e.target)) closeThread(); });
  window.addEventListener("storage", function (e) { if (e.key === KEY) { all = loadAll(); schedule(); } });

  function mount() {
    document.body.appendChild(host);
    paintPins();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.documentElement);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
