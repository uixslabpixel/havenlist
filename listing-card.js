/* Havenlist listing card — one template for search results, similar listings
   and the wishlist page, styled by design-system.css. */
(function () {
  var BED = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5V4.5a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0112 4.5V7.5M1.5 11.5v-2A1.5 1.5 0 013 8h8a1.5 1.5 0 011.5 1.5v2M1.5 7.5h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  var BATH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h9.5V9a2.5 2.5 0 01-2.5 2.5H5A2.5 2.5 0 012.5 9V3.5M3 3.5h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  var AREA = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 8.5L8.5 2.5l3 3-6 6-3-3zM5 6l1 1M6.5 4.5l1 1M8 3l1 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var HEART = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path class="heart-outline" pathLength="100" d="M8 5.85C8 5.85 8 3.4 10.45 3.4C12.65 3.4 13.75 5.05 13.75 6.7C13.75 9.95 8 13.55 8 13.55C8 13.55 2.25 9.95 2.25 6.7C2.25 5.05 3.35 3.4 5.55 3.4C8 3.4 8 5.85 8 5.85Z" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* Smaller copies for small cards: 2-up on phones, 3-up on tablets, 4-up and more on desktop */
  function cardSrcset(src) {
    var ss = window.HavenlistStore && HavenlistStore.srcset ? HavenlistStore.srcset(src) : null;
    return ss ? ' srcset="' + ss + '" sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw"' : "";
  }

  function html(l) {
    return '<article class="card" data-id="' + esc(l.id) + '">' +
      '<div class="card__media">' +
        '<img src="' + esc(l.image) + '"' + cardSrcset(l.image) + ' alt="' + esc(l.alt || l.place) + '" loading="lazy" decoding="async" width="800" height="809">' +
        '<span class="card__badge">' + esc(l.badge || "For sale") + "</span>" +
        '<button class="card__fav" type="button" data-wl-id="' + esc(l.id) + '" aria-label="Save ' + esc(l.place) + '">' + HEART + "</button>" +
      "</div>" +
      '<div class="card__body">' +
        '<h3 class="card__place"><a class="card__link" href="listing.html?id=' + encodeURIComponent(l.id) + '">' + esc(l.place) + "</a></h3>" +
        '<p class="card__addr">' + esc(l.addr) + "</p>" +
        '<div class="card__meta">' +
          '<span class="card__meta-item">' + BED + esc(l.beds) + "</span>" +
          '<span class="card__meta-item">' + BATH + esc(l.baths) + "</span>" +
          '<span class="card__meta-item">' + AREA + esc(l.sqft) + " ft²</span>" +
          '<span class="card__price">' + esc(l.price) + "</span>" +
        "</div>" +
      "</div></article>";
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function build(list) {
    var t = document.createElement("template");
    t.innerHTML = list.map(html).join("");
    return t.content;
  }

  /* Swap the cards in. When the grid already shows cards, the ones that stay slide to their new place (they are the
     same elements, so pictures don't reload), the ones that go fade out first, and new ones rise in one by one. */
  function commit(el, animate) {
    var list = el.__next;
    el.__next = null;
    var old = {}, first = {};
    if (animate) {
      Array.prototype.forEach.call(el.children, function (c) {
        if (c.classList.contains("is-leaving")) return;
        old[c.dataset.id] = c;
        first[c.dataset.id] = c.getBoundingClientRect();
      });
      var nodes = list.map(function (l) { return old[l.id] || build([l]).firstElementChild; });
      el.replaceChildren.apply(el, nodes);
      var moved = [], n = 0;
      nodes.forEach(function (c) {
        var f = first[c.dataset.id];
        if (!f) { c.classList.add("is-entering"); c.style.setProperty("--i", n++); return; }
        var r = c.getBoundingClientRect(), dx = f.left - r.left, dy = f.top - r.top;
        if (dx || dy) { c.style.translate = dx + "px " + dy + "px"; moved.push(c); }
      });
      void el.offsetWidth;
      moved.forEach(function (c) {
        c.style.transition = "translate 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
        c.style.translate = "";
      });
      setTimeout(function () {
        moved.forEach(function (c) { c.style.transition = ""; });
        nodes.forEach(function (c) { c.classList.remove("is-entering"); c.style.removeProperty("--i"); });
      }, 900 + n * 45);
      if (window.HLWishlist) HLWishlist.sync(el);
      return;
    }
    el.innerHTML = list.map(html).join("");
    if (window.HLWishlist) HLWishlist.sync(el);
  }

  window.HLCard = {
    html: html,
    /* Render a list into a container, then sync heart state */
    mount: function (el, list) {
      el.__next = list;
      if (el.__timer) return; /* a swap is already scheduled: it will use the latest list */
      var cards = Array.prototype.slice.call(el.children);
      var animate = !reduce && cards.length && el.offsetParent !== null && cards.every(function (c) { return c.classList.contains("card"); });
      if (!animate) return commit(el, false);
      var keep = {};
      list.forEach(function (l) { keep[l.id] = 1; });
      var leaving = cards.filter(function (c) { return !keep[c.dataset.id]; });
      if (!leaving.length) return commit(el, true);
      leaving.forEach(function (c) { c.classList.add("is-leaving"); });
      el.__timer = setTimeout(function () { el.__timer = 0; commit(el, true); }, 220);
    }
  };
})();
