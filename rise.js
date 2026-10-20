/* Text rise on hover for text-only buttons and links (same motion as the
   homepage CTAs: label slides up, an identical copy rises into place).
   Watches the DOM so dynamically rendered cards (agents, neighborhoods) work too. */
(function () {
  var SEL = ".ins-read, .agent-card__mail, .nbp__dir, .agent-profile__mail, .nav-pill__btn, .filter-clear";
  function wrap(el) {
    if (el.__rise || el.querySelector(".rise, .link-rise")) { el.__rise = 1; return; }
    el.__rise = 1;
    Array.from(el.childNodes).forEach(function (node) {
      var isText = node.nodeType === 3 && node.textContent.trim();
      var isSpan = node.nodeType === 1 && node.tagName === "SPAN" && !node.children.length && node.textContent.trim();
      if (!isText && !isSpan) return;
      var clip = document.createElement("span"); clip.className = "rise";
      var label = node;
      if (isText) { label = document.createElement("span"); label.textContent = node.textContent.trim(); }
      el.replaceChild(clip, node); clip.appendChild(label); label.classList.add("rise__t");
    });
  }
  function scan(root) { (root || document).querySelectorAll(SEL).forEach(wrap); }
  scan();
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) {
      if (n.nodeType !== 1) return; if (n.matches && n.matches(SEL)) wrap(n); scan(n);
    }); });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
