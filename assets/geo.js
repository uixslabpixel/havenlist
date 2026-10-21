/* Havenlist geo data: where each listing is, and the real places around it.
   Places come live from OpenStreetMap (Overpass API); if that can't be reached
   a short list of well-known San Francisco landmarks is used instead.
   Listing coordinates are street/neighbourhood-level, not surveyed points. */
(function () {
  var COORDS = {
    s1: [37.7955, -122.4339], s2: [37.7978, -122.4166], s3: [37.7878, -122.4511], s4: [37.7650, -122.4535],
    s5: [37.7516, -122.4268], s6: [37.7919, -122.4130], s7: [37.7790, -122.3925], s8: [37.7905, -122.3957],
    s9: [37.7870, -122.4895], s10: [37.8030, -122.4390], s11: [37.7640, -122.4660], s12: [37.7380, -122.4120],
    fa: [37.7925, -122.4382], fb: [37.8049, -122.4140], fc: [37.7500, -122.4280], fd: [37.7990, -122.4180], fe: [37.7700, -122.4220]
  };
  var CENTER = [37.7749, -122.4194];

  var CATS = [
    { key: "food", label: "Restaurants & cafés", color: "#1DAEEF", icon: "p-0" },
    { key: "health", label: "Hospitals & clinics", color: "#00CB1B", icon: "p-1" },
    { key: "shop", label: "Supermarkets", color: "#FFB200", icon: "p-2" },
    { key: "transit", label: "Transit", color: "#F23C00", icon: "p-3" }
  ];

  /* Fallback: real, well-known places (approximate coordinates) */
  var SAMPLE = [
    ["food", "Tartine Bakery", 37.7614, -122.4241], ["food", "Zuni Café", 37.7733, -122.4212], ["food", "Swan Oyster Depot", 37.7918, -122.4204],
    ["food", "Greens Restaurant", 37.8062, -122.4316], ["food", "State Bird Provisions", 37.7836, -122.4331], ["food", "Cotogna", 37.7971, -122.4036],
    ["food", "Nopa", 37.7747, -122.4376], ["food", "Burma Superstar", 37.7822, -122.4631], ["food", "Foreign Cinema", 37.7568, -122.4190],
    ["health", "UCSF Medical Center at Parnassus", 37.7631, -122.4580], ["health", "CPMC Pacific Campus", 37.7900, -122.4310],
    ["health", "Zuckerberg San Francisco General Hospital", 37.7557, -122.4046], ["health", "Saint Francis Memorial Hospital", 37.7894, -122.4175],
    ["health", "Saint Mary's Medical Center", 37.7743, -122.4553], ["health", "UCSF Mission Bay", 37.7680, -122.3920],
    ["shop", "Whole Foods Market (Franklin St)", 37.7900, -122.4235], ["shop", "Bi-Rite Market", 37.7616, -122.4254], ["shop", "Safeway (Marina)", 37.8003, -122.4375],
    ["shop", "Trader Joe's (North Beach)", 37.8049, -122.4150], ["shop", "Whole Foods Market (Potrero)", 37.7658, -122.4008], ["shop", "Safeway (Market St)", 37.7656, -122.4129],
    ["transit", "Powell St BART", 37.7844, -122.4080], ["transit", "Embarcadero BART", 37.7930, -122.3968], ["transit", "Montgomery St BART", 37.7894, -122.4013],
    ["transit", "Civic Center BART", 37.7796, -122.4139], ["transit", "16th St Mission BART", 37.7650, -122.4197], ["transit", "24th St Mission BART", 37.7522, -122.4184],
    ["transit", "4th & King Caltrain", 37.7765, -122.3946], ["transit", "Glen Park BART", 37.7330, -122.4338], ["transit", "Balboa Park BART", 37.7216, -122.4474]
  ].map(function (r) { return { cat: r[0], name: r[1], lat: r[2], lng: r[3], src: "sample" }; });

  function dist(a, b) {
    var R = 6371000, r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function nearest(list, center, perCat) {
    var out = [];
    CATS.forEach(function (c) {
      var seen = {};
      list.filter(function (p) { return p.cat === c.key; })
        .map(function (p) { p.d = dist(center, [p.lat, p.lng]); return p; })
        .sort(function (a, b) { return a.d - b.d; })
        .filter(function (p) { if (seen[p.name]) return false; seen[p.name] = 1; return true; })
        .slice(0, perCat).forEach(function (p) { out.push(p); });
    });
    return out;
  }

  function query(c) {
    var la = c[0], ln = c[1], a = function (r) { return "(around:" + r + "," + la + "," + ln + ")"; };
    return "[out:json][timeout:12];(" +
      'node' + a(1400) + '["amenity"~"^(restaurant|cafe)$"]["name"];' +
      'nwr' + a(2200) + '["amenity"~"^(hospital|clinic)$"]["name"];' +
      'node' + a(1600) + '["shop"~"^(supermarket|convenience)$"]["name"];' +
      'node' + a(1400) + '["railway"~"^(station|tram_stop|subway_entrance)$"]["name"];' +
      'node' + a(900) + '["highway"="bus_stop"]["name"];' +
      ");out center 400;";
  }
  function classify(t) {
    if (t.amenity === "restaurant" || t.amenity === "cafe") return "food";
    if (t.amenity === "hospital" || t.amenity === "clinic") return "health";
    if (t.shop) return "shop";
    if (t.railway || t.highway === "bus_stop") return "transit";
    return null;
  }

  /* Overpass JSON -> the nearest few places per category, topped up from the sample set */
  function parse(j, center) {
    var all = (j.elements || []).map(function (e) {
      var tags = e.tags || {}, cat = classify(tags);
      var lat = e.lat != null ? e.lat : e.center && e.center.lat, lng = e.lon != null ? e.lon : e.center && e.center.lon;
      return cat && lat != null && tags.name ? { cat: cat, name: tags.name, lat: lat, lng: lng, src: "osm" } : null;
    }).filter(Boolean);
    var list = nearest(all, center, 3);
    /* any category OpenStreetMap had nothing for nearby is filled from the sample set */
    CATS.forEach(function (c) {
      if (!list.some(function (p) { return p.cat === c.key; })) {
        nearest(SAMPLE.filter(function (p) { return p.cat === c.key; }).map(function (p) { return Object.assign({}, p); }), center, 2).forEach(function (p) { list.push(p); });
      }
    });
    return list;
  }

  /* Free public Overpass servers, tried in turn: the next one starts if the
     previous hasn't answered in 2.5s, and the first good answer wins. */
  var ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
  ];

  /* Order of use: 1) places baked into assets/poi-data.js (no network, see
     scripts/build-poi.mjs)  2) live Overpass  3) the sample landmarks. */
  function pois(center, key, cb) {
    if (window.HL_POI && window.HL_POI[key]) return cb(window.HL_POI[key]);
    var ck = "havenlist.pois.v2." + key;
    try { var hit = JSON.parse(sessionStorage.getItem(ck)); if (hit) return cb(hit); } catch (e) {}
    var done = false, timers = [], ctls = [];
    function finish(list, live) {
      if (done) return; done = true;
      timers.forEach(clearTimeout); ctls.forEach(function (c) { try { c.abort(); } catch (e) {} });
      if (live) { try { sessionStorage.setItem(ck, JSON.stringify(list)); } catch (e) {} }
      cb(list);
    }
    function fallback() {
      if (window.console) console.warn("[Havenlist map] Overpass unreachable — showing sample landmarks instead");
      finish(nearest(SAMPLE.map(function (p) { return Object.assign({}, p); }), center, 3), false);
    }
    if (!window.fetch) return fallback();
    var failed = 0;
    function tryEndpoint(i) {
      var ctl = window.AbortController ? new AbortController() : null;
      if (ctl) ctls.push(ctl);
      fetch(ENDPOINTS[i], {
        method: "POST", body: "data=" + encodeURIComponent(query(center)),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: ctl ? ctl.signal : undefined
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) { finish(parse(j, center), true); })
        .catch(function (err) {
          if (done) return;
          if (window.console) console.warn("[Havenlist map] " + ENDPOINTS[i] + " failed:", err && err.message || err);
          if (++failed === ENDPOINTS.length) fallback();
        });
    }
    ENDPOINTS.forEach(function (_, i) { timers.push(setTimeout(function () { if (!done) tryEndpoint(i); }, i * 2500)); });
    timers.push(setTimeout(fallback, 11000));
  }


  /* Offline base map: San Francisco neighbourhood outlines drawn under the tiles, so the map is
     never blank when tiles can't be loaded. Real tiles (when reachable) simply cover it. */
  function base(map, highlight) {
    var L = window.L, data = window.HL_SF_BASE;
    if (!L || !data) return;
    var el = map.getContainer();
    el.style.background = "#cfdde8";
    map.createPane("hlbase").style.zIndex = 150;
    var hl = {}; (highlight || []).forEach(function (n) { hl[n] = 1; });
    var labels = L.layerGroup().addTo(map);
    data.forEach(function (n) {
      var park = n.n === "Golden Gate Park" || n.n === "Presidio";
      var on = hl[n.n];
      var poly = L.polygon(n.r, { pane: "hlbase", interactive: false, weight: on ? 2 : 1, color: on ? "#1e1e1e" : "#d6d1c6",
        fillColor: on ? "#ece4d3" : park ? "#dce8d0" : "#f4f2ed", fillOpacity: 1 }).addTo(map);
      var c = poly.getBounds().getCenter();
      L.marker(c, { interactive: false, keyboard: false, icon: L.divIcon({ className: "hl-nblabel" + (on ? " is-on" : ""), html: n.n, iconSize: [90, 14], iconAnchor: [45, 7] }) }).addTo(labels);
    });
    function toggle() { el.classList.toggle("hl-nolabels", map.getZoom() < 13); }
    map.on("zoomend", toggle); toggle();
  }

  window.HLGeo = {
    base: base,
    poly: function (place) {
      var m = { "Pacific Heights": "Pacific Heights", "Russian Hill": "Russian Hill", "Russian Hill Terrace": "Russian Hill", "Presidio Heights": "Presidio Heights",
        "Cole Valley": "Haight Ashbury", "Noe Valley": "Noe Valley", "Noe Valley Loft": "Noe Valley", "Nob Hill": "Nob Hill", "South Beach": "South of Market",
        "Rincon Hill": "South of Market", "Sea Cliff": "Seacliff", "Marina District": "Marina", "Marina Vista": "Marina", "Inner Sunset": "Inner Sunset",
        "Bernal Heights": "Bernal Heights", "Mission Modern": "Mission" };
      return m[place] ? [m[place]] : [];
    },
    CATS: CATS,
    center: function (item) { return COORDS[item && item.id] || CENTER; },
    pois: pois,
    /* used by scripts/build-poi.mjs */
    COORDS: COORDS, query: query, parse: parse
  };
})();
