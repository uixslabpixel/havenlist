/* Filter UI shared by Search, Agents, Agent, Neighborhoods and Neighborhood:
   the dropdown panels that grow out of their buttons, the filter sheet, and the compact
   filter bar that replaces the in-page form once it scrolls away.
   HLFilterUI({ names, updateLabels }) -> { closePop, openSheet, closeSheet, sheetOpen (getter) }
   - names: the filters on the page; each one needs #pop<Name>, #anchor<Name>, #btn<Name> and #sheetBtn<Name>
   - updateLabels: refreshes the button labels when the sheet opens */
window.HLFilterUI = function (cfg) {
  const body = document.body;
  const compactBar = document.getElementById("compactBar");
  const filterForm = document.getElementById("filterForm");
  const filterSheet = document.getElementById("filterSheet");
  let compact = false;
  let sheetOpen = false;
  let openPop = null;

  const cap = (n) => n.charAt(0).toUpperCase() + n.slice(1);
  const pops = {};
  const anchors = {};
  cfg.names.forEach((n) => {
    pops[n] = document.getElementById("pop" + cap(n));
    anchors[n] = document.getElementById("anchor" + cap(n));
  });

  /* ----- Popover open/close ----- */
  function syncFilterExpanded(name) {
    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.setAttribute("aria-expanded", String(!!name && btn.dataset.filter === name));
    });
  }

  /* Tunable motion (CSS vars): full close = dissolve beat + shrink beat */
  function cssMs(name, fallback) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const n = parseFloat(raw);
    return Number.isNaN(n) ? fallback : (raw.endsWith("ms") ? n : n * 1000);
  }
  function popCloseMs() { return cssMs("--pop-fade", 160) + cssMs("--pop-close", 300); }

  function closePop() {
    Object.values(pops).forEach((p) => {
      if (!p.classList.contains("is-open")) return;
      p.classList.remove("is-open");
      /* Keep its anchor above the page until the panel has folded back in */
      const host = p._anchor || p.parentElement;
      clearTimeout(host._frontTimer);
      host._frontTimer = setTimeout(() => host.classList.remove("is-front"), popCloseMs() + 60);
    });
    openPop = null;
    syncFilterExpanded(null);
  }

  /* The dropdown always lives next to the button that opened it (in-page
     form or the sheet), so it moves with that button. It grows out of the
     button's own rect: we measure its final size while hidden, park it at
     the button's size, then let CSS carry it to the final size. */
  function openFilter(name, anchorEl) {
    closePop();
    const pop = pops[name];
    if (!pop) return;
    const anchor = (anchorEl && anchorEl.closest(".filter-anchor")) || anchors[name];
    /* Bottom sheets live on <body> so no scrolling ancestor can clip or offset them */
    const host = window.innerWidth <= 1100 ? document.body : anchor;
    if (host && pop.parentElement !== host) host.appendChild(pop);
    pop._anchor = anchor;
    clearTimeout(anchor._frontTimer);
    anchor.classList.add("is-front");

    const popBody = pop.querySelector(".filter-pop__body");
    const aRect = anchor.getBoundingClientRect();
    /* Measure against where the sheet will rest, not where it is mid-slide */
    const slide = anchor.closest(".filter-sheet__panel");
    const settleY = slide ? new DOMMatrix(getComputedStyle(slide).transform).m42 : 0;
    const anchorBottom = aRect.bottom - settleY;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pop-gap")) || 10;
    const maxH = Math.max(240, window.innerHeight - anchorBottom - gap - 16);

    /* Natural size, off-screen state */
    pop.style.transition = "none";
    pop.style.setProperty("--pop-shift", "0px");
    pop.style.setProperty("--body-h", "auto");
    pop.classList.add("is-measuring");
    const w = pop.offsetWidth;
    const natural = pop.offsetHeight;
    const bodyNatural = popBody.offsetHeight;
    pop.classList.remove("is-measuring");

    /* Keep wide panels inside the viewport, and short ones inside the height */
    const left = aRect.left + aRect.width / 2 - w / 2;
    const min = 16;
    const max = window.innerWidth - 16 - w;
    const shift = left < min ? min - left : left > max ? max - left : 0;
    const height = Math.min(natural, maxH);
    pop.style.setProperty("--pop-shift", `${shift}px`);
    pop.style.setProperty("--pop-h", `${height}px`);
    pop.style.setProperty("--body-h", `${Math.max(0, bodyNatural - (natural - height))}px`);
    pop.style.setProperty("--from-w", `${aRect.width}px`);
    pop.style.setProperty("--from-h", `${aRect.height}px`);

    /* Land on the button-sized start frame, then release the transition */
    void pop.offsetHeight;
    pop.style.transition = "";
    void pop.offsetHeight;
    pop.classList.add("is-open");
    openPop = name;
    syncFilterExpanded(name);
  }

  function bindFilterButton(btn) {
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const name = btn.dataset.filter;
      if (compact && !sheetOpen && btn.closest("#compactBar")) {
        openSheet(name);
        return;
      }
      if (openPop === name) closePop();
      else openFilter(name, btn);
    });
  }

  cfg.names.forEach((n) => {
    bindFilterButton(document.getElementById("btn" + cap(n)));
    bindFilterButton(document.getElementById("sheetBtn" + cap(n)));
  });

  document.addEventListener("click", (e) => {
    if (!openPop) return;
    const pop = pops[openPop];
    if (pop && !pop.contains(e.target) && !e.target.closest("[data-filter]")) closePop();
  });

  /* ----- Filter sheet (after scroll) ----- */
  let sheetPopTimer = null;

  function openSheet(focusFilter) {
    sheetOpen = true;
    filterSheet.classList.add("is-open");
    filterSheet.setAttribute("aria-hidden", "false");
    body.classList.add("is-sheet-open");
    cfg.updateLabels();
    clearTimeout(sheetPopTimer);
    if (focusFilter) {
      /* Let the drawer arrive first, then unfold the requested dropdown */
      sheetPopTimer = setTimeout(() => {
        if (!sheetOpen) return;
        const btn = document.getElementById("sheetBtn" + cap(focusFilter));
        if (btn) openFilter(focusFilter, btn);
      }, 260);
    }
  }

  function closeSheet() {
    clearTimeout(sheetPopTimer);
    sheetOpen = false;
    closePop();
    filterSheet.classList.remove("is-open");
    filterSheet.setAttribute("aria-hidden", "true");
    body.classList.remove("is-sheet-open");
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (openPop) closePop();
    else if (sheetOpen) closeSheet();
  });

  document.getElementById("filterSheetScrim").addEventListener("click", closeSheet);

  document.querySelectorAll("[data-open-sheet]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".chip__x")) return;
      if (!compact) return;
      e.preventDefault();
      e.stopPropagation();
      openSheet(el.dataset.filter || null);
    });
  });

  /* ----- Compact filter bar -----
     The navbar itself stays put on these pages (only the homepage hides it);
     once the in-page form scrolls away, the filters move up into it. */
  const NAV_H = 64;
  const COMPACT_ON = NAV_H + 16;   // form top crosses this → compact
  const COMPACT_OFF = NAV_H + 28;  // hysteresis so trackpad jitter can't flicker it

  function setCompact(next) {
    if (next === compact) return;
    compact = next;
    body.classList.toggle("is-compact", next);
    compactBar.setAttribute("aria-hidden", String(!next));
  }

  function evaluateCompact() {
    if (window.innerWidth <= 1100) {
      setCompact(false);
      return;
    }
    const top = filterForm.getBoundingClientRect().top;
    if (!compact && top < COMPACT_ON) setCompact(true);
    else if (compact && top > COMPACT_OFF) setCompact(false);
  }

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      evaluateCompact();
    });
  }, { passive: true });

  window.addEventListener("resize", evaluateCompact);
  evaluateCompact();

  return { closePop, openSheet, closeSheet, get sheetOpen() { return sheetOpen; } };
};
