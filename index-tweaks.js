/* DEV TOOL — "Animation tweaks" panel for the homepage. Loaded only when the URL has ?tweak=1
   (saved values always apply, see index.html). When the values are final: "Copy values",
   paste them over ANIM_DEFAULTS in index.html, then delete this file. */
(function (T) {
  var ANIM = T.ANIM, ANIM_DEFAULTS = T.ANIM_DEFAULTS, EASE_BEZIER = T.EASE_BEZIER;
(function animationTweaks() {

  const BEZIER_NAMES = Object.keys(EASE_BEZIER);
  const ALL_NAMES = BEZIER_NAMES.concat(["Smoothstep", "Smootherstep"]);

  const STACK = [
    ["len", "Scroll per item", 40, 220, 5, "vh"],
    ["hold", "Hold on each image", 0, 40, 1, "%"],
    ["zoomEnd", "Zoom-out share of change", 0, 80, 1, "%"],
    ["zoomAmt", "Zoom-out amount", 0, 20, 1, "%"],
    ["follow", "Follow speed (higher = snappier)", 2, 24, 0.5, ""],
    ["ease", "Wipe easing", "select", ALL_NAMES]
  ];

  const SECTIONS = [
    {
      key: "featured", title: "Featured listings", target: "listings",
      controls: [
        ["dur", "Slide duration", 300, 2000, 10, "ms"],
        ["ease", "Slide easing", "select", BEZIER_NAMES],
        ["parallax", "Parallax distance", 0, 64, 1, "px"],
        ["imgEase", "Parallax easing", "select", BEZIER_NAMES]
      ],
      tests: [["◀ Prev", "featuredPrev"], ["Next ▶", "featuredNext"]]
    },
    { key: "categories", title: "Browse by type", target: "categories", controls: STACK, play: ".categories__slide" },
    { key: "neighborhoods", title: "Explore neighborhoods", target: "neighborhoods", controls: STACK, play: ".neighborhoods__slide" },
    {
      key: "testimonials", title: "Testimonials", target: "testimonials",
      controls: [
        ["dur", "Slide duration", 300, 2000, 10, "ms"],
        ["ease", "Slide easing", "select", ALL_NAMES],
        ["inShift", "Incoming travel", 0, 60, 1, "%"],
        ["outShift", "Outgoing drift", 0, 40, 1, "%"],
        ["zoom", "Incoming zoom", 0, 30, 1, "%"],
        ["text", "Text swap", 0, 600, 10, "ms"]
      ],
      tests: [["◀ Prev", "testimonialsPrev"], ["Next ▶", "testimonialsNext"]]
    }
  ];

  const css = document.createElement("style");
  css.textContent =
    ".tw{position:fixed;left:16px;bottom:16px;z-index:400;font:12px/1.3 var(--font-ui);color:var(--ink)}" +
    ".tw__btn{height:36px;padding:0 14px;border-radius:36px;background:var(--ink);color:#fff;font-weight:500;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,.18)}" +
    ".tw__card{position:absolute;left:0;bottom:44px;width:304px;max-height:calc(100vh - 80px);overflow:auto;padding:12px 14px;background:#fff;border:1px solid var(--ink-10);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.16);display:none;overscroll-behavior:contain}" +
    ".tw.is-open .tw__card{display:block}" +
    ".tw__title{font:500 14px var(--font-display);letter-spacing:-.01em;margin:2px 0 8px}" +
    ".tw details{border-top:1px solid var(--ink-07);padding:8px 0}" +
    ".tw summary{cursor:pointer;font-weight:500;font-size:13px;list-style:none;display:flex;justify-content:space-between;align-items:center}" +
    ".tw summary::-webkit-details-marker{display:none}" +
    ".tw summary::after{content:'+';color:var(--ink-40);font-size:16px;line-height:1}" +
    ".tw details[open] summary::after{content:'–'}" +
    ".tw__row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;margin:10px 0 0}" +
    ".tw__row label{color:var(--ink-70)}" +
    ".tw__row output{font-variant-numeric:tabular-nums;font-weight:500}" +
    ".tw__row input[type=range]{grid-column:1/3;width:100%;margin:0;accent-color:#1e1e1e}" +
    ".tw__row select{grid-column:1/3;height:30px;border:1px solid var(--ink-10);border-radius:8px;padding:0 8px;background:#fff;font:inherit}" +
    ".tw__acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}" +
    ".tw__acts button{height:28px;padding:0 10px;border:1px solid var(--ink-10);border-radius:28px;background:#fff;font:500 12px var(--font-ui)}" +
    ".tw__acts button:hover{background:var(--ink-07)}" +
    ".tw__acts .is-primary{background:var(--ink);color:#fff;border-color:var(--ink)}" +
    ".tw__foot{border-top:1px solid var(--ink-07);margin-top:8px;padding-top:10px}";
  document.head.appendChild(css);

  const wrap = document.createElement("div");
  wrap.className = "tw";
  wrap.innerHTML =
    '<div class="tw__card" role="group" aria-label="Animation tweaks"><div class="tw__title">Animation tweaks</div><div class="tw__secs"></div>' +
    '<div class="tw__foot tw__acts"></div></div>' +
    '<button class="tw__btn" type="button" aria-expanded="false">Animation tweaks</button>';
  document.body.appendChild(wrap);

  const toggle = wrap.querySelector(".tw__btn");
  toggle.addEventListener("click", () => {
    const open = wrap.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  function easeLabel(name) {
    const b = EASE_BEZIER[name];
    return b && name !== "Linear" ? name + "  (" + b.join(", ") + ")" : name;
  }

  const repaints = [];
  let playRaf = 0;

  function stopPlay() {
    if (playRaf) cancelAnimationFrame(playRaf);
    playRaf = 0;
  }
  ["wheel", "touchstart", "keydown"].forEach((evt) => window.addEventListener(evt, stopPlay, { passive: true }));

  /* Scroll the pinned section's whole run at a steady pace so the transition
     can be judged without a wheel in hand */
  function playSection(el, items) {
    stopPlay();
    const start = el.offsetTop;
    const travel = el.offsetHeight - window.innerHeight;
    const dur = Math.max(1, items - 1) * 2200;
    window.scrollTo(0, start);
    const t0 = performance.now() + 300;
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / dur));
      window.scrollTo(0, start + travel * t);
      playRaf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    playRaf = requestAnimationFrame(step);
  }

  function ensureVisible(el) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight * 0.6) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  }

  const secsEl = wrap.querySelector(".tw__secs");
  SECTIONS.forEach((sec) => {
    const d = document.createElement("details");
    const sum = document.createElement("summary");
    sum.textContent = sec.title;
    d.appendChild(sum);
    const vals = ANIM.v[sec.key];

    sec.controls.forEach((def) => {
      const key = def[0];
      const row = document.createElement("div");
      row.className = "tw__row";
      const label = document.createElement("label");
      label.textContent = def[1];
      row.appendChild(label);
      if (def[2] === "select") {
        const sel = document.createElement("select");
        def[3].forEach((name) => {
          const o = document.createElement("option");
          o.value = name;
          o.textContent = easeLabel(name);
          sel.appendChild(o);
        });
        sel.addEventListener("change", () => { vals[key] = sel.value; ANIM.apply(true); });
        repaints.push(() => { sel.value = vals[key]; });
        row.appendChild(sel);
      } else {
        const out = document.createElement("output");
        const input = document.createElement("input");
        input.type = "range";
        input.min = def[2]; input.max = def[3]; input.step = def[4];
        input.addEventListener("input", () => {
          vals[key] = Number(input.value);
          out.textContent = vals[key] + def[5];
          ANIM.apply(true);
        });
        repaints.push(() => { input.value = vals[key]; out.textContent = vals[key] + def[5]; });
        row.appendChild(out);
        row.appendChild(input);
      }
      d.appendChild(row);
    });

    const acts = document.createElement("div");
    acts.className = "tw__acts";
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = "Go to section";
    go.addEventListener("click", () => {
      stopPlay();
      window.scrollTo({ top: document.getElementById(sec.target).offsetTop, behavior: "smooth" });
    });
    acts.appendChild(go);
    if (sec.play) {
      const play = document.createElement("button");
      play.type = "button";
      play.textContent = "▶ Play";
      play.addEventListener("click", () => {
        playSection(document.getElementById(sec.target), document.querySelectorAll(sec.play).length);
      });
      acts.appendChild(play);
    }
    (sec.tests || []).forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t[0];
      b.addEventListener("click", () => {
        ensureVisible(document.getElementById(sec.target));
        document.getElementById(t[1]).click();
      });
      acts.appendChild(b);
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "Reset";
    reset.addEventListener("click", () => {
      Object.keys(ANIM_DEFAULTS[sec.key]).forEach((k) => { vals[k] = ANIM_DEFAULTS[sec.key][k]; });
      repaints.forEach((fn) => fn());
      ANIM.apply(true);
    });
    acts.appendChild(reset);
    d.appendChild(acts);
    secsEl.appendChild(d);
  });
  repaints.forEach((fn) => fn());

  const foot = wrap.querySelector(".tw__foot");
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "is-primary";
  copy.textContent = "Copy values";
  copy.addEventListener("click", () => {
    const text = JSON.stringify(ANIM.v, null, 2);
    const done = () => { copy.textContent = "Copied"; setTimeout(() => { copy.textContent = "Copy values"; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => window.prompt("Copy:", text));
    else window.prompt("Copy:", text);
  });
  foot.appendChild(copy);
})();
})(window.HL_ANIM_TWEAKS);
