/* =====================================================================
   THE REEF — Point Roberts Beach Club  |  1334 Gulf Rd, Point Roberts WA
   Financial Model  |  model.js
   Last updated: 2026-02-21

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
    { name: "Founding",     sharePx:  6_000, dues: 3_500, cap: 100, count: 100 },  // [G] pre-launch price
    { name: "Full",         sharePx: 10_000, dues: 4_200, cap: 150, count: 100 },  // [E]
    { name: "Non-resident", sharePx:  7_000, dues: 2_800, cap:  50, count:  50 },  // [E]
  ],
  //  Total sources:  100 × $6,000 + 100 × $10,000 + 50 × $7,000 = $1,950,000

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
    //  Line item              Auto model              No-automation baseline
    //                         lo          hi          baselineLo  baselineHi
    { label: "Labor (GM + staff)",
      lo: 160_000, hi: 230_000, baselineLo: 290_000, baselineHi: 365_000, color: "#f0c040" },  // [E]
    { label: "F&B COGS (35%)",       lo:  75_000, hi: 105_000, color: "#7ab5d8" },  // [I]
    { label: "Buyback reserve",      lo:  20_000, hi:  40_000, color: "#e07840" },  // [E]
    { label: "Maintenance / repair", lo:  20_000, hi:  40_000, color: "#5a8a70" },  // [E]
    { label: "Utilities",            lo:  24_000, hi:  36_000, color: "#5a8a70" },  // [E]
    { label: "Insurance",            lo:  18_000, hi:  28_000, color: "#5a8a70" },  // [E]
    { label: "Property tax",         lo:  18_000, hi:  22_000, color: "#5a8a70" },  // [G]
    { label: "Admin / legal",        lo:  15_000, hi:  25_000, color: "#5a8a70" },  // [E]
  ],
  //  Total OpEx (auto model, mid):   ~$348,000
  //  Total OpEx (baseline,  mid):    ~$476,000
  //
  //  Net operating income — automated model:  $1,165K − $89K − $348K ≈ $727K
  //  Net operating income — baseline model:   $1,165K − $89K − $476K ≈ $600K

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
