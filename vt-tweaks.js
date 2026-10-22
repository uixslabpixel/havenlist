/* DEV TOOL — "Page transition" panel. Loaded by vt.js only when the URL has ?tweak=1.
   Tunes the --vt-* variables of the page transitions (design-system.css, "Page transitions") and keeps them
   in this browser (localStorage), so every page uses them at once. Once final: "Copy values", paste the
   block over the --vt-* defaults in design-system.css :root, then delete this file and the tweak hook in vt.js. */
(function () {
  var KEY_CSS = "havenlist.vtTweaks.v1", KEY_NUM = "havenlist.vtTweaks.n", root = document.documentElement;
  var EASES = {
    "Smooth": "cubic-bezier(0.65, 0, 0.2, 1)",
    "Cinematic": "cubic-bezier(0.5, 0, 0.1, 1)",
    "Out expo": "cubic-bezier(0.16, 1, 0.3, 1)",
    "Ease in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
    "Soft": "cubic-bezier(0.33, 0.1, 0.25, 1)",
    "Gentle out": "cubic-bezier(0.22, 1, 0.36, 1)",
    "Linear": "linear"
  };
  /* key, label, min, max, step, unit, css var, to css */
  var SLIDERS = [
    ["wipeDur", "Wipe duration", 200, 2000, 10, "ms", "--vt-wipe-dur", function (n) { return n + "ms"; }],
    ["wipeIn", "Incoming slides from", 0, 25, 1, "vh", "--vt-wipe-in-shift", function (n) { return n + "vh"; }],
    ["wipeAway", "Outgoing slides by", 0, 25, 1, "vh", "--vt-wipe-away-shift", function (n) { return n + "vh"; }],
    ["wipeInOp", "Incoming starts at", 0, 100, 5, "%", "--vt-wipe-in-opacity", function (n) { return String(n / 100); }],
    ["wipeAwayOp", "Outgoing ends at", 0, 100, 5, "%", "--vt-wipe-away-opacity", function (n) { return String(n / 100); }],
    ["wipeDim", "Outgoing dims to", 50, 100, 1, "%", "--vt-wipe-dim", function (n) { return String(n / 100); }],
    ["heroDur", "Picture grow / shrink", 200, 2000, 10, "ms", "--vt-hero-dur", function (n) { return n + "ms"; }],
    ["fadeOut", "Page fades out", 0, 1000, 10, "ms", "--vt-fade-out", function (n) { return n + "ms"; }],
    ["fadeIn", "Page fades in", 0, 1500, 10, "ms", "--vt-fade-in", function (n) { return n + "ms"; }],
    ["fadeDelay", "Page fade-in delay", 0, 800, 10, "ms", "--vt-fade-delay", function (n) { return n + "ms"; }]
  ];
  var SELECTS = [["wipeEase", "Wipe easing", "--vt-wipe-ease", "Smooth"], ["heroEase", "Picture easing", "--vt-hero-ease", "Cinematic"]];
  var DEFAULTS = { wipeDur: 850, wipeIn: 7, wipeAway: 9, wipeInOp: 40, wipeAwayOp: 50, wipeDim: 90, heroDur: 800, fadeOut: 300, fadeIn: 600, fadeDelay: 120, wipeEase: "Smooth", heroEase: "Cinematic" };

  var v = {};
  Object.keys(DEFAULTS).forEach(function (k) { v[k] = DEFAULTS[k]; });
  try {
    var saved = JSON.parse(localStorage.getItem(KEY_NUM) || "{}");
    Object.keys(saved).forEach(function (k) { if (k in DEFAULTS) v[k] = saved[k]; });
  } catch (e) {}

  function cssVars() {
    var out = {};
    SLIDERS.forEach(function (d) { out[d[6]] = d[7](v[d[0]]); });
    SELECTS.forEach(function (d) { out[d[2]] = EASES[v[d[0]]] || EASES.Smooth; });
    return out;
  }
  function apply() {
    var all = cssVars();
    Object.keys(all).forEach(function (k) { root.style.setProperty(k, all[k]); });
    try { localStorage.setItem(KEY_CSS, JSON.stringify(all)); localStorage.setItem(KEY_NUM, JSON.stringify(v)); } catch (e) {}
  }
  apply();

  var css = document.createElement("style");
  css.textContent =
    ".vtw{position:fixed;right:16px;bottom:16px;z-index:400;font:12px/1.3 var(--font-ui);color:var(--ink)}" +
    ".vtw__btn{display:block;margin-left:auto;height:36px;padding:0 14px;border-radius:36px;background:var(--ink);color:#fff;font-weight:500;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,.18)}" +
    ".vtw__card{position:absolute;right:0;bottom:44px;width:304px;max-height:calc(100vh - 80px);overflow:auto;padding:14px;background:#fff;border:1px solid var(--ink-10);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.16);display:none}" +
    ".vtw.is-open .vtw__card{display:block}" +
    ".vtw__title{font:500 14px var(--font-display);margin-bottom:10px;letter-spacing:-.01em}" +
    ".vtw__sec{margin:12px 0 8px;font-weight:500;color:var(--ink-40);letter-spacing:.02em;text-transform:uppercase;font-size:10px}" +
    ".vtw__row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;margin-bottom:10px}" +
    ".vtw__row label{color:var(--ink-70)}.vtw__row output{font-variant-numeric:tabular-nums;font-weight:500}" +
    ".vtw__row input[type=range]{grid-column:1/3;width:100%;margin:0;accent-color:#1e1e1e}" +
    ".vtw__row select{grid-column:1/3;height:30px;border:1px solid var(--ink-10);border-radius:8px;padding:0 8px;background:#fff;font:inherit}" +
    ".vtw__btns{display:flex;flex-wrap:wrap;gap:6px}" +
    ".vtw__btns button{height:28px;padding:0 10px;border:1px solid var(--ink-10);border-radius:28px;background:#fff;font:500 12px var(--font-ui)}" +
    ".vtw__btns button:hover{background:var(--ink-07)}.vtw__btns .is-primary{background:var(--ink);color:#fff;border-color:var(--ink)}";
  document.head.appendChild(css);

  var wrap = document.createElement("div");
  wrap.className = "vtw";
  wrap.innerHTML =
    '<div class="vtw__card" role="group" aria-label="Page transition tweaks"><div class="vtw__title">Page transition</div>' +
    '<div class="vtw__sec">Test (opens the next / previous page in the menu)</div><div class="vtw__btns vtw__tests"></div>' +
    '<div class="vtw__sec">Wipe</div><div class="vtw__wipe"></div>' +
    '<div class="vtw__sec">Card picture &harr; detail picture</div><div class="vtw__hero"></div>' +
    '<div class="vtw__sec">&nbsp;</div><div class="vtw__btns vtw__acts"></div></div>' +
    '<button class="vtw__btn" type="button" aria-expanded="false">Page transition</button>';
  document.body.appendChild(wrap);
  var toggle = wrap.querySelector(".vtw__btn");
  toggle.addEventListener("click", function () {
    var open = wrap.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  var paints = {};
  function row(label) {
    var r = document.createElement("div");
    r.className = "vtw__row";
    var l = document.createElement("label");
    l.textContent = label;
    r.appendChild(l);
    return r;
  }
  var HERO_KEYS = { heroDur: 1, fadeOut: 1, fadeIn: 1, fadeDelay: 1, heroEase: 1 };
  function host(key) { return wrap.querySelector(HERO_KEYS[key] ? ".vtw__hero" : ".vtw__wipe"); }
  SLIDERS.forEach(function (d) {
    var key = d[0], r = row(d[1]), out = document.createElement("output"), input = document.createElement("input");
    input.type = "range"; input.min = d[2]; input.max = d[3]; input.step = d[4];
    function paint() { out.textContent = v[key] + d[5]; input.value = v[key]; }
    input.addEventListener("input", function () { v[key] = Number(input.value); paint(); apply(); });
    r.appendChild(out); r.appendChild(input);
    host(key).appendChild(r);
    paints[key] = paint; paint();
  });
  SELECTS.forEach(function (d) {
    var key = d[0], r = row(d[1]), sel = document.createElement("select");
    Object.keys(EASES).forEach(function (n) {
      var o = document.createElement("option");
      o.value = n; o.textContent = n + (EASES[n] === "linear" ? "" : "  " + EASES[n].replace("cubic-bezier", ""));
      sel.appendChild(o);
    });
    function paint() { sel.value = v[key]; }
    sel.addEventListener("change", function () { v[key] = sel.value; apply(); });
    r.appendChild(sel);
    host(key).appendChild(r);
    paints[key] = paint; paint();
  });

  /* Test: go to the next page in the menu order (the new page rises from below) or the previous one (drops from above) */
  var ORDER = ["index.html", "search.html", "agents.html", "neighborhoods.html", "insights.html", "about.html", "sell.html", "wishlist.html"];
  var here = location.pathname.replace(/^\//, "").replace(/\/$/, "") || "index.html";
  if (!/\.html$/.test(here)) here += ".html";
  var at = ORDER.indexOf(here);
  var tests = wrap.querySelector(".vtw__tests");
  [["Next page ↑ (rises)", 1], ["Previous page ↓ (drops)", -1]].forEach(function (d) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = d[0];
    b.addEventListener("click", function () {
      var i = at < 0 ? (d[1] > 0 ? 0 : ORDER.length - 1) : at + d[1];
      if (i < 0) i = ORDER.length - 1;
      if (i >= ORDER.length) i = 0;
      location.href = ORDER[i] + "?tweak=1";
    });
    tests.appendChild(b);
  });

  var acts = wrap.querySelector(".vtw__acts");
  var reset = document.createElement("button");
  reset.type = "button"; reset.textContent = "Reset";
  reset.addEventListener("click", function () {
    Object.keys(DEFAULTS).forEach(function (k) { v[k] = DEFAULTS[k]; if (paints[k]) paints[k](); });
    apply();
  });
  var copy = document.createElement("button");
  copy.type = "button"; copy.className = "is-primary"; copy.textContent = "Copy values";
  copy.addEventListener("click", function () {
    var all = cssVars();
    var text = ":root {\n" + Object.keys(all).map(function (k) { return "  " + k + ": " + all[k] + ";"; }).join("\n") + "\n}";
    function done() { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy values"; }, 1400); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt("Copy:", text); });
    else window.prompt("Copy:", text);
  });
  acts.appendChild(reset); acts.appendChild(copy);
})();
