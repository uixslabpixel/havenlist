/* Havenlist agents — shared by agents.html, agent.html and the listing page.
   Placeholder roster: the four portraits come from the design file and are reused. */
(function () {
  /* Smaller copies for the card photos (HavenlistStore.srcset, when that script is on the page) */
  function agentSrcset(src) {
    var ss = window.HavenlistStore && HavenlistStore.srcset ? HavenlistStore.srcset(src) : null;
    return ss ? ' srcset="' + ss + '" sizes="(max-width: 760px) 50vw, 25vw"' : "";
  }
  function a(id, name, role, photo, location, expertise, rating, years, phone, listings, bio) {
    return { id: id, name: name, role: role, photo: typeof photo === "number" ? "assets/agents/agent-" + photo + ".webp" : photo, location: location, expertise: expertise,
      rating: rating, years: years, phone: phone, email: id + "@havenlist.com", listings: listings, bio: bio };
  }
  var AGENTS = [
    a("sarah-chen", "Sarah Chen", "Senior agent", 4, "Pacific Heights", ["Luxury homes", "Family homes"], 4.9, 12, "+1 415 555 0142", ["s1", "s3", "s9"],
      "Sarah has guided more than 300 families through Pacific Heights and Presidio Heights, with a focus on architecturally significant homes."),
    a("alexander-josh", "Alexander Josh", "Lead consultant", 2, "Marina District", ["Condos", "Investment"], 4.8, 9, "+1 415 555 0178", ["s10", "s2", "s7"],
      "Alexander specialises in waterfront condos and investment properties around the Marina and Russian Hill."),
    a("daniel-weber", "Daniel Weber", "Senior agent", 3, "Noe Valley", ["Family homes", "First-time buyers"], 4.7, 8, "+1 415 555 0113", ["s5", "s11", "s12"],
      "Daniel helps first-time buyers and growing families find their place in Noe Valley, Bernal Heights and the Sunset."),
    a("emily-zhang", "Emily Zhang", "Lead consultant", 4, "Russian Hill", ["Luxury homes", "Condos"], 5.0, 11, "+1 415 555 0166", ["s2", "s6", "s8"],
      "Emily represents boutique condos and penthouses across Nob Hill, Rincon Hill and Russian Hill."),
    a("priya-nair", "Priya Nair", "Associate agent", 1, "Cole Valley", ["First-time buyers", "Rentals"], 4.6, 5, "+1 415 555 0121", ["s4", "s11", "s5"],
      "Priya works with renters and first-time buyers in Cole Valley, the Haight and the Inner Sunset."),
    a("omar-haddad", "Omar Haddad", "Senior agent", 2, "South Beach", ["Investment", "Condos"], 4.5, 7, "+1 415 555 0190", ["s7", "s8", "s6"],
      "Omar advises on investment condos in South Beach, SoMa and Mission Bay."),
    a("lars-nielsen", "Lars Nielsen", "Lead consultant", 3, "Sea Cliff", ["Luxury homes", "Estates"], 4.9, 14, "+1 415 555 0105", ["s9", "s3", "s1"],
      "Lars handles waterfront estates and view homes from Sea Cliff to the Presidio."),
    a("grace-lin", "Grace Lin", "Associate agent", 4, "Inner Sunset", ["Rentals", "Family homes"], 4.4, 4, "+1 415 555 0137", ["s11", "s4", "s12"],
      "Grace matches renters and families with homes near Golden Gate Park and the UCSF corridor."),
    a("julian-vance", "Julian Vance", "Lead agent", 2, "Pacific Heights", ["Family homes", "Condos"], 4.8, 10, "+1 415 555 0151", ["s2", "s6", "s10"],
      "Julian leads a small team that helps families and move-up buyers across Pacific Heights, the Marina and Russian Hill."),
    a("maya-torres", "Maya Torres", "Luxury specialist", 1, "Russian Hill", ["Luxury homes", "Estates"], 4.9, 13, "+1 415 555 0127", ["s3", "s9", "fd"],
      "Maya specialises in architecturally significant homes and discreet off-market sales."),
    a("marcus-sterling", "Marcus Sterling", "Senior agent", 3, "Nob Hill", ["Investment", "Condos"], 4.7, 9, "+1 415 555 0184", ["s6", "s7", "s8"],
      "Marcus advises investors and downsizers on condos and small multi-unit buildings downtown."),
    a("ethan-walsh", "Ethan Walsh", "Buyer specialist", 2, "Noe Valley", ["First-time buyers", "Rentals"], 4.6, 6, "+1 415 555 0139", ["s4", "s5", "s12"],
      "Ethan works exclusively with buyers, from first apartments to family homes in Noe Valley and Bernal Heights.")
  ];
  var LINKEDIN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path pathLength="100" d="M14.625 0C15.2578 0 15.75 0.527 15.75 1.125V14.625C15.75 15.258 15.258 15.75 14.625 15.75H1.125C0.492 15.75 0 15.258 0 14.625V1.125C0 0.527 0.492 0 1.125 0H14.625ZM4.781 13.5V5.977H2.426V13.5H4.781ZM3.586 2.25C2.848 2.25 2.25 2.848 2.25 3.621C2.25 4.359 2.848 4.957 3.586 4.957C4.324 4.957 4.957 4.359 4.957 3.621C4.957 2.848 4.324 2.25 3.586 2.25ZM13.5 13.5V9.387C13.5 7.348 13.078 5.801 10.723 5.801C9.563 5.801 8.824 6.434 8.508 6.996H8.473V5.977H6.223V13.5H8.578V9.773C8.578 8.789 8.754 7.84 9.949 7.84C11.145 7.84 11.18 8.965 11.18 9.844V13.5H13.5Z" fill="currentColor" fill-opacity=".9"/></svg>';
  var PHONE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path pathLength="100" d="M3.2875 0.0889C4.131 -0.1924 5.069 0.2139 5.444 1.0264L6.663 3.7451C7.006 4.4951 6.788 5.3389 6.163 5.8389L5.413 6.4639C6.225 8.0264 7.475 9.3076 9.006 10.1514L9.663 9.3389C10.163 8.7139 11.038 8.4951 11.756 8.8389L14.475 10.0889C15.288 10.4326 15.694 11.3701 15.413 12.2139C14.788 14.1826 12.819 15.8701 10.381 15.4326C4.975 14.4639 1.038 10.5576 0.069 5.1201C-0.369 2.7139 1.35 0.7451 3.2875 0.0889ZM4.069 1.6514C4.006 1.5264 3.881 1.4639 3.756 1.4951C2.35 1.9951 1.288 3.3389 1.569 4.8389C2.413 9.6514 5.85 13.1201 10.663 13.9639C12.163 14.2139 13.538 13.1514 14.006 11.7451C14.038 11.6201 13.975 11.4951 13.85 11.4326L11.131 10.1826C11.038 10.1514 10.913 10.1826 10.819 10.2764L9.788 11.5889C9.569 11.8389 9.194 11.9326 8.881 11.7764C6.6 10.7139 4.788 8.8389 3.788 6.5264C3.663 6.2139 3.756 5.8701 4.006 5.6514L5.225 4.6826C5.319 4.6201 5.35 4.4951 5.319 4.3701L4.069 1.6514Z" fill="currentColor" fill-opacity=".8"/></svg>';

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function cardHTML(g) {
    return '<article class="agent-card">' +
      '<div class="agent-card__media"><img src="' + esc(g.photo) + '"' + agentSrcset(g.photo) + ' alt="' + esc(g.name) + '" loading="lazy" decoding="async" width="600" height="480"><span class="agent-card__fade" aria-hidden="true"></span></div>' +
      '<div class="agent-card__body">' +
        '<div class="agent-card__top"><div class="agent-card__id">' +
          '<h3 class="agent-card__name"><a class="agent-card__link" href="agent.html?id=' + encodeURIComponent(g.id) + '">' + esc(g.name) + "</a></h3>" +
          '<p class="agent-card__role">' + esc(g.role) + "</p></div>" +
          '<a class="agent-card__icon" href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="' + esc(g.name) + ' on LinkedIn">' + LINKEDIN + "</a></div>" +
        '<a class="agent-card__phone" href="tel:' + esc(g.phone.replace(/\s/g, "")) + '">' + PHONE + "<span>" + esc(g.phone) + "</span></a>" +
        '<a class="agent-card__mail" href="mailto:' + esc(g.email) + '">Email</a>' +
      "</div></article>";
  }

  window.HLAgents = {
    all: function () { return AGENTS.slice(); },
    get: function (id) { return AGENTS.filter(function (g) { return g.id === id; })[0] || null; },
    cardHTML: cardHTML,
    mount: function (el, list) { el.innerHTML = list.map(cardHTML).join(""); },
    LINKEDIN: LINKEDIN, PHONE: PHONE
  };
})();
