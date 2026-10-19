/* Havenlist card parallax — shared by search.html and listing.html (similar listings).
   Each listing image is slightly taller than its frame and drifts inside it as the
   card scrolls through the viewport (CSS var --py, consumed by `translate`).
   Cards are found on every frame, so re-rendered grids need no extra wiring. */
window.HLParallax = (function () {
  var AMP = 0.08; // travel, as a share of the frame height (image is 116% tall)
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var queued = false;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function update() {
    queued = false;
    var imgs = document.querySelectorAll(".card__media img");
    var vh = window.innerHeight;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (reduce) { img.style.removeProperty("--py"); continue; }
      var r = img.parentElement.getBoundingClientRect();
      if (!r.height || r.bottom < -120 || r.top > vh + 120) continue;
      /* +1 as the card enters at the bottom, -1 as it leaves at the top */
      var p = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      img.style.setProperty("--py", (-p * AMP * r.height).toFixed(1) + "px");
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
  document.addEventListener("load", schedule, true); // lazy images settling
  if (window.MutationObserver) {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  }
  schedule();
  return { update: schedule };
})();
