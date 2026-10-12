/* Havenlist smooth scrolling — shared by index.html, search.html and listing.html.
   Exposes window.HLScroll.to(y) for eased jumps; wheel smoothing starts on load. */
/* ===== Smooth scrolling =====
   Mouse-wheel notches glide with inertia instead of stepping. Trackpads
   (small, continuous deltas) and touch stay native — they're already smooth —
   as do scrollable panels, the open menu / filter sheet, and reduced-motion.
   Tune SMOOTH_TAU; add ?smooth=0 to the URL to switch it off. */
window.HLScroll = (function () {
  // ms — glide time constant (higher = floatier); a page can set
  // window.HL_SMOOTH_TAU before loading this file to tune its own feel
  const SMOOTH_TAU = window.HL_SMOOTH_TAU || 120;
  const NOTCH_MIN = 40;     // |deltaY| below this is treated as a trackpad
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const off = /[?&]smooth=0\b/.test(window.location.search);

  let target = window.scrollY;
  let current = target;
  let raf = 0;
  let last = 0;
  let ownUntil = 0;      // scroll events up to here came from us
  let gliding = null;
  let lastSet = window.scrollY;
  let trackpadUntil = 0; // a trackpad was used recently — leave wheel input native

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  function set(y) {
    ownUntil = performance.now() + 120;
    window.scrollTo(0, y);
    lastSet = window.scrollY;
  }

  /* Something other than us moved the page (native trackpad momentum,
     scrollbar, keys): let it win instead of fighting it frame by frame */
  function movedElsewhere() {
    return Math.abs(window.scrollY - lastSet) > 2;
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (gliding) gliding.cancel = true;
    gliding = null;
  }

  function tick(now) {
    if (movedElsewhere()) {
      raf = 0;
      current = target = window.scrollY;
      return;
    }
    const dt = Math.min(64, now - last || 16.7);
    last = now;
    current += (target - current) * (1 - Math.exp(-dt / SMOOTH_TAU));
    if (Math.abs(target - current) < 0.4) {
      current = target;
      set(current);
      raf = 0;
      return;
    }
    set(current);
    raf = requestAnimationFrame(tick);
  }

  /* Leave wheel input to a panel that can still scroll in that direction */
  function innerScrolls(el, dy) {
    while (el && el !== document.body && el !== document.documentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
        if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function onWheel(e) {
    if (e.ctrlKey || e.defaultPrevented) return;
    const cl = document.body.classList;
    if (cl.contains("is-menu-open") || cl.contains("is-sheet-open") || cl.contains("is-map-open")) return;
    let dy = e.deltaY;
    const now = performance.now();
    /* Trackpad / Magic Mouse streams mix small and large deltas; smoothing
       only the large ones makes the page shake between two scroll sources.
       Once a small delta shows up, all wheel input stays native until the
       device has been idle for 3s */
    if (e.deltaMode === 0 && (Math.abs(dy) < NOTCH_MIN || now < trackpadUntil)) {
      trackpadUntil = now + 3000;
    }
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight;
    if (e.deltaMode === 0 && now < trackpadUntil) {
      if (raf || gliding) {
        stop();
        current = target = window.scrollY;
      }
      return;
    }
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (innerScrolls(e.target, dy)) return;
    e.preventDefault();
    if (gliding || !raf) {
      stop();
      current = target = window.scrollY;
    }
    target = clamp(target + dy, 0, maxY());
    if (!raf) {
      last = performance.now();
      lastSet = window.scrollY;
      raf = requestAnimationFrame(tick);
    }
  }

  if (fine && !reduce && !off) {
    window.addEventListener("wheel", onWheel, { passive: false });
    /* Anything else that scrolls the page (keys, scrollbar drag, anchors)
       takes over and re-syncs the glide to wherever it ended up */
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].indexOf(e.key) !== -1) stop();
    });
    window.addEventListener("mousedown", (e) => {
      if (e.clientX >= document.documentElement.clientWidth) stop();
    });
    window.addEventListener("scroll", () => {
      if (raf || gliding || performance.now() < ownUntil) return;
      current = target = window.scrollY;
    }, { passive: true });
  }

  /* Glide to a page position (menu / section links): eased, duration scales
     with distance, any wheel or key press takes over immediately */
  function to(y) {
    y = clamp(y, 0, maxY());
    stop();
    const from = window.scrollY;
    const dist = Math.abs(y - from);
    if (dist < 2 || reduce) {
      window.scrollTo(0, y);
      return;
    }
    const dur = clamp(700 + dist * 0.22, 800, 1900);
    const g = { cancel: false };
    gliding = g;
    const t0 = performance.now();
    lastSet = window.scrollY;
    const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function step(now) {
      if (g.cancel) return;
      if (movedElsewhere()) {
        gliding = null;
        current = target = window.scrollY;
        return;
      }
      const t = clamp((now - t0) / dur, 0, 1);
      const v = from + (y - from) * inOut(t);
      set(v);
      current = target = v;
      if (t < 1) requestAnimationFrame(step);
      else gliding = null;
    }
    requestAnimationFrame(step);
  }

  return { to };
})();
