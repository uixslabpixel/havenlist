/* Havenlist smooth scrolling — exposes window.HLScroll.to(y) for eased jumps
   (menu / section links). Wheel, trackpad and touch scrolling stay native so the
   browser can scroll on the compositor thread; hijacking the wheel forced every
   scroll frame through the main thread and made the heavier pages stutter.
   Any wheel, touch or key press during a jump takes over immediately. */
window.HLScroll = (function () {
  /* Every page load starts at the top: reload and back/forward don't restore the
     old position (it landed mid-page, often inside a pinned section). Anchored
     URLs (sell.html#form) still go to their anchor. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && !location.hash) window.scrollTo(0, 0);
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gliding = null;
  let lastSet = window.scrollY;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  function stop() {
    if (gliding) gliding.cancel = true;
    gliding = null;
  }

  const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
  ["wheel", "touchstart"].forEach((evt) => window.addEventListener(evt, stop, { passive: true }));
  window.addEventListener("keydown", (e) => {
    if (SCROLL_KEYS.indexOf(e.key) !== -1) stop();
  });

  /* While the full-screen menu is open (circle-menu.js calls lock) the page behind it stays put:
     body overflow alone doesn't stop the root scroller. Only the menu panel may scroll, and only
     when it is taller than the screen. The blocking listeners exist only while the menu is open, so
     normal wheel and touch scrolling stays on the compositor thread. */
  const panelOf = (t) => (t && t.closest ? t.closest(".mega-menu__panel") : null);
  const scrollable = (p) => p && p.scrollHeight > p.clientHeight + 1;
  const blockScroll = (e) => { if (!scrollable(panelOf(e.target))) e.preventDefault(); };
  const blockKeys = (e) => {
    if (SCROLL_KEYS.indexOf(e.key) !== -1 && !/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(e.target.tagName) && !e.target.isContentEditable) e.preventDefault();
  };
  function lock(on) {
    const m = on ? "addEventListener" : "removeEventListener";
    ["wheel", "touchmove"].forEach((evt) => window[m](evt, blockScroll, { passive: false }));
    window[m]("keydown", blockKeys);
  }

  /* Glide to a page position: eased, duration scales with distance */
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
      /* Something else moved the page (scrollbar drag): let it win */
      if (Math.abs(window.scrollY - lastSet) > 2) {
        gliding = null;
        return;
      }
      const t = clamp((now - t0) / dur, 0, 1);
      window.scrollTo(0, from + (y - from) * inOut(t));
      lastSet = window.scrollY;
      if (t < 1) requestAnimationFrame(step);
      else gliding = null;
    }
    requestAnimationFrame(step);
  }

  /* In-page links (#section) glide on every page and screen size. Pages that
     already handle a link themselves call preventDefault, so those are skipped. */
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 64;
    to(target.getBoundingClientRect().top + window.scrollY - nav - 8);
    history.replaceState(null, "", "#" + id);
  });

  return { to, lock };
})();
