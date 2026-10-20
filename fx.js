/* Shared page effects: scroll reveal ([data-reveal], [data-clip]), count-up ([data-count]),
   and the reading progress bar (.read-progress). Content stays visible without JS. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) doc.classList.add("fx-ready");

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, d = el.getAttribute("data-reveal-delay");
      if (d) el.style.transitionDelay = d + "ms";
      el.classList.add("is-in");
      if (el.hasAttribute("data-count")) count(el);
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }) : null;

  function count(el) {
    var to = parseFloat(el.getAttribute("data-count")), suffix = el.getAttribute("data-suffix") || "";
    if (reduce || isNaN(to)) { el.textContent = to + suffix; return; }
    var t0 = performance.now(), dur = 1800;
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur), e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = Math.round(to * e) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  function scan() {
    document.querySelectorAll("[data-reveal], [data-clip], [data-count]").forEach(function (el) {
      if (el.__fx) return; el.__fx = 1;
      if (el.hasAttribute("data-count") && !reduce) el.textContent = "0" + (el.getAttribute("data-suffix") || "");
      if (io) io.observe(el); else { el.classList.add("is-in"); if (el.hasAttribute("data-count")) count(el); }
    });
  }
  scan();
  if (window.MutationObserver) new MutationObserver(function () { scan(); }).observe(document.body, { childList: true, subtree: true });

  var bar = document.querySelector(".read-progress__bar");
  if (bar) {
    var tick = false, art = document.querySelector("[data-progress-target]") || document.body;
    function upd() {
      tick = false;
      var r = art.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.35 - r.top) / Math.max(1, r.height - vh * 0.35)));
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd); upd();
  }
})();
