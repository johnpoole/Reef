/* =====================================================================
   THE REEF — Point Roberts Beach Club  |  1334 Gulf Rd, Point Roberts WA
   Financial Model  |  model.js
   Last updated: 2026-02-22

   !! CONSTRAINT — DO NOT CHANGE WITHOUT EXPLICIT INSTRUCTION !!
   Dues are an assessment, not a revenue source.
   Set dues to cover operating costs only. No surplus. No reserves.
   Do not raise dues to generate profit, justify a reserve, or
   "smooth" any unexplained overage.
   !! END CONSTRAINT !!

   Confidence codes:
     [G]  = Given — contractual or public record (MLS, county assessor)
     [E]  = Estimate — requires verification before reliance
     [I]  = Industry standard assumption

   Structure:
     I.   Sources & Uses of Funds
     II.  Pro Forma Income Statement (Year 2, steady-state)
     III. Computed values — do not edit

   Edit inputs in Sections I and II only.
   ===================================================================== */

const MODEL = {

/* =====================================================================
   I.  SOURCES & USES OF FUNDS
   Demonstrates that share equity covers acquisition cost in full.
   No debt is assumed in this model.
   ===================================================================== */

  // ── SOURCES: Share Equity ────────────────────────────────────────────
  //   sharePx   one-time share purchase price per member
  //   dues      annual recurring dues (see Section II)
  //   cap       structural maximum memberships (hard ceiling)
  //   count     Year-2 operating assumption used throughout model

  tiers: [
    { name: "Founding",     sharePx:  6_000, dues:   600, cap: 100, count: 100 },  // [E] discounted — pre-launch commitment reward
    { name: "Full",         sharePx: 10_000, dues:   900, cap: 150, count: 100 },  // [E]
    { name: "Non-resident", sharePx:  7_000, dues:   650, cap:  50, count:  50 },  // [E]
  ],
  //  Annual dues:  100×$600 + 100×$900 + 50×$650 = $182,500
  //  F&B gross:    $255,000
  //  Total income: $437,500
  //  Total costs:  ~$438,000
  //  Surplus:      ~$0  ← dues are set to cover costs, not generate profit

  // ── USES: Acquisition & Pre-Opening Costs ───────────────────────────
  askPrice:    1_375_000,   // Purchase price, 1334 Gulf Rd               [G]
  renovation:    375_000,   // Renovation; range $250K–$500K              [E] OI-04
  carry:         175_000,   // Pre-revenue carry (~15 months)             [E]
                            //   Debt service / holding    $  89,000
                            //   Property tax              $  20,000
                            //   Utilities                 $  12,000
                            //   Insurance                 $  15,000
                            //   Miscellaneous             $  39,000
                            //   ─────────────────────────────────────
                            //   Total carry               $ 175,000
  //  Total uses:   $1,375,000 + $375,000 + $175,000 = $1,925,000
  //  Surplus:      $1,950,000 − $1,925,000           =    $25,000


/* =====================================================================
   II.  PRO FORMA INCOME STATEMENT  (Year 2, steady-state)
        Basis: 250 members per tier mix above. No debt service.
   =====================================================================

   REVENUE
   ─────────────────────────────────────────────────────────────────── */

  //  Membership dues revenue — computed from tiers in Section I.
  //  (see Section III: annualDues)

  fbLight:       175_000,   // Food & beverage, light service / bar      [E]
  fbEvents:       80_000,   // Food & beverage, private events           [E]
  //  Total F&B:          $175,000 + $80,000                 = $255,000
  //  Total revenue:      dues $910,000 + F&B $255,000       = $1,165,000

  /* ──────────────────────────────────────────────────────────────────
   COST OF REVENUE (COGS)
   ────────────────────────────────────────────────────────────────── */

  fbCOGSRate:       0.35,   // F&B cost of goods sold rate               [I]
  //  F&B COGS:           35% × $255,000                     =   $89,250
  //  Gross profit:       $1,165,000 − $89,250               = $1,075,750

  /* ──────────────────────────────────────────────────────────────────
   OPERATING EXPENSES
   Ranges shown: lo = floor, hi = ceiling (automated staffing model).
   Labor line also carries a no-automation baseline for comparison.
   color field is for chart rendering only — not a financial input.
   ────────────────────────────────────────────────────────────────── */

  costs: [
    // ── Labor ────────────────────────────────────────────────────────────────
    // Basis: WA minimum wage 2026 = $17.13/hr (L&I, confirmed 2026-02-22).
    // Automation model: GM + 1–2 PT bar/service + payroll taxes.
    // Baseline: same GM, 3–4 FTE bar/FOH, 1 PT cleaning — no self-service.
    { label: "Labor",
      lo: 160_000, hi: 230_000, baselineLo: 290_000, baselineHi: 365_000, color: "#f0c040",  // [E]
      detail: [
        { label: "GM / Operations Manager (salaried)",
          lo:  75_000, hi:  85_000, confidence: "E",
          note: "~$36–$41/hr equiv. Competitive for remote WA market." },
        { label: "Bar & service staff (hourly, auto model)",
          lo:  55_000, hi: 100_000, confidence: "E",
          note: "1–2 PT bartenders + event coverage. $17.13/hr × 20–35 hrs × 52 wks × 1–2 staff." },
        { label: "Payroll taxes + WA L&I + unemployment",
          lo:  18_000, hi:  35_000, confidence: "I",
          note: "FICA 7.65% + WA L&I ~2% + WA UI ~1.5% ≈ 11–12% of gross wages." },
      ],
      baselineDetail: [
        { label: "GM / Operations Manager (salaried)",      lo:  75_000, hi:  85_000 },
        { label: "Bar + front-of-house (3–4 FTE)",          lo: 170_000, hi: 220_000,
          note: "3–4 FTE × $17.13/hr × 40 hrs × 52 wks + OT allowance." },
        { label: "Cleaning / back-of-house (1 PT)",         lo:  20_000, hi:  30_000 },
        { label: "Payroll taxes + WA L&I + unemployment",   lo:  25_000, hi:  30_000 },
      ],
    },
    // ── F&B COGS ─────────────────────────────────────────────────────────────
    // Derived from fbCOGSRate (35%). No subcategories — single rate applied to fbGross.
    { label: "F&B COGS (35%)",       lo:  75_000, hi: 105_000, color: "#7ab5d8" },  // [I]
    // ── Buyback reserve ──────────────────────────────────────────────────────
    // Structural — no real-world rate source. Amount set by policy, not market.
    { label: "Buyback reserve",      lo:  20_000, hi:  40_000, color: "#e07840" },  // [E]
    // ── Maintenance / repair ─────────────────────────────────────────────────
    // Industry benchmark: 1–2% of building value/yr on older commercial stock.
    // 1334 Gulf Rd: 1959 build, 8,463 sqft. Higher end of range is prudent.
    { label: "Maintenance / repair", lo:  20_000, hi:  40_000, color: "#5a8a70",  // [E]
      detail: [
        { label: "HVAC, plumbing, electrical (routine)",
          lo:  10_000, hi:  20_000, confidence: "E",
          note: "1–2% of $850K–$1.75M building value. 1959 construction = higher draw." },
        { label: "Grounds, dock, beach access upkeep",
          lo:   5_000, hi:  12_000, confidence: "E" },
        { label: "Contingency / unplanned repairs",
          lo:   5_000, hi:   8_000, confidence: "E" },
      ],
    },
    // ── Utilities ────────────────────────────────────────────────────────────
    // NEEDS QUOTES: PSE (electric), Point Roberts Water District (water/sewer),
    // Wave/Consolidated (internet), propane supplier.
    // Point Roberts has no natural gas grid — propane for heating.
    { label: "Utilities",            lo:  24_000, hi:  36_000, color: "#5a8a70",  // [E]
      detail: [
        { label: "Electric — PSE small commercial",
          lo:  12_000, hi:  18_000, confidence: "E",
          note: "NEEDS PSE QUOTE. 8,463 sqft commercial bar. ~$1,000–$1,500/mo for similar WA coastal venues." },
        { label: "Water / sewer — Point Roberts Water District",
          lo:   4_800, hi:   7_200, confidence: "E",
          note: "NEEDS PRWD QUOTE. Bar use is high-draw (dishwasher, restrooms, bar sinks)." },
        { label: "Propane / heating fuel",
          lo:   3_000, hi:   5_000, confidence: "E",
          note: "NEEDS QUOTE. Point Roberts is not on natural gas grid. Propane assumed." },
        { label: "Internet / cable — Wave or Consolidated",
          lo:   2_400, hi:   3_600, confidence: "E",
          note: "NEEDS QUOTE. ~$200–$300/mo business plan estimated." },
        { label: "Garbage / recycling — Whatcom County",
          lo:   1_800, hi:   3_600, confidence: "E",
          note: "NEEDS QUOTE. Commercial bar rate, Whatcom County solid waste." },
      ],
    },
    // ── Insurance ────────────────────────────────────────────────────────────
    // NEEDS BROKER QUOTE. Liquor liability is the dominant line for any licensed
    // alcohol service. Coastal/waterfront location adds property surcharge.
    { label: "Insurance",            lo:  18_000, hi:  28_000, color: "#5a8a70",  // [E]
      detail: [
        { label: "Liquor liability",
          lo:   8_000, hi:  12_000, confidence: "E",
          note: "NEEDS QUOTE. WA clubs/taverns typically $6K–$14K/yr. Dominant line." },
        { label: "Commercial property (8,463 sqft, coastal)",
          lo:   5_000, hi:   9_000, confidence: "E",
          note: "NEEDS QUOTE. Coastal/waterfront adds surcharge over inland rates." },
        { label: "General liability",
          lo:   3_000, hi:   5_000, confidence: "E" },
        { label: "Directors & officers (member-owned entity)",
          lo:   1_500, hi:   2_500, confidence: "E" },
      ],
    },
    // ── Property tax ─────────────────────────────────────────────────────────
    // Current assessed value: $850,965 (Whatcom County assessor, prop_id 154423).
    // Whatcom Co. unincorporated levy ~$10.50/$1,000 → current bill ~$8,935/yr.
    // Model range anticipates post-renovation reassessment:
    //   $1,750,000 × $10.50/$1,000 = $18,375
    //   $2,100,000 × $10.50/$1,000 = $22,050
    // Range is reasonable IF renovation triggers reassessment to that level.
    // Confidence on levy rate: [E] — confirm against Whatcom Co. published levy schedule.
    { label: "Property tax",         lo:  18_000, hi:  22_000, color: "#5a8a70",  // [G/E]
      detail: [
        { label: "Current assessed $850,965 × ~$10.50/$1,000",
          lo:   8_900, hi:   8_900, confidence: "G",
          note: "Prop_id 154423. Levy rate ~$10.50/$1,000 — confirm against Whatcom Co. levy schedule." },
        { label: "Post-renovation reassessment (~$1.75M–$2.1M)",
          lo:  18_000, hi:  22_000, confidence: "E",
          note: "Model uses this range. Reassessment typically follows permitted renovation." },
      ],
    },
    // ── Admin / legal / licenses ─────────────────────────────────────────────
    { label: "Admin / legal / licenses", lo: 15_000, hi: 25_000, color: "#5a8a70",  // [E]
      detail: [
        { label: "WA LCB liquor license (annual)",
          lo:   1_000, hi:   4_000, confidence: "E",
          note: "Tavern (beer/wine) ~$1,070/yr; spirits/beer/wine restaurant ~$2K–$4K/yr; private club ~$900–$1,500/yr. Exact type TBD pending entity structure. CONFIRM WITH LCB." },
        { label: "Accounting / bookkeeping",
          lo:   6_000, hi:  10_000, confidence: "E" },
        { label: "Legal retainer (HOA / coop / nonprofit counsel)",
          lo:   4_000, hi:   8_000, confidence: "E" },
        { label: "Software — POS + club management",
          lo:   2_400, hi:   4_800, confidence: "E",
          note: "~$200–$400/mo. Club management (e.g. Jonas, Northstar) + POS terminal." },
        { label: "WA SOS annual report + misc state filings",
          lo:     200, hi:     500, confidence: "G",
          note: "WA LLC annual report fee: $71. 501(c)(7) nonprofit: $0 annual report." },
      ],
    },
  ],
  //  Total OpEx (auto model, mid):   ~$348K
  //  Total OpEx (baseline,  mid):    ~$476K
  //
  //  Income statement waterfall (Year 2, auto model, mid):
  //    Dues (250 members × avg $3,640):        = $910K
  //    F&B gross:                              = $255K
  //    Total revenue:                          = $437.5K
  //    Operating expenses (mid):               = ($438K)
  //    Net:                                    ~  $0
  //
  //  Dues are set to cover costs only. No surplus.

  /* ──────────────────────────────────────────────────────────────────
   CAPITAL EXPENDITURE — Automation (one-time, pre-opening)
   ────────────────────────────────────────────────────────────────── */

  autoCapexLo:    20_000,   // Self-service / POS system, low scenario   [E]
  autoCapexHi:    35_000,   // Self-service / POS system, high scenario  [E]

  /* ──────────────────────────────────────────────────────────────────
   LABOR SAVING FROM AUTOMATION  (annual, recurring)
   ────────────────────────────────────────────────────────────────── */

  laborSavingLo: 120_000,   // Annual saving vs. baseline, conservative  [E]
  laborSavingHi: 190_000,   // Annual saving vs. baseline, optimistic    [E]

  /* ──────────────────────────────────────────────────────────────────
   BREAK-EVEN SENSITIVITY INPUT
   ────────────────────────────────────────────────────────────────── */

  foundingN:          25,   // Minimum founding members assumed pre-open  [E]


/* =====================================================================
   III.  COMPUTED — do not edit below this line.
         All values derive from Sections I and II.
   ===================================================================== */

  // Sources & Uses
  get dealTotal()         { return this.askPrice + this.renovation + this.carry; },
  get shareEquity()       { return this.tiers.reduce((s,t) => s + t.sharePx * t.count, 0); },
  get surplus()           { return this.shareEquity - this.dealTotal; },

  // Membership
  get memberCap()         { return this.tiers.reduce((s,t) => s + t.cap,   0); },
  get totalMembers()      { return this.tiers.reduce((s,t) => s + t.count, 0); },

  // Revenue
  get annualDues()        { return this.tiers.reduce((s,t) => s + t.dues * t.count, 0); },
  get avgDues()           { return Math.round(this.annualDues / this.totalMembers); },
  get fbGross()           { return this.fbLight + this.fbEvents; },
  get totalRevenue()      { return this.annualDues + this.fbGross; },

  // Cost of Revenue
  get fbCOGS()            { return Math.round(this.fbGross * this.fbCOGSRate); },
  get grossProfit()       { return this.totalRevenue - this.fbCOGS; },

  // Operating Expenses
  get laborAutoMid()      { return Math.round((this.costs[0].lo + this.costs[0].hi) / 2); },
  get laborBaseMid()      { const c = this.costs[0]; return Math.round(((c.baselineLo || c.lo) + (c.baselineHi || c.hi)) / 2); },
  get totalCostsAutoMid() { return this.costs.reduce((s,c) => s + Math.round((c.lo + c.hi) / 2), 0); },
  get totalCostsBaseMid() {
    return this.costs.reduce((s, c, i) => {
      const lo = (i === 0 && c.baselineLo) ? c.baselineLo : c.lo;
      const hi = (i === 0 && c.baselineHi) ? c.baselineHi : c.hi;
      return s + Math.round((lo + hi) / 2);
    }, 0);
  },
  get costsTotalLo()      { return this.costs.reduce((s,c) => s + (c.baselineLo || c.lo), 0); },
  get costsTotalHi()      { return this.costs.reduce((s,c) => s + (c.baselineHi || c.hi), 0); },
  get otherOpsMid()       { return this.costs.slice(2).reduce((s,c) => s + Math.round((c.lo + c.hi) / 2), 0); },

  // Net Operating Income (EBITDA proxy)
  get cashFlow()          { return this.annualDues + this.fbGross - this.totalCostsAutoMid; },

  // Dues burden (operating costs not offset by F&B — must be covered by dues)
  get burdenAuto()        { return this.totalCostsAutoMid - this.fbGross; },
  get burdenBase()        { return this.totalCostsBaseMid - this.fbGross; },
  get burdenReduction()   { return Math.round((1 - this.burdenAuto / this.burdenBase) * 100); },

  // Labor as % of total costs
  get laborShareLo()      { return Math.round((this.costs[0].baselineHi || this.costs[0].hi) / this.costsTotalHi * 100); },
  get laborShareHi()      { return Math.round((this.costs[0].baselineLo || this.costs[0].lo) / this.costsTotalLo * 100); },

  // Break-even membership counts
  get mAutoBreak()        { return Math.round(this.burdenAuto / this.avgDues); },
  get mBaseBreak()        { return Math.round(this.burdenBase / this.avgDues); },
  get foundingDues()      { return this.tiers[0].dues; },
  get foundingContrib()   { return this.foundingN * this.foundingDues; },
  get burdenRemain()      { return this.burdenAuto - this.foundingContrib; },
  get mFoundBreak()       { return this.foundingN + this.burdenRemain / this.avgDues; },


/* =====================================================================
   IV.  OPENING BALANCE SHEET  (two snapshots)

   Snapshot A — At close (shares collected, property title transferred,
                          renovation not yet started):

     ASSETS
       Real property, at cost                      $1,375,000   [G]
       Cash held for renovation & carry              $575,000   [E]
       ─────────────────────────────────────────────────────────
       Total assets                                $1,950,000

     LIABILITIES
       Long-term debt                                       $0   no mortgage
       ─────────────────────────────────────────────────────────
       Total liabilities                                    $0

     MEMBERS' EQUITY
       Share capital — Founding  (100 × $6,000)     $600,000
       Share capital — Full      (100 × $10,000)  $1,000,000
       Share capital — Non-res.  ( 50 × $7,000)    $350,000
       ─────────────────────────────────────────────────────────
       Total members' equity                       $1,950,000
       ─────────────────────────────────────────────────────────
       Total liabilities + equity                  $1,950,000   ✓

   Snapshot B — Stabilized (post-renovation, pre-revenue operations):
                Renovation capitalized; carry expensed during pre-opening.

     ASSETS
       Real property + improvements                $1,750,000   [E]
       Cash surplus                                   $25,000   [E]
       ─────────────────────────────────────────────────────────
       Total assets                                $1,775,000

     LIABILITIES
       Long-term debt                                       $0
       ─────────────────────────────────────────────────────────
       Total liabilities                                    $0

     MEMBERS' EQUITY
       Share capital                               $1,950,000
       Pre-opening expense (carry, expensed)        ($175,000)  [E]
       Retained earnings                                    $0
       ─────────────────────────────────────────────────────────
       Total members' equity                       $1,775,000
       ─────────────────────────────────────────────────────────
       Total liabilities + equity                  $1,775,000   ✓
   ===================================================================== */

  // ── Balance Sheet — Snapshot A (at close) ───────────────────────────
  get bs_propertyAtCost()       { return this.askPrice; },
  get bs_cashAtClose()          { return this.shareEquity - this.askPrice; },
  get bs_totalAssetsAtClose()   { return this.shareEquity; },        // = shareEquity
  get bs_totalLiabilities()     { return 0; },
  get bs_shareCapital()         { return this.shareEquity; },
  get bs_totalEquityAtClose()   { return this.shareEquity; },

  // ── Balance Sheet — Snapshot B (stabilized, post-renovation) ────────
  get bs_propertyStabilized()   { return this.askPrice + this.renovation; },
  get bs_cashStabilized()       { return this.surplus; },            // shareEquity - dealTotal
  get bs_totalAssetsStabilized(){ return this.bs_propertyStabilized + this.bs_cashStabilized; },
  get bs_preOpeningExpense()    { return -this.carry; },             // expensed, not capitalized
  get bs_retainedEarnings()     { return 0; },
  get bs_totalEquityStabilized(){ return this.shareEquity + this.bs_preOpeningExpense; },
};
