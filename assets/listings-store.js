/* Havenlist listings store — shared by cms.html, search.html and index.html.
   Data lives in localStorage; the defaults below are what the site ships with. */
(function () {
  var KEY = "havenlist.listings.v1";
  var IMG = "assets/listings/listing-";
  function s(n, badge, place, addr, beds, baths, sqft, price) {
    return { id: "s" + n, collection: "search", badge: badge, place: place, addr: addr, beds: beds, baths: baths, sqft: sqft, price: price, image: IMG + n + ".webp", alt: place + " property" };
  }
  function f(k, place, addr, beds, baths, sqft, price, alt) {
    return { id: "f" + k, collection: "featured", badge: "", place: place, addr: addr, beds: beds, baths: baths, sqft: sqft, price: price, image: "assets/featured-" + k + ".webp", alt: alt };
  }
  var DEFAULTS = [
    s(1, "For sale", "Pacific Heights", "2250 Vallejo St, San Francisco", 4, 3, "3,180", "$4,950,000"),
    s(2, "Open house", "Russian Hill", "1111 Jones St, San Francisco", 3, 2, "1,850", "$2,195,000"),
    s(3, "New listing", "Presidio Heights", "3712 Sacramento St, San Francisco", 5, 4, "3,420", "$5,750,000"),
    s(4, "Just listed", "Cole Valley", "1245 Stanyan St, San Francisco", 2, 2, "1,240", "$1,495,000"),
    s(5, "Price cut", "Noe Valley", "1420 Dolores St, San Francisco", 3, 2, "2,080", "$2,450,000"),
    s(6, "Featured", "Nob Hill", "1177 California St #806, San Francisco", 2, 2, "1,100", "$1,725,000"),
    s(7, "Available", "South Beach", "88 Townsend St #311, San Francisco", 2, 2, "1,185", "$1,350,000"),
    s(8, "Exclusive", "Rincon Hill", "301 Mission St #37E, San Francisco", 2, 2, "1,860", "$2,850,000"),
    s(9, "Coming soon", "Sea Cliff", "740 El Camino del Mar, San Francisco", 4, 4, "3,560", "$6,250,000"),
    s(10, "Turnkey", "Marina District", "2140 Beach St, San Francisco", 3, 2, "1,940", "$3,195,000"),
    s(11, "Updated", "Inner Sunset", "1326 8th Ave, San Francisco", 3, 2, "1,675", "$1,895,000"),
    s(12, "View home", "Bernal Heights", "86 Anderson St, San Francisco", 3, 2, "1,520", "$1,685,000"),
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
      if (raw) { var a = JSON.parse(raw); if (Array.isArray(a)) return a; }
    } catch (e) {}
    return clone(DEFAULTS);
  }

  window.HavenlistStore = {
    KEY: KEY,
    defaults: function () { return clone(DEFAULTS); },
    all: all,
    /* Cards for one collection ("search" | "featured"). */
    get: function (collection) {
      return all().filter(function (l) { return l.collection === collection; });
    },
    /* Throws if the browser refuses the write (storage quota). */
    save: function (list) { localStorage.setItem(KEY, JSON.stringify(list)); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
  };
})();
