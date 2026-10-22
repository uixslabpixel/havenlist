/* Havenlist listings store — shared by cms.html, search.html and index.html.
   Data lives in localStorage; the defaults below are what the site ships with. */
(function () {
  var KEY = "havenlist.listings.v1";
  var IMG = "assets/listings/listing-";
  /* type: the Rent / Buy / Commercial tab a listing shows under */
  function s(n, type, badge, place, addr, beds, baths, sqft, price) {
    return { id: "s" + n, collection: "search", type: type, badge: badge, place: place, addr: addr, beds: beds, baths: baths, sqft: sqft, price: price, image: IMG + n + ".webp", alt: place + " property" };
  }
  function f(k, place, addr, beds, baths, sqft, price, alt) {
    return { id: "f" + k, collection: "featured", type: "Buy", badge: "", place: place, addr: addr, beds: beds, baths: baths, sqft: sqft, price: price, image: "assets/featured-" + k + ".webp", alt: alt };
  }
  var DEFAULTS = [
    s(1, "Buy", "For sale", "Pacific Heights", "2250 Vallejo St, San Francisco", 4, 3, "3,180", "$4,950,000"),
    s(2, "Rent", "Open house", "Russian Hill", "1111 Jones St, San Francisco", 3, 2, "1,850", "$7,800/mo"),
    s(3, "Buy", "New listing", "Presidio Heights", "3712 Sacramento St, San Francisco", 5, 4, "3,420", "$5,750,000"),
    s(4, "Rent", "For rent", "Cole Valley", "1245 Stanyan St, San Francisco", 2, 2, "1,240", "$5,200/mo"),
    s(5, "Buy", "Price cut", "Noe Valley", "1420 Dolores St, San Francisco", 3, 2, "2,080", "$2,450,000"),
    s(6, "Commercial", "Office space", "Nob Hill", "1177 California St #806, San Francisco", 2, 2, "1,100", "$1,725,000"),
    s(7, "Rent", "Available", "South Beach", "88 Townsend St #311, San Francisco", 2, 2, "1,185", "$5,900/mo"),
    s(8, "Commercial", "Exclusive", "Rincon Hill", "301 Mission St #37E, San Francisco", 2, 2, "1,860", "$2,850,000"),
    s(9, "Buy", "Coming soon", "Sea Cliff", "740 El Camino del Mar, San Francisco", 4, 4, "3,560", "$6,250,000"),
    s(10, "Buy", "Turnkey", "Marina District", "2140 Beach St, San Francisco", 3, 2, "1,940", "$3,195,000"),
    s(11, "Rent", "Updated", "Inner Sunset", "1326 8th Ave, San Francisco", 3, 2, "1,675", "$6,100/mo"),
    s(12, "Rent", "View home", "Bernal Heights", "86 Anderson St, San Francisco", 3, 2, "1,520", "$5,600/mo"),
    s(13, "Rent", "New listing", "Potrero Hill", "1832 Carolina St, San Francisco", 4, 3, "3,050", "$9,400/mo"),
    s(14, "Commercial", "Retail", "Lake Street", "415 Lake St, San Francisco", 5, 4, "3,780", "$4,295,000"),
    s(15, "Buy", "Just listed", "Diamond Heights", "230 Diamond Heights Blvd, San Francisco", 3, 2, "2,240", "$2,175,000"),
    s(16, "Commercial", "Mixed-use", "Twin Peaks", "75 Palo Alto Ave, San Francisco", 4, 4, "3,320", "$4,780,000"),
    s(17, "Buy", "Price cut", "Ocean Beach", "3340 Great Hwy, San Francisco", 3, 3, "2,610", "$3,895,000"),
    f("a", "Pacific Heights", "2847 Pacific Heights Blvd, San Francisco", 4, 3, "2,400", "$1,250,000", "Modern white residence with lawn and palm trees"),
    f("b", "Marina Vista", "412 Bay Street, San Francisco", 3, 2, "1,850", "$980,000", "Cliffside villa with infinity pool at dusk"),
    f("c", "Noe Valley Loft", "1298 Church Street, San Francisco", 2, 2, "1,420", "$875,000", "Cantilevered glass residence overlooking the ocean"),
    f("d", "Russian Hill Terrace", "956 Green Street, San Francisco", 5, 4, "3,100", "$2,150,000", "Mediterranean villa with pool and patio lounge"),
    f("e", "Mission Modern", "274 Valencia Street, San Francisco", 3, 2, "1,680", "$1,050,000", "Minimal desert pavilion with open terrace"),
  ];

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function all() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var a = JSON.parse(raw);
        if (Array.isArray(a)) {
          /* Defaults shipped after this browser's last CMS save are added; ones it deleted stay deleted */
          var known = JSON.parse(localStorage.getItem(KEY + ".known") || "null");
          var have = a.map(function (l) { return l.id; });
          /* Saves from before listings had a type take the shipped one (or Buy) */
          a.forEach(function (l) { if (!l.type) { var d = DEFAULTS.filter(function (x) { return x.id === l.id; })[0]; l.type = d ? d.type : "Buy"; } });
          return a.concat(clone(DEFAULTS).filter(function (d) { return have.indexOf(d.id) === -1 && !(known && known.indexOf(d.id) !== -1); }));
        }
      }
    } catch (e) {}
    return clone(DEFAULTS);
  }

  /* srcset for the images that have smaller copies (scripts/make-image-variants.py); null for anything else */
  function srcset(path) {
    var m;
    if ((m = /^assets\/featured-([a-z])\.webp$/.exec(path || ""))) {
      var b = "assets/featured-" + m[1];
      return b + "-640.webp 640w, " + b + "-960.webp 960w, " + path + " 1200w";
    }
    if ((m = /^assets\/listings\/listing-(\d+)\.webp$/.exec(path || ""))) {
      return "assets/listings/listing-" + m[1] + "-480.webp 480w, " + path + " 800w";
    }
    if ((m = /^assets\/neighborhoods\/hero-pacific-heights\.webp$/.exec(path || ""))) {
      var h = "assets/neighborhoods/hero-pacific-heights";
      return h + "-640.webp 640w, " + h + "-960.webp 960w, " + path + " 1600w";
    }
    if ((m = /^assets\/agents\/agent-(\d+)\.webp$/.exec(path || ""))) {
      return "assets/agents/agent-" + m[1] + "-320.webp 320w, " + path + " 600w";
    }
    return null;
  }

  window.HavenlistStore = {
    KEY: KEY,
    srcset: srcset,
    defaults: function () { return clone(DEFAULTS); },
    all: all,
    /* Cards for one collection ("search" | "featured"). */
    get: function (collection) {
      return all().filter(function (l) { return l.collection === collection; });
    },
    /* Throws if the browser refuses the write (storage quota). */
    save: function (list) {
      localStorage.setItem(KEY, JSON.stringify(list));
      try { localStorage.setItem(KEY + ".known", JSON.stringify(DEFAULTS.map(function (d) { return d.id; }))); } catch (e) {}
    },
    reset: function () { try { localStorage.removeItem(KEY); localStorage.removeItem(KEY + ".known"); } catch (e) {} },
  };
})();
