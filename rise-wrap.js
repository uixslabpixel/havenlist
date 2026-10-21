/* Wraps a button/link's text label in .rise / .rise__t (the markup rise.js animates).
   HLWrapLabels([selector]) wraps the labels of the matching buttons and links once, right away,
   so it also happens on touch screens, where rise.js stays idle. */
window.HLWrapLabels = function (selector) {
  function wrap(el) {
    if (el.querySelector(".rise, .link-rise")) return;
    var host = el.querySelector(".hl-btn__inner") || el;
    Array.prototype.slice.call(host.childNodes).forEach(function (node) {
      var isText = node.nodeType === 3 && node.textContent.trim();
      var isLabel = node.nodeType === 1 && node.tagName === "SPAN" && !node.children.length && node.textContent.trim();
      if (!isText && !isLabel) return;
      var clip = document.createElement("span");
      clip.className = "rise";
      var label = node;
      if (isText) {
        label = document.createElement("span");
        label.textContent = node.textContent.trim();
      }
      host.replaceChild(clip, node);
      clip.appendChild(label);
      label.classList.add("rise__t");
    });
  }
  /* Text buttons and text links only — not the logo, tabs, pills or dropdowns */
  document.querySelectorAll(selector || ".hl-btn, .back-link, .filter-clear, .site-footer__contact, .site-footer__col a, .site-footer__legal a, .site-footer__email").forEach(wrap);
};
