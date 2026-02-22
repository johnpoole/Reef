/* ─────────────────────────────────────────────────────────
   slides.js — Presentation engine + all 12 slide functions
   Depends on: d3, model.js, strategic.js, map.js, planning.js (all loaded before this)
───────────────────────────────────────────────────────── */

let currentSlide = 0;
let presentationReady = false;

const SLIDES = [
  { num:"01", sect:"THE PROPERTY",       sub:"What is The Reef?",                                    fn: slideProperty   },
  { num:"02", sect:"THE REEF — PHOTOS",  sub:"Existing building, patio & waterfront — MLS\u00ae #2477253", fn: slidePhotos     },
  { num:"03", sect:"ACQUISITION TYPE",   sub:"This is a Conversion \u2014 not a Going Concern",           fn: slideConversion },
  { num:"04", sect:"THE PENCLAVE",       sub:"Domestic isolation via foreign intermediation",        fn: slidePenclave   },
  { num:"05", sect:"ADDRESSABLE MARKET", sub:"Who can actually get here?",                            fn: slideMarket     },
  { num:"06", sect:"BORDER RISK",        sub:"When the border closes, 80% of revenue disappears",    fn: slideClosure    },
  { num:"07", sect:"THE SEASON",         sub:"Revenue lives in 13 weeks",                            fn: slideSeason     },
  { num:"08", sect:"COST STACK",         sub:"Build costs first \u2014 revenue is what covers them",     fn: slideCosts      },
  { num:"09", sect:"AUTOMATION",         sub:"The penclave makes automation capital \u2014 not compromise", fn: slideAutomation },
  { num:"10", sect:"BREAK-EVEN",         sub:"How many members does it take?",                       fn: slideBreakeven  },
  { num:"11", sect:"CAPITAL REQUIRED",   sub:"Total outlay before first dollar of revenue",          fn: slideCapital    },
  { num:"12", sect:"GO / NO-GO",         sub:"The conditions that kill the deal",                    fn: slideGoNoGo     },
];

/* ─────────────────────────────────────────────────────────
   ENGINE
───────────────────────────────────────────────────────── */
function initPresentation() {
  presentationReady = true;
  const dotsEl = document.getElementById("slide-dots");
  dotsEl.innerHTML = "";
  SLIDES.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slide-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goToSlide(i));
    dotsEl.appendChild(dot);
  });
  document.getElementById("slide-prev").addEventListener("click", () => goToSlide(currentSlide - 1));
  document.getElementById("slide-next").addEventListener("click", () => goToSlide(currentSlide + 1));
  document.addEventListener("keydown", e => {
    if (!document.body.classList.contains("presentation-mode")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goToSlide(currentSlide + 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goToSlide(currentSlide - 1);
  });
  let _tx0 = 0, _ty0 = 0;
  const panel = document.getElementById("presentation-panel");
  panel.addEventListener("touchstart", e => {
    _tx0 = e.touches[0].clientX;
    _ty0 = e.touches[0].clientY;
  }, { passive: true });
  panel.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - _tx0;
    const dy = e.changedTouches[0].clientY - _ty0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
  }, { passive: true });
  goToSlide(0);
}

function goToSlide(idx) {
  if (idx < 0 || idx >= SLIDES.length) return;
  currentSlide = idx;
  const s = SLIDES[idx];
  document.getElementById("slide-title").textContent    = s.num + " / " + s.sect;
  document.getElementById("slide-subtitle").textContent = s.sub;
  document.getElementById("slide-counter").textContent  = (idx + 1) + " / " + SLIDES.length;
  document.querySelectorAll(".slide-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
  document.getElementById("slide-prev").disabled = idx === 0;
  document.getElementById("slide-next").disabled = idx === SLIDES.length - 1;
  const viz = document.getElementById("slide-viz");
  viz.style.opacity = "0";
  while (viz.firstChild) viz.removeChild(viz.firstChild);
  d3.select("#slide-viz").selectAll("svg").remove();
  setTimeout(() => { s.fn(viz); viz.style.opacity = "1"; }, 80);
  pushState();
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function sEl(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
function sWrap(cls)  { return sEl("div", cls); }
function sNote(txt)  { return sEl("p",   "snote", txt); }
function sVizW()     { return (document.getElementById("slide-viz").clientWidth - 96) || 660; }

/* ─────────────────────────────────────────────────────────
   SLIDE FUNCTIONS
───────────────────────────────────────────────────────── */

/* ── Slide 01: The Property ── */
function slideProperty(c) {
  const REEF = STRATEGIC.find(s => s.id === "reef");
  const askPct = REEF ? "+" + ((REEF.asking / REEF.assessed - 1) * 100).toFixed(1) + "%" : "—";
  const grid = sWrap("sstat-grid");
  [{ v: REEF ? "$" + REEF.asking.toLocaleString()   : "—", k:"Asking Price",         cls:"s-hi"  },
   { v: REEF ? "$" + REEF.assessed.toLocaleString() : "—", k:"Assessed Value",        cls:""     },
   { v: askPct,                                            k:"Ask vs Assessed",       cls:"s-warn"},
   { v:"≤2,500 sqft",                                     k:"Est. Building Area [E]",cls:""     },
   { v: REEF ? "Built " + REEF.built : "—",               k:"Year Built",            cls:""     },
   { v:"RESORT COMM",                                     k:"Zoning",               cls:"s-ok" }]
  .forEach(s => { const d = sEl("div","sstat "+s.cls); d.innerHTML=`<div class="sv">${s.v}</div><div class="sk">${s.k}</div>`; grid.appendChild(d); });
  c.appendChild(grid);

  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Value component breakdown — where the money actually is"));
  const cd = sEl("div"); cd.id="sp-chart"; cw.appendChild(cd);
  const landK = REEF ? Math.round(REEF.land_value / 1000) : "—";
  const premK = REEF ? Math.round((REEF.asking - REEF.assessed) / 1000) : "—";
  cw.appendChild(sNote(`[V] Whatcom County 2025 assessed values. Land ($${landK}K) is the load-bearing component — improvements on a ${REEF ? REEF.built : ""} building carry minimal residual structural value. The asking price premium of $${premK}K above assessed reflects the business value and/or seller expectations.`));
  c.appendChild(cw);

  const data = [
    { label:"Land value",       val: REEF ? REEF.land_value : 0, color:"#4caf50" },
    { label:"Improvement value",val: REEF ? REEF.impr_value : 0, color:"#7ab5d8" },
    { label:"Total assessed",   val: REEF ? REEF.assessed   : 0, color:"#5a7a94" },
    { label:"Asking price",     val: REEF ? REEF.asking     : 0, color:"#f0c040" },
  ];
  const W=sVizW(), H=160, ml=165, mr=90, mt=8, mb=8;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x=d3.scaleLinear().domain([0, REEF ? REEF.asking * 1.1 : 1500000]).range([0,bw]);
  const y=d3.scaleBand().domain(data.map(d=>d.label)).range([0,bh]).padding(0.32);
  const svg=d3.select("#sp-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);
  svg.selectAll("rect").data(data).join("rect")
    .attr("y",d=>y(d.label)).attr("height",y.bandwidth()).attr("x",0).attr("width",0).attr("rx",4)
    .attr("fill",d=>d.color).attr("opacity",0.85)
    .transition().duration(600).delay((_,i)=>i*100).attr("width",d=>x(d.val));
  svg.selectAll(".lbl").data(data).join("text").attr("class","lbl")
    .attr("x",-6).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("text-anchor","end").attr("fill","#8090a0").attr("font-size","11px").text(d=>d.label);
  svg.selectAll(".val").data(data).join("text").attr("class","val")
    .attr("x",d=>x(d.val)+6).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("fill",d=>d.color).attr("font-size","11px").attr("font-weight","700")
    .text(d=>"$"+(d.val/1000).toFixed(0)+"K");
}

/* ── Slide 02: Photos ── */
function slidePhotos(c) {
  const hero = sWrap("sphoto-hero");
  const heroImg = document.createElement("img");
  heroImg.src = "https://cdn.listingphotos.sierrastatic.com/pics3x/v1770342736/152/152_2477253_01.jpg";
  heroImg.alt = "The Reef — waterfront view, 1334 Gulf Rd, Point Roberts WA";
  heroImg.className = "sphoto-hero-img";
  hero.appendChild(heroImg);
  const _reefS = STRATEGIC.find(s => s.id === "reef");
  const cap = sEl("div", "sphoto-caption",
    `Kiniski\u2019s Reef Tavern \u00b7 1334 Gulf Rd, Point Roberts WA 98281 \u00b7 MLS\u00ae #2477253 \u00b7 Listed\u00a0 ${_reefS ? "$" + _reefS.asking.toLocaleString() : ""}`);
  hero.appendChild(cap);
  c.appendChild(hero);

  const THUMBS = [
    { n:"02", v:"v1770342768" },
    { n:"03", v:"v1770342769" },
    { n:"04", v:"v1770342770" },
    { n:"05", v:"v1770342771" },
  ];
  const grid = sEl("div", "sphoto-grid");
  THUMBS.forEach(t => {
    const base = `https://cdn.listingphotos.sierrastatic.com/pics1x/${t.v}/152/152_2477253_${t.n}.jpg`;
    const a = document.createElement("a");
    a.href = base; a.target = "_blank"; a.rel = "noopener";
    const img = document.createElement("img");
    img.src = base; img.alt = `Photo ${t.n}`;
    a.appendChild(img);
    grid.appendChild(a);
  });
  c.appendChild(grid);

  const lw = sEl("div", "sphoto-links");
  lw.appendChild(sEl("div", "sphoto-links-title", "Listing sources \u2014 38 photos available"));
  const LINKS = [
    { href: "https://www.washingtonwaterfronts.com/property/1334-gulf-rd-point-roberts-wa-98281/pid-15151627/",
      label: "Washington Waterfronts \u2014 full gallery (38 photos), MLS\u00ae #2477253" },
    { href: "https://www.loopnet.com/Listing/1334-Gulf-Rd-Point-Roberts-WA/32585395/",
      label: "LoopNet commercial listing #32585395" },
    { href: "https://www.kiniskisreef.com/",
      label: "kiniskisreef.com \u2014 official bar website" },
    { href: "https://www.kiniskisreef.com/private_events.html",
      label: "kiniskisreef.com \u2014 events & patio photos" },
    { href: "https://m.yelp.com/biz/kiniskis-reef-tavern-point-roberts",
      label: "Yelp \u2014 Kiniski\u2019s Reef Tavern reviews & photos" },
    { href: "https://www.tripadvisor.ca/Restaurant_Review-g58681-d4375086-Reviews-Kiniski_s_Reef_Tavern-Point_Roberts_Washington.html",
      label: "TripAdvisor \u2014 Kiniski\u2019s Reef Tavern" },
  ];
  LINKS.forEach((lk, i) => {
    const row = sEl("div", "sphoto-link-row");
    row.appendChild(sEl("span", "sphoto-link-num", String(i + 1)));
    const a = document.createElement("a");
    a.href = lk.href; a.target = "_blank"; a.rel = "noopener";
    a.className = "sphoto-link"; a.textContent = lk.label;
    row.appendChild(a);
    lw.appendChild(row);
  });
  c.appendChild(lw);
}

/* ── Slide 03: Conversion ── */
function slideConversion(c) {
  const cols = sWrap("s2col");
  const buying = sWrap("s2col-card dim");
  buying.innerHTML = `<h4>What you\'re buying</h4>`;
  ["A 1959 building assessed at $851K",
   "A bar operating as \"DRINK PLACES\" since ~1959",
   "Trailing bar revenue (irrelevant to club model)",
   "Bar customers — none of whom joined a club",
   "An on-premise liquor license (Class 12 or 14)",
   "Owner: Nicholas C. Kiniski"
  ].forEach(r => { const d=sEl("div","s2col-row"); d.textContent=r; buying.appendChild(d); });
  const building = sWrap("s2col-card bright");
  building.innerHTML = `<h4>What you\'re building</h4>`;
  ["A member-owned beach club — purpose-converted",
   "Year 1: zero members, zero revenue (greenfield)",
   "New income model: dues + F&B + events",
   "Members must be recruited from scratch",
   "Class 6 Club License — WA (new application)",
   "Renovation required: $250K–$500K [E]"
  ].forEach(r => { const d=sEl("div","s2col-row"); d.textContent=r; building.appendChild(d); });
  cols.appendChild(buying); cols.appendChild(building); c.appendChild(cols);
  c.appendChild(sEl("div","shighlight",
    '<span class="sbold">The bar\'s trailing revenue does not justify club revenue projections.</span> The existing business is only useful for: (a) whether the liquor license transfers to a members club use, (b) what the physical plant costs to operate, and (c) what the seller is actually selling.'));
  c.appendChild(sEl("div","srisk",
    '<span class="sbold">Transition risk:</span> Zero revenue during conversion. Carry costs run regardless — debt service + property tax + utilities + insurance for 15–18 months = <span class="sbold">estimated $150–200K [E]</span> before the first member walks in.'));
}

/* ── Slide 04: The Penclave ── */
function slidePenclave(c) {
  const d = sWrap("penclave-diagram");
  const us = sWrap("pcl-side us-side");
  us.innerHTML = `
    <div class="pcl-label">US Member — Bellingham WA</div>
    <div class="pcl-big">4×</div>
    <div class="pcl-desc">border crossings per round trip</div>
    <div class="pcl-steps">
      <span class="pcl-node">WA mainland</span><span class="pcl-arrow">→</span>
      <span class="pcl-border">BORDER</span><span class="pcl-arrow">→</span>
      <span class="pcl-node">Canada</span><span class="pcl-arrow">→</span>
      <span class="pcl-border">BORDER</span><span class="pcl-arrow">→</span>
      <span class="pcl-node">Point Roberts</span>
    </div>
    <div class="pcl-steps">
      <span class="pcl-node">Point Roberts</span><span class="pcl-arrow">→</span>
      <span class="pcl-border">BORDER</span><span class="pcl-arrow">→</span>
      <span class="pcl-node">Canada</span><span class="pcl-arrow">→</span>
      <span class="pcl-border">BORDER</span><span class="pcl-arrow">→</span>
      <span class="pcl-node">WA mainland</span>
    </div>
    <div class="pcl-desc" style="margin-top:8px">2–5 hrs total travel in summer</div>`;
  const ca = sWrap("pcl-side ca-side");
  ca.innerHTML = `
    <div class="pcl-label">Canadian Member — Tsawwassen BC</div>
    <div class="pcl-big">1×</div>
    <div class="pcl-desc">border crossing per round trip</div>
    <div class="pcl-steps">
      <span class="pcl-node">Tsawwassen BC</span><span class="pcl-arrow">→</span>
      <span class="pcl-border">BORDER</span><span class="pcl-arrow">→</span>
      <span class="pcl-node">Point Roberts</span>
    </div>
    <div class="pcl-steps" style="margin-top:6px">
      <span class="pcl-node">20,933 people</span>
      <span class="pcl-arrow">·</span>
      <span class="pcl-node">5–10 min drive</span>
    </div>
    <div class="pcl-desc" style="margin-top:8px;color:#3a8060">Most accessible market = foreign nationals</div>`;
  d.appendChild(us); d.appendChild(ca); c.appendChild(d);
  c.appendChild(sEl("div","shighlight",
    '<span class="sbold">Key implication:</span> US membership is a secondary market. 4 crossings per round trip + 30–90 min peak wait times each direction = up to 5 hours of travel for a beach club visit. US members will visit far less frequently than any non-penclave comparable. Do not use mainland club visit-frequency assumptions.'));
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Other structural dependencies"));
  const rows = [
    ["Water supply",     "Sourced from Greater Vancouver Water District (Delta, BC) — confirmed [V]"],
    ["Supply chain",     "Every delivery through Canadian customs. +8–15% COGS premium [E]"],
    ["Fire coverage",    "Volunteer fire dept + Delta Fire Dept cross-border assistance [V]"],
    ["Local labor",      "Year-round population: 1,191 (median age 52.7). Not a hospitality labor pool."],
    ["Real estate exit", "Buyer pool limited to penclave-accepting purchasers. Suppressed floor value."],
  ];
  const tbl = sEl("table","gono-tbl");
  rows.forEach(([dep, note]) => {
    const tr = sEl("tr");
    tr.innerHTML = `<td class="cond-col" style="width:150px;font-size:12px">${dep}</td><td class="thresh-col">${note}</td>`;
    tbl.appendChild(tr);
  });
  cw.appendChild(tbl); c.appendChild(cw);
}

/* ── Slide 05: Addressable Market ── */
function slideMarket(c) {
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Addressable market by segment — population and access friction"));
  const cd = sEl("div"); cd.id="sm-chart"; cw.appendChild(cd);
  cw.appendChild(sNote("[V] Statistics Canada 2021, US Census 2020. Tier 1 = directly adjacent, 1 crossing, ≤20 min. Tier 2 = 1 crossing but competing with border-free local beaches. US = 4 crossings per visit."));
  c.appendChild(cw);
  const segs = [
    { label:"Metro Van (Tier 2)",    pop:1700000, type:"ca-far"  },
    { label:"Vancouver city",        pop: 675000, type:"ca-far"  },
    { label:"Surrey",                pop: 590000, type:"ca-far"  },
    { label:"Whatcom Co. US",        pop: 230000, type:"us"      },
    { label:"Richmond BC",           pop: 232000, type:"ca-far"  },
    { label:"White Rock / S Surrey", pop: 110000, type:"ca-near" },
    { label:"Ladner",                pop:  21112, type:"ca-near" },
    { label:"Tsawwassen",            pop:  20933, type:"ca-near" },
  ].sort((a,b) => b.pop - a.pop);
  const colors = { "ca-near":"#4caf50", "ca-far":"rgba(74,175,80,0.35)", "us":"#e07840" };
  const W=sVizW(), H=280, ml=185, mr=95, mt=12, mb=10;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x=d3.scaleLinear().domain([0,d3.max(segs,d=>d.pop)]).range([0,bw]);
  const y=d3.scaleBand().domain(segs.map(d=>d.label)).range([0,bh]).padding(0.3);
  const svg=d3.select("#sm-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);
  const nearLabels=segs.filter(d=>d.type==="ca-near").map(d=>d.label);
  if (nearLabels.length) {
    const y0=y(nearLabels[0]), y1=y(nearLabels[nearLabels.length-1])+y.bandwidth();
    svg.append("rect").attr("x",-ml+8).attr("width",bw+ml-8).attr("y",y0-5).attr("height",y1-y0+10)
      .attr("fill","rgba(76,175,80,0.07)").attr("rx",3);
    svg.append("text").attr("x",bw+6).attr("y",(y0+y1)/2+4)
      .attr("fill","#4caf50").attr("font-size","10px").attr("font-weight","700").text("Tier 1");
  }
  svg.selectAll("rect.bar").data(segs).join("rect").attr("class","bar")
    .attr("y",d=>y(d.label)).attr("height",y.bandwidth())
    .attr("x",0).attr("width",0).attr("rx",3)
    .attr("fill",d=>colors[d.type]).attr("opacity",0.9)
    .transition().duration(700).delay((_,i)=>i*70).attr("width",d=>x(d.pop));
  svg.selectAll(".lbl").data(segs).join("text").attr("class","lbl")
    .attr("x",-6).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("text-anchor","end").attr("fill","#7090a8").attr("font-size","11px").text(d=>d.label);
  svg.selectAll(".popval").data(segs).join("text").attr("class","popval")
    .attr("x",d=>x(d.pop)+6).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("fill",d=>colors[d.type]).attr("font-size","11px").attr("font-weight","600")
    .text(d=>d.pop>=1e6?(d.pop/1e6).toFixed(1)+"M":(d.pop/1000).toFixed(0)+"K");
  c.appendChild(sEl("div","shighlight",
    '<span class="sbold">Primary realistic market:</span> ~152K people (Tier 1 Canadian) within 20 min + 1 crossing. <span class="sbold">US addressable:</span> ~30K realistic candidates from Whatcom County — highly friction-limited. Model <em>must</em> show the scenario where Canadian demand drops 30% (2025 tariff baseline, documented).'));
}

/* ── Slide 06: Border Risk ── */
function slideClosure(c) {
  const grid = sWrap("sstat-grid");
  [{ v:"17 months", k:"Border closure, March 2020 – Aug 2021 [V]", cls:"s-warn" },
   { v:"–80%",      k:"Point Roberts business revenue lost [V]",    cls:"s-warn" },
   { v:"–30%",      k:"Canadian visitors, 2025 tariff event [V]",   cls:"s-warn" }]
  .forEach(s => { const d=sEl("div","sstat "+s.cls); d.innerHTML=`<div class="sv">${s.v}</div><div class="sk">${s.k}</div>`; grid.appendChild(d); });
  c.appendChild(grid);
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Point Roberts revenue capacity over time (schematic)"));
  const cd = sEl("div"); cd.id="sc-chart"; cw.appendChild(cd);
  cw.appendChild(sNote("[V] Border closure March 2020–August 2021 (Wikipedia, CBC News). \"Ghost town\" — 80% revenue loss (local chamber of commerce, CBC Sep 2020). Feb 2021: Canada waived COVID testing for PR residents after WA state negotiations. 2025 tariff events: Guardian June 2025."));
  c.appendChild(cw);
  const pts = [
    {t:0,  rev:100},{t:1,  rev:100},
    {t:1.24,rev:100},{t:1.26,rev:20},
    {t:1.6, rev:22},{t:2.1, rev:26},
    {t:2.58,rev:26},{t:2.62,rev:78},
    {t:3,  rev:88},{t:4,  rev:100},
    {t:5.24,rev:100},{t:5.26,rev:70},
    {t:6,  rev:70},
  ];
  const W=sVizW(), H=190, ml=36, mr=16, mt=12, mb=28;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x=d3.scaleLinear().domain([0,6]).range([0,bw]);
  const y=d3.scaleLinear().domain([0,115]).range([bh,0]);
  const svg=d3.select("#sc-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);
  svg.append("rect").attr("x",x(1.24)).attr("width",x(2.62)-x(1.24)).attr("y",0).attr("height",bh).attr("fill","rgba(224,80,64,0.1)");
  svg.append("text").attr("x",(x(1.24)+x(2.62))/2).attr("y",bh-4).attr("text-anchor","middle").attr("fill","#e05040").attr("font-size","10px").attr("font-weight","700").text("17 MONTHS CLOSED");
  svg.append("rect").attr("x",x(5.24)).attr("width",bw-x(5.24)).attr("y",0).attr("height",bh).attr("fill","rgba(212,176,64,0.1)");
  svg.append("text").attr("x",(x(5.24)+bw)/2-8).attr("y",14).attr("text-anchor","middle").attr("fill","#d4b040").attr("font-size","9px").text("tariffs");
  const area=d3.area().x(d=>x(d.t)).y0(bh).y1(d=>y(d.rev)).curve(d3.curveMonotoneX);
  svg.append("path").datum(pts).attr("fill","rgba(76,175,80,0.12)").attr("d",area);
  const ln=d3.line().x(d=>x(d.t)).y(d=>y(d.rev)).curve(d3.curveMonotoneX);
  const p=svg.append("path").datum(pts).attr("fill","none").attr("stroke","#4caf50").attr("stroke-width",2).attr("d",ln);
  const len=p.node().getTotalLength();
  p.attr("stroke-dasharray",len).attr("stroke-dashoffset",len).transition().duration(1200).attr("stroke-dashoffset",0);
  const years=["2019","2020","2021","2022","2023","2024","2025","2026"];
  years.forEach((yr,i) => svg.append("text").attr("x",x(i)).attr("y",bh+14).attr("text-anchor","middle").attr("fill","#5a7a94").attr("font-size","10px").text(yr));
  svg.append("g").call(d3.axisLeft(y).ticks(4).tickFormat(d=>d+"%")).selectAll("text").attr("fill","#5a7a94").attr("font-size","10px");
  svg.selectAll(".domain,.tick line").attr("stroke","#1e3048");
  c.appendChild(sEl("div","srisk",
    '<span class="sbold">This is not a tail risk — it is a documented recent event.</span> A border closure happened and lasted 17 months. Any financial model must include a closure scenario. Estimate: <span class="sbold">$700K–$1M cash reserve required [E]</span> to survive an 18-month closure at near-zero Canadian revenue.'));
}

/* ── Slide 07: The Season ── */
function slideSeason(c) {
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Monthly revenue potential vs. fixed cost floor (relative %)"));
  const cd = sEl("div"); cd.id="ss-chart"; cw.appendChild(cd);
  cw.appendChild(sNote("[E] Revenue profile from Delta/Tsawwassen climate normals (Environment Canada 1981–2010). Beach weather (≥19°C avg high, low rain) = mid-June through mid-September ≈ 13 weeks. Cost floor = fixed charges (debt, labor overhead, tax, insurance) as % of peak revenue capacity — runs year-round."));
  c.appendChild(cw);
  const mos = [{m:"Jan",r:8},{m:"Feb",r:8},{m:"Mar",r:12},{m:"Apr",r:18},{m:"May",r:32},
               {m:"Jun",r:62},{m:"Jul",r:100},{m:"Aug",r:98},{m:"Sep",r:60},
               {m:"Oct",r:22},{m:"Nov",r:10},{m:"Dec",r:8}];
  const beach=["Jun","Jul","Aug","Sep"], cf=50;
  const W=sVizW(), H=200, ml=40, mr=10, mt=14, mb=28;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x=d3.scaleBand().domain(mos.map(d=>d.m)).range([0,bw]).padding(0.2);
  const y=d3.scaleLinear().domain([0,115]).range([bh,0]);
  const svg=d3.select("#ss-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);
  const bx0=x("Jun"), bx1=x("Sep")+x.bandwidth();
  svg.append("rect").attr("x",bx0-2).attr("width",bx1-bx0+4).attr("y",-4).attr("height",bh+4).attr("fill","rgba(240,192,64,0.07)").attr("rx",3);
  svg.append("text").attr("x",(bx0+bx1)/2).attr("y",-1).attr("text-anchor","middle").attr("fill","#f0c040").attr("font-size","9px").attr("font-weight","700").text("← 13-week beach season →");
  svg.selectAll("rect.bar").data(mos).join("rect").attr("class","bar")
    .attr("x",d=>x(d.m)).attr("width",x.bandwidth())
    .attr("y",bh).attr("height",0).attr("rx",2)
    .attr("fill",d=>beach.includes(d.m)?"#f0c040":"#3a6080").attr("opacity",0.85)
    .transition().duration(600).delay((_,i)=>i*50)
    .attr("y",d=>y(d.r)).attr("height",d=>bh-y(d.r));
  svg.append("line").attr("x1",0).attr("x2",bw).attr("y1",y(cf)).attr("y2",y(cf)).attr("stroke","#e05040").attr("stroke-width",1.5).attr("stroke-dasharray","4,3");
  svg.append("text").attr("x",bw+4).attr("y",y(cf)+4).attr("fill","#e05040").attr("font-size","9px").text("costs");
  svg.append("g").attr("transform",`translate(0,${bh})`).call(d3.axisBottom(x)).selectAll("text").attr("fill","#5a7a94").attr("font-size","10px");
  svg.append("g").call(d3.axisLeft(y).ticks(4).tickFormat(d=>d+"%")).selectAll("text").attr("fill","#5a7a94").attr("font-size","10px");
  svg.selectAll(".domain,.tick line").attr("stroke","#1e3048");
  c.appendChild(sEl("div","shighlight",
    '<span class="sbold">Critical structure:</span> Fixed costs run 12 months. Revenue is concentrated in 13 weeks. The model must be built month-by-month — not as an annual average. The off-season question is: can dues alone cover fixed costs October–May, or does the club need to suspend operations?'));
}

/* ── Slide 08: Cost Stack ── */
function slideCosts(c) {
  const M = MODEL;
  const costs = M.costs.map((x, i) => ({
    label: x.label,
    low:   i === 0 ? (x.baselineLo || x.lo) : x.lo,
    high:  i === 0 ? (x.baselineHi || x.hi) : x.hi,
    color: x.color,
  }));
  const tlo=costs.reduce((s,cc)=>s+cc.low,0), thi=costs.reduce((s,cc)=>s+cc.high,0);
  const grid = sWrap("sstat-grid");
  [{v:"$"+(tlo/1000).toFixed(0)+"K",k:"Annual cost floor [E]",cls:""},
   {v:"$"+(thi/1000).toFixed(0)+"K",k:"Annual cost ceiling [E]",cls:"s-warn"},
   {v:`${M.laborShareLo}\u2013${M.laborShareHi}%`,k:"Labor share of total costs [E]",cls:""}]
  .forEach(s => { const d=sEl("div","sstat "+s.cls); d.innerHTML=`<div class="sv">${s.v}</div><div class="sk">${s.k}</div>`; grid.appendChild(d); });
  c.appendChild(grid);
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Annual cost stack — low (solid) to high (faded) [E]"));
  const cd = sEl("div"); cd.id="sco-chart"; cw.appendChild(cd);
  const _reefC = STRATEGIC.find(s => s.id === "reef");
  cw.appendChild(sNote(`[E] Labor: GM $130–160K + 2–3 seasonal staff × 13 weeks, +25–40% penclave premium. No mortgage — 250 shares fund acquisition. Buyback reserve: liquidity pool for share exits. F&B COGS at 35% of $${Math.round(M.fbGross/1000)}K gross F&B/events revenue. Property tax ~1.1% of $${_reefC ? Math.round(_reefC.assessed/1000) : "—"}K assessed.`));
  c.appendChild(cw);
  const W=sVizW(), H=240, ml=170, mr=100, mt=8, mb=8;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x=d3.scaleLinear().domain([0,thi*1.05]).range([0,bw]);
  const y=d3.scaleBand().domain(costs.map(d=>d.label)).range([0,bh]).padding(0.3);
  const svg=d3.select("#sco-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);
  svg.selectAll(".bbg").data(costs).join("rect").attr("class","bbg")
    .attr("y",d=>y(d.label)).attr("height",y.bandwidth())
    .attr("x",0).attr("width",0).attr("rx",3)
    .attr("fill",d=>d.color).attr("opacity",0.22)
    .transition().duration(500).delay((_,i)=>i*60).attr("width",d=>x(d.high));
  svg.selectAll(".bfg").data(costs).join("rect").attr("class","bfg")
    .attr("y",d=>y(d.label)).attr("height",y.bandwidth())
    .attr("x",0).attr("width",0).attr("rx",3)
    .attr("fill",d=>d.color).attr("opacity",0.85)
    .transition().duration(500).delay((_,i)=>i*60).attr("width",d=>x(d.low));
  svg.selectAll(".lbl").data(costs).join("text").attr("class","lbl")
    .attr("x",-6).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("text-anchor","end").attr("fill","#7090a8").attr("font-size","11px").text(d=>d.label);
  svg.selectAll(".vr").data(costs).join("text").attr("class","vr")
    .attr("x",d=>x(d.high)+5).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("fill",d=>d.color).attr("font-size","10px")
    .text(d=>"$"+(d.low/1000).toFixed(0)+"–"+(d.high/1000).toFixed(0)+"K");
}

/* ── Slide 09: Automation ── */
function slideAutomation(c) {
  const M = MODEL, lc = M.costs[0];
  const blo = lc.baselineLo||lc.lo, bhi = lc.baselineHi||lc.hi;
  const grid = sWrap("sstat-grid");
  [{v:`$${(blo/1000)|0}\u2013${(bhi/1000)|0}K`,                         k:"Baseline labor (no automation) [E]",  cls:"s-warn"},
   {v:`$${(lc.lo/1000)|0}\u2013${(lc.hi/1000)|0}K`,                     k:"Automated labor model [E]",           cls:"s-ok"  },
   {v:`$${(M.laborSavingLo/1000)|0}\u2013${(M.laborSavingHi/1000)|0}K`, k:"Annual saving [E]",                   cls:"s-ok"  },
   {v:`$${(M.autoCapexLo/1000)|0}\u2013${(M.autoCapexHi/1000)|0}K`,     k:"Est. automation capex (in reno) [E]", cls:""      }]
  .forEach(s => { const d=sEl("div","sstat "+s.cls); d.innerHTML=`<div class="sv">${s.v}</div><div class="sk">${s.k}</div>`; grid.appendChild(d); });
  c.appendChild(grid);
  const cols = sWrap("s2col");
  const yes = sWrap("s2col-card bright");
  yes.innerHTML = `<h4>Automate — person adds nothing here</h4>`;
  [
    { t:"Member access",        n:"RFID/app gate. Works 24\u202f×\u202f7, survives no-show staff." },
    { t:"Grounds & lawn",       n:"Robot mowers overnight. Beachfront turf is significant." },
    { t:"Interior cleaning",    n:"Commercial robot vacuums between sessions." },
    { t:"Pool / spa chemistry", n:"Auto-dosing + robot cleaner. Liability risk if missed." },
    { t:"Food prep",            n:"Programmable kitchen equipment, portion control, batch cooking. Reduces prep labour heavily without touching the guest experience." },
    { t:"Security & monitoring",n:"Cameras + app alerts. Replaces overnight presence." },
    { t:"HVAC & energy",        n:"Occupancy sensors + smart zones. 1959 envelope = huge waste." },
    { t:"Reservations & booking",n:"Member app handles court/cabana/event slots." },
  ].forEach(r => {
    const d = sEl("div","s2col-row");
    d.innerHTML = `<strong style="color:#a0d8b0">${r.t}</strong> \u2014 ${r.n}`;
    yes.appendChild(d);
  });
  const no = sWrap("s2col-card dim");
  no.innerHTML = `<h4 style="color:#e07840">Keep human — presence is the product</h4>`;
  [
    { t:"Food & drink service", n:"Table service and bar presence is a core reason members pay $6–8K/yr. A robot bringing drinks signals budget motel, not somewhere worth belonging to." },
    { t:"Bartending",           n:"Wine and cocktail service is hospitality signal. One skilled bartender during peak hours is a feature, not a cost." },
    { t:"Event hosting",        n:"Members at events expect a human point of contact." },
    { t:"Membership sales",     n:"Founding members are recruited by a person they trust." },
    { t:"Guest greeting",       n:"First impression at arrival. Especially important for Canadian members seeing a US border operation." },
  ].forEach(r => {
    const d = sEl("div","s2col-row");
    d.innerHTML = `<strong style="color:#c08060">${r.t}</strong> \u2014 ${r.n}`;
    no.appendChild(d);
  });
  cols.appendChild(yes); cols.appendChild(no); c.appendChild(cols);
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Remaining staffing model post-automation [E]"));
  const rows = [
    ["Owner-operator / GM",       "1 person, lives locally or on-site. Full-time, year-round. Covers management, member relations, compliance."],
    ["Peak seasonal staff",        "2\u20133 people \u00d7 13 weeks only (bar service + floor). ~$40\u201396K total seasonal labour."],
    ["Year-round FTE beyond GM",   "Zero. Automation covers the gap."],
  ];
  const tbl = sEl("table","gono-tbl");
  rows.forEach(([role, note]) => {
    const tr = sEl("tr");
    tr.innerHTML = `<td class="cond-col" style="width:200px;font-size:12px">${role}</td><td class="thresh-col">${note}</td>`;
    tbl.appendChild(tr);
  });
  cw.appendChild(tbl); c.appendChild(cw);
  c.appendChild(sEl("div","shighlight",
    `Break-even impact: automation capex (~$${(M.autoCapexLo/1000)|0}\u2013${(M.autoCapexHi/1000)|0}K) is absorbed into the renovation budget. The $${(M.laborSavingLo/1000)|0}\u2013${(M.laborSavingHi/1000)|0}K/yr labour saving reduces the dues burden from ~$${Math.round(M.burdenBase/1000)}K to <span class="sbold">~$${Math.round(M.burdenAuto/1000)}K [E]</span> \u2014 shifting break-even from ~${M.mBaseBreak} members down to <span class="sbold">~${M.mAutoBreak} members at avg $${M.avgDues.toLocaleString()} dues [E]</span>.`));
}

/* ── Slide 10: Break-Even ── */
function slideBreakeven(c) {
  const M = MODEL;
  const burdenBase = M.burdenBase, burdenAuto = M.burdenAuto;
  const foundingN = M.foundingN, foundingDues = M.foundingDues, regDues = M.avgDues;
  const foundingContrib = M.foundingContrib;
  const burdenRemain    = M.burdenRemain;
  const mFoundBreak     = M.mFoundBreak;

  const grid = sWrap("sstat-grid");
  [{v:`~${M.mBaseBreak}`,                   k:`Baseline: members @ avg $${M.avgDues.toLocaleString()} dues [E]`,                         cls:"s-warn"},
   {v:`~${M.mAutoBreak}`,                   k:`Automated: members @ avg $${M.avgDues.toLocaleString()} dues [E]`,                        cls:"s-ok"  },
   {v:`~${Math.round(M.mFoundBreak)}`,      k:`Founding mix: ${M.foundingN}\u00d7$${(M.foundingDues/1000).toFixed(1)}K + rest@avg [E]`,  cls:""      },
   {v:`$${M.foundingDues.toLocaleString()}`, k:`Founding rate \u00b7 ${M.foundingN} spots [E]`,                                         cls:"s-ok"  },
   {v:`~$${Math.round(M.burdenAuto/1000)}K`, k:"Automated dues burden [E]",                                                              cls:""      },
   {v:`\u2212${M.burdenReduction}%`,        k:"Burden reduction from automation",                                                       cls:"s-ok"  }]
  .forEach(s => { const d=sEl("div","sstat "+s.cls); d.innerHTML=`<div class="sv">${s.v}</div><div class="sk">${s.k}</div>`; grid.appendChild(d); });
  c.appendChild(grid);

  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Required dues per member to break even — baseline · automated · founding mix [E]"));
  const cd = sEl("div"); cd.id="sbe-chart"; cw.appendChild(cd);
  const laborDelta = M.laborBaseMid - M.laborAutoMid;
  const extraM = Math.round(M.burdenRemain / M.avgDues);
  cw.appendChild(sNote(`[E] Baseline burden $${Math.round(M.burdenBase/1000)}K (baseline labor, no debt). Automated $${Math.round(M.burdenAuto/1000)}K (\u2212$${Math.round(laborDelta/1000)}K labor). Founding mix: ${M.foundingN}\u00d7$${M.foundingDues.toLocaleString()} = $${(M.foundingContrib/1000).toFixed(1)}K \u2192 remaining $${(M.burdenRemain/1000).toFixed(1)}K \u00f7 $${M.avgDues.toLocaleString()} = ${extraM} more regular members \u2192 ${Math.round(M.mFoundBreak)} total. Share funding eliminates mortgage \u2014 no debt service in burden. F&B/events ($${Math.round(M.fbGross/1000)}K gross) offset costs directly.`));
  c.appendChild(cw);

  const mrng = d3.range(20, 151, 5);
  const ptsBase = mrng.map(m => ({m, d: burdenBase / m}));
  const ptsAuto = mrng.map(m => ({m, d: burdenAuto / m}));
  const mrngF = d3.range(foundingN + 2, 151, 2);
  const ptsFnd = mrngF.map(m => ({m, d: burdenRemain / (m - foundingN)}));

  const W=sVizW(), H=220, ml=58, mr=24, mt=20, mb=32;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x = d3.scaleLinear().domain([20, 150]).range([0, bw]);
  const yMax = d3.max(ptsBase, d => d.d) * 1.1;
  const y = d3.scaleLinear().domain([0, yMax]).range([bh, 0]);
  const svg = d3.select("#sbe-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);

  svg.append("defs").append("clipPath").attr("id","sbe-clip")
    .append("rect").attr("width", bw).attr("height", bh);

  svg.append("rect").attr("x",x(40)).attr("width",x(85)-x(40)).attr("y",0).attr("height",bh).attr("fill","rgba(76,175,80,0.08)");
  svg.append("text").attr("x",(x(40)+x(85))/2).attr("y",12).attr("text-anchor","middle").attr("fill","#4caf50").attr("font-size","9px").attr("font-weight","700").text("← viable zone →");

  const lf = d3.line().x(d=>x(d.m)).y(d=>y(d.d)).curve(d3.curveCatmullRom);

  svg.append("path").datum(ptsBase).attr("fill","none").attr("stroke","#f0c040")
    .attr("stroke-width",1.5).attr("stroke-dasharray","5,4").attr("opacity",0.6).attr("d",lf);
  svg.append("text").attr("x",x(30)).attr("y",y(burdenBase/30)+12)
    .attr("fill","#a08030").attr("font-size","9px").text("baseline");

  const pa = svg.append("path").datum(ptsAuto).attr("fill","none").attr("stroke","#4caf50")
    .attr("stroke-width",2.5).attr("d",lf);
  const ln = pa.node().getTotalLength();
  pa.attr("stroke-dasharray",ln).attr("stroke-dashoffset",ln)
    .transition().duration(900).attr("stroke-dashoffset",0);
  svg.append("text").attr("x",x(30)).attr("y",y(burdenAuto/30)+12)
    .attr("fill","#4caf50").attr("font-size","9px").attr("font-weight","700").text("automated");

  const lfDef = d3.line().defined(d => y(d.d) >= 0 && y(d.d) <= bh)
    .x(d=>x(d.m)).y(d=>y(d.d)).curve(d3.curveCatmullRom);
  const pf = svg.append("path").datum(ptsFnd).attr("fill","none").attr("stroke","#7ab5d8")
    .attr("stroke-width",2).attr("stroke-dasharray","6,3")
    .attr("clip-path","url(#sbe-clip)").attr("d",lfDef);
  const lnF = pf.node().getTotalLength();
  pf.attr("stroke-dashoffset",lnF).transition().delay(300).duration(900).attr("stroke-dashoffset",0);
  const lblFndM = 80;
  svg.append("text").attr("x",x(lblFndM)).attr("y",y(burdenRemain/(lblFndM-foundingN))-7)
    .attr("fill","#7ab5d8").attr("font-size","9px").attr("font-weight","700").text("founding mix");

  svg.append("line").attr("x1",x(mFoundBreak)).attr("x2",x(mFoundBreak))
    .attr("y1",y(regDues)).attr("y2",bh).attr("stroke","#4a80a8").attr("stroke-dasharray","3,3");
  svg.append("circle").attr("cx",x(mFoundBreak)).attr("cy",y(regDues)).attr("r",3.5).attr("fill","#7ab5d8");
  svg.append("text").attr("x",x(mFoundBreak)+5).attr("y",y(regDues)-7)
    .attr("fill","#7ab5d8").attr("font-size","9px").attr("font-weight","700")
    .text(`~${Math.round(mFoundBreak)} total`);

  const ma6 = burdenAuto / regDues, mb6 = burdenBase / regDues;
  svg.append("line").attr("x1",x(mb6)).attr("x2",x(mb6)).attr("y1",y(regDues)).attr("y2",bh)
    .attr("stroke","#5a4020").attr("stroke-dasharray","3,3");
  svg.append("line").attr("x1",x(ma6)).attr("x2",x(ma6)).attr("y1",y(regDues)).attr("y2",bh)
    .attr("stroke","#2a5030").attr("stroke-dasharray","3,3");

  const arrowY = y(regDues) - 28;
  svg.append("line").attr("x1",x(ma6)+2).attr("x2",x(mb6)-2).attr("y1",arrowY).attr("y2",arrowY)
    .attr("stroke","#f0c040").attr("stroke-width",1.5);
  svg.append("text").attr("x",(x(ma6)+x(mb6))/2).attr("y",arrowY-4)
    .attr("text-anchor","middle").attr("fill","#f0c040").attr("font-size","9px").attr("font-weight","700")
    .text(`−${Math.round(mb6-ma6)} members`);

  svg.append("g").attr("transform",`translate(0,${bh})`).call(d3.axisBottom(x).ticks(7))
    .selectAll("text").attr("fill","#5a7a94").attr("font-size","10px");
  svg.append("text").attr("x",bw/2).attr("y",bh+28).attr("text-anchor","middle")
    .attr("fill","#5a7a94").attr("font-size","10px").text("Members");
  svg.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d=>"$"+Math.round(d/1000)+"K"))
    .selectAll("text").attr("fill","#5a7a94").attr("font-size","10px");
  svg.selectAll(".domain,.tick line").attr("stroke","#1e3048");
}

/* ── Slide 11: Capital Required ── */
function slideCapital(c) {
  const M = MODEL;
  const k = n => Math.round(n / 1000);
  const surplus = M.shareEquity - M.dealTotal;
  const grid = sWrap("sstat-grid");
  [{v:`$${k(M.askPrice).toLocaleString()}K`,                       k:"Acquisition price [G]",                       cls:""     },
   {v:`$${k(M.renovation)}K`,                                      k:"Renovation mid-estimate [E]",                 cls:""     },
   {v:`$${k(M.carry)}K`,                                           k:"Pre-revenue carry costs [E]",                 cls:""     },
   {v:`$${(M.dealTotal/1e6).toFixed(3).replace(/\.?0+$/,"")}M`,   k:"Total capital required",                      cls:"s-warn"},
   {v:`$${(M.shareEquity/1e6).toFixed(2)}M`,                      k:`Share equity — ${M.totalMembers} shares [G]`, cls:"s-ok" },
   {v:`+$${k(surplus)}K`,                                          k:"Surplus cushion above deal cost",             cls:"s-ok" }]
  .forEach(s => { const d=sEl("div","sstat "+s.cls); d.innerHTML=`<div class="sv">${s.v}</div><div class="sk">${s.k}</div>`; grid.appendChild(d); });
  c.appendChild(grid);
  const cw = sWrap("schart-wrap");
  cw.appendChild(sEl("div","schart-title","Deal cost components — share equity covers all three [G/E]"));
  const cd = sEl("div"); cd.id="scp-chart"; cw.appendChild(cd);
  cw.appendChild(sNote("[G] Acquisition price per MLS listing. [E] Renovation: $250–500K range, mid $375K (inspection required — OI-04). Carry: debt service + tax + utilities + insurance + misc over ~15 months."));
  c.appendChild(cw);
  const comps = [
    { label:"Acquisition",    val: M.askPrice,   color:"#f0c040" },
    { label:"Renovation [E]", val: M.renovation, color:"#7ab5d8" },
    { label:"Carry [E]",      val: M.carry,      color:"#e07840" },
  ];
  const total = M.dealTotal;
  const W=sVizW(), H=155, ml=145, mr=120, mt=8, mb=8;
  const bw=W-ml-mr, bh=H-mt-mb;
  const x=d3.scaleLinear().domain([0,total*1.1]).range([0,bw]);
  const y=d3.scaleBand().domain(comps.map(d=>d.label)).range([0,bh]).padding(0.35);
  const svg=d3.select("#scp-chart").append("svg").attr("width",W).attr("height",H)
    .append("g").attr("transform",`translate(${ml},${mt})`);
  svg.selectAll("rect").data(comps).join("rect")
    .attr("y",d=>y(d.label)).attr("height",y.bandwidth())
    .attr("x",0).attr("width",0).attr("rx",4)
    .attr("fill",d=>d.color).attr("opacity",0.85)
    .transition().duration(600).delay((_,i)=>i*120).attr("width",d=>x(d.val));
  svg.selectAll(".lbl").data(comps).join("text").attr("class","lbl")
    .attr("x",-6).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("text-anchor","end").attr("fill","#7090a8").attr("font-size","12px").text(d=>d.label);
  svg.selectAll(".vv").data(comps).join("text").attr("class","vv")
    .attr("x",d=>x(d.val)+7).attr("y",d=>y(d.label)+y.bandwidth()/2+4)
    .attr("fill",d=>d.color).attr("font-size","12px").attr("font-weight","700")
    .text(d=>"$"+(d.val/1000).toFixed(0)+"K");
  svg.append("line").attr("x1",x(total)).attr("x2",x(total)).attr("y1",-5).attr("y2",bh+5)
    .attr("stroke","#f0c040").attr("stroke-dasharray","4,3").attr("stroke-width",1.5);
  svg.append("text").attr("x",x(total)+6).attr("y",bh/2+4)
    .attr("fill","#f0c040").attr("font-size","12px").attr("font-weight","700")
    .text("Total: $"+(total/1000).toFixed(0)+"K");
  c.appendChild(sEl("div","srisk",
    `<span class="sbold">Bottom line:</span> ${M.totalMembers} shares at $${M.tiers[0].sharePx.toLocaleString()}\u2013$${M.tiers[1].sharePx.toLocaleString()} raise $${(M.shareEquity/1e6).toFixed(2)}M against a $${(M.dealTotal/1e6).toFixed(3).replace(/\.?0+$/,"")}M deal \u2014 no mortgage required. If the club fails, a penclave-discounted exit at ~$800K against $${k(M.askPrice)}K paid + $${k(M.renovation)}K renovation = <span class="sbold">~$${k(M.shareEquity - 800000)}K collective member loss [E]</span>. That is the downside you are accepting.`));
}

/* ── Slide 12: Go / No-Go ── */
function slideGoNoGo(c) {
  const M = MODEL;
  const k = n => Math.round(n / 1000);
  c.appendChild(sEl("div","schart-title","Rule 5 failure list — conditions that make the deal unworkable"));
  const cw = sWrap("schart-wrap");
  const tbl = sEl("table","gono-tbl");
  tbl.innerHTML = `
    <thead><tr><th>Condition</th><th>Threshold</th><th>Signal</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td class="cond-col">Liquor license transfer</td><td class="thresh-col">WSLCB denies Class 6 Club License application</td><td><span class="signal-stop">DEAL STOP</span></td><td class="thresh-col">Open — OI-02</td></tr>
      <tr><td class="cond-col">Renovation cost</td><td class="thresh-col">Actual cost &gt; $600K after inspection</td><td><span class="signal-stop">DEAL STOP</span></td><td class="thresh-col">Open — OI-04</td></tr>
      <tr><td class="cond-col">Founding membership</td><td class="thresh-col">&lt; 50 Founding shares ($${M.tiers[0].sharePx.toLocaleString()} each) committed before close</td><td><span class="signal-stop">DEAL STOP</span></td><td class="thresh-col">Not tested</td></tr>
      <tr><td class="cond-col">Canadian demand &lt;40%</td><td class="thresh-col">Tariff / political climate locks in \u221230% Canadian visitor loss</td><td><span class="signal-warn">RESTRUCTURE</span></td><td class="thresh-col">Active (2025)</td></tr>
      <tr><td class="cond-col">Border closure scenario</td><td class="thresh-col">Revenue \u2192 ~$0 for 17+ months (documented 2020\u20132021)</td><td><span class="signal-stop">STOP</span> w/o reserve</td><td class="thresh-col">Needs $700K\u2013$1M reserve</td></tr>
    </tbody>`;
  cw.appendChild(tbl); c.appendChild(cw);
  c.appendChild(sEl("div","shighlight",
    '<span class="sbold">Gate items before any model is trusted:</span> OI-02 (license class), OI-04 (building inspection). These are not optional — the model inputs are wrong without them.'));
  c.appendChild(sEl("div","srisk",
    `<span class="sbold">Maximum downside in a failed scenario:</span> Exit at penclave-discounted floor (~$800K) vs. $${k(M.askPrice)}K paid + $${k(M.renovation)}K renovation = <span class="sbold">~$${k(M.shareEquity - 800000)}K collective member loss [E]</span> (no mortgage \u2014 members own the asset outright). This is what you are accepting.`));
}
