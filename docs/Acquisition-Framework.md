# Acquisition Decision Framework
## The Reef — 1334 Gulf Rd, Point Roberts, WA

This document defines the rules of analysis. It is process-only — no financial data or projections belong here. See [Club-Comparables.md](Club-Comparables.md) for comparable data.

---

## Core Rules

These apply at every level of analysis, without exception.

**Rule 1: Costs before revenue.**
Build the cost stack from the ground up. Revenue is what must cover costs — not the other way around. Never start with a revenue target and work backwards to justify it.

**Rule 2: Revenue assumptions need a derivation.**
Every revenue line requires a bottom-up build or a cited comparable at the correct type level (see hierarchy below). "It seems reasonable" is not a derivation.

**Rule 3: Sensitivity over point estimates.**
Any single number hides the real question: what is the break-even, and how far away is failure? Every key variable must have a low / base / high case.

**Rule 4: Flag every assumption.**
Every number carries exactly one of:
- **Verified** — from actuals, public records, or confirmed comparables
- **Estimated** — derived from a documented methodology
- **Guessed** — placeholder; must be replaced before any decision is made

**Rule 5: The model must be able to say NO.**
If the math always works out, the model isn't doing anything. Every analysis must define an explicit failure condition: what member count, cost overrun, or revenue shortfall kills the deal?

---

## Type Hierarchy

A comparable is only valid if it sits at the same node or you explicitly document the delta. Using a parent-level comparable as if it were the same type is a Rule 2 violation.

```
Commercial Real Estate
└── Going Concern (business + real estate acquired together)
    └── Hospitality & Recreation
        └── Private Membership Club
            ├── [Golf / Yacht / City — not applicable]
            └── Waterfront / Beach Club
                ├── Urban / Suburban beach club  (Mercer Island, Seabright)
                └── Remote / Destination beach club
                    └── Border-adjacent, seasonal, small-format
                        └── THE REEF (1334 Gulf Rd, Point Roberts WA)
```

### Level: Commercial Real Estate
**Entry criteria:** Property generates or is intended to generate income.
**Inherited constraints:** Acquisition price must be justified by income potential, not comparable sales alone. Cap rate and DSCR are the primary valuation tools.
**Required questions before descending:**
- [ ] What is the current cap rate at asking price?
- [ ] What DSCR does the lender require, and does the projected income meet it?
- [ ] Is the real estate separable from the business, and what is each worth independently?

### Level: Going Concern
**Entry criteria:** You are acquiring an operating business, not just a building. Goodwill, customer relationships, licenses, and staff are part of the asset.
**Inherited constraints:** Valuation must include a normalized earnings analysis. Year 1 projections must account for transition risk (revenue disruption during ownership change).
**Required questions before descending:**
- [ ] What are the trailing 3 years of actual financials (not pro forma)?
- [ ] What revenue is tied to the current owner and will not transfer?
- [ ] What licenses (liquor, food service, etc.) are required and are they transferable?

### Level: Private Membership Club
**Entry criteria:** Primary revenue stream is member dues or initiation fees, not open-to-public sales.
**Inherited constraints:** Member count is the central variable — the model must show sensitivity to it. Initiation fees are not recurring revenue and must not fund ongoing operations. Comparables must be 501(c)(7) filings or equivalent documented sources.
**Required questions before descending:**
- [ ] What is the realistic member addressable market (who would join, and why)?
- [ ] What are comparable clubs charging in initiation and dues within 200 miles?
- [ ] What is the minimum member count to break even (before any F&B or events)?

### Level: Waterfront / Beach Club
**Entry criteria:** Water access is a primary membership draw, not incidental.
**Inherited constraints:** Seasonal demand must be modeled explicitly — annual averages obscure the operational reality of a 3–4 month peak season. F&B revenue is real but requires dedicated staff; it is not a margin enhancer, it is a separate business line with its own cost stack.
**Required questions before descending:**
- [ ] What is the usable season length (weeks/year of beach weather)?
- [ ] What is the minimum off-season staffing required to maintain the property and serve year-round members?
- [ ] Does F&B improve the economics after accounting for required staff, or not?

### Level: Remote / Destination Beach Club
**Entry criteria:** Property is not within convenient commute of its primary member base. Members must make a dedicated trip.
**Inherited constraints:** Member retention depends heavily on the "escape" value proposition. Dues tolerance may be higher than urban comps, but the addressable market is smaller and geographically constrained. Marketing costs are higher. Occupancy patterns differ from urban clubs — weekends and summer dominate.
**Required questions before descending:**
- [ ] What is the realistic member draw radius, and what is the total addressable population within it?
- [ ] What infrastructure do members need to make the trip (ferry, accommodations, etc.) and does it limit frequency of use?
- [ ] How does remoteness affect staffing — recruitment, retention, and cost?

### Level: Border-Adjacent, Seasonal, Small-Format
**Entry criteria:** Remote club where a significant portion of the member base is foreign nationals crossing an international border, and the facility is small (sub-5,000 sq ft).
**Inherited constraints:**
- Border crossing friction is a demand variable. Any scenario that assumes consistent Canadian member attendance must model crossing wait times and policy risk (e.g. NEXUS disruptions, border closures).
- Small format caps F&B revenue hard — fewer seats = lower ceiling regardless of demand.
- Staffing at a remote small-format property is disproportionately expensive relative to revenue because minimum viable staffing doesn't scale down with size.
**Required questions before descending:**
- [ ] What is the realistic Canadian member fraction, and what border conditions does the model assume?
- [ ] What is the actual building sq footage and maximum F&B covers?
- [ ] What is the minimum viable staff headcount to open the doors on a given day?

### Node: The Reef
At this node, all inherited constraints from every level above are active. An assumption is only valid if it has cleared every level's required questions.

**Open questions as of 2026-02-21:**
- [ ] Trailing 3-year financials not obtained
- [ ] Liquor license status unknown
- [ ] Addressable member market not estimated
- [ ] Usable season length not documented
- [ ] Minimum viable staffing not calculated
- [ ] Building sq footage and cover count not confirmed
- [ ] Canadian member demand not modeled
- [ ] DSCR analysis not performed

---

## Comparable Validity Check

Before using any comparable in the model, confirm which node it occupies and document the delta.

| Comparable | Node | Delta to The Reef | Usable? |
|---|---|---|---|
| Mercer Island Beach Club | Urban/Suburban beach club | Suburban Seattle, year-round demand, larger facility, no border factor | Yes, with haircut on revenue ceiling |
| Seabright Beach Club | Urban/Suburban beach club | NJ coast, dense member market, larger F&B operation | Yes, for F&B cost ratios only |

---

## Status
- [ ] All hierarchy questions answered (pre-condition for any financial modeling)
- [ ] Cost stack built bottom-up (Rule 1)
- [ ] All revenue lines sourced (Rule 2)
- [ ] Sensitivity ranges defined (Rule 3)
- [ ] All assumptions flagged with confidence (Rule 4)
- [ ] Break-even and failure conditions defined (Rule 5)
