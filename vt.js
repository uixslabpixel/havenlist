/* Page transitions (cross-document View Transitions, same-origin navigations).
   - Wipe: pages slide in vertically in menu order (see design-system.css, section "Page transitions").
   - Shared element: from a card (or the agent on a listing, or the Insights slider) to its detail page the
     card's picture grows into the detail page's main picture, and on the way back it shrinks into the card
     you came from. Browsers without support just navigate.
   Loaded synchronously in <head>: pagereveal fires before the first paint.
   The motion numbers are CSS variables (--vt-*); open any page with ?tweak=1 once for the panel that tunes them (it then follows you across pages; ?tweak=0 hides it). */
(function () {
  "use strict";
  var NAME = "hl-hero", STORE = "hl.vt", BACK = "hl.vt.back", TWEAKS = "havenlist.vtTweaks.v1";
  var DEST = { listing: "#galleryMain", agent: "#heroPhoto", neighborhood: "#heroPhoto", insight: "#heroPhoto" };
  var CARD = ".card, .agent-card, .ins-card, .mi-card, .mi-feature, .featured-card, .agent";
  var MEDIA = ".card__media, .agent-card__media, .nb-card__media, .mi-card__media, .mi-feature__media, .agent__photo";
  var root = document.documentElement;

  /* saved tweak values apply on every page, so the panel's changes are felt right away */
  try {
    var saved = JSON.parse(localStorage.getItem(TWEAKS) || "{}");
    Object.keys(saved).forEach(function (k) { if (/^--vt-[\w-]+$/.test(k)) root.style.setProperty(k, saved[k]); });
  } catch (x) {}
  /* The "Page transition" panel (vt-tweaks.js) stays on across pages once switched on: ?tweak=1 once, ?tweak=0 to hide it */
  var PANEL = "hl.tweak.vt", panelOn = false;
  try {
    if (/[?&]tweak(=1|=true)?(&|$)/.test(location.search)) localStorage.setItem(PANEL, "1");
    else if (/[?&]tweak=0(&|$)/.test(location.search)) localStorage.removeItem(PANEL);
    panelOn = localStorage.getItem(PANEL) === "1";
  } catch (x) {}
  if (panelOn) {
    document.addEventListener("DOMContentLoaded", function () {
      var s = document.createElement("script");
      s.src = "vt-tweaks.js";
      document.body.appendChild(s);
    });
  }

  function kindOf(path) {
    var m = /^\/(listing|agent|neighborhood|insight)(?:\.html)?\/?$/.exec(path);
    return m ? m[1] : null;
  }
  function name(el) {
    el.style.viewTransitionName = NAME;
    return function () { el.style.viewTransitionName = ""; };
  }
  function fresh(stamp) { return Date.now() - Number(stamp) <= 8000; }

  /* what was pressed last (links, and cards that navigate from a script) */
  var last = null;
  ["pointerdown", "click", "keydown"].forEach(function (t) {
    document.addEventListener(t, function (e) { last = e.target; }, true);
  });

  /* the picture that leaves with the click: a card's media, the listing's agent photo, the Insights slider's picture */
  function sourceOf(target) {
    if (!target || !target.closest) return null;
    if (target.closest(".ins-slides")) return document.querySelector(".ins-img.is-active");
    var card = target.closest(CARD);
    return card && (card.matches(".featured-card") ? card : card.querySelector(MEDIA));
  }

  window.addEventListener("pageswap", function (e) {
    try {
      var vt = e.viewTransition, act = e.activation;
      root.classList.remove("vt-shared");
      if (!vt || !act || !act.entry || act.navigationType === "reload") return;
      var to = new URL(act.entry.url).pathname, kind = kindOf(to), el = null;
      if (kind && act.navigationType !== "traverse") {
        el = sourceOf(last);
        if (el) { try { sessionStorage.setItem(STORE, kind + "|" + Date.now()); } catch (x) {} }
      }
      if (!el) {
        /* leaving a detail page: its main picture shrinks into the card it came from (if that card is on the next page) */
        var here = kindOf(location.pathname);
        el = here && document.querySelector(DEST[here]);
        if (el) { try { sessionStorage.setItem(BACK, String(Date.now())); } catch (x) {} }
      }
      if (!el) return;
      var clear = name(el);
      root.classList.add("vt-shared");
      vt.finished.then(clear, clear);
    } catch (x) {}
  });

  window.addEventListener("pageshow", function (e) { if (e.persisted) root.classList.remove("vt-shared"); });

  /* Menu order: a page further down the menu rises from below, one further up drops in from above */
  var RANK = { index: 0, search: 1, listing: 1.5, agents: 2, agent: 2.5, neighborhoods: 3, neighborhood: 3.5, insights: 4, insight: 4.5, about: 5, sell: 6, wishlist: 7, "wishlist-detail": 7.5 };
  function rankOf(path) {
    var m = /^\/?([^/]*?)(?:\.html)?\/?$/.exec(path);
    var k = m ? (m[1] || "index") : "";
    return RANK.hasOwnProperty(k) ? RANK[k] : null;
  }

  window.addEventListener("pagereveal", function (e) {
    try {
      root.classList.remove("vt-next", "vt-prev");
      if (window.navigation && navigation.activation && navigation.activation.from) {
        var from = rankOf(new URL(navigation.activation.from.url).pathname), to = rankOf(location.pathname);
        if (from !== null && to !== null && from !== to) root.classList.add(to > from ? "vt-next" : "vt-prev");
      }
    } catch (x) {}
    try {
      var vt = e.viewTransition;
      if (!vt || !window.navigation || !navigation.activation || !navigation.activation.from) return;
      var type = navigation.activation.navigationType;
      if (type === "reload") return;
      var kind = kindOf(location.pathname), mark = [], back = null, el = null;
      try {
        mark = (sessionStorage.getItem(STORE) || "").split("|"); sessionStorage.removeItem(STORE);
        back = sessionStorage.getItem(BACK); sessionStorage.removeItem(BACK);
      } catch (x) {}
      if (kind && type !== "traverse" && mark[0] === kind && fresh(mark[1])) {
        /* forward: the card's picture becomes this page's main picture */
        el = document.querySelector(DEST[kind]);
        if (!el) return;
        el.removeAttribute("data-clip"); el.removeAttribute("data-reveal"); /* no entrance effect while it morphs */
      } else if (back && fresh(back)) {
        /* back: this page's card for the detail page we just left receives its picture */
        var gone = new URL(navigation.activation.from.url);
        if (!kindOf(gone.pathname)) return;
        var link = Array.prototype.filter.call(document.querySelectorAll("a[href]"), function (a) {
          var u = new URL(a.href, location.href);
          return u.pathname === gone.pathname && u.search === gone.search;
        })[0];
        el = sourceOf(link);
        if (!el) return;
        el.scrollIntoView({ block: "center" }); /* pages open at the top, so bring the card to the picture */
      }
      if (!el) return;
      root.classList.add("vt-shared");
      var clear = name(el);
      vt.finished.then(clear, clear);
    } catch (x) {}
  });
})();
