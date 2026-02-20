"""
Whatcom County Assessor / GIS parcel data fetcher
1. Full detail on 1334 Gulf Rd (The Reef)
2. ALL commercial/business parcels in Point Roberts
No API key required — all public endpoints.
"""

import json
import csv
import urllib.request
import urllib.parse

BASE_GIS  = "https://gis.whatcomcounty.us/arcgis/rest/services"
GEOCODER  = f"{BASE_GIS}/Geocoder/WhatcomGeocodingService/GeocodeServer"
PACS      = f"{BASE_GIS}/Applications/PACSGIS_Viewer/MapServer"
LAYER_TAX = 28
LAYER_ZONE = 37

# Washington state property use codes — commercial/business categories
# 5000-5999 = Retail/Service/Commercial
# 4000-4999 = Industrial (warehouses etc.)
# 6000-6999 = Recreational/Cultural
# 2000-2999 = Office/Professional
# We'll pull everything non-residential (not 1xxx single family, not 9xxx farm)
COMMERCIAL_USE_PREFIX = ("2", "3", "4", "5", "6", "7", "8")


def get(url, params=None):
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.loads(r.read().decode())


def section(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")


# ── 1. Single property deep-dive: 1334 Gulf Rd ───────────────
section("STEP 1: Geocode 1334 Gulf Rd")
geo = get(f"{GEOCODER}/findAddressCandidates", {
    "Street": "1334 Gulf Rd", "City": "Point Roberts", "ZIP": "98281", "f": "json"
})
candidates = geo.get("candidates", [])
if not candidates:
    print("No geocode match — stopping.")
    exit(1)

best = max(candidates, key=lambda c: c["score"])
x, y = best["location"]["x"], best["location"]["y"]
wkid  = geo.get("spatialReference", {}).get("wkid", 102748)
print(f"  Matched: {best['address']}  (score {best['score']})")

section("STEP 2: Tax Parcel detail — 1334 Gulf Rd")
parcel_resp = get(f"{PACS}/{LAYER_TAX}/query", {
    "geometry": f"{x},{y}", "geometryType": "esriGeometryPoint",
    "inSR": wkid, "spatialRel": "esriSpatialRelIntersects",
    "outFields": "*", "returnGeometry": "false", "f": "json",
})
for feat in parcel_resp.get("features", []):
    for k, v in feat["attributes"].items():
        if v not in (None, "", " ", 0):
            print(f"  {k:<40} {v}")


# ── 2. All commercial parcels in Point Roberts ────────────────
section("STEP 3: All commercial/business parcels in Point Roberts")

# Query by city name — pull everything, then filter by use code client-side
# The API maxes at 1000 records; Point Roberts has ~2,500 total parcels,
# so we page with resultOffset.
all_features = []
offset = 0
PAGE   = 1000

while True:
    resp = get(f"{PACS}/{LAYER_TAX}/query", {
        "where":          "situs_city = 'POINT ROBERTS'",
        "outFields":      "prop_id,situs_num,situs_street,title_owner_name,"
                          "property_use_cd,property_use_description,"
                          "zoning,zoning_description,"
                          "market_land_val,market_improvement_val,market,"
                          "appraised_val_total,taxable_val_total,"
                          "yr_blt,sqft_la,imprv_type,legal_description,"
                          "tax_payer_name,tax_payer_city,tax_payer_state",
        "returnGeometry": "false",
        "resultOffset":   offset,
        "resultRecordCount": PAGE,
        "f":              "json",
    })
    features = resp.get("features", [])
    all_features.extend(features)
    print(f"  Fetched {len(all_features)} parcels so far...")
    if len(features) < PAGE:
        break
    offset += PAGE

print(f"  Total Point Roberts parcels: {len(all_features)}")

# Filter to commercial/business use codes
commercial = [
    f for f in all_features
    if str(f["attributes"].get("property_use_cd", "") or "").startswith(COMMERCIAL_USE_PREFIX)
]
print(f"  Commercial/business parcels: {len(commercial)}")


# ── 3. Print summary table ────────────────────────────────────
section("STEP 4: Commercial parcel summary")
print(f"  {'Address':<30} {'Use':<35} {'Owner':<30} {'Mkt Value':>12}  {'Yr Blt':>6}  {'SqFt':>7}")
print(f"  {'-'*28:<30} {'-'*33:<35} {'-'*28:<30} {'-'*10:>12}  {'-'*5:>6}  {'-'*6:>7}")

commercial.sort(key=lambda f: f["attributes"].get("situs_street", "") or "")
for feat in commercial:
    a = feat["attributes"]
    addr  = f"{a.get('situs_num','')} {a.get('situs_street','')}"
    use   = (a.get("property_use_description") or "")[:34]
    owner = (a.get("title_owner_name") or "")[:29]
    val   = a.get("market") or 0
    yr    = a.get("yr_blt") or ""
    sqft  = a.get("sqft_la") or ""
    print(f"  {addr:<30} {use:<35} {owner:<30} ${val:>11,}  {yr:>6}  {sqft:>7}")


# ── 4. Save to CSV and JSON ───────────────────────────────────
section("STEP 5: Saving output files")

# JSON — full data
out_json = {
    "reef_parcel":   [f["attributes"] for f in parcel_resp.get("features", [])],
    "all_point_roberts": [f["attributes"] for f in all_features],
    "commercial_only":   [f["attributes"] for f in commercial],
}
with open("parcel_data.json", "w") as fh:
    json.dump(out_json, fh, indent=2)
print("  Saved: parcel_data.json")

# CSV — commercial parcels for easy spreadsheet use
if commercial:
    keys = list(commercial[0]["attributes"].keys())
    with open("point_roberts_commercial.csv", "w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=keys)
        writer.writeheader()
        for feat in commercial:
            writer.writerow(feat["attributes"])
    print(f"  Saved: point_roberts_commercial.csv  ({len(commercial)} rows)")
