/* Search, Agent and Neighborhood share one filter bar: tabs, search field, Featured pill, price /
   location / beds / more dropdowns, the filter sheet and the compact bar (see filter-ui.js).
   HLListingFilters({ total, names, render, sheetTitle, afterCount }) -> { state, setTab, ..., start }
   - total        how many listings the page starts with
   - names        the dropdowns on the page (see HLFilterUI)
   - render()     draws the matching listings and returns how many there are
   - sheetTitle(n)  title of the filter sheet
   - afterCount() optional, runs after every count update */
window.HLListingFilters = function (cfg) {
  let ready = false;

  /* ----- Apply URL params from homepage search ----- */
  const params = new URLSearchParams(window.location.search);
  const initialQuery = (params.get("q") || "").trim();
  const initialType = params.get("type")?.trim() || "Rent";

  const state = {
    query: initialQuery,
    type: initialType,
    featured: false,
    priceMin: 0,
    priceMax: 10000000,
    location: "",
    beds: 0, // 0 = All
    baths: 0,
    propType: "House",
    facilities: [],
    listingCount: cfg.total,
    page: 1,
  };


  /* ----- Tabs ----- */
  const tabs = Array.from(document.querySelectorAll(".search-header .tab"));
  const tabsPill = document.getElementById("tabsPill");
  const compactTypeLabel = document.getElementById("compactTypeLabel");
  const sheetTabs = Array.from(document.querySelectorAll("#sheetTabs .tab"));
  const sheetTabsPill = document.getElementById("sheetTabsPill");

  function setTab(index, syncSheet = true) {
    tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === index)));
    tabsPill.style.transform = `translateX(${index * 100}%)`;
    state.type = tabs[index].dataset.type;
    compactTypeLabel.textContent = state.type;
    if (syncSheet) {
      sheetTabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === index)));
      sheetTabsPill.style.transform = `translateX(${index * 100}%)`;
    }
    updateCount();
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => setTab(i)));
  sheetTabs.forEach((tab, i) => tab.addEventListener("click", () => setTab(i)));

  const typeIndex = Math.max(0, tabs.findIndex((t) => t.dataset.type === initialType));
  setTab(typeIndex);

  /* ----- Query sync ----- */
  const searchInput = document.getElementById("searchInput");
  const sheetSearchInput = document.getElementById("sheetSearchInput");
  const titleQuery = document.getElementById("titleQuery");
  const compactQueryLabel = document.getElementById("compactQueryLabel");

  searchInput.value = initialQuery;
  sheetSearchInput.value = initialQuery;

  const titlePrefix = document.getElementById("titlePrefix");
  const compactQueryChip = compactQueryLabel.closest(".chip");

  /* Mirror the edited field into the other one — never rewrite the field
     being typed in (trimming it would eat spaces mid-word). Empty = all. */
  function syncQuery(from) {
    const source = from === "sheet" ? sheetSearchInput : searchInput;
    const other = from === "sheet" ? searchInput : sheetSearchInput;
    const q = source.value.trim();
    state.query = q;
    if (other.value !== source.value) other.value = source.value;
    compactQueryLabel.textContent = q;
    if (compactQueryChip) compactQueryChip.hidden = !q;
    
    updateCount();
  }
  searchInput.addEventListener("input", () => syncQuery("main"));
  sheetSearchInput.addEventListener("input", () => syncQuery("sheet"));
  syncQuery("main");

  function syncClearVisibility() {
    searchInput.closest(".filter-query")?.classList.toggle("has-value", !!searchInput.value.trim());
    sheetSearchInput.closest(".filter-query")?.classList.toggle("has-value", !!sheetSearchInput.value.trim());
  }
  searchInput.addEventListener("input", syncClearVisibility);
  sheetSearchInput.addEventListener("input", syncClearVisibility);
  syncClearVisibility();

  document.getElementById("searchClearBtn")?.addEventListener("click", () => {
    searchInput.value = "";
    syncQuery("main");
    syncClearVisibility();
    searchInput.focus();
  });
  document.getElementById("sheetSearchClearBtn")?.addEventListener("click", () => {
    sheetSearchInput.value = "";
    syncQuery("sheet");
    syncClearVisibility();
    sheetSearchInput.focus();
  });

  document.getElementById("btnFeatured").addEventListener("click", (e) => {
    state.featured = !state.featured;
    e.currentTarget.setAttribute("aria-pressed", String(state.featured));
    document.getElementById("sheetFeatured").setAttribute("aria-pressed", String(state.featured));
    /* The navbar chip only exists while the filter is on */
    document.querySelector(".chip--featured").hidden = !state.featured;
    updateLabels();
    updateCount();
  });
  document.getElementById("sheetFeatured").addEventListener("click", () => {
    document.getElementById("btnFeatured").click();
  });

  /* ----- Fav: the outline draws on hover (the click itself is handled by wishlist.js) ----- */
  const favBtn = document.getElementById("favBtn");
  favBtn.addEventListener("mouseenter", () => {
    const path = favBtn.querySelector(".heart-outline");
    path.style.animation = "none";
    void path.getBoundingClientRect();
    path.style.animation = "";
    favBtn.classList.add("is-drawing");
  });
  favBtn.addEventListener("mouseleave", () => {
    const path = favBtn.querySelector(".heart-outline");
    favBtn.classList.remove("is-drawing");
    path.style.animation = "none";
    path.style.strokeDashoffset = "0";
  });

  /* ----- Helpers ----- */
  const PRICE_MAX = 10000000;
  function formatPrice(n) {
    if (n >= PRICE_MAX) return "$10M+";
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(n % 1000000 ? 2 : 0).replace(/0$/, "").replace(/\.$/, "") + "M";
    return "$" + Math.round(n / 1000) + "K";
  }

  function bedsLabel(n) {
    return n <= 0 ? "All" : n >= 5 ? "5+" : String(n);
  }

  function updateCount() {
    if (!ready) return; /* filters are wired up first; the first render happens in start() */
    const n = cfg.render();
    state.listingCount = n;
    const show = `Show ${n} listing${n === 1 ? "" : "s"}`;
    ["priceShowCount", "bedsShowCount", "moreShowCount"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = show;
    });
    document.getElementById("sheetTitle").textContent = cfg.sheetTitle(n);
    if (cfg.afterCount) cfg.afterCount();
  }

  function updateLabels() {
    const priceDefault = state.priceMin === 0 && state.priceMax === PRICE_MAX;
    const priceText = priceDefault ? "Price range" : `${formatPrice(state.priceMin)} – ${formatPrice(state.priceMax)}`;
    document.getElementById("labelPrice").textContent = priceText;
    document.getElementById("sheetLabelPrice").textContent = priceText;
    document.getElementById("compactPriceLabel").textContent =
      priceDefault ? "Any price" : `${formatPrice(state.priceMin)}-${formatPrice(state.priceMax)}`;

    const locationText = state.location || "All neighborhoods";
    document.getElementById("labelLocation").textContent = locationText;
    document.getElementById("sheetLabelLocation").textContent = locationText;
    document.getElementById("compactLocationLabel").textContent = state.location || "All neighborhoods";

    const anyBeds = state.beds <= 0 && state.baths <= 0;
    const part = (n) => (bedsLabel(n) === "All" ? "Any" : bedsLabel(n));
    const bedsText = anyBeds ? "Bed & bath" : `${part(state.baths)} bath, ${part(state.beds)} bed`;
    document.getElementById("labelBeds").textContent = bedsText;
    document.getElementById("sheetLabelBeds").textContent = bedsText;
    document.getElementById("compactBedsLabel").textContent =
      anyBeds ? "2 bath, 2 bed" : `${state.baths > 0 ? state.baths : 1} bath, ${state.beds > 0 ? state.beds : 1} bed`;
  }

  /* ----- Price filter ----- */
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const priceFill = document.getElementById("priceFill");

  function syncPriceUI() {
    let a = Number(priceMin.value);
    let b = Number(priceMax.value);
    if (a > b) [a, b] = [b, a];
    state.priceMin = a;
    state.priceMax = b;
    const max = PRICE_MAX;
    priceFill.style.left = `${(a / max) * 100}%`;
    priceFill.style.width = `${((b - a) / max) * 100}%`;
    document.getElementById("priceMinLabel").textContent = formatPrice(a);
    document.getElementById("priceMaxLabel").textContent = formatPrice(b);
    updateCount();
  }
  priceMin.addEventListener("input", syncPriceUI);
  priceMax.addEventListener("input", syncPriceUI);
  syncPriceUI();

  /* ----- Building / land area ranges ----- */
  function bindAreaRange(track) {
    const lo = track.querySelector('[data-end="min"]');
    const hi = track.querySelector('[data-end="max"]');
    const fill = track.querySelector(".range-track__fill");
    const row = track.nextElementSibling;
    const loLabel = row.querySelector('[data-range-label="min"]');
    const hiLabel = row.querySelector('[data-range-label="max"]');
    const max = Number(hi.max);
    const defaults = [lo.value, hi.value];
    const fmt = (n) => `${n.toLocaleString("en-US")}${n >= max ? "+" : ""} sqft`;

    function sync() {
      let a = Number(lo.value);
      let b = Number(hi.value);
      if (a > b) [a, b] = [b, a];
      fill.style.left = `${(a / max) * 100}%`;
      fill.style.width = `${((b - a) / max) * 100}%`;
      loLabel.textContent = fmt(a);
      hiLabel.textContent = fmt(b);
      state[track.dataset.range] = [a, b];
      updateCount();
    }

    lo.addEventListener("input", sync);
    hi.addEventListener("input", sync);
    sync();
    return {
      reset() {
        lo.value = defaults[0];
        hi.value = defaults[1];
        sync();
      },
    };
  }
  const areaRanges = Array.from(document.querySelectorAll(".range-track[data-range]")).map(bindAreaRange);

  /* ----- Location ----- */
  function selectLocation(loc) {
    state.location = loc;
    document.querySelectorAll(".loc-chip, .loc-item").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.loc === loc);
    });
    updateLabels();
    updateCount();
    closePop();
  }
  document.querySelectorAll(".loc-chip, .loc-item").forEach((el) => {
    el.addEventListener("click", () => selectLocation(el.dataset.loc));
  });
  document.getElementById("locSearch").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll("#locList .loc-item").forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  /* ----- Beds / baths steppers ----- */
  function setStepper(kind, delta) {
    const key = kind;
    let v = state[key] + delta;
    if (v < 0) v = 0;
    if (v > 5) v = 5;
    state[key] = v;
    document.getElementById(kind + "Val").textContent = bedsLabel(v);
    updateLabels();
    updateCount();
  }
  document.querySelectorAll("[data-stepper]").forEach((row) => {
    const kind = row.dataset.stepper;
    row.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => setStepper(kind, Number(btn.dataset.step)));
    });
  });

  /* ----- More filters ----- */
  document.querySelectorAll("#propTypes .type-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#propTypes .type-chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      state.propType = chip.dataset.type;
      updateCount();
    });
  });
  document.querySelectorAll("#facilities input").forEach((cb) => {
    cb.addEventListener("change", () => {
      state.facilities = Array.from(document.querySelectorAll("#facilities input:checked")).map((i) => i.value);
      updateCount();
    });
  });

  /* ----- Dropdowns, filter sheet and compact bar (filter-ui.js) ----- */
  const ui = HLFilterUI({ names: cfg.names, updateLabels });
  const { closePop, closeSheet } = ui;

  document.querySelectorAll("[data-close-pop]").forEach((btn) => {
    btn.addEventListener("click", closePop);
  });
  document.querySelectorAll("[data-apply-pop]").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateLabels();
      updateCount();
      closePop();
      if (ui.sheetOpen) closeSheet();
    });
  });
  document.querySelectorAll("[data-clear]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.clear;
      if (kind === "price") {
        priceMin.value = 0; priceMax.value = PRICE_MAX; syncPriceUI();
      } else if (kind === "beds") {
        state.beds = 0; state.baths = 0;
        document.getElementById("bedsVal").textContent = "All";
        document.getElementById("bathsVal").textContent = "All";
      } else if (kind === "more") {
        state.propType = "House";
        state.facilities = [];
        document.querySelectorAll("#propTypes .type-chip").forEach((c, i) => c.classList.toggle("is-active", i === 0));
        document.querySelectorAll("#facilities input").forEach((i) => { i.checked = false; });
        areaRanges.forEach((range) => range.reset());
      }
      updateLabels();
      updateCount();
    });
  });

  /* ----- Compact chip clears ----- */
  const clearQueryChip = document.getElementById("clearQueryChip");
  if (clearQueryChip) {
    clearQueryChip.addEventListener("click", (e) => {
      e.stopPropagation();
      searchInput.value = "";
      sheetSearchInput.value = "";
      syncQuery("main");
      syncClearVisibility();
    });
  }
  document.getElementById("clearFeaturedChip")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.featured) document.getElementById("btnFeatured").click();
  });


  /* ----- Full-page circle menu (circle-menu.js) ----- */
  HLCircleMenu({ toast: HLToast, onOpen: () => { if (ui.sheetOpen) closeSheet(); closePop(); } });

  return {
    state, PRICE_MAX, tabs, ui, setTab, updateLabels, updateCount, closePop,
    /* the page calls this once its own code is in place: first labels, first render */
    start() { updateLabels(); ready = true; updateCount(); },
  };
};
