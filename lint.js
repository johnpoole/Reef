#!/usr/bin/env node
// lint.js — run with: node lint.js
// Enforces the data-integrity rules from CONSTRAINTS.md.
// Exits 1 if any violations found; exits 0 if clean.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
let errors = 0;

function fail(file, line, msg) {
  console.error(`FAIL  ${file}:${line}  —  ${msg}`);
  errors++;
}

function lines(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { console.warn(`SKIP  ${file} (not found)`); return []; }
  return fs.readFileSync(full, "utf8").split("\n");
}

// ─── Rule 1: index.html must not define STRATEGIC data ───────────────────────
// It is loaded from strategic.js. Any `const STRATEGIC` here is a violation.
lines("index.html").forEach((l, i) => {
  if (/\bconst STRATEGIC\s*=/.test(l) && !/\/\//.test(l.slice(0, l.indexOf("const STRATEGIC"))))
    fail("index.html", i + 1, "STRATEGIC array defined in index.html — move to strategic.js");
});

// ─── Rule 2: strategic.js must not contain hardcoded coords ──────────────────
// Coords belong in businesses.geojson. strategic.js may only reference
// geojsonName for runtime lookup. Flags `lat: <number>` style assignments only.
lines("strategic.js").forEach((l, i) => {
  const stripped = l.replace(/\/\/.*/, "");
  if (/\blat\s*:\s*-?\d/.test(stripped))
    fail("strategic.js", i + 1, "hardcoded numeric `lat:` — coords belong in businesses.geojson");
  if (/\blng\s*:\s*-?\d/.test(stripped))
    fail("strategic.js", i + 1, "hardcoded numeric `lng:` — coords belong in businesses.geojson");
});

// ─── Rule 3: index.html must not contain hardcoded coords ────────────────────
// resolveCoords() is the only runtime source of lat/lng.
// Flags `lat: <number>` or `lng: <number>` object literal assignments only.
// Does NOT flag property reads (s.lat), destructuring ({ lat, lng }), or setView camera defaults.
lines("index.html").forEach((l, i) => {
  const stripped = l.replace(/\/\/.*/, "").replace(/<!--.*?-->/, "");
  if (/\blat\s*:\s*-?\d/.test(stripped))
    fail("index.html", i + 1, "hardcoded numeric `lat:` — use resolveCoords()");
  if (/\blng\s*:\s*-?\d/.test(stripped))
    fail("index.html", i + 1, "hardcoded numeric `lng:` — use resolveCoords()");
});

// ─── Rule 4: index.html must not contain hardcoded property financials ────────
// All dollar amounts for specific properties must come from STRATEGIC or MODEL.
// Pattern: a dollar sign immediately followed by a 6+ digit number (e.g. $850965, $1375000)
// or a formatted equivalent like $850,965 or $1,375,000.
// Exception: CSS rgba() values and hex colors are not financials.
lines("index.html").forEach((l, i) => {
  const stripped = l.replace(/\/\/.*/, "").replace(/<!--.*?-->/, "");
  if (/css|style|rgba|#[0-9a-fA-F]/i.test(stripped)) return;
  if (/\$[\d,]{7,}/.test(stripped))
    fail("index.html", i + 1, "hardcoded dollar amount — use STRATEGIC.<field> or MODEL.<field>");
  // bare 6-digit numbers that look like assessed values (not CSS pixels, loop counters, etc.)
  // Only flag when adjacent to financial keywords
  if (/\b(assessed|asking|land_value|impr_value|mkt_value)\s*[:=]\s*\d{6,}/.test(stripped))
    fail("index.html", i + 1, "hardcoded property value — belongs in strategic.js");
});

// ─── Rule 5: model.js must not contain property-specific data ────────────────
// model.js is for financial model parameters only (dues, member count, costs).
// It must not contain assessed values, asking prices, or addresses for specific properties.
lines("model.js").forEach((l, i) => {
  const stripped = l.replace(/\/\/.*/, "");
  if (/\b(assessed|asking|land_value|impr_value)\s*[:=]/.test(stripped))
    fail("model.js", i + 1, "property-specific financial data in model.js — belongs in strategic.js");
});

// ─── Rule 6: "Lady Liberty" must never appear in any data field ──────────────
// An unconfirmed Google Places artifact. Not a real business entry. Comments are
// allowed (archaeological record); any non-comment code line is a violation.
["strategic.js", "index.html", "map.js", "planning.js", "slides.js"].forEach(file => {
  lines(file).forEach((l, i) => {
    const stripped = l.replace(/\/\/.*/, "").replace(/<!--.*?-->/, "");
    if (/lady\s+liberty/i.test(stripped))
      fail(file, i + 1, `"Lady Liberty" in data/code — unverified artifact, must not appear outside comments`);
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────
if (errors === 0) {
  console.log("OK    All data-integrity checks passed.");
  process.exit(0);
} else {
  console.error(`\nFAILED  ${errors} violation(s) found.`);
  process.exit(1);
}
