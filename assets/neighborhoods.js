/* Havenlist neighborhoods — shared by neighborhoods.html and neighborhood.html.
   Placeholder figures (prices, counts, scores) for the demo; centres are real San Francisco / Marin locations. */
(function () {
  var NB = "assets/neighborhoods/", LST = "assets/listings/listing-";
  function n(id, name, area, avg, count, image, hero, ll, days, walk, transit, listings, about, highlights) {
    return { poly: POLY[id] || [], id: id, name: name, area: area, avg: avg, count: count, image: image, hero: hero, ll: ll, days: days, walk: walk, transit: transit,
      listings: listings, about: about, highlights: highlights };
  }
  var F = "assets/featured-";
  var POLY = {"pacific-heights": ["Pacific Heights"], "noe-valley": ["Noe Valley"], "marina-district": ["Marina"], "sausalito": [], "russian-hill": ["Russian Hill"], "presidio-heights": ["Presidio Heights"], "cole-valley": ["Haight Ashbury"], "nob-hill": ["Nob Hill"], "south-beach": ["South of Market"], "sea-cliff": ["Seacliff"], "inner-sunset": ["Inner Sunset"], "bernal-heights": ["Bernal Heights"]};
  var LIST = [
    n("pacific-heights", "Pacific Heights", "Northern SF", 2.1, 32, NB + "n-pacific-heights.webp", NB + "hero-pacific-heights.webp", [37.7925, -122.4372], 24, 94, 82, ["s1", "s15", "fa"],
      "Grand Victorians and Edwardians along Broadway and Pacific Avenue, with sweeping views of the Bay and the Golden Gate. Quiet, leafy and walkable, it is one of the city's most established addresses.",
      ["Alta Plaza and Lafayette parks", "Fillmore Street shops and cafés", "Views across the Bay to Marin", "Top-rated private and public schools"]),
    n("noe-valley", "Noe Valley", "Central SF", 1.6, 18, NB + "n-noe-valley.webp", F + "c.webp", [37.7502, -122.4337], 21, 90, 74, ["s5", "s14", "fc"],
      "A sunny, family-friendly village on 24th Street, known for its strollers, bakeries and independent shops. Streets are calm and the J Church line is a short ride to downtown.",
      ["24th Street dining and shopping", "Noe Valley Farmers Market", "Sunniest weather in the city", "Playgrounds and Billy Goat Hill"]),
    n("marina-district", "Marina District", "Waterfront", 1.4, 14, NB + "n-marina-district.webp", F + "b.webp", [37.8021, -122.4368], 27, 92, 70, ["s10", "fb"],
      "Pastel Mediterranean-style homes a block from the water, with Crissy Field, the Palace of Fine Arts and the Presidio at the door. Chestnut and Union streets keep it lively.",
      ["Crissy Field and the Presidio", "Waterfront running and cycling paths", "Chestnut Street restaurants", "Easy ferry and bus access"]),
    n("sausalito", "Sausalito", "Marin County", 1.8, 10, NB + "n-sausalito.webp", F + "d.webp", [37.8591, -122.4853], 38, 78, 48, ["s16"],
      "A waterfront village across the Golden Gate Bridge, with houseboats, galleries and a ferry that reaches San Francisco in about 30 minutes. Hillside homes look back at the skyline.",
      ["Ferry to San Francisco", "Bridgeway galleries and restaurants", "Houseboat community", "Trails into the Marin Headlands"]),
    n("russian-hill", "Russian Hill", "Northern SF", 2.2, 21, LST + "2.webp", F + "d.webp", [37.8011, -122.4194], 26, 96, 84, ["s2", "fd"],
      "Steep streets, Lombard's famous curves and some of the city's best views. A mix of Edwardian flats and boutique condos, minutes from North Beach and Fisherman's Wharf.",
      ["Lombard and Macondray Lane", "Polk Street dining", "Cable car lines", "Panoramic Bay views"]),
    n("cole-valley", "Cole Valley", "Western SF", 1.5, 12, LST + "4.webp", F + "e.webp", [37.7653, -122.4505], 22, 91, 78, ["s4"],
      "A small, walkable village at the edge of Golden Gate Park, with cafés on Cole Street and the N Judah at the corner.",
      ["Golden Gate Park access", "Cole Street cafés", "N Judah to downtown", "Tiny Victorian streets"]),
    n("nob-hill", "Nob Hill", "Central SF", 1.7, 17, LST + "6.webp", F + "a.webp", [37.7930, -122.4161], 29, 97, 90, ["s6"],
      "Historic hotels, Grace Cathedral and grand apartment buildings at the top of the cable-car hill, with downtown a short walk away.",
      ["Grace Cathedral", "Cable cars on California St", "Downtown within walking distance", "Classic high-rise views"]),
    n("south-beach", "South Beach", "Waterfront", 1.3, 15, LST + "7.webp", F + "b.webp", [37.7810, -122.3893], 33, 93, 88, ["s7", "s8"],
      "Modern condos along the Embarcadero beside Oracle Park, with bayside walks, the ferry and Caltrain close by.",
      ["Oracle Park", "Embarcadero waterfront", "Caltrain at 4th & King", "New-build condos with amenities"]),
    n("sea-cliff", "Sea Cliff", "Western SF", 5.2, 6, LST + "9.webp", F + "d.webp", [37.7871, -122.4929], 45, 70, 52, ["s9", "s13"],
      "Elegant coastal estates facing the Golden Gate, with direct access to China Beach and the Lands End trails.",
      ["China Beach", "Lands End trails", "Golden Gate views", "Private, quiet enclave"]),
    n("inner-sunset", "Inner Sunset", "Western SF", 1.9, 13, LST + "11.webp", F + "c.webp", [37.7632, -122.4668], 28, 89, 76, ["s11"],
      "Relaxed and lively near Golden Gate Park and UCSF, with Irving Street's restaurants and the Sunset's fog-kissed evenings.",
      ["Golden Gate Park and Botanical Garden", "Irving Street dining", "UCSF Parnassus", "N Judah line"]),
    n("bernal-heights", "Bernal Heights", "Central SF", 1.7, 16, LST + "12.webp", F + "e.webp", [37.7388, -122.4151], 25, 85, 66, ["s12"],
      "A hilltop community with a village feel, Cortland Avenue's shops and the open slope of Bernal Hill for sunsets and dog walks.",
      ["Bernal Hill park", "Cortland Avenue shops", "Community gardens", "Sunny microclimate"]),
    n("san-antonio", "San Antonio", "Texas", 1.2, 21, "assets/neighborhood-san-antonio.webp", F + "a.webp", [29.4241, -98.4936], 41, 62, 30, ["s17"],
      "A warm, historic Texas city of river walks, old missions and neighborhoods with generous lots, with homes that cost far less than the coast.",
      ["The River Walk and the Alamo", "Five UNESCO-listed missions", "Quiet suburbs with large lots", "Lower cost of living"])
  ];
  var AREAS = ["Northern SF", "Central SF", "Western SF", "Waterfront", "Marin County", "Texas"];

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function href(g) { return "neighborhood.html?id=" + encodeURIComponent(g.id); }
  function price(g) { return "$" + g.avg.toFixed(1) + "M"; }

  /* Same markup and classes as the listing card (listing-card.js) so structure, parallax and hover match */
  function cardHTML(g) {
    return '<article class="card">' +
      '<div class="card__media">' +
        '<img src="' + esc(g.image) + '" alt="' + esc(g.name) + '" loading="lazy" width="800" height="809">' +
        '<span class="card__badge">' + esc(g.area) + "</span>" +
      "</div>" +
      '<div class="card__body">' +
        '<h3 class="card__place"><a class="card__link" href="' + href(g) + '">' + esc(g.name) + "</a></h3>" +
        '<p class="card__addr">' + esc(window.HLNeighborhoods.place(g)) + "</p>" +
        '<div class="card__meta">' +
          '<span class="card__meta-item">' + g.count + " listings</span>" +
          '<span class="card__price">' + price(g) + " avg</span>" +
        "</div>" +
      "</div></article>";
  }

  window.HLNeighborhoods = {
    all: function () { return LIST.slice(); },
    featured: function () { return LIST.slice(0, 4); },
    areas: AREAS,
    get: function (id) { return LIST.filter(function (g) { return g.id === id; })[0] || null; },
    href: href, price: price,
    place: function (g) { return g.id === "sausalito" ? "Sausalito, CA" : g.id === "san-antonio" ? "San Antonio, TX" : g.name + ", San Francisco, CA"; },
    cardHTML: cardHTML,
    mount: function (el, list) { el.innerHTML = list.map(cardHTML).join(""); }
  };
})();
