/* Text rise on hover for text-only buttons and links (same motion as the
   homepage CTAs: label slides up, an identical copy rises into place).
   Watches the DOM so dynamically rendered cards (agents, neighborhoods) work too. */
(function () {
  var SEL = ".ins-read, .agent-card__mail, .nbp__dir, .agent-profile__mail, .nav-pill__btn, .filter-clear, .hl-btn, .back-link, .site-footer__contact, .site-footer__col a, .site-footer__legal a, .site-footer__email";
  function wrap(el) {
    if (el.__rise || el.querySelector(".rise, .link-rise")) { el.__rise = 1; return; }
    el.__rise = 1;
    var host = el.querySelector(".hl-btn__inner") || el;
    Array.from(host.childNodes).forEach(function (node) {
      var isText = node.nodeType === 3 && node.textContent.trim();
      var isSpan = node.nodeType === 1 && node.tagName === "SPAN" && !node.children.length && node.textContent.trim();
      if (!isText && !isSpan) return;
      var clip = document.createElement("span"); clip.className = "rise";
      var label = node;
      if (isText) { label = document.createElement("span"); label.textContent = node.textContent.trim(); }
      host.replaceChild(clip, node); clip.appendChild(label); label.classList.add("rise__t");
    });
  }
  /* ---- Letter-by-letter reveal: letters spread out, then close in, edges first ---- */
  var LAB = ".rise__t, .link-rise";
  function letters(el) {
    var txt = el.dataset.text || el.textContent;
    if (el.__fx === txt && el.querySelector(".tx")) return;
    if (!txt.trim()) return;
    var chars = Array.from(txt), n = chars.filter(function (c) { return c.trim(); }).length;
    var c = (n - 1) / 2, k = 0, html = "";
    chars.forEach(function (ch) {
      if (!ch.trim()) { html += " "; return; }
      var norm = c ? (k - c) / c : 0; k++;
      html += '<span class="tx__c" aria-hidden="true" style="--o:' + (norm * 0.55).toFixed(3) + "em;--d:" + ((1 - Math.abs(norm)) * 0.22).toFixed(3) + 's">' +
        ch.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>";
    });
    el.__fx = txt;
    el.setAttribute("data-text", txt);
    el.innerHTML = '<span class="tx" role="text" aria-label="' + txt.replace(/"/g, "&quot;") + '">' + html + "</span>";
  }
  function fx(root) {
    (root || document).querySelectorAll(SEL).forEach(wrap);
    (root || document).querySelectorAll(LAB).forEach(letters);
  }
  function scan(root) { fx(root); }
  scan();
  var busy = false;
  new MutationObserver(function (ms) {
    if (busy) return; busy = true;
    ms.forEach(function (m) {
      var t = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      var lab = t && t.closest && t.closest(LAB);
      if (lab && lab.__fx !== undefined) letters(lab);
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches(SEL)) wrap(n);
        if (n.matches && n.matches(LAB)) letters(n);
        scan(n);
      });
    });
    setTimeout(function () { busy = false; }, 0);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
