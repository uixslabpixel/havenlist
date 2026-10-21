/* DEV TOOL — "Dropdown tweaks" (shared by the filter pages). Hidden unless the URL has ?tweak=1.
   Saved values (localStorage) always apply. Once final, paste the "Copy values" output into :root and delete this file. */
(function dropdownTweaks() {
  /* The panel is hidden by default. Your saved values still apply; open
     search.html?tweak=1 to bring the panel back. */
  var SHOW_PANEL = /[?&]tweak(=1|=true)?(&|$)/.test(window.location.search);

  var KEY = "havenlist.popTweaks.v1";
  var root = document.documentElement;
  var EASES = {
    "Smooth": "cubic-bezier(0.32, 0.72, 0, 1)",
    "Out expo": "cubic-bezier(0.16, 1, 0.3, 1)",
    "Ease in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
    "Soft": "cubic-bezier(0.33, 0.1, 0.25, 1)",
    "Overshoot": "cubic-bezier(0.34, 1.4, 0.64, 1)",
    "Linear": "linear"
  };
  var DEFAULTS = {
    open: 550, close: 300, fade: 160,
    easeOpen: "Smooth", easeClose: "Smooth",
    rFrom: 40, rTo: 20, gap: 10, shadow: 12
  };
  var SLIDERS = [
    ["open", "Open duration", 150, 1400, 10, "ms"],
    ["close", "Close · shrink duration", 100, 1000, 10, "ms"],
    ["fade", "Close · content dissolve", 0, 600, 10, "ms"],
    ["rFrom", "Start radius (button)", 0, 40, 1, "px"],
    ["rTo", "End radius (panel)", 0, 40, 1, "px"],
    ["gap", "Gap below button", 0, 32, 1, "px"],
    ["shadow", "Shadow strength", 0, 30, 1, "%"]
  ];

  var v = {};
  Object.keys(DEFAULTS).forEach(function (k) { v[k] = DEFAULTS[k]; });
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    Object.keys(saved).forEach(function (k) { if (k in DEFAULTS) v[k] = saved[k]; });
  } catch (e) {}

  function vars() {
    return {
      "--pop-open": v.open + "ms",
      "--pop-close": v.close + "ms",
      "--pop-fade": v.fade + "ms",
      "--pop-ease-open": EASES[v.easeOpen] || EASES.Smooth,
      "--pop-ease-close": EASES[v.easeClose] || EASES.Smooth,
      "--pop-r-from": v.rFrom + "px",
      "--pop-r-to": v.rTo + "px",
      "--pop-gap": v.gap + "px",
      "--pop-shadow": String(v.shadow / 100)
    };
  }

  function apply() {
    var all = vars();
    Object.keys(all).forEach(function (k) { root.style.setProperty(k, all[k]); });
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }
  apply();
  if (!SHOW_PANEL) return;

  var css = document.createElement("style");
  css.textContent =
    ".tw{position:fixed;left:16px;bottom:16px;z-index:400;font:12px/1.3 var(--font-ui);color:var(--ink)}" +
    ".tw__btn{height:36px;padding:0 14px;border-radius:36px;background:var(--ink);color:#fff;font-weight:500;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,.18)}" +
    ".tw__card{position:absolute;left:0;bottom:44px;width:296px;max-height:calc(100vh - 80px);overflow:auto;padding:14px;background:#fff;border:1px solid var(--ink-10);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.16);display:none}" +
    ".tw.is-open .tw__card{display:block}" +
    ".tw__title{font:500 14px var(--font-display);margin-bottom:10px;letter-spacing:-.01em}" +
    ".tw__row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;margin-bottom:10px}" +
    ".tw__row label{color:var(--ink-70)}" +
    ".tw__row output{font-variant-numeric:tabular-nums;font-weight:500}" +
    ".tw__row input[type=range]{grid-column:1/3;width:100%;margin:0;accent-color:#1e1e1e}" +
    ".tw__row select{grid-column:1/3;height:30px;border:1px solid var(--ink-10);border-radius:8px;padding:0 8px;background:#fff;font:inherit}" +
    ".tw__sec{margin:12px 0 8px;font-weight:500;color:var(--ink-40);letter-spacing:.02em;text-transform:uppercase;font-size:10px}" +
    ".tw__tests,.tw__acts{display:flex;flex-wrap:wrap;gap:6px}" +
    ".tw__tests button,.tw__acts button{height:28px;padding:0 10px;border:1px solid var(--ink-10);border-radius:28px;background:#fff;font:500 12px var(--font-ui)}" +
    ".tw__tests button:hover,.tw__acts button:hover{background:var(--ink-07)}" +
    ".tw__acts .is-primary{background:var(--ink);color:#fff;border-color:var(--ink)}";
  document.head.appendChild(css);

  var wrap = document.createElement("div");
  wrap.className = "tw";
  wrap.innerHTML =
    '<div class="tw__card" role="group" aria-label="Dropdown tweaks"><div class="tw__title">Dropdown tweaks</div>' +
    '<div class="tw__sec">Test (scrolls to top)</div><div class="tw__tests"></div>' +
    '<div class="tw__sec">Timing &amp; shape</div><div class="tw__sliders"></div>' +
    '<div class="tw__sec">Easing</div><div class="tw__eases"></div>' +
    '<div class="tw__sec">&nbsp;</div><div class="tw__acts"></div></div>' +
    '<button class="tw__btn" type="button" aria-expanded="false">Dropdown tweaks</button>';
  document.body.appendChild(wrap);

  /* Don't let clicks in the panel count as "outside" clicks that close the dropdown */
  wrap.addEventListener("click", function (e) { e.stopPropagation(); });

  var toggle = wrap.querySelector(".tw__btn");
  toggle.addEventListener("click", function () {
    var open = wrap.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  var inputs = {};
  function row(key, label, node) {
    var r = document.createElement("div");
    r.className = "tw__row";
    var l = document.createElement("label");
    l.textContent = label;
    r.appendChild(l);
    return r;
  }
  var slidersEl = wrap.querySelector(".tw__sliders");
  SLIDERS.forEach(function (def) {
    var key = def[0];
    var r = row(key, def[1]);
    var out = document.createElement("output");
    var input = document.createElement("input");
    input.type = "range";
    input.min = def[2]; input.max = def[3]; input.step = def[4];
    function paint() { out.textContent = v[key] + def[5]; input.value = v[key]; }
    input.addEventListener("input", function () { v[key] = Number(input.value); paint(); apply(); });
    r.appendChild(out); r.appendChild(input);
    slidersEl.appendChild(r);
    inputs[key] = paint;
    paint();
  });

  var easesEl = wrap.querySelector(".tw__eases");
  [["easeOpen", "Open easing"], ["easeClose", "Close easing"]].forEach(function (def) {
    var key = def[0];
    var r = row(key, def[1]);
    var sel = document.createElement("select");
    Object.keys(EASES).forEach(function (name) {
      var o = document.createElement("option");
      o.value = name; o.textContent = name + "  " + (EASES[name] === "linear" ? "" : EASES[name].replace("cubic-bezier", ""));
      sel.appendChild(o);
    });
    function paint() { sel.value = v[key]; }
    sel.addEventListener("change", function () { v[key] = sel.value; apply(); });
    r.appendChild(sel);
    easesEl.appendChild(r);
    inputs[key] = paint;
    paint();
  });

  var tests = wrap.querySelector(".tw__tests");
  [["Price", "btnPrice"], ["Location", "btnLocation"], ["Beds", "btnBeds"], ["More", "btnMore"]].forEach(function (def) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = def[0];
    b.addEventListener("click", function () {
      var target = document.getElementById(def[1]);
      if (!target) return;
      if (window.scrollY > 0) { window.scrollTo(0, 0); setTimeout(function () { target.click(); }, 120); }
      else target.click();
    });
    tests.appendChild(b);
  });

  var acts = wrap.querySelector(".tw__acts");
  var reset = document.createElement("button");
  reset.type = "button"; reset.textContent = "Reset";
  reset.addEventListener("click", function () {
    Object.keys(DEFAULTS).forEach(function (k) { v[k] = DEFAULTS[k]; if (inputs[k]) inputs[k](); });
    apply();
  });
  var copy = document.createElement("button");
  copy.type = "button"; copy.className = "is-primary"; copy.textContent = "Copy values";
  copy.addEventListener("click", function () {
    var all = vars();
    var text = ":root {\n" + Object.keys(all).map(function (k) { return "  " + k + ": " + all[k] + ";"; }).join("\n") + "\n}";
    function done() { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy values"; }, 1400); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt("Copy:", text); });
    else window.prompt("Copy:", text);
  });
  acts.appendChild(reset); acts.appendChild(copy);
})();
  
