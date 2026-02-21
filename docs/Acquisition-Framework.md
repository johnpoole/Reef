# Acquisition Decision Framework
## The Reef — 1334 Gulf Rd, Point Roberts, WA

This document defines the rules of analysis. It is process-only — no financial data or projections belong here. See [Club-Comparables.md](Club-Comparables.md) for comparable data.

---

## Core Rules

These apply at every stage of analysis, without exception.

**Rule 1: Costs before revenue.**
Build the cost stack from the ground up. Revenue is what must cover costs — not the other way around. Never start with a revenue target and work backwards to justify it.

**Rule 2: Revenue assumptions need a derivation.**
Every revenue line requires a bottom-up build or a cited comparable at the correct classification level (see dimensions below). "It seems reasonable" is not a derivation.

**Rule 3: Sensitivity over point estimates.**
Every key variable must have a low / base / high case. The model must show what breaks the deal, not just the scenario where it works.

**Rule 4: Flag every assumption.**
Every number carries exactly one label:
- **Verified** — from actuals, public records, or confirmed comparables at the correct classification level
- **Estimated** — derived from a documented methodology with a cited source
- **Guessed** — placeholder; must be replaced before any decision is made. A model with unresolved Guesses is not a model.

**Rule 5: The model must be able to say NO.**
If the math always works out, the model isn't doing anything. Every analysis must define the specific failure conditions — the member count, cost level, or revenue shortfall — that make the deal unworkable.

**Rule 6: Unanswerable questions are risk flags, not blockers — but they must be named.**
If a required question cannot be answered (seller refuses to provide financials, data doesn't exist), document it explicitly as an open risk. Proceeding without it is a conscious decision, not an oversight. The model must show the impact range of the unknown.

---

## Classification Dimensions

The Reef must be classified independently on three dimensions before any financial modeling begins. These are not a hierarchy — they are parallel axes. Each has its own questions and constraints.

A comparable is only valid if it matches The Reef's classification on the dimension you are using it for. Using a comparable from a different classification as if it were equivalent is a Rule 2 violation.

---

### Dimension 1: Acquisition Type
*What you are buying, and what that means for how you value it.*

```
Asset Purchase (real estate only, business winds down)
Going Concern (buy the operating business as-is)
Conversion (buy the asset, discard the existing business, launch a new one)  ← The Reef
```

**The Reef is a Conversion.** The existing business is a bar/restaurant. You are not buying a private club — you are buying a building and creating one. This has specific consequences:

- Trailing financials of the existing bar are **not a basis for projecting club revenue**. They are relevant only for: (a) license transferability, (b) understanding existing costs of the physical plant, and (c) assessing what the seller is actually selling.
- There is no "goodwill" being transferred. The existing customer base is irrelevant.
- Year 1 is a launch, not a continuation. Transition risk means zero revenue during buildout/conversion.
- The financial model is a greenfield club pro forma, not an acquisition of an existing club.

**Required questions — Acquisition Type:**
- [ ] What exactly is included in the asking price? (Real estate, liquor license, equipment, goodwill?)
- [ ] What licenses exist, what do they permit, and are they transferable to a new legal entity with a new use?
- [ ] What is the building's physical condition? What are the required capital costs before opening?
- [ ] How long is the realistic conversion timeline, and what are the carrying costs during that period?
- [ ] What does the real estate alone — without any business — justify at this price? (Floor value)

---

### Dimension 2: Business Type
*What the target business will operate as, and what constraints that type imposes.*

```
Private Membership Club
└── Waterfront / Beach Club
    └── Remote / Destination Beach Club
        └── Border-Adjacent, Seasonal, Small-Format  ← The Reef
```

Each level inherits the constraints of the level above.

**Private Membership Club**
- Member count is the central demand variable. Every version of the model must show break-even member count.
- Initiation fees are not recurring revenue. They must not be used to fund ongoing operations or service debt. Model them separately.
- Dues rate and member count are inversely correlated — higher dues = smaller addressable market. The model must explore this tradeoff explicitly.
- Comparables must come from actual club financials (IRS 990 or audited statements), not industry surveys.

**Waterfront / Beach Club** *(inherits above)*
- Seasonal demand is not an average — it is a peak that funds an off-season with lower or zero revenue. Model each season separately.
- F&B is a separate business line within the club, with its own cost stack. It is not found money. If F&B requires a cook and a bartender, those salaries must appear in costs before F&B revenue appears in income.
- Water access quality (beach, dock, swimming conditions) is a primary membership variable. Degraded access degrades membership value.

**Remote / Destination Beach Club** *(inherits above)*
- Addressable market is geographically constrained. Do not assume a regional or metro-wide draw — model the realistic trip-making population within the friction boundary.
- Dues tolerance may be higher than urban comps (destination premium), but the addressable market is smaller. These offset — do not assume both work in your favor simultaneously.
- Staff recruitment and retention at a remote site carries a cost premium. Budget accordingly.
- Frequency of use per member is lower than urban clubs. This affects how many members are needed to sustain F&B economics.

**Border-Adjacent, Seasonal, Small-Format** *(inherits above)*
- If any modeled revenue depends on Canadian members, the model must explicitly state what border conditions it assumes (wait times, entry requirements, political climate) and show the scenario where that demand is cut in half.
- Small format is a hard revenue cap. Maximum F&B revenue is physically bounded by covers × turns × average check. Calculate this ceiling before putting any F&B number in the model.
- Minimum viable staffing does not scale proportionally with small size. A 40-seat venue still needs a GM, front-of-house, and kitchen. The ratio of labor cost to revenue is worse at small scale, not better.

**Required questions — Business Type:**
- [ ] What is the actual building square footage and maximum seating capacity (covers)?
- [ ] What is the usable season length at this specific location? (Weeks of beach weather, not calendar summer)
- [ ] What is the realistic member draw population within the friction boundary (drive time + border crossing)?
- [ ] What fraction of that population is Canadian, and under what assumptions?
- [ ] What is the minimum viable staffing headcount to operate on a given day?
- [ ] What do comparable clubs charge in dues and initiation within 200 miles?
- [ ] At what member count does dues revenue alone cover minimum viable operating costs?

---

### Dimension 3: Real Estate
*The property as an income-producing asset, independent of the business.*

- Valuation must be supportable by income potential, not comparable sales of dissimilar properties.
- Cap rate: what does the property yield at asking price, assuming stabilized operations? If the cap rate is below market for the asset class, the price is speculative.
- DSCR: debt service coverage ratio. Lenders typically require ≥1.25×. The model must show whether projected income meets this at the proposed financing terms. If it doesn't, the deal either requires more equity or doesn't pencil.
- Floor value: what is the property worth if the club concept fails and you sell? This defines the downside.

**Required questions — Real Estate:**
- [ ] What is the asking cap rate based on realistic (not optimistic) stabilized income?
- [ ] Does the projected income meet a 1.25× DSCR at the proposed loan terms?
- [ ] What is the realistic exit value if the club concept doesn't work? (Highest and best alternative use)
- [ ] Are there zoning, covenant, or permitting constraints that limit use or affect value?

---

## Structural Constraint: Penclave

Point Roberts is a **penclave** — US territory accessible by road only through Canada. To reach Point Roberts from the rest of Washington state by land, you must cross into Canada and back. This is not a location characteristic. It is a structural dependency that cuts across all three analysis dimensions and has no analog in any standard comparable.

Every financial assumption must be stress-tested against the question: *what happens if the border is difficult or closed?*

### What penclave status means for each dimension

**Dimension 1 — Acquisition / Conversion:**
- All building materials, equipment, and FF&E deliveries arrive through Canadian customs. Every shipment is subject to inspection, duty assessment, and delay. Conversion timelines and capital budgets must include a border friction premium.
- Contractor labor for the conversion must be sourced locally (limited pool) or cross the border daily. Cross-border workers require appropriate documentation. US contractor quotes may not be realistic for this site.

**Dimension 2 — Business Operations:**
- *Supply chain:* Food, beverage, and consumable restocking passes through Canada every time. This is not a one-time friction — it is a permanent operating cost premium. COGS assumptions from mainland or island comparables are not directly applicable.
- *Staffing:* The year-round population of Point Roberts is approximately 1,300 people. A club cannot be fully staffed from that pool. Workers who cross daily from Delta/Tsawwassen need NEXUS or equivalent, are subject to border hours and wait times, and cannot be assumed to reliably arrive on time on any given day. Canadian workers employed at a US business have visa and work authorization requirements that add HR complexity and cost.
- *Member access — US members:* Reaching Point Roberts from the US mainland requires entering Canada, transiting Delta/Tsawwassen, and re-entering the US. This is not "a border crossing" — it is two border crossings each way, four total per visit. This is categorically different from any inland or ferry-access comparable. Frequency of use will be materially lower than at an accessible comparable.
- *Member access — Canadian members:* Paradoxically, Canadian members in Delta and Tsawwassen have simpler access — one southbound crossing. This means the most accessible member population is foreign nationals. Any model that assumes heavy Canadian membership must also assume the border stays open, wait times stay low, and US entry requirements for Canadians remain unchanged. None of these are guaranteed.
- *Border closure as existential risk:* The US–Canada land border closed to non-essential travel in March 2020 and did not fully reopen until November 2021 — 18 months. Point Roberts was effectively cut off from its practical supply chain and the majority of its functional market. This is not a tail risk. It happened within the last five years. Any model that does not account for a border disruption scenario is incomplete.

**Dimension 3 — Real Estate:**
- Floor value (the value if the club concept fails) is directly affected by penclave status. The buyer pool for any Point Roberts property is structurally limited — US buyers face the same access friction their members would. This suppresses liquidity and exit optionality.
- The penclave premium (if any) may be built into the asking price as an "exclusivity" story. Verify whether comparable sales support that premium or whether it is speculative.
- Any bank financing this acquisition will be underwriting penclave-specific risk. Lenders may apply a higher rate or lower LTV than mainland comparables — confirm with lenders before assuming standard terms.

### Penclave-specific required questions
- [ ] What were the actual operational impacts on Point Roberts businesses during the 2020–2021 border closure?
- [ ] What is the current typical border wait time southbound at Peace Arch / Pacific Highway during peak season?
- [ ] What is the realistic Canadian member fraction, and under what explicit border assumptions?
- [ ] What is the cost premium for supply delivery via Canadian customs vs. direct mainland delivery?
- [ ] What is the available local labor pool, and what is the realistic cost to staff from across the border?
- [ ] Have lenders who operate in this market been consulted on financing terms specific to Point Roberts properties?
- [ ] What is the floor value of the real estate given the penclave liquidity discount?

---

## Comparable Validity Check

Before using any comparable, identify which dimension and classification level it is being used for, and document every material attribute difference from The Reef at that level. For each difference, state whether it makes the comparable an overestimate or underestimate, and by what mechanism.

A comparable used without this documentation is a Rule 2 violation.

**Template:**
```
Comparable: [Name]
Used for: [Dimension + specific variable, e.g. "Business Type — labor cost ratios"]
Their classification at this level: [e.g. Urban/Suburban beach club]
The Reef's classification at this level: [Border-adjacent, seasonal, small-format]
Attribute deltas:
  - [Attribute]: [Their value] vs. [The Reef's expected value] → [Over/underestimate] because [mechanism]
  - ...
Conclusion: [How the comparable is being adjusted and why]
```

---

## Status
*Financial modeling may not begin until all Dimension questions are answered or explicitly flagged as open risks per Rule 6.*

**Penclave Constraints:**
- [ ] 2020–2021 border closure impacts on Point Roberts businesses documented
- [ ] Border wait time data obtained for peak season
- [ ] Canadian member fraction and border assumptions stated explicitly
- [ ] Supply chain cost premium estimated
- [ ] Local vs. cross-border labor costs estimated
- [ ] Lender terms for Point Roberts properties confirmed
- [ ] Real estate floor value estimated with penclave liquidity discount

**Dimension 1 — Acquisition Type:**
- [ ] Included assets in asking price identified
- [ ] License status and transferability confirmed
- [ ] Physical condition and capital cost assessed
- [ ] Conversion timeline and carry costs estimated
- [ ] Real estate floor value established

**Dimension 2 — Business Type:**
- [ ] Building sq footage and cover count confirmed
- [ ] Usable season length documented
- [ ] Member draw population estimated
- [ ] Canadian member fraction and border assumptions stated
- [ ] Minimum viable staffing calculated
- [ ] Comparable dues/initiation rates gathered
- [ ] Break-even member count calculated

**Dimension 3 — Real Estate:**
- [ ] Asking cap rate calculated
- [ ] DSCR tested at proposed financing terms
- [ ] Exit / floor value estimated
- [ ] Zoning and use constraints confirmed

**Financial Model:**
- [ ] Cost stack built bottom-up (Rule 1)
- [ ] All revenue lines derived (Rule 2)
- [ ] Low / base / high cases defined (Rule 3)
- [ ] All assumptions labeled Verified / Estimated / Guessed (Rule 4)
- [ ] Failure conditions defined (Rule 5)
- [ ] All open risks named and impact-ranged (Rule 6)
