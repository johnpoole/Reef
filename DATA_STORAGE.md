# Data Storage

## Current Format

All data is stored as flat files. The schema is designed so each file maps
directly to a SQL table with no structural changes required — just a loader.

---

## Files

### `businesses.geojson`
**What it is:** Map layer. 63 business/place records for Point Roberts.
Built by merging Google Places API results with Whatcom County assessor data
wherever street addresses match.

**Source:** `rebuild_businesses.py` (reads `google_places.json` + assessor data)

| Column | Type | Source | Notes |
|--------|------|--------|-------|
| `name` | text | Google | Actual business name |
| `address` | text | Google | Street address + city |
| `category` | text | derived | Food & Drink / Lodging / Retail / Services / Recreation / Marina/Marine / Government / Other |
| `color` | text | derived | Hex color for category — display only, drop in SQL |
| `is_reef` | bool | derived | True for The Reef parcel |
| `g_types` | text[] | Google | Raw Google place types (up to 4) |
| `place_id` | text | Google | Google stable place identifier — use as PK for Google-sourced rows |
| `rating` | float | Google | Google rating (1.0–5.0), nullable |
| `source` | text | derived | `"google"`, `"google+assessor"`, or `"assessor"` |
| `owner` | text | Assessor | Legal property owner name — nullable |
| `mkt_value` | int | Assessor | Total market value ($) — nullable |
| `land_value` | int | Assessor | Land component of market value — nullable |
| `impr_value` | int | Assessor | Improvement (building) component — nullable |
| `yr_blt` | int | Assessor | Year built — nullable |
| `sqft` | int | Assessor | Building square footage — nullable |
| `zoning` | text | Assessor | Zoning code (e.g. `SMALL TOWN COM`) — nullable |
| `legal` | text | Assessor | Short legal description — nullable |
| `prop_id` | int | Assessor | Whatcom County parcel ID — FK to `parcels` table — nullable |
| `county_url` | text | Assessor | Direct link to Whatcom County assessor record — nullable |
| geometry | Point | Google | GeoJSON Point (longitude, latitude) — PostGIS `geometry(Point, 4326)` |

**SQL table name:** `businesses`
**Primary key:** `place_id` (Google rows) or `prop_id` (assessor-only rows) —
in SQL, synthesize a `id SERIAL` PK and index both.

---

### `lots.geojson`
**What it is:** Parcel polygons within ~100m of The Reef (19 parcels).
Full assessor attribute data including legal descriptions and valuation breakdown.

**Source:** `fetch_lots.py` (queries Whatcom County ArcGIS REST API)

| Column | Type | Source | Notes |
|--------|------|--------|-------|
| `prop_id` | int | Assessor | PK — Whatcom County parcel ID |
| `situs_num` | text | Assessor | Street number |
| `situs_street` | text | Assessor | Street name |
| `title_owner_name` | text | Assessor | Owner of title |
| `property_use_cd` | text | Assessor | Use code (e.g. `DRINK PLACES`) |
| `property_use_description` | text | Assessor | Human-readable use description |
| `zoning` | text | Assessor | Zoning code |
| `zoning_description` | text | Assessor | Zoning description |
| `market_land_val` | int | Assessor | Land market value |
| `market_improvement_val` | int | Assessor | Improvement market value |
| `market` | int | Assessor | Total market value |
| `appraised_val_total` | int | Assessor | Total appraised value |
| `taxable_val_total` | int | Assessor | Taxable value |
| `yr_blt` | int | Assessor | Year built |
| `sqft_la` | int | Assessor | Living area sqft |
| `imprv_type` | text | Assessor | Improvement type code |
| `legal_description` | text | Assessor | Legal description |
| `lot` | text | Assessor | Lot number |
| `block` | text | Assessor | Block number |
| `subdv_description` | text | Assessor | Subdivision name |
| `Hyperlink` | text | Assessor | Link to assessor record |
| geometry | Polygon | ArcGIS | GeoJSON Polygon — PostGIS `geometry(Polygon, 4326)` |

**SQL table name:** `parcels`
**Primary key:** `prop_id`

---

### `parcel_data.json`
**What it is:** Full assessor attribute dump (no geometries). Three sections:

| Section | Records | Description |
|---------|---------|-------------|
| `reef_parcel` | 1 | Complete record for 1334 Gulf Rd including all tax/owner fields |
| `all_point_roberts` | 4,627 | All PR parcels, summary columns |
| `commercial_only` | 1,066 | PR parcels with commercial use codes only |

Same column schema as `lots.geojson` properties, plus full tax payer address fields
(`tax_payer_name`, `tax_payer_line1`–`line3`, `tax_payer_city/state/zip/country`).

**SQL table name:** `parcels` (same table, superset of `lots.geojson` rows)

---

### `point_roberts_commercial.csv`
**What it is:** `parcel_data.json["commercial_only"]` exported as CSV.
1,066 rows, same columns as the commercial_only section above.
Exists as a convenience export — not the source of truth.

**SQL equivalent:** Same rows as `parcels` WHERE `zoning` in commercial codes.
**Can be dropped** once a database exists.

---

### `google_places.json`  *(gitignored — do not commit)*
**What it is:** Raw response cache from the Google Places Nearby Search API.
60 place objects, full Google Places API schema.

Regenerate with: `python compare_google_places.py`
(uses `GOOGLE_PLACES_API_KEY` from `.env`)

**SQL table name:** `places_raw` (optional staging table, not required for the app)

---

## SQL Migration Path

All flat files map 1:1 to tables. No restructuring required.

```sql
-- Core tables
CREATE TABLE parcels (
    prop_id          INTEGER PRIMARY KEY,
    situs_num        TEXT,
    situs_street     TEXT,
    title_owner_name TEXT,
    property_use_cd  TEXT,
    property_use_description TEXT,
    zoning           TEXT,
    zoning_description TEXT,
    market_land_val  INTEGER,
    market_improvement_val INTEGER,
    market           INTEGER,
    appraised_val_total INTEGER,
    taxable_val_total INTEGER,
    yr_blt           INTEGER,
    sqft_la          INTEGER,
    imprv_type       TEXT,
    legal_description TEXT,
    lot              TEXT,
    block            TEXT,
    subdv_description TEXT,
    county_url       TEXT,
    geom             GEOMETRY(POLYGON, 4326)  -- PostGIS; NULL for non-lot rows
);

CREATE TABLE businesses (
    id               SERIAL PRIMARY KEY,
    place_id         TEXT UNIQUE,             -- Google stable ID (nullable for assessor-only)
    prop_id          INTEGER REFERENCES parcels(prop_id),
    name             TEXT NOT NULL,
    address          TEXT,
    category         TEXT,
    g_types          TEXT[],                  -- use JSON or junction table in non-PG DBs
    rating           NUMERIC(3,1),
    source           TEXT,                    -- 'google' | 'google+assessor' | 'assessor'
    is_reef          BOOLEAN DEFAULT FALSE,
    owner            TEXT,
    mkt_value        INTEGER,
    land_value       INTEGER,
    impr_value       INTEGER,
    yr_blt           INTEGER,
    sqft             INTEGER,
    zoning           TEXT,
    legal            TEXT,
    county_url       TEXT,
    geom             GEOMETRY(POINT, 4326)
);
```

### Loading from current files

```python
# businesses.geojson → businesses table (psycopg2 example)
import json, psycopg2
from psycopg2.extras import execute_values

with open("businesses.geojson", encoding="utf-8") as f:
    fc = json.load(f)

rows = []
for feat in fc["features"]:
    p = feat["properties"]
    lng, lat = feat["geometry"]["coordinates"]
    rows.append((
        p.get("place_id"), p.get("prop_id"), p["name"], p.get("address"),
        p.get("category"), p.get("g_types"), p.get("rating"), p.get("source"),
        p.get("is_reef", False), p.get("owner"), p.get("mkt_value"),
        p.get("land_value"), p.get("impr_value"), p.get("yr_blt"), p.get("sqft"),
        p.get("zoning"), p.get("legal"), p.get("county_url"),
        f"SRID=4326;POINT({lng} {lat})"
    ))

execute_values(cur,
    """INSERT INTO businesses
       (place_id, prop_id, name, address, category, g_types, rating, source,
        is_reef, owner, mkt_value, land_value, impr_value, yr_blt, sqft,
        zoning, legal, county_url, geom)
       VALUES %s ON CONFLICT (place_id) DO NOTHING""",
    rows)
```

---

## Rules

1. **GeoJSON is the source of truth for the map layer.** The app reads flat files
   directly. Do not add a backend until the data model is stable.

2. **`businesses.geojson` is always rebuilt from `rebuild_businesses.py`.**
   Do not hand-edit it. If source data changes, re-run the script.

3. **Google Places results are ephemeral.** `google_places.json` is gitignored.
   It is a cache, not a database. The API key lives in `.env` (also gitignored).

4. **`prop_id` is the join key** between any assessor-sourced record and the
   `parcels` / `lots.geojson` data. Always preserve it.

5. **Column names are stable.** Do not rename columns in any data file without
   updating the corresponding SQL schema above and all consuming scripts.

6. **Geometry is always WGS84 (EPSG:4326).** Points are `[longitude, latitude]`
   in GeoJSON order. Do not store lat/lng as separate columns — keep them in the
   geometry field so PostGIS spatial queries work without transformation.
