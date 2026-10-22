/* Havenlist pagination — shared by search.html, agents.html and neighborhoods.html.
   HLPager.mount(navEl, { total, pageSize, page, onChange }) draws prev / numbers / next
   and hides itself when everything fits on one page.
   HLPager.fit(gridEl, onResize) returns the page size for that grid: its column count × 2 rows
   (× 4 rows at two columns or fewer), so every page but the last is made of full rows.
   onResize(newSize, oldSize) runs when a resize changes the column count. */
window.HLPager = (function () {
  var ARROW = '<span class="ui-arrow" aria-hidden="true"><svg viewBox="0 0 17 12" fill="none"><path pathLength="100" d="M0.75 6H15.1L10.1 0.9L15.1 6L10.1 11.1"/></svg></span>';

  function pageList(cur, pages) {
    if (pages <= 7) { var all = []; for (var i = 1; i <= pages; i++) all.push(i); return all; }
    var out = [1];
    var from = Math.max(2, cur - 1), to = Math.min(pages - 1, cur + 1);
    if (from > 2) out.push("…");
    for (var p = from; p <= to; p++) out.push(p);
    if (to < pages - 1) out.push("…");
    out.push(pages);
    return out;
  }

  function mount(nav, opts) {
    var pages = Math.max(1, Math.ceil(opts.total / Math.max(1, opts.pageSize | 0)));
    var cur = Math.min(Math.max(1, opts.page), pages);
    nav.hidden = pages <= 1;
    if (pages <= 1) { nav.innerHTML = ""; return cur; }
    var hadFocus = nav.contains(document.activeElement);
    nav.innerHTML =
      '<button class="pager__btn pager__nav pager__prev" type="button" aria-label="Previous page" data-go="' + (cur - 1) + '"' + (cur === 1 ? " disabled" : "") + ">" + ARROW + "</button>" +
      '<div class="pager__list">' + pageList(cur, pages).map(function (p) {
        return p === "…" ? '<span class="pager__gap" aria-hidden="true">…</span>'
          : '<button class="pager__btn" type="button" data-go="' + p + '" aria-label="Page ' + p + '"' + (p === cur ? ' aria-current="page"' : "") + ">" + p + "</button>";
      }).join("") + '</div>' +
      '<button class="pager__btn pager__nav pager__next" type="button" aria-label="Next page" data-go="' + (cur + 1) + '"' + (cur === pages ? " disabled" : "") + ">" + ARROW + "</button>";
    nav.onclick = function (e) {
      var b = e.target.closest("[data-go]");
      if (!b || b.disabled) return;
      var p = Number(b.dataset.go);
      if (p >= 1 && p <= pages && p !== cur) opts.onChange(p);
    };
    if (hadFocus) { var now = nav.querySelector('[aria-current="page"]'); if (now) now.focus({ preventScroll: true }); }
    return cur;
  }
  function fit(grid, onResize) {
    function size() {
      var cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
      return cols * (cols <= 2 ? 4 : 2);
    }
    var cur = size();
    window.addEventListener("resize", function () {
      var n = size();
      if (n !== cur) { var old = cur; cur = n; onResize(n, old); }
    });
    return cur;
  }
  return { mount: mount, fit: fit };
})();
