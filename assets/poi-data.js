/* Optional: nearby places baked in at build time so the map never waits on a
   public API. Generate with:  node scripts/build-poi.mjs
   Left empty, the map falls back to live Overpass, then to sample landmarks. */
window.HL_POI = window.HL_POI || {};
