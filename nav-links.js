/* Site-wide wiring for the pages added later (About, Sell, Insight details).
   Runs in the capture phase so it wins over each page's older toast handlers. */
(function () {
  var ON_HOME = /(^|\/)(index\.html)?$/.test(location.pathname);
  var MAP = { "home": "index.html", "buy": "search.html?type=Buy", "rent": "search.html?type=Rent", "commercial": "search.html?type=Commercial", "about": "about.html", "about us": "about.html", "sell with us": "sell.html", "insights": "insights.html", "listings": "search.html?q=", "agents": "agents.html", "neighborhoods": "neighborhoods.html", "wishlist": "wishlist.html" };
  function fix() {
    document.querySelectorAll(".site-footer a, .mega-menu a").forEach(function (a) {
      var h = a.getAttribute("href") || "";
      if (h !== "#" && h.charAt(0) !== "#") return;
      var k = (a.textContent || "").trim().toLowerCase();
      if (k === "home" && ON_HOME) return;
      if (MAP[k]) a.setAttribute("href", MAP[k]);
    });
  }
  fix();
  document.addEventListener("click", function (e) {
    var t = e.target, go = null;
    if (t.closest("#sellBtn") || t.closest(".site-footer__btn")) go = "sell.html";
    else if (t.closest(".site-footer__contact")) go = "sell.html#form";
    if (!go) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (/sell\.html$/.test(location.pathname) && go === "sell.html#form") { var f = document.getElementById("form"); if (f) { f.scrollIntoView({ behavior: "smooth", block: "center" }); return; } }
    location.href = go;
  }, true);
})();
