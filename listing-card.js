/* Havenlist listing card — one template for search results, similar listings
   and the wishlist page, styled by components.css. */
(function () {
  var BED = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5V4.5a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0112 4.5V7.5M1.5 11.5v-2A1.5 1.5 0 013 8h8a1.5 1.5 0 011.5 1.5v2M1.5 7.5h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  var BATH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h9.5V9a2.5 2.5 0 01-2.5 2.5H5A2.5 2.5 0 012.5 9V3.5M3 3.5h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
  var AREA = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 8.5L8.5 2.5l3 3-6 6-3-3zM5 6l1 1M6.5 4.5l1 1M8 3l1 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var HEART = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path class="heart-outline" pathLength="100" d="M8 5.85C8 5.85 8 3.4 10.45 3.4C12.65 3.4 13.75 5.05 13.75 6.7C13.75 9.95 8 13.55 8 13.55C8 13.55 2.25 9.95 2.25 6.7C2.25 5.05 3.35 3.4 5.55 3.4C8 3.4 8 5.85 8 5.85Z" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function html(l) {
    return '<article class="card">' +
      '<div class="card__media">' +
        '<img src="' + esc(l.image) + '" alt="' + esc(l.alt || l.place) + '" loading="lazy" width="800" height="809">' +
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

  window.HLCard = {
    html: html,
    /* Render a list into a container in one write, then sync heart state */
    mount: function (el, list) {
      el.innerHTML = list.map(html).join("");
      if (window.HLWishlist) HLWishlist.sync(el);
    }
  };
})();
