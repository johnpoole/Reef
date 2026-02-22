"""
Rebuild businesses.geojson from Google Places data, enriched with
Whatcom County assessor fields where addresses match.

Sources:
  google_places.json   — 60 Google Places results for Point Roberts
  businesses.geojson   — 16 assessor parcel records (current map data)

Output:
  businesses.geojson   — overwritten with merged, corrected dataset

Strategy:
  • Each Google Place becomes one feature (real name, real lat/lng, real types)
  • Assessor fields merged in where addresses match:
      owner, mkt_value, land_value, impr_value, zoning, legal,
      yr_blt, sqft, county_url, prop_id
  • Assessor-only records (5) retained as-is, flagged source="assessor"
  • Google types → our category system for color coding

Run:  python rebuild_businesses.py
"""

import json
import re

# ── Type → Category mapping ─────────────────────────────────────────────────
# Google Places types → our display category
TYPE_MAP = [
    (["restaurant", "cafe", "bar", "food", "bakery", "meal_takeaway",
       "meal_delivery", "liquor_store"],                                   "Food & Drink"),
    (["lodging", "rv_park", "campground"],                                 "Lodging"),
    (["gas_station", "car_repair", "car_wash", "car_dealer"],              "Services"),
    (["supermarket", "grocery_or_supermarket", "convenience_store"],       "Retail"),
    (["store", "shopping_mall", "clothing_store", "furniture_store",
       "hardware_store", "home_goods_store", "electronics_store",
       "book_store", "florist"],                                            "Retail"),
    (["bank", "finance", "insurance_agency", "accounting"],                "Services"),
    (["real_estate_agency"],                                                "Services"),
    (["beauty_salon", "hair_care", "spa", "gym", "health"],               "Services"),
    (["painter", "electrician", "plumber", "contractor", "locksmith",
       "moving_company", "storage"],                                        "Services"),
    (["park", "campground", "natural_feature"],                            "Recreation"),
    (["marina", "boat_rental"],                                            "Marina/Marine"),
    (["airport"],                                                          "Recreation"),
    (["museum", "library", "art_gallery"],                                 "Government"),
    (["church", "place_of_worship"],                                       "Government"),
    (["post_office", "local_government_office", "courthouse",
       "embassy", "fire_station", "police"],                               "Government"),
    (["school", "university"],                                             "Government"),
]

CAT_COLORS = {
    "Food & Drink":    "#e05c5c",
    "Lodging":         "#e08c40",
    "Retail":          "#d4b040",
    "Services":        "#7ab5d8",
    "Recreation":      "#4caf50",
    "Marina/Marine":   "#40c8d8",
    "Government":      "#a060d0",
    "Commercial":      "#7a9ab5",
    "Vacant":          "#3a4a5a",
    "Other":           "#5a6a7a",
}

SKIP_TYPES = {"locality", "political", "neighborhood", "natural_feature",
              "administrative_area_level_1", "administrative_area_level_2",
              "country", "route", "street_address", "premise"}

def infer_category(types):
    for keys, cat in TYPE_MAP:
        if any(t in types for t in keys):
            return cat
    return "Other"

# ── Address normalization (same as compare script) ────────────────────────────
def norm_addr(s):
    s = (s or "").lower()
    s = re.sub(r"(?<=\d)[a-z](?=\s|,|$)", "", s)    # strip unit suffix e.g. 1334b→1334
    s = re.sub(r"\b(road|rd)\b",    "rd",  s)
    s = re.sub(r"\b(drive|dr)\b",   "dr",  s)
    s = re.sub(r"\b(avenue|ave)\b", "ave", s)
    s = re.sub(r"\s+(suite|ste|#|apt|unit|bldg)\s*\S*.*", "", s)   # drop unit suffix
    s = re.sub(r",.*", "", s)                         # drop city/state
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def extract_street(addr):
    return norm_addr(addr.split(",")[0])

# ── Load data ─────────────────────────────────────────────────────────────────
with open("google_places.json", encoding="utf-8") as fh:
    all_places = json.load(fh)

with open("businesses.geojson", encoding="utf-8") as fh:
    assessor_data = json.load(fh)

# Build assessor lookup by normalized street address
assessor_by_addr = {}
for feat in assessor_data["features"]:
    addr = extract_street(feat["properties"].get("address", ""))
    if addr:
        assessor_by_addr[addr] = feat["properties"]

print(f"Google Places:  {len(all_places)} total")
print(f"Assessor parcs: {len(assessor_data['features'])} total, {len(assessor_by_addr)} unique addrs")

# ── Build new features ────────────────────────────────────────────────────────
features = []
matched_addrs = set()

for place in all_places:
    types = place.get("types", [])
    # Skip pure administrative/geo entries
    if all(t in SKIP_TYPES for t in types):
        continue

    name    = place.get("name", "")
    loc     = place["geometry"]["location"]
    lat, lng = loc["lat"], loc["lng"]
    vicinity = place.get("vicinity", "")
    vic_addr = extract_street(vicinity)

    category = infer_category(types)
    color    = CAT_COLORS.get(category, CAT_COLORS["Other"])
    is_reef  = ("1334" in vicinity and "gulf" in vicinity.lower())
    # Suppress sub-businesses at STRATEGIC property addresses from the regular marker layer.
    # 713 Simundson Dr = Point Roberts Marina complex (Shell Marina, The Pier, Marina Resort).
    # The STRATEGIC circle marker already represents the whole property; individual markers
    # just stack on top of it and clutter the map.
    STRATEGIC_ADDRS = {
        norm_addr("713 Simundson Dr"),
    }
    is_strategic = (not is_reef) and (vic_addr in STRATEGIC_ADDRS)

    # Base properties from Google
    props = {
        "name":         name,
        "address":      vicinity,
        "category":     category,
        "color":        color,
        "is_reef":      is_reef,
        "is_strategic": is_strategic,
        "g_types":    types[:4],
        "place_id":   place.get("place_id", ""),
        "rating":     place.get("rating"),
        "source":     "google",
        # assessor fields — filled in below if matched
        "owner":      None,
        "mkt_value":  None,
        "land_value": None,
        "impr_value": None,
        "yr_blt":     None,
        "sqft":       None,
        "zoning":     None,
        "legal":      None,
        "prop_id":    None,
        "county_url": None,
    }

    # Merge assessor data if address matches
    if vic_addr and vic_addr in assessor_by_addr:
        a = assessor_by_addr[vic_addr]
        props["owner"]      = a.get("owner")
        props["mkt_value"]  = a.get("mkt_value")
        props["land_value"] = a.get("land_value")
        props["impr_value"] = a.get("impr_value")
        props["yr_blt"]     = a.get("yr_blt")
        props["sqft"]       = a.get("sqft")
        props["zoning"]     = a.get("zoning")
        props["legal"]      = a.get("legal")
        props["prop_id"]    = a.get("prop_id")
        props["county_url"] = a.get("county_url")
        props["source"]     = "google+assessor"
        matched_addrs.add(vic_addr)

    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lng, lat]},
        "properties": props
    })

# ── Add assessor-only records (not matched to any Google entry) ────────────────
assessor_only = []
for feat in assessor_data["features"]:
    addr = extract_street(feat["properties"].get("address", ""))
    if addr not in matched_addrs:
        p = feat["properties"]
        props = {
            "name":       (p.get("owner") or "").title(),
            "address":    p.get("address", ""),
            "category":   p.get("category", "Other"),
            "color":      p.get("color", CAT_COLORS["Other"]),
            "is_reef":      p.get("is_reef", False),
            "is_strategic": norm_addr(p.get("address","").split(",")[0]) in {norm_addr("713 Simundson Dr")},
            "g_types":    [],
            "place_id":   None,
            "rating":     None,
            "source":     "assessor",
            "owner":      p.get("owner"),
            "mkt_value":  p.get("mkt_value"),
            "land_value": p.get("land_value"),
            "impr_value": p.get("impr_value"),
            "yr_blt":     p.get("yr_blt"),
            "sqft":       p.get("sqft"),
            "zoning":     p.get("zoning"),
            "legal":      p.get("legal"),
            "prop_id":    p.get("prop_id"),
            "county_url": p.get("county_url"),
        }
        geom = feat.get("geometry")
        assessor_only.append({
            "type": "Feature",
            "geometry": geom,
            "properties": props
        })

features.extend(assessor_only)

# ── Save ──────────────────────────────────────────────────────────────────────
out = {"type": "FeatureCollection", "features": features}
with open("businesses.geojson", "w", encoding="utf-8") as fh:
    json.dump(out, fh, indent=2)

# ── Report ────────────────────────────────────────────────────────────────────
google_only  = sum(1 for f in features if f["properties"]["source"] == "google")
merged       = sum(1 for f in features if f["properties"]["source"] == "google+assessor")
aonly        = sum(1 for f in features if f["properties"]["source"] == "assessor")

print(f"\nbusinesses.geojson rebuilt:")
print(f"  {merged:3d}  google + assessor (matched)")
print(f"  {google_only:3d}  google only (no assessor parcel)")
print(f"  {aonly:3d}  assessor only (not in Google)")
print(f"  ───")
print(f"  {len(features):3d}  total features")
print(f"\nSaved: businesses.geojson")

# ── Category breakdown ────────────────────────────────────────────────────────
from collections import Counter
cats = Counter(f["properties"]["category"] for f in features)
print("\nBy category:")
for cat, n in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {n:3d}  {cat}")
