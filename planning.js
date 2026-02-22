/* ─────────────────────────────────────────────────────────
   planning.js — Planning tab: model notes, D3 charts,
                 strategic list, partnerships panel
   Depends on: d3, model.js, strategic.js, map.js (all loaded before this)
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   MODEL-DRIVEN NOTES + TABLES
───────────────────────────────────────────────────────── */
function initPlanningNotes() {
  const M = MODEL;
  const k = n => Math.round(n / 1000);

  const feeNote = document.getElementById("note-fee-floor");
  if (feeNote) feeNote.textContent =
    `Dues set to cover costs: $${M.avgDues.toLocaleString()}/member avg across ${M.totalMembers} members. Break-even \u2248 ${M.mAutoBreak} members. Annual burden on dues: $${Math.round(M.burdenAuto).toLocaleString()} (after F&B).`;

  const revNote = document.getElementById("note-revenue");
  if (revNote) revNote.innerHTML =
    `${M.totalMembers} members; tier avg $${(M.avgDues/1000).toFixed(2).replace(/\.?0+$/,"")}K/yr dues ($${k(M.annualDues)}K total). F&amp;B adds $${k(M.fbGross)}K gross. Operating costs ~$${k(M.totalCostsAutoMid)}K/yr. Dues are set to cover costs — no surplus.`;

  const tb = document.getElementById("tiers-tbody");
  if (tb) tb.innerHTML = M.tiers.map((t, i) =>
    `<tr><td>${t.name}</td><td${i===0?' class="hi"':''}>$${t.sharePx.toLocaleString()}</td><td${i===0?' class="hi"':''}>$${t.dues.toLocaleString()}${i===0?' locked':''}</td><td>${t.cap}</td></tr>`
  ).join("");
}

/* ─────────────────────────────────────────────────────────
   D3 CHARTS
───────────────────────────────────────────────────────── */
function buildChartValuation() {
  const el = document.getElementById("chart-valuation");
  if (!el) return;
  const W = el.clientWidth || 330, H = 180;
  const margin = { top: 6, right: 60, bottom: 6, left: 130 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const data = STRATEGIC
    .filter(d => d.assessed > 0)
    .sort((a, b) => b.assessed - a.assessed);

  const x = d3.scaleLinear().domain([0, d3.max(data, d => d.assessed)]).range([0, w]);
  const y = d3.scaleBand().domain(data.map(d => d.id)).range([0, h]).padding(0.2);

  const svg = d3.select(el).append("svg")
    .attr("width", W).attr("height", H)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.selectAll("rect").data(data).join("rect")
    .attr("y",      d => y(d.id))
    .attr("height", y.bandwidth())
    .attr("x", 0).attr("width", 0)
    .attr("rx", 3)
    .attr("fill", d => d.color)
    .attr("opacity", 0.85)
    .transition().duration(700).delay((d, i) => i * 80)
    .attr("width", d => x(d.assessed));

  svg.selectAll(".label").data(data).join("text")
    .attr("class", "label")
    .attr("y", d => y(d.id) + y.bandwidth() / 2 + 4)
    .attr("x", -6)
    .attr("text-anchor", "end")
    .attr("fill", "#b0c4d8").attr("font-size", "10px")
    .text(d => d.name.replace("★ ", "").substring(0, 16));

  svg.selectAll(".val").data(data).join("text")
    .attr("class", "val")
    .attr("y", d => y(d.id) + y.bandwidth() / 2 + 4)
    .attr("x", d => x(d.assessed) + 5)
    .attr("fill", "#e8eaed").attr("font-size", "10px").attr("font-weight", "bold")
    .text(d => "$" + (d.assessed / 1e6).toFixed(1) + "M");
}

function buildChartFeeFloor() {
  const el = document.getElementById("chart-fee-floor");
  if (!el) return;
  const W = el.clientWidth || 330, H = 160;
  const margin = { top: 10, right: 20, bottom: 30, left: 56 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const M = MODEL;
  const burden = M.burdenAuto;
  const members = d3.range(25, M.totalMembers + 1, 5);
  const points = members.map(m => ({ m, dues: burden / m }));

  const x = d3.scaleLinear().domain([25, M.totalMembers]).range([0, w]);
  const y = d3.scaleLinear().domain([0, d3.max(points, d => d.dues) * 1.1]).range([h, 0]);

  const svg = d3.select(el).append("svg")
    .attr("width", W).attr("height", H)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Green target band 200-250
  svg.append("rect")
    .attr("x", x(200)).attr("width", x(250) - x(200))
    .attr("y", 0).attr("height", h)
    .attr("fill", "rgba(76,175,80,0.12)");

  svg.append("text").attr("x", x(225)).attr("y", 10)
    .attr("text-anchor", "middle").attr("fill", "#4caf50").attr("font-size", "9px")
    .text("target");

  svg.append("g").attr("transform", `translate(0,${h})`).call(
    d3.axisBottom(x).ticks(5).tickFormat(d => d)
  ).selectAll("text").attr("fill", "#5a7a94").attr("font-size", "10px");
  svg.selectAll(".domain, .tick line").attr("stroke", "#263545");

  svg.append("g").call(
    d3.axisLeft(y).ticks(4).tickFormat(d => "$" + Math.round(d / 1000) + "K")
  ).selectAll("text").attr("fill", "#5a7a94").attr("font-size", "10px");
  svg.selectAll(".domain, .tick line").attr("stroke", "#263545");

  const line = d3.line().x(d => x(d.m)).y(d => y(d.dues)).curve(d3.curveCatmullRom);
  const path = svg.append("path")
    .datum(points).attr("fill", "none")
    .attr("stroke", "#f0c040").attr("stroke-width", 2)
    .attr("d", line);

  const len = path.node().getTotalLength();
  path.attr("stroke-dasharray", len).attr("stroke-dashoffset", len)
    .transition().duration(900).attr("stroke-dashoffset", 0);

  svg.append("text").attr("x", w / 2).attr("y", h + 26)
    .attr("text-anchor", "middle").attr("fill", "#5a7a94").attr("font-size", "10px")
    .text("Members");
}

function buildChartRevenue() {
  const el = document.getElementById("chart-revenue");
  if (!el) return;
  const W = el.clientWidth || 330, H = 180;
  const margin = { top: 10, right: 20, bottom: 40, left: 16 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const M = MODEL;
  const items = [
    { label: "Dues",      value:  M.annualDues,                                    type: "in"  },
    { label: "F&B",       value:  M.fbLight,                                        type: "in"  },
    { label: "Events",    value:  M.fbEvents,                                       type: "in"  },
    { label: "Labor",     value: -M.laborAutoMid,                                   type: "out" },
    { label: "COGS",      value: -Math.round((M.costs[1].lo+M.costs[1].hi)/2),     type: "out" },
    { label: "Other Ops", value: -M.otherOpsMid,                                   type: "out" },
    { label: "Surplus",   value:  M.cashFlow,                                       type: "net" }
  ];

  const maxVal = d3.max(items, d => Math.abs(d.value));
  const x = d3.scaleBand().domain(items.map(d => d.label)).range([0, w]).padding(0.25);
  const y = d3.scaleLinear().domain([-maxVal * 1.05, maxVal * 1.05]).range([h, 0]);

  const svg = d3.select(el).append("svg")
    .attr("width", W).attr("height", H)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("line")
    .attr("x1", 0).attr("x2", w)
    .attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", "#263545").attr("stroke-width", 1);

  svg.selectAll("rect").data(items).join("rect")
    .attr("x",  d => x(d.label))
    .attr("width", x.bandwidth())
    .attr("rx", 3)
    .attr("y",      d => d.value >= 0 ? y(d.value) : y(0))
    .attr("height", d => Math.abs(y(d.value) - y(0)))
    .attr("fill",   d => d.type === "in" ? "#4caf50" : d.type === "out" ? "#e05040" : "#f0c040")
    .attr("opacity", 0)
    .transition().duration(600).delay((d, i) => i * 90)
    .attr("opacity", 0.85);

  svg.selectAll(".bar-label").data(items).join("text")
    .attr("class", "bar-label")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", d => d.value >= 0 ? y(d.value) - 3 : y(0) + Math.abs(y(d.value) - y(0)) + 11)
    .attr("text-anchor", "middle")
    .attr("fill", "#7ab5d8").attr("font-size", "9px")
    .text(d => (d.value >= 0 ? "+" : "") + Math.round(d.value / 1000) + "K");

  svg.selectAll(".x-label").data(items).join("text")
    .attr("class", "x-label")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", h + 14)
    .attr("text-anchor", "middle")
    .attr("fill", "#5a7a94").attr("font-size", "9px")
    .text(d => d.label);
}

/* ─────────────────────────────────────────────────────────
   STRATEGIC LIST  (Planning tab)
───────────────────────────────────────────────────────── */
function buildStrategicList() {
  const el = document.getElementById("strategic-list");
  if (!el) return;
  el.innerHTML = "";
  STRATEGIC.forEach(s => {
    const item = document.createElement("div");
    item.className = "strategic-item";
    const statusLabels = { target: "Target", stalled: "⚠ Stalled", watch: "Watch", open: "Open" };
    item.innerHTML = `
      <div class="si-dot" style="background:${s.color}"></div>
      <div class="si-info">
        <div class="si-name">${s.name}</div>
        <div class="si-status status-${s.status}">${statusLabels[s.status]}</div>
        <div class="si-note">${resolveAddress(s)}</div>
      </div>
      <div class="si-assessed">${s.assessed ? "$" + (s.assessed/1e6).toFixed(1) + "M" : "—"}</div>
    `;
    item.addEventListener("click", () => {
      const coords = resolveCoords(s);
      if (!coords) return;
      switchTab("map-panel");
      map.flyTo([coords.lat, coords.lng], 16, { duration: 1 });
      if (!strategicVisible) {
        strategicVisible = true;
        document.getElementById("strategic-toggle").textContent = "Hide Strategic";
        document.getElementById("strategic-toggle").classList.add("on");
        addStrategicMarkers();
      }
      setTimeout(() => {
        const m = strategicMarkers.find((_, i) => STRATEGIC[i].id === s.id);
        if (m) m.openPopup();
      }, 1100);
    });
    el.appendChild(item);
  });
}

/* ─────────────────────────────────────────────────────────
   PARTNERSHIPS PANEL  (from STRATEGIC[partnerReady])
───────────────────────────────────────────────────────── */
function buildPartnershipsPanel() {
  const el = document.getElementById("partnerships-list");
  if (!el || el.children.length) return;

  const ready = STRATEGIC.filter(s => s.partnerReady);
  if (!ready.length) {
    el.innerHTML = '<p class="partner-intro" style="color:#e07050">No properties are currently partner-ready. Set <code>partnerReady: true</code> in STRATEGIC once a property\'s identity and tenants are confirmed.</p>';
    return;
  }

  ready.forEach(s => {
    const card = document.createElement("div");
    card.className = "partner-card";
    card.innerHTML = `
      <div class="partner-card-head">
        <div class="partner-card-dot" style="background:${s.color}"></div>
        <div class="partner-card-meta">
          <div class="partner-card-name">${s.name}</div>
          <div class="partner-card-addr">${s.partnerAddr || s.address}</div>
        </div>
        <div class="partner-card-tag ptag-nearby">Open</div>
      </div>
      <div class="partner-card-body">
        <div class="partner-data-note">${s.note}</div>
        ${(s.partnerIdeas || []).map(idea => `
          <div class="partner-idea">
            <span class="partner-idea-icon">${idea.icon}</span>
            <div class="partner-idea-text"><strong>${idea.title}</strong> ${idea.body}</div>
          </div>
        `).join("")}
      </div>
    `;
    el.appendChild(card);
  });
}
