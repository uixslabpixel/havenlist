/* Shared toast: HLToast(message[, ms]). Uses the page's #toast element, or adds one. */
window.HLToast = (function () {
  var el, timer;
  return function (message, ms) {
    if (!el) {
      el = document.getElementById("toast");
      if (!el) {
        el = document.createElement("div");
        el.className = "toast";
        el.setAttribute("role", "status");
        document.body.appendChild(el);
      }
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(function () { el.classList.remove("is-visible"); }, ms || 2200);
  };
})();
