/* Havenlist card parallax — shared by search.html and listing.html (similar listings).
   Each listing image is taller than its frame and drifts inside it as the card
   scrolls through the viewport (CSS var --py, consumed by `translate`).

   Built to stay cheap while scrolling: an IntersectionObserver tracks which
   cards are near the viewport, so only those are measured; each frame reads
   every rect first and writes afterwards (no layout thrash); a value is only
   written when it moved by at least a fifth of a pixel. */
window.HLParallax = (function () {
  var AMP = 0.10; // travel each way, as a share of the frame height (CSS: image is 120% tall)
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var near = new Set();   // card frames close to the viewport
  var known = new WeakSet();
  var last = new WeakMap();
  var queued = false;
  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) near.add(e.target); else near.delete(e.target);
        });
        schedule();
      }, { rootMargin: "150px 0px" })
    : null;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /* Pick up cards that were rendered (or re-rendered) since the last scan */
  function scan() {
    var frames = document.querySelectorAll(".card__media");
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (known.has(f)) continue;
      known.add(f);
      if (io) io.observe(f); else near.add(f);
    }
  }

  function update() {
    queued = false;
    var vh = window.innerHeight;
    var jobs = [];
    /* read phase */
    near.forEach(function (f) {
      if (!f.isConnected) { near.delete(f); return; }
      var img = f.firstElementChild;
      if (!img || img.tagName !== "IMG") img = f.querySelector("img");
      if (!img) return;
      var r = f.getBoundingClientRect();
      if (!r.height) return;
      /* +1 as the card enters at the bottom, -1 as it leaves at the top */
      var p = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      jobs.push(img, -p * AMP * r.height);
    });
    /* write phase */
    for (var i = 0; i < jobs.length; i += 2) {
      var el = jobs[i], v = jobs[i + 1];
      var prev = last.get(el);
      if (prev !== undefined && Math.abs(prev - v) < 0.2) continue;
      last.set(el, v);
      el.style.setProperty("--py", v.toFixed(1) + "px");
    }
  }

  function schedule() {
    if (queued || reduce) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  if (window.MutationObserver) {
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; scan(); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  scan();
  schedule();
  return { update: schedule };
})();
