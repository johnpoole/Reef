# Model Constraints

## Dues

**Stop thinking up bizarre ways to justify high annual dues.**

If costs change, recalculate dues bottom-up:
`dues/member = (total costs − F&B gross) ÷ member count`

## businesses.geojson — inclusion standard

**A feature must be visible as a business pin on Google Maps to be included.**

A `place_id` is not proof. Google assigns place_ids to third-party listings (Airbnb, VRBO, booking platforms) that do not appear as map pins. Confirmed via the A-Frame Cottage incident (2026-02-22): real place_id `ChIJc5u1m_blhVQRfbk1g6a9vxM` returned by the API, not visible on maps.google.com — removed.

Before adding or restoring any feature, verify it appears on the Google Maps UI as a business pin, not just that the Places API returns a place_id for it.
