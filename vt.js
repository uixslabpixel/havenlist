/* Shared-element page transitions (cross-document View Transitions).
   Going from a card to its detail page, the card's picture becomes the detail page's main picture
   (listing -> gallery, agent -> photo, neighborhood -> thumbnail, insight -> hero). Every other
   navigation keeps the plain fade from design-system.css. Browsers without support just navigate.
   Loaded synchronously in <head>: pagereveal fires before the first paint. */
(function () {
  "use strict";
  var NAME = "hl-hero", STORE = "hl.vt";
  var DEST = { listing: "#galleryMain", agent: "#heroPhoto", neighborhood: "#heroPhoto", insight: "#heroPhoto" };
  var CARD = ".card, .agent-card, .ins-card, .mi-card, .mi-feature, .featured-card";
  var MEDIA = ".card__media, .agent-card__media, .nb-card__media, .mi-card__media, .mi-feature__media";

  function kindOf(path) {
    var m = /^\/(listing|agent|neighborhood|insight)(?:\.html)?\/?$/.exec(path);
    return m ? m[1] : null;
  }
  function name(el) {
    el.style.viewTransitionName = NAME;
    return function () { el.style.viewTransitionName = ""; };
  }

  /* what was pressed last (links, and cards that navigate from a script) */
  var last = null;
  ["pointerdown", "click", "keydown"].forEach(function (t) {
    document.addEventListener(t, function (e) { last = e.target; }, true);
  });

  window.addEventListener("pageswap", function (e) {
    try {
      var vt = e.viewTransition, act = e.activation;
      document.documentElement.classList.remove("vt-shared");
      if (!vt || !act || !act.entry || act.navigationType === "traverse" || act.navigationType === "reload") return;
      var kind = kindOf(new URL(act.entry.url).pathname);
      if (!kind || !last || !last.closest) return;
      var card = last.closest(CARD);
      var el = card && (card.matches(".featured-card") ? card : card.querySelector(MEDIA));
      if (!el) return;
      var clear = name(el);
      document.documentElement.classList.add("vt-shared");
      try { sessionStorage.setItem(STORE, kind + "|" + Date.now()); } catch (x) {}
      vt.finished.then(clear, clear);
    } catch (x) {}
  });

  window.addEventListener("pageshow", function (e) { if (e.persisted) document.documentElement.classList.remove("vt-shared"); });

  /* Menu order: a page further down the menu rises from below, one further up drops in from above */
  var RANK = { index: 0, search: 1, listing: 1.5, agents: 2, agent: 2.5, neighborhoods: 3, neighborhood: 3.5, insights: 4, insight: 4.5, about: 5, sell: 6, wishlist: 7, "wishlist-detail": 7.5 };
  function rankOf(path) {
    var m = /^\/?([^/]*?)(?:\.html)?\/?$/.exec(path);
    var k = m ? (m[1] || "index") : "";
    return RANK.hasOwnProperty(k) ? RANK[k] : null;
  }

  window.addEventListener("pagereveal", function (e) {
    try {
      var root = document.documentElement;
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
      if (type === "traverse" || type === "reload") return;
      var kind = kindOf(location.pathname), mark = null;
      try { mark = (sessionStorage.getItem(STORE) || "").split("|"); sessionStorage.removeItem(STORE); } catch (x) {}
      if (!kind || !mark || mark[0] !== kind || Date.now() - Number(mark[1]) > 8000) return;
      var el = document.querySelector(DEST[kind]);
      if (!el) return;
      document.documentElement.classList.add("vt-shared");
      el.removeAttribute("data-clip"); el.removeAttribute("data-reveal"); /* no entrance effect while it morphs */
      var clear = name(el);
      vt.finished.then(clear, clear);
    } catch (x) {}
  });
})();
