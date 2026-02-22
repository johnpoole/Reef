"""
Compare businesses.geojson against Google Places data for Point Roberts, WA.

Our GeoJSON uses assessor parcel data — no "name" field, uses "owner" + "address".
Google Places has actual business names and addresses.

Matching strategy:
  1. Normalize street numbers from addresses ("1334 GULF RD" → "1334 gulf rd")
  2. Match by street address between Google vicinity and our address field
  3. Also attempt owner-name vs Google-name token overlap for confirmation

Outputs:
  - google_places.json     raw Google results (all 60 max)
  - compare_report.txt     diff table

Usage:  python compare_google_places.py
"""

import json
import time
import urllib.request
import urllib.parse
import re
import os

# Load .env if present (no dependencies required)
_env = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env):
    for _line in open(_env):
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())

API_KEY  = os.environ.get("GOOGLE_PLACES_API_KEY") or ""
if not API_KEY:
    raise RuntimeError("Set GOOGLE_PLACES_API_KEY in .env or environment")
BASE_URL = "https://maps.googleapis.com/maps/api/place"

CENTER   = "48.982,-123.075"
RADIUS_M = 2500          # covers the whole Point Roberts peninsula

# Types we skip for the "missing from our map" list (not commercial businesses)
SKIP_TYPES = {"locality", "political", "neighborhood", "natural_feature",
              "administrative_area_level_1", "administrative_area_level_2",
              "country", "route", "street_address", "premise"}

# ── Helpers ──────────────────────────────────────────────────────────────────

def get(url):
    with urllib.request.urlopen(url, timeout=15) as r:
        return json.loads(r.read().decode())

def nearby_search(page_token=None):
    params = {"location": CENTER, "radius": RADIUS_M, "key": API_KEY}
    if page_token:
        params = {"pagetoken": page_token, "key": API_KEY}
    return get(f"{BASE_URL}/nearbysearch/json?{urllib.parse.urlencode(params)}")

def norm_addr(s):
    """'1334B Gulf Road' → '1334 gulf rd'  — strip unit letters, abbreviate."""
    s = (s or "").lower()
    s = re.sub(r"(?<=\d)[a-z](?=\s|,|$)", "", s)  # strip unit suffix e.g. 1334b→1334
    s = re.sub(r"\b(road|rd)\b", "rd", s)
    s = re.sub(r"\b(drive|dr)\b", "dr", s)
    s = re.sub(r"\b(avenue|ave)\b", "ave", s)
    s = re.sub(r"\s+(suite|ste|#|apt|unit|bldg)\s*\S*.*", "", s)  # drop unit/suite suffix
    s = re.sub(r",.*", "", s)               # drop city/state
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def extract_street(addr):
    """Return just 'NNNN streetname' — no city, state, zip."""
    return norm_addr(addr.split(",")[0])

def is_skip(types):
    return all(t in SKIP_TYPES for t in types)

# ── 1. Fetch all Google Places results ───────────────────────────────────────
print("Fetching Google Places for Point Roberts WA …")

# Try to load cached results to avoid hammering the API
try:
    with open("google_places.json") as fh:
        all_places = json.load(fh)
    print(f"  Loaded {len(all_places)} cached results from google_places.json")
    refetch = False
except FileNotFoundError:
    refetch = True

if refetch:
    all_places = []
    resp = nearby_search()
    all_places.extend(resp.get("results", []))
    print(f"  Page 1: {len(all_places)} results  ({resp.get('status')})")
    while resp.get("next_page_token"):
        time.sleep(2)
        resp = nearby_search(resp["next_page_token"])
        pg = resp.get("results", [])
        all_places.extend(pg)
        print(f"  Next page: {len(pg)} results  ({resp.get('status')})")
    with open("google_places.json", "w", encoding="utf-8") as fh:
        json.dump(all_places, fh, indent=2)
    print(f"  Total fetched: {len(all_places)}  →  saved google_places.json")

# ── 2. Load businesses.geojson ───────────────────────────────────────────────
with open("businesses.geojson", encoding="utf-8") as fh:
    our_data = json.load(fh)

our_features = our_data["features"]
print(f"\nOur businesses.geojson : {len(our_features)} entries")

# Build address lookup for our data  key = norm street  value = feature
our_by_addr = {}
for feat in our_features:
    p    = feat["properties"]
    addr = extract_street(p.get("address", ""))
    if addr:
        our_by_addr[addr] = feat

# Build address lookup for Google  key = norm street  value = place
google_by_addr = {}
google_businesses = []
for place in all_places:
    types = place.get("types", [])
    if is_skip(types):
        continue
    google_businesses.append(place)
    vic = extract_street(place.get("vicinity", ""))
    if vic:
        google_by_addr.setdefault(vic, []).append(place)

print(f"Google (non-admin):     {len(google_businesses)} entries")

# ── 3. Diff ───────────────────────────────────────────────────────────────────
matched_addrs   = set(our_by_addr) & set(google_by_addr)
only_in_google  = [p for p in google_businesses
                   if extract_street(p.get("vicinity","")) not in matched_addrs]
only_in_ours    = [f for addr, f in our_by_addr.items()
                   if addr not in matched_addrs]

# ── 4. Report ─────────────────────────────────────────────────────────────────
sep = "=" * 72
W   = 44

lines = [
    sep,
    "  Point Roberts — Business Data Comparison",
    f"  Google Places (non-admin): {len(google_businesses)}",
    f"  Our GeoJSON (assessor):    {len(our_features)}",
    f"  Matched by address:        {len(matched_addrs)}",
    sep,
]

# ── Matched
lines += [f"\n[MATCHED by address — {len(matched_addrs)}]"]
for addr in sorted(matched_addrs):
    our_p  = our_by_addr[addr]["properties"]
    g_list = google_by_addr[addr]
    owner  = our_p.get("owner", "").title()
    g_names = " / ".join(g["name"] for g in g_list)
    lines.append(f"  {addr:<30}  ours: {owner}")
    lines.append(f"  {'':30}  goog: {g_names}")

# ── In Google but not ours
lines += [f"\n[IN GOOGLE — NOT IN OUR MAP ({len(only_in_google)})]"]
lines.append("  (businesses Google knows about that we're missing)")
lines += [f"  {'Name':<{W}}  {'Types':<30}  Address"]
lines += [f"  {'-'*W}  {'-'*28}  --------"]
for p in sorted(only_in_google, key=lambda x: x.get("name","")):
    name  = p.get("name","")
    types = ", ".join(t for t in p.get("types",[])[:2]
                      if t not in ("point_of_interest","establishment"))[:28]
    vic   = p.get("vicinity","")
    lines.append(f"  {name:<{W}}  {types:<30}  {vic}")

# ── In ours but not Google
lines += [f"\n[IN OUR MAP — NOT IN GOOGLE ({len(only_in_ours)})]"]
lines.append("  (assessor parcels we show that Google doesn't have)")
lines += [f"  {'Owner':<{W}}  {'Category':<20}  Address"]
lines += [f"  {'-'*W}  {'-'*18}  --------"]
for feat in sorted(only_in_ours, key=lambda x: x["properties"].get("address","")):
    p    = feat["properties"]
    own  = (p.get("owner") or "(unknown)").title()
    cat  = p.get("category") or ""
    addr = p.get("address") or ""
    lines.append(f"  {own:<{W}}  {cat:<20}  {addr}")

report = "\n".join(lines)
print("\n" + report)

with open("compare_report.txt", "w", encoding="utf-8") as fh:
    fh.write(report + "\n")
print("\nSaved: compare_report.txt")
