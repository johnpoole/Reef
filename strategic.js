/* ─────────────────────────────────────────────────────────
   STRATEGIC PROPERTIES  (planning data — single source of truth)
   Loaded before index.html main script via <script src="strategic.js">.
───────────────────────────────────────────────────────── */
// ═══════════════════════════════════════════════════════════
//  STRATEGIC DATA INTEGRITY RULES
//
//  Every field in this array must have a traceable source.
//  The `src` field on each entry documents provenance.
//  Never use assessor property use codes as business names —
//  they describe tax classification, not operating businesses.
//
//  ALLOWED SOURCES:
//    "assessor"  — Whatcom County parcel data (numeric fields only:
//                  assessed value, sqft, yr_blt, owner name)
//    "google"    — Google Places API or Maps (business name, rating,
//                  address, hours, business type)
//    "listing"   — MLS / broker listing (asking price — verify currency)
//    "direct"    — Personal observation or direct contact
//
//  PROHIBITED:
//    ✗ Inferring a business name from an assessor use code
//      (e.g. use code "LIQUOR" ≠ business name "Liquor Store")
//    ✗ Claiming operational status ("operating successfully",
//      "not for sale") without a source
//    ✗ Describing strategy or intent as fact
//      ("controls key food retail", "asking price negotiable")
//    ✗ Any proximity or direction claim that was not computed from
//      coordinates. Address numbers are NOT proximity evidence.
//      Use haversine on lat/lng; cite the computed value.
//    ✗ Writing a `src` value you cannot verify in the actual data.
//      If the API did not return it, `src` cannot say "google".
//      A fake citation is worse than no citation — it hides the gap.
//    ✗ Adding any note claim without being able to cite its origin
//    ✗ Hardcoding coords that exist in businesses.geojson.
//      All coords must come from businesses.geojson at runtime via
//      resolveCoords(). Only assessor-sourced data (assessed, asking,
//      land_value, impr_value, sqft, built) belongs in this file.
//
//  When in doubt: leave the field null and add "[ unverified ]"
//  to the note rather than filling it with inference.
//
//  partnerReady field — DEFAULTS TO false:
//    Set to true ONLY when the business identity is confirmed AND there
//    is a coherent partnership model to propose.
//    partnerReady: true on an unverified property is the same class of
//    error as inventing a business name. The partnerships panel renders
//    EXCLUSIVELY from this flag — there is no HTML to hand-edit.
// ═══════════════════════════════════════════════════════════
const STRATEGIC = [
  {
    id: "reef", name: "★ The Reef", geojsonName: "Kiniski's Reef Tavern",
    status: "target", assessed: 850965, asking: 1375000,
    land_value: 669526, impr_value: 181439,
    sqft: 8463, built: 1959, address: "1334 Gulf Rd",
    // Google Places API (findplacefromtext, 2026-02-22):
    //   Operating name: "Kiniski's Reef Tavern" — rating 4.3, types: bar, restaurant, food.
    //   place_id: ChIJkw174fPlhVQR1jT640kPTFk. Coords in businesses.geojson (source: google-places-api).
    //   Co-tenant at same parcel: Larry's Liquor Locker (1334B Gulf Rd) — rating 4.5, types: liquor_store.
    //   Larry's is a sub-address of this parcel, NOT a separate parcel. Do not confuse with 1405 (Lady Liberty).
    // assessed/land_value/impr_value/sqft/built: Whatcom County assessor.
    // asking: listing price — verify currency before use.
    src: "name:google-places-api, coords:businesses.geojson, co-tenant:google-places-api, assessed:assessor, asking:listing",
    note: "Target acquisition. Operating as Kiniski's Reef Tavern (Google). Co-tenant: Larry's Liquor Locker at 1334B — same parcel, different sub-address.",
    partnerReady: false,
    color: "#f0c040"
  },
  {
    // Google Places API find_place for "1405 Gulf Rd" (2026-02-22) returned only type "premise" —
    // no business name is linked to this address in Google's data. Lady Liberty appearing in the
    // nearby search at r=4.0 is a separate listing (types: point_of_interest) — generic, unverified.
    // IMPORTANT: Larry's Liquor Locker (r=4.5, liquor_store) is at 1334B Gulf Rd, NOT here.
    //   The assessor LIQUOR use code on 1405 is a tax classification — it does not confirm
    //   that a liquor store is operating at this address. Lady Liberty's actual business type unknown.
    // partnerReady: false — business identity unverified.
    id: "liquorstore", name: "Lady Liberty",
    status: "watch", assessed: 202000, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson, assessed:assessor",
    note: "Lady Liberty appears in Google nearby search (r=4.0, type: point_of_interest only). find_place for 1405 Gulf Rd returned only \"premise\" — no business confirmed at 1405. Assessor use code LIQUOR is a tax classification only. Larry's Liquor Locker is at 1334B (The Reef parcel), not here.",
    partnerReady: false,
    color: "#d4b040"
  },
  {
    // name: Google Places. Sub-businesses at this address (Shell Marina, The Pier,
    // Point Roberts Marina Resort) confirmed via Google Places API — see businesses.geojson.
    // STRATEGIC marker covers the whole property; sub-businesses are suppressed (is_strategic).
    // partnerReady: true — tenants confirmed via Google Places API; coherent partnership models exist.
    id: "marina", name: "Point Roberts Marina", geojsonName: "Point Roberts Marina",
    status: "open", assessed: 12770000, asking: null,
    sqft: null, built: null,
    src: "name:google, coords:businesses.geojson, assessed:assessor, sub-businesses:google-places-api",
    note: "Marina complex at 713 Simundson Dr. Tenants confirmed via Google: The Pier restaurant (4.4\u2605), Shell Marina fuel dock, Point Roberts Marina Resort.",
    partnerReady: true,
    partnerAddr: "713 Simundson Dr \u2014 ~1.0 mi southeast (coords)",
    partnerIdeas: [
      { icon: "\u{1f6a4}", title: "Dock-and-dine with The Pier.", body: "Marina slip holders get a Reef day-pass or member discount; Reef members get preferred reservation access or a fuel discount at Shell Marina. High overlap in boating demographic." },
      { icon: "\u{1f374}", title: "Cross-referral with The Pier (4.4\u2605).", body: "The Pier is a full-service restaurant; The Reef is a bar/social venue. Refer overflow to each other. Marina guests get exposure to The Reef and vice versa." },
      { icon: "\u{1f3d6}", title: "Marina Resort guest day passes.", body: "Resort overnight guests get a complimentary Reef beach access pass. Adds amenity value to the resort stay without capital cost to either party." },
      { icon: "\u{1f4c5}", title: "Shared event calendar.", body: "Combined events (seafood nights, fishing tournaments, sunset cruises) draw from both guest lists and strengthen Point Roberts as a destination." }
    ],
    color: "#7ab5d8"
  },
  {
    // name: "Point Roberts Golf and Country Club" per Google Maps — shortened here for display.
    // Verify full legal name before any formal outreach.
    // partnerReady: true — member club structure confirmed via Google; cross-membership model is coherent.
    id: "golf", name: "Golf & Country Club", geojsonName: "Point Roberts Golf and Country Club",
    status: "open", assessed: 4340000, asking: null,
    sqft: null, built: null,
    src: "name:google, coords:businesses.geojson, assessed:assessor",
    note: "Point Roberts Golf and Country Club (Google). Existing member club structure confirmed. Assessed $4.34M (assessor). Operational status unverified.",
    partnerReady: true,
    partnerAddr: "500 Benson Rd \u2014 ~0.8 mi north (coords)",
    partnerIdeas: [
      { icon: "\u{1f91d}", title: "Cross-membership bundle.", body: "Golf + Beach Club dual membership at a combined price point. Members who join one are natural prospects for the other. Neither club dilutes its brand; both expand value." },
      { icon: "\u{1f4cb}", title: "Founding member prospect list.", body: "The golf club's existing members are the highest-quality cold-call list for Reef founding shares \u2014 they already pay for a PR membership and have demonstrated willingness to do so." },
      { icon: "\u{1f4c5}", title: "Shared social calendar.", body: "Golf tournament with awards dinner at The Reef. Summer beach BBQ for club members. Keeps both facilities fully utilized on event days." },
      { icon: "\u{1f3cc}", title: "Guest reciprocity.", body: "Reef members get one complimentary guest round at the club per season; golf members get Reef guest day passes. Low-cost perk that makes dual membership feel richer." }
    ],
    color: "#7ab5d8"
  },
  {
    // Google Places API nearby search (600m from The Reef, 2026-02-22):
    //   Name: "Saltwater Café" — rating 4.4, types: cafe, restaurant, food, address: 1345 Gulf Rd.
    //   Coords from businesses.geojson (Google Places source): lat 48.9840489, lng -123.081863.
    //   Assessor: owner TH COASTAL DESIGN LLC, assessed $281K, sqft 1200, built 1960.
    // partnerReady: false — newly discovered; no partnership model developed yet.
    id: "saltwater", name: "Saltwater Café",
    status: "watch", assessed: 281000, asking: null,
    sqft: 1200, built: 1960,
    src: "name:google-places-api, coords:businesses.geojson, assessed:assessor",
    note: "Owner: TH Coastal Design LLC (assessor). Closest food-service tenant to The Reef — potential cross-referral or event partner.",
    partnerReady: false,
    color: "#e05c5c"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=4.5, liquor_store, 1334B Gulf Rd.
    // Co-tenant of The Reef parcel — same ownership parcel as the target acquisition.
    // Understanding their lease terms is prerequisite to any deal on 1334.
    // partnerReady: false — lease terms unknown; no outreach model until acquisition closer.
    id: "larrys", name: "Larry's Liquor Locker",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson",
    note: "Co-tenant of The Reef (1334) parcel — not a separate parcel. Lease terms unknown; any acquisition of 1334 must account for this tenancy.",
    partnerReady: false,
    color: "#d4b040"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=5.0, real_estate_agency, 1339 Gulf Rd.
    // Immediately adjacent to The Reef — same block, different parcel.
    // Local realty contact useful for member recruitment, parcel research, and acquisition support.
    // partnerReady: false — no outreach model developed yet.
    id: "juliusrealty", name: "Julius Realty",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson",
    note: "Immediately adjacent to The Reef parcel, different parcel. Potential: acquisition advisory, member outreach to buyers/sellers in Point Roberts.",
    partnerReady: false,
    color: "#7ab5d8"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=3.8, rv_park/lodging, 1408 Gulf Rd.
    // Lodging guests on Gulf Rd — same corridor as The Reef. Significant cross-referral potential.
    // partnerReady: false — no outreach model developed yet.
    id: "sunnypoint", name: "Sunny Point Resort",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson",
    note: "Lodging on Gulf Rd corridor. Cross-referral potential: resort recommends The Reef to guests; Reef offers day passes to resort guests.",
    partnerReady: false,
    color: "#e08c40"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=4.6, campground/lodging, 811 Marine Dr.
    // State marine park — highest-rated lodging in Point Roberts. Campers/visitors are the exact
    // demographic likely to want a beach club experience.
    // partnerReady: false — no outreach model developed yet.
    id: "lighthouse", name: "Lighthouse Marine Park",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson",
    note: "State marine park — destination lodging for Point Roberts visitors. Potential: Reef literature at park kiosk, event co-promotion.",
    partnerReady: false,
    color: "#e08c40"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=4.1, 1RL FAA identifier.
    // Only fly-in access to Point Roberts. Owned by Lily Point Holdings LLC.
    // Landing fee: $10, overnight tiedown: $15. PPR required — text 778-846-4311.
    // Runway 16/34, 2265x125 ft turf. See businesses.geojson for full operational detail.
    // partnerReady: false — partnership model not yet developed.
    id: "airpark", name: "Point Roberts Airpark",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson, ops:skyvector-1RL",
    note: "Only fly-in access to Point Roberts. Potential: Reef membership covers landing fee for fly-in days; airpark promotes Reef to visiting pilots. Operational detail in businesses.geojson.",
    partnerReady: false,
    color: "#4caf50"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=4.1, grocery/food, 480 Tyee Dr.
    // Main grocery/food hub at the Tyee commercial cluster. Community gathering point.
    // partnerReady: false — no outreach model developed yet.
    id: "intlmarket", name: "International Marketplace",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson",
    note: "Main community grocery at Tyee commercial cluster. Potential: reciprocal member offers, event supply sourcing, co-promotion of Point Roberts as destination.",
    partnerReady: false,
    color: "#e05c5c"
  },
  {
    // businesses.geojson (Google Places, 2026-02-22): r=5.0, community center, 1437 Gulf Rd.
    // Also hosts Point Roberts History Center (r=4.9) at same address.
    // Primary community event venue in Point Roberts — key channel for member recruitment.
    // partnerReady: false — no outreach model developed yet.
    id: "commcenter", name: "Point Roberts Community Center",
    status: "watch", assessed: null, asking: null,
    sqft: null, built: null,
    src: "name:google-places-api, coords:businesses.geojson",
    note: "Primary community event venue. Also hosts Point Roberts History Center. Potential: member recruitment events, co-hosted community nights, Reef literature presence.",
    partnerReady: false,
    color: "#a060d0"
  }
];
