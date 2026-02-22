/* ─────────────────────────────────────────────────────────
   map.js — Leaflet map, GIS rendering, strategic markers, filters
   Depends on: leaflet, d3, model.js, strategic.js (all loaded before this)
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   CATEGORY COLORS  (for GIS parcels)
───────────────────────────────────────────────────────── */
const CAT_COLORS = {
  "Food & Drink":    "#e05c5c",
  "Lodging":        "#e08c40",
  "Retail":         "#d4b040",
  "Services":       "#7ab5d8",
  "Recreation":     "#4caf50",
  "Marina/Marine":  "#40c8d8",
  "Government":     "#a060d0",
  "Commercial":     "#7a9ab5",
  "Vacant":         "#3a4a5a",
  "Other":          "#5a6a7a"
};

/* ─────────────────────────────────────────────────────────
   STATE
───────────────────────────────────────────────────────── */
let allFeatures = [];
let activeCategories = new Set();
let searchQuery = "";
let strategicVisible = true;
let strategicMarkers = [];
let selectedId = null;
let map, geoLayer, lotsLayer;
let lotsVisible = false;

/* ─────────────────────────────────────────────────────────
   MAP INIT
   map_.on("moveend") is wired in index.html after pushState is defined.
───────────────────────────────────────────────────────── */
const map_ = L.map("map", { zoomControl: false }).setView([48.982, -123.075], 14);
map = map_;
L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OSM contributors &copy; CARTO",
  maxZoom: 19
}).addTo(map);

/* ─────────────────────────────────────────────────────────
   GEOJSON RESOLVERS
   Source of truth for coords/address is businesses.geojson.
   Source of truth for assessor data is strategic.js.
   Nothing is hardcoded here.
───────────────────────────────────────────────────────── */
function resolveFeature(s) {
  if (!allFeatures || !allFeatures.length) return null;
  const lookupName = s.geojsonName || s.name;
  return allFeatures.find(f => f.properties.name === lookupName) || null;
}

function resolveCoords(s) {
  if (s.lat != null && s.lng != null) return { lat: s.lat, lng: s.lng };
  const feat = resolveFeature(s);
  if (!feat) return null;
  const [lng, lat] = feat.geometry.coordinates;
  return { lat, lng };
}

function resolveAddress(s) {
  if (s.address) return s.address;
  const feat = resolveFeature(s);
  return feat ? (feat.properties.address || "") : "";
}

/* ─────────────────────────────────────────────────────────
   STRATEGIC MARKERS
───────────────────────────────────────────────────────── */
function addStrategicMarkers() {
  strategicMarkers.forEach(m => map.removeLayer(m));
  strategicMarkers = [];
  if (!strategicVisible) return;

  STRATEGIC.forEach(s => {
    const coords = resolveCoords(s);
    if (!coords) return;
    const isReef = s.id === "reef";
    const marker = L.circleMarker([coords.lat, coords.lng], {
      radius:      isReef ? 18 : 13,
      fillColor:   s.color,
      color:       isReef ? "#ffffff" : s.color,
      weight:      isReef ? 3 : 1.5,
      opacity:     0.9,
      fillOpacity: isReef ? 0.9 : 0.7
    });

    const statusMap = { target: "Target", stalled: "⚠ Stalled", watch: "Watch", open: "Open" };
    const flagClass = `flag-${s.status}`;
    marker.bindPopup(`
      <div class="popup-inner">
        <div class="popup-address">${s.name}</div>
        <div class="popup-owner">${resolveAddress(s)}</div>
        <div class="popup-stats">
          <div class="popup-stat"><div class="v">${s.assessed ? "$" + (s.assessed/1e6).toFixed(2) + "M" : "—"}</div><div class="k">Assessed</div></div>
          <div class="popup-stat"><div class="v">${s.asking ? "$" + (s.asking/1e6).toFixed(2) + "M" : "—"}</div><div class="k">Asking</div></div>
          <div class="popup-stat"><div class="v">${s.sqft ? s.sqft.toLocaleString() + " sqft" : "—"}</div><div class="k">Size</div></div>
          <div class="popup-stat"><div class="v">${s.built || "—"}</div><div class="k">Built</div></div>
        </div>
        <div class="strategic-popup-flag ${flagClass}">${statusMap[s.status]}</div>
        <div class="popup-owner" style="margin-top:8px;line-height:1.5;">${s.note}</div>
      </div>
    `, { maxWidth: 300 });

    marker.addTo(map);
    strategicMarkers.push(marker);
  });
}

/* ─────────────────────────────────────────────────────────
   LOT LINES LAYER
───────────────────────────────────────────────────────── */
function buildLotsLayer(features) {
  if (lotsLayer) map.removeLayer(lotsLayer);

  lotsLayer = L.geoJSON({ type: "FeatureCollection", features }, {
    style: f => {
      const isReef = (f.properties.situs_num === "1334");
      return {
        color:       isReef ? "#f0c040" : "#7ab5d8",
        weight:      isReef ? 2.5 : 1.2,
        opacity:     isReef ? 0.95 : 0.6,
        fillColor:   isReef ? "#f0c040" : "#4a8aaa",
        fillOpacity: isReef ? 0.08 : 0.04,
        dashArray:   isReef ? null : "4 3"
      };
    },
    onEachFeature: (f, layer) => {
      const p = f.properties;
      const addr  = `${p.situs_num || ""} ${p.situs_street || ""}`.trim() || "(no address)";
      const owner = p.title_owner_name || "—";
      const use   = (p.property_use_description || "").trim() || "—";
      const val   = p.market ? "$" + p.market.toLocaleString() : "—";
      const zoning = `${(p.zoning || "").trim()} — ${(p.zoning_description || "").trim()}`;
      const lot    = p.lot   ? `Lot ${p.lot}`   : "";
      const block  = p.block ? `Block ${p.block}` : "";
      const subdv  = (p.subdv_description || "").trim();
      const link   = p.Hyperlink ? `<a href="${p.Hyperlink}" target="_blank" style="color:#7ab5d8">Whatcom Assessor ↗</a>` : "";
      const yr     = p.yr_blt   ? `Built ${p.yr_blt}` : "";
      const sqft   = p.sqft_la  ? `${p.sqft_la.toLocaleString()} sqft` : "";

      layer.bindPopup(`
        <div class="popup-inner">
          <div class="popup-address">${addr}</div>
          <div class="popup-owner">${owner}</div>
          <div class="popup-stats">
            <div class="popup-stat"><div class="v">${val}</div><div class="k">Assessed</div></div>
            <div class="popup-stat"><div class="v">${use}</div><div class="k">Use</div></div>
            ${yr ? `<div class="popup-stat"><div class="v">${yr}</div><div class="k">Built</div></div>` : ""}
            ${sqft ? `<div class="popup-stat"><div class="v">${sqft}</div><div class="k">Bldg Sqft</div></div>` : ""}
          </div>
          <div style="font-size:11px;color:#5a7a94;margin-top:6px">${zoning}</div>
          ${(lot || block) ? `<div style="font-size:11px;color:#5a7a94">${[lot,block,subdv].filter(Boolean).join(" · ")}</div>` : ""}
          ${p.legal_description ? `<div style="font-size:10px;color:#3a5060;margin-top:4px">${p.legal_description}</div>` : ""}
          ${link ? `<div style="margin-top:8px">${link}</div>` : ""}
        </div>
      `, { maxWidth: 300 });

      layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.18, opacity: 1 }));
      layer.on("mouseout",  () => lotsLayer.resetStyle(layer));
    }
  });

  if (lotsVisible) lotsLayer.addTo(map);
}

/* ─────────────────────────────────────────────────────────
   FILTER PILLS
───────────────────────────────────────────────────────── */
function buildFilterPills(cats) {
  const container = document.getElementById("filter-pills");
  container.innerHTML = "";

  const allPill = document.createElement("div");
  allPill.className = "pill active";
  allPill.style.background = "#1e3048";
  allPill.style.color = "#e8eaed";
  allPill.style.borderColor = "#2e5070";
  allPill.textContent = "All";
  allPill.addEventListener("click", () => {
    activeCategories = new Set(cats);
    document.querySelectorAll(".pill").forEach(p => p.classList.add("active"));
    renderAll();
  });
  container.appendChild(allPill);

  [...cats].sort().forEach(cat => {
    const color = CAT_COLORS[cat] || CAT_COLORS["Other"];
    const pill = document.createElement("div");
    pill.className = "pill active";
    pill.style.background = color + "22";
    pill.style.borderColor = color;
    pill.style.color = color;
    pill.textContent = cat;
    pill.addEventListener("click", () => {
      if (activeCategories.has(cat)) {
        activeCategories.delete(cat);
        pill.classList.remove("active");
      } else {
        activeCategories.add(cat);
        pill.classList.add("active");
      }
      renderAll();
    });
    container.appendChild(pill);
  });
}

/* ─────────────────────────────────────────────────────────
   LEGEND
───────────────────────────────────────────────────────── */
function buildLegend(cats) {
  const container = document.getElementById("legend-items");
  [...cats].sort().forEach(cat => {
    const color = CAT_COLORS[cat] || CAT_COLORS["Other"];
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<div class="legend-dot" style="background:${color}"></div><span>${cat}</span>`;
    container.appendChild(item);
  });
}

/* ─────────────────────────────────────────────────────────
   RENDER ALL (map layer + sidebar list)
───────────────────────────────────────────────────────── */
function renderAll() {
  const q = searchQuery.toLowerCase();
  const filtered = allFeatures.filter(f => {
    const p = f.properties;
    if (!activeCategories.has(p.category || "Other")) return false;
    if (q && !( (p.name||p.address||"").toLowerCase().includes(q) || (p.owner||"").toLowerCase().includes(q) )) return false;
    return true;
  });

  document.getElementById("count-badge").textContent = filtered.length + " / " + allFeatures.length;

  // Skip The Reef (is_reef) and STRATEGIC sub-businesses (is_strategic) — strategic layer handles them.
  if (geoLayer) map.removeLayer(geoLayer);
  geoLayer = L.geoJSON({ type: "FeatureCollection", features: filtered }, {
    filter: f => !f.properties.is_reef && !f.properties.is_strategic,
    pointToLayer: (feature, latlng) => {
      const p = feature.properties;
      const color = p.color || CAT_COLORS[p.category] || CAT_COLORS["Other"];
      const isStrategicParcel = STRATEGIC.some(s => (p.address||"").startsWith(s.address));
      return L.circleMarker(latlng, {
        radius:      isStrategicParcel ? 10 : 7,
        fillColor:   color,
        color:       isStrategicParcel ? "#ffffff" : color,
        weight:      isStrategicParcel ? 1.5 : 1,
        opacity:     0.8,
        fillOpacity: 0.75
      });
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const color = p.color || CAT_COLORS[p.category] || CAT_COLORS["Other"];
      const fmt = v => v ? "$" + Number(v).toLocaleString() : "—";

      const ratingStr = p.rating ? `★ ${p.rating}` : "";
      const ownerLine = p.owner ? `<div class="popup-owner">Owner: ${p.owner.replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bLlc\b/,"LLC")}</div>` : "";
      const countyLink = p.county_url
        ? `<a class="popup-link" href="${p.county_url}" target="_blank">Whatcom County assessor &rarr;</a>`
        : "";
      layer.bindPopup(`
        <div class="popup-inner">
          <span class="popup-use-badge" style="background:${color}22;color:${color}">${p.category || "Other"}${ratingStr ? " &nbsp;" + ratingStr : ""}</span>
          <div class="popup-address">${p.name || p.address || "Unknown"}</div>
          <div class="popup-owner">${p.address || ""}</div>
          ${ownerLine}
          <div class="popup-stats">
            <div class="popup-stat"><div class="v">${fmt(p.mkt_value)}</div><div class="k">Assessed</div></div>
            <div class="popup-stat"><div class="v">${p.sqft ? Number(p.sqft).toLocaleString() + " sqft" : "—"}</div><div class="k">Size</div></div>
            <div class="popup-stat"><div class="v">${p.yr_blt || "—"}</div><div class="k">Built</div></div>
            <div class="popup-stat"><div class="v">${p.zoning || "—"}</div><div class="k">Zoning</div></div>
          </div>
          ${countyLink}
        </div>
      `, { maxWidth: 280 });

      layer.bindTooltip(p.name || p.address || "No name", { direction: "top", offset: [0, -6] });

      layer.on("click", () => {
        selectedId = p.place_id || String(p.prop_id);
        renderList(filtered);
      });
    }
  }).addTo(map);

  renderList(filtered);
}

/* ─────────────────────────────────────────────────────────
   SIDEBAR LIST
───────────────────────────────────────────────────────── */
function renderList(features) {
  const container = document.getElementById("property-list");
  container.innerHTML = "";

  features.forEach(f => {
    const p = f.properties;
    const color = p.color || CAT_COLORS[p.category] || CAT_COLORS["Other"];
    const isStrategic = STRATEGIC.some(s => (p.address||"").startsWith(s.address));
    const uid = p.place_id || String(p.prop_id);
    const item = document.createElement("div");
    item.className = "property-item" +
      (p.is_reef ? " is-reef" : "") +
      (isStrategic && !p.is_reef ? " is-strategic" : "") +
      (uid === selectedId ? " selected" : "");

    const fmt = v => v ? "$" + (Number(v) / 1000).toFixed(0) + "K" : "—";
    const label = p.name || p.address || "Unknown";
    const sub   = p.name ? (p.address || "") : (p.owner ? p.owner.replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bLlc\b/,"LLC") : "");
    item.innerHTML = `
      <div class="dot" style="background:${color}"></div>
      <div class="prop-info">
        <div class="prop-address">${label}</div>
        <div class="prop-owner">${sub}</div>
      </div>
      <div class="prop-meta">
        <div class="prop-value">${fmt(p.mkt_value)}</div>
        <div class="prop-use">${p.category || "—"}</div>
      </div>
    `;

    if (f.geometry && f.geometry.coordinates) {
      item.addEventListener("click", () => {
        const [lng, lat] = f.geometry.coordinates;
        map.flyTo([lat, lng], 17, { duration: 1 });
        selectedId = uid;
        renderList(features);
      });
    }

    container.appendChild(item);
  });
}

/* ─────────────────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────────────────── */
function buildStats() {
  const bar = document.getElementById("stats-bar");
  const total = allFeatures.length;
  const totalAssessed = allFeatures.reduce((s, f) => s + (Number(f.properties.mkt_value) || 0), 0);
  const REEF = STRATEGIC.find(s => s.id === "reef");
  bar.innerHTML = `
    <div class="stat-pill"><strong>${total}</strong> businesses</div>
    <div class="stat-pill">Total assessed <strong>$${(totalAssessed / 1e6).toFixed(1)}M</strong></div>
    <div class="stat-pill">Target: <strong style="color:#f0c040">${REEF ? "The Reef $" + (REEF.asking/1e6).toFixed(3).replace(/\.?0+$/,"") + "M ask" : "The Reef"}</strong></div>
  `;
}
