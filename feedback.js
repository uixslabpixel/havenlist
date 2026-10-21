/* Havenlist feedback — pin a comment to any part of any page.
   Off for everyone by default. Open any page once with ?feedback=KODE to switch it on in this
   browser (?feedback=off switches it off again). Comments are sent to /api/feedback, which files
   them as GitHub issues; the "feedback-triage" skill reads them back. */
(function () {
  "use strict";
  var KEY = "hl.feedback.v1";
  var CATS = [["layout", "Tampilan"], ["bug", "Bug"], ["copy", "Teks"], ["idea", "Ide"]];
  var PRIOS = [["low", "Rendah"], ["med", "Sedang"], ["high", "Tinggi"]];

  /* ---------- state (code + pins already sent from this browser) ---------- */
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && typeof d === "object") { d.list = d.list || []; return d; } } catch (e) {}
    return { code: "", list: [], pins: true };
  }
  var st = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var params = new URLSearchParams(location.search);
  if (params.has("feedback")) {
    var c = params.get("feedback");
    if (c === "off") { st.code = ""; } else if (c) { st.code = c; }
    save();
    params.delete("feedback");
    var qs = params.toString();
    try { history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash); } catch (e) {}
  }
  if (!st.code) return;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
  function pageKey() { return location.pathname + location.search; }
  function bp() { var w = window.innerWidth; return w <= 640 ? "mobile" : w <= 1024 ? "tablet" : "desktop"; }

  /* Short, stable-ish CSS path: tag#id or tag.class, with :nth-of-type when siblings share the tag */
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
  function describe(el) {
    var r = el.getBoundingClientRect();
    return {
      selector: selectorOf(el),
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").replace(/\s+/g, " ").trim().slice(0, 100),
      section: sectionOf(el),
      rect: { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      scrollY: Math.round(scrollY)
    };
  }
  function env() {
    return {
      w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1,
      bp: bp(), touch: matchMedia("(hover: none)").matches, ua: navigator.userAgent.slice(0, 200)
    };
  }

  /* ---------- UI (Shadow DOM so page styles never leak in or out) ---------- */
  var host = document.createElement("div");
  host.id = "hl-feedback";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;font:400 14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1e1e1e;";
  var root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    "<style>" +
    ":host{font:400 14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1e1e1e}" +
    "*{box-sizing:border-box}button{font:inherit;color:inherit;cursor:pointer}" +
    ".fab{pointer-events:auto;position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;background:#1e1e1e;color:#fff;font-weight:500;box-shadow:0 4px 14px rgba(0,0,0,.25)}" +
    ".fab b{min-width:20px;height:20px;padding:0 6px;display:inline-grid;place-items:center;border-radius:10px;background:#e5484d;font-size:12px}" +
    ".menu{pointer-events:auto;position:fixed;left:12px;bottom:calc(60px + env(safe-area-inset-bottom,0px));min-width:220px;padding:6px;background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.2);display:none}" +
    ".menu.on{display:block}.menu button{display:block;width:100%;padding:11px 12px;text-align:left;background:none;border:0;border-radius:8px}.menu button:hover{background:#f2f2f0}" +
    ".bar{pointer-events:none;position:fixed;top:12px;left:50%;transform:translateX(-50%);max-width:calc(100% - 24px);padding:10px 16px;background:#1e1e1e;color:#fff;border-radius:999px;font-weight:500;display:none;text-align:center}" +
    ".bar.on{display:block}" +
    ".hi{position:fixed;display:none;border:2px solid #e5484d;background:rgba(229,72,77,.12);border-radius:4px;pointer-events:none}" +
    ".hi.on{display:block}.hi.sel{background:rgba(229,72,77,.06)}" +
    ".panel{pointer-events:auto;position:fixed;width:min(340px,calc(100vw - 24px));padding:16px;background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.28);display:none}" +
    ".panel.on{display:block}" +
    "@media(max-width:760px){.panel{left:0!important;right:0!important;top:auto!important;bottom:0!important;width:100%;border-radius:20px 20px 0 0;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}}" +
    ".panel h4{margin:0 0 4px;font-size:15px;line-height:1.3;font-weight:600}.where{margin:0 0 12px;color:#6b6b68;font-size:12px;word-break:break-all}" +
    ".lab{display:block;margin:10px 0 6px;font-size:12px;color:#6b6b68}" +
    ".seg{display:flex;gap:6px;flex-wrap:wrap}.seg button{padding:7px 12px;border:1px solid #dcdcd8;border-radius:999px;background:#fff}.seg button[aria-pressed=true]{background:#1e1e1e;border-color:#1e1e1e;color:#fff}" +
    "textarea{width:100%;min-height:92px;padding:10px 12px;border:1px solid #dcdcd8;border-radius:12px;font:inherit;resize:vertical}textarea:focus{outline:2px solid #1e1e1e;outline-offset:1px}" +
    ".row{display:flex;gap:8px;margin-top:12px}.row button{flex:1;height:42px;border-radius:999px;border:1px solid #dcdcd8;background:#fff;font-weight:500}.row .go{background:#1e1e1e;border-color:#1e1e1e;color:#fff}.row button:disabled{opacity:.5;cursor:default}" +
    ".err{margin:8px 0 0;color:#c4262b;font-size:12px;min-height:0}" +
    ".toast{pointer-events:none;position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);padding:10px 16px;background:#1e1e1e;color:#fff;border-radius:999px;opacity:0;transition:opacity .2s}.toast.on{opacity:1}" +
    "</style>" +
    '<button class="fab" type="button" aria-haspopup="true">Feedback <b hidden>0</b></button>' +
    '<div class="menu" role="menu"><button type="button" data-a="add">Tambah feedback…</button><button type="button" data-a="pins"></button><button type="button" data-a="off">Matikan mode feedback</button></div>' +
    '<div class="bar" role="status">Pilih bagian yang ingin diberi feedback · Esc untuk batal</div>' +
    '<div class="hi"></div>' +
    '<form class="panel" aria-label="Kirim feedback"><h4>Feedback untuk bagian ini</h4><p class="where"></p>' +
    '<span class="lab">Jenis</span><div class="seg" data-k="cat"></div>' +
    '<span class="lab">Prioritas</span><div class="seg" data-k="prio"></div>' +
    '<label class="lab" for="c">Apa yang ingin diubah?</label><textarea id="c" maxlength="2000" placeholder="Tulis sespesifik mungkin, mis. \'judul terlalu besar di mobile\'"></textarea>' +
    '<p class="err" role="alert"></p><div class="row"><button type="button" data-a="cancel">Batal</button><button class="go" type="submit">Kirim</button></div></form>' +
    '<div class="toast" role="status"></div>';

  var $ = function (s) { return root.querySelector(s); };
  var fab = $(".fab"), menu = $(".menu"), bar = $(".bar"), hi = $(".hi"), panel = $(".panel"), toastEl = $(".toast");
  var ta = $("textarea"), errEl = $(".err"), whereEl = $(".where"), goBtn = $(".go");
  var form = { cat: "layout", prio: "med" };
  function seg(k, opts) {
    var wrap = $('.seg[data-k="' + k + '"]');
    wrap.innerHTML = opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (form[k] === o[0]) + '">' + o[1] + "</button>"; }).join("");
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      form[k] = b.getAttribute("data-v");
      Array.prototype.forEach.call(wrap.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  }
  seg("cat", CATS); seg("prio", PRIOS);

  var tT = 0;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove("on"); }, 2600); }
  function badge() {
    var n = st.list.filter(function (p) { return p.page === pageKey(); }).length, b = fab.querySelector("b");
    b.hidden = !n; b.textContent = n;
  }
  function paintMenu() { menu.querySelector('[data-a="pins"]').textContent = st.pins === false ? "Tampilkan pin feedback" : "Sembunyikan pin feedback"; }

  /* ---------- picking ---------- */
  var picking = false, picked = null;
  function inUI(t) { return t === host || (t && host.contains && host.contains(t)); }
  function target(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el || inUI(el) || el === document.documentElement || el === document.body) return null;
    return el;
  }
  function box(el, node) {
    var r = el.getBoundingClientRect();
    node.style.cssText = "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px";
  }
  function onMove(e) {
    var el = target(e.clientX, e.clientY);
    if (!el) { hi.classList.remove("on"); return; }
    hi.classList.add("on"); box(el, hi); hi._el = el;
  }
  function onClick(e) {
    if (inUI(e.target) || (e.composedPath && e.composedPath().indexOf(host) > -1)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var el = target(e.clientX, e.clientY) || e.target;
    choose(el);
  }
  function onKey(e) { if (e.key === "Escape") stop(); }
  function start() {
    closeMenu(); stop(true); picking = true;
    bar.classList.add("on"); document.documentElement.style.cursor = "crosshair";
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
  }
  function stop(keepPanel) {
    picking = false; bar.classList.remove("on"); document.documentElement.style.cursor = "";
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    if (!keepPanel) { panel.classList.remove("on"); hi.classList.remove("on", "sel"); picked = null; }
  }
  function choose(el) {
    stop(true); picked = el;
    hi.classList.add("on", "sel"); box(el, hi);
    var d = describe(el);
    whereEl.textContent = d.section ? d.section + " · " + d.tag : d.selector;
    errEl.textContent = ""; ta.value = ""; goBtn.disabled = false; goBtn.textContent = "Kirim";
    panel.classList.add("on");
    /* desktop: sit beside the element, kept on screen; phones use the bottom-sheet CSS */
    var r = el.getBoundingClientRect(), pw = 340, ph = panel.offsetHeight || 380;
    var left, top;
    if (r.right + 12 + pw <= innerWidth) { left = r.right + 12; top = r.top; }
    else if (r.left - 12 - pw >= 0) { left = r.left - 12 - pw; top = r.top; }
    else { left = r.left; top = r.bottom + 12; if (top + ph > innerHeight - 12) top = Math.max(12, r.top - ph - 12); }
    left = Math.min(Math.max(12, left), innerWidth - pw - 12);
    top = Math.min(Math.max(12, top), innerHeight - ph - 12);
    panel.style.left = left + "px"; panel.style.top = top + "px";
    setTimeout(function () { ta.focus({ preventScroll: true }); }, 30);
  }

  /* ---------- submit ---------- */
  panel.addEventListener("click", function (e) { if (e.target.getAttribute("data-a") === "cancel") stop(); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") stop(); e.stopPropagation(); });
  panel.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = ta.value.trim();
    if (!text) { errEl.textContent = "Tulis komentarnya dulu."; ta.focus(); return; }
    if (!picked || !picked.isConnected) { errEl.textContent = "Bagian ini sudah berubah. Pilih ulang."; return; }
    var d = describe(picked);
    var payload = { code: st.code, comment: text, category: form.cat, priority: form.prio, page: pageKey(), title: document.title.slice(0, 120), element: d, env: env() };
    goBtn.disabled = true; goBtn.textContent = "Mengirim…"; errEl.textContent = "";
    fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (r) {
        if (r.s === 200 && r.j.ok) {
          st.list.push({ n: r.j.number, page: pageKey(), sel: d.selector, text: text.slice(0, 140), cat: form.cat, rect: d.rect });
          save(); stop(); badge(); pins(); toast("Terkirim · #" + r.j.number);
        } else if (r.s === 401) {
          st.code = ""; save(); errEl.textContent = "Kode feedback salah. Buka lagi dengan ?feedback=KODE.";
          goBtn.textContent = "Kirim";
        } else if (r.s === 429) {
          errEl.textContent = "Terlalu sering. Coba lagi sebentar."; goBtn.disabled = false; goBtn.textContent = "Kirim";
        } else if (r.s === 503) {
          errEl.textContent = "Server belum disetel (FEEDBACK_CODE / GITHUB_TOKEN)."; goBtn.disabled = false; goBtn.textContent = "Kirim";
        } else {
          errEl.textContent = "Gagal mengirim. Komentar tetap di sini, coba lagi."; goBtn.disabled = false; goBtn.textContent = "Kirim";
        }
      })
      .catch(function () { errEl.textContent = "Tidak ada koneksi. Komentar tetap di sini, coba lagi."; goBtn.disabled = false; goBtn.textContent = "Kirim"; });
  });

  /* ---------- pins: numbered markers on the parts already commented on (this browser only) ---------- */
  var pinLayer = document.createElement("div");
  pinLayer.style.cssText = "all:initial;position:absolute;left:0;top:0;width:0;height:0;z-index:2147482999;";
  var pinRoot = pinLayer.attachShadow({ mode: "open" });
  pinRoot.innerHTML = "<style>.p{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;display:grid;place-items:center;border-radius:50%;background:#e5484d;color:#fff;font:600 11px/1 system-ui,sans-serif;box-shadow:0 0 0 2px #fff;pointer-events:auto}</style>";
  var pinTimer = 0;
  function pins() {
    clearTimeout(pinTimer);
    pinTimer = setTimeout(function () {
      Array.prototype.slice.call(pinRoot.querySelectorAll(".p")).forEach(function (n) { n.remove(); });
      if (st.pins === false) return;
      st.list.forEach(function (p) {
        if (p.page !== pageKey()) return;
        var el; try { el = document.querySelector(p.sel); } catch (e) { el = null; }
        var r = el ? el.getBoundingClientRect() : null;
        var x = r ? r.right + scrollX : p.rect.x + p.rect.w, y = r ? r.top + scrollY : p.rect.y;
        var n = document.createElement("span"); n.className = "p"; n.textContent = p.n; n.title = "#" + p.n + " · " + p.text;
        n.style.left = Math.max(12, x - 4) + "px"; n.style.top = Math.max(12, y + 4) + "px";
        pinRoot.appendChild(n);
      });
    }, 120);
  }

  /* ---------- menu + mount ---------- */
  function closeMenu() { menu.classList.remove("on"); fab.setAttribute("aria-expanded", "false"); }
  fab.addEventListener("click", function (e) { e.stopPropagation(); if (picking) { stop(); return; } paintMenu(); var on = menu.classList.toggle("on"); fab.setAttribute("aria-expanded", String(on)); });
  menu.addEventListener("click", function (e) {
    var a = e.target.getAttribute("data-a"); if (!a) return;
    if (a === "add") start();
    if (a === "pins") { st.pins = st.pins === false; save(); closeMenu(); pins(); }
    if (a === "off") { st.code = ""; save(); closeMenu(); host.remove(); pinLayer.remove(); toast("Mode feedback dimatikan"); }
  });
  document.addEventListener("click", function (e) { if (!inUI(e.target)) closeMenu(); });

  function mount() {
    document.body.appendChild(pinLayer); document.body.appendChild(host);
    badge(); pins();
    window.addEventListener("resize", pins);
    window.addEventListener("load", pins);
    if (window.ResizeObserver) new ResizeObserver(pins).observe(document.documentElement);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
