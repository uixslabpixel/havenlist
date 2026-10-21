/* Full-page circle menu (the hamburger on every page). The page passes what differs:
   HLCircleMenu({ toast, onOpen, onEscape, onLink })
   - onOpen    runs just before the menu opens (close a filter sheet, a full-screen map, ...)
   - onEscape  runs on Escape while the menu is closed
   - onLink    replaces the default "Go to <label>" toast for links that only point at "#" */
window.HLCircleMenu = function (opts) {
  opts = opts || {};
  var body = document.body;
  var menuBtn = document.getElementById("menuBtn");
  var megaMenu = document.getElementById("megaMenu");
  var xLines = Array.prototype.slice.call(menuBtn.querySelectorAll(".menu-btn__x-line"));
  var closingTimer, busyTimer, busy = false;

  function isOpen() { return megaMenu.classList.contains("is-open"); }

  function replayXDraw() {
    xLines.forEach(function (line) { line.style.animation = "none"; line.style.strokeDashoffset = "100"; });
    void menuBtn.offsetHeight;
    xLines.forEach(function (line) { line.style.animation = ""; line.style.strokeDashoffset = ""; });
  }

  function placeCircleOrigin() {
    var rect = menuBtn.getBoundingClientRect();
    megaMenu.style.setProperty("--cx", (rect.left + rect.width / 2) + "px");
    megaMenu.style.setProperty("--cy", (rect.top + rect.height / 2) + "px");
  }

  function openMenu() {
    if (busy) return;
    busy = true;
    clearTimeout(closingTimer);
    if (opts.onOpen) opts.onOpen();
    megaMenu.classList.remove("is-closing");
    megaMenu.style.clipPath = "";
    placeCircleOrigin();
    megaMenu.hidden = false;
    void megaMenu.offsetHeight;
    megaMenu.classList.add("is-open");
    menuBtn.classList.add("is-open");
    replayXDraw();
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    body.classList.add("is-menu-open");
    if (window.HLScroll) HLScroll.lock(true);
    busyTimer = setTimeout(function () { busy = false; }, 880);
  }

  function closeMenu() {
    if (busy && !isOpen()) return;
    busy = true;
    clearTimeout(busyTimer);
    placeCircleOrigin();
    megaMenu.style.clipPath = "";
    megaMenu.classList.add("is-closing");
    megaMenu.classList.remove("is-open");
    menuBtn.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    body.classList.remove("is-menu-open");
    if (window.HLScroll) HLScroll.lock(false);
    clearTimeout(closingTimer);
    closingTimer = setTimeout(function () {
      megaMenu.classList.remove("is-closing");
      megaMenu.hidden = true;
      busy = false;
    }, 600);
  }

  menuBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) closeMenu(); else openMenu();
  });
  menuBtn.addEventListener("mouseenter", function () { if (menuBtn.classList.contains("is-open")) replayXDraw(); });

  /* Links to a page just go there; "#" links keep the placeholder behaviour */
  megaMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if ((link.getAttribute("href") || "").charAt(0) !== "#") return;
      e.preventDefault();
      closeMenu();
      if (opts.onLink) { opts.onLink(link); return; }
      var rise = link.querySelector(".link-rise");
      if (opts.toast) opts.toast("Go to " + ((rise && rise.dataset.text) || link.textContent.trim() || "page"));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (isOpen()) closeMenu(); else if (opts.onEscape) opts.onEscape();
  });
  window.addEventListener("resize", function () { if (isOpen()) placeCircleOrigin(); });

  return { open: openMenu, close: closeMenu, isOpen: isOpen };
};
