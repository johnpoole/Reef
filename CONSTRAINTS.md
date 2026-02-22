# Model Constraints

## Data files — who owns what

There are four data files. Each owns exactly one thing. Nothing else.

| File | Owns |
|---|---|
| `businesses.geojson` | Coordinates, ratings, addresses, operational notes for every business |
| `strategic.js` | Strategic context, assessor financials, partnership ideas, `partnerReady` flag |
| `model.js` | Financial model parameters: dues, member count, costs, revenue |
| `index.html` | Layout, CSS, rendering logic only — **zero data** |

**index.html contains no data.** No numbers, no addresses, no coordinates. Everything it displays is read from one of the three data files at runtime.

**Run `node lint.js` before committing.** It checks all four rules mechanically. If lint fails, do not commit.

## Dues

**Stop thinking up bizarre ways to justify high annual dues.**

If costs change, recalculate dues bottom-up:
`dues/member = (total costs − F&B gross) ÷ member count`

## STRATEGIC array — no duplication of geojson data

**Do not hardcode into STRATEGIC any data that already exists in businesses.geojson.**

Coordinates, ratings, addresses, and operational notes that are in businesses.geojson must stay there. STRATEGIC entries for watch/open businesses should carry only what is NOT in geojson: strategic context, acquisition status, partnership ideas, assessor financials, and the `partnerReady` flag.

At runtime, index.html joins STRATEGIC with businesses.geojson by `place_id` or `name` to get coordinates and display data. If a STRATEGIC entry duplicates geojson fields (lat, lng, rating, address, note), those fields belong in the geojson only — remove them from STRATEGIC.

Violating this creates two diverging copies of the same fact with no clear authority.

## businesses.geojson — inclusion standard

**A feature must be visible as a business pin on Google Maps to be included.**

A `place_id` is not proof. Google assigns place_ids to third-party listings (Airbnb, VRBO, booking platforms) that do not appear as map pins. Confirmed via the A-Frame Cottage incident (2026-02-22): real place_id `ChIJc5u1m_blhVQRfbk1g6a9vxM` returned by the API, not visible on maps.google.com — removed.

Before adding or restoring any feature, verify it appears on the Google Maps UI as a business pin, not just that the Places API returns a place_id for it.
