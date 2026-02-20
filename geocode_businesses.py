"""
Geocode all non-condo commercial parcels in Point Roberts, WA
Outputs businesses.geojson for the Leaflet web app.
Uses the Whatcom County geocoder (no API key needed).
"""
import json
import time
import urllib.request
import urllib.parse

GEOCODER = "https://gis.whatcomcounty.us/arcgis/rest/services/Geocoder/WhatcomGeocodingService/GeocodeServer"
SLIP_TYPES = {"MARINE CONDO", "STOR CONDOS"}

# Use type → color for map markers
USE_COLORS = {
    "EATING PLACE":   "#e74c3c",
    "DRINK PLACES":   "#9b59b6",
    "GAS SERV STA":   "#e67e22",
    "GROCERIES":      "#27ae60",
    "MARINAS":        "#2980b9",
    "OTHR MARINAS":   "#2980b9",
    "GOLF COURSES":   "#1abc9c",
    "RV PARKS":       "#f39c12",
    "MINI STORAGE":   "#95a5a6",
    "WHSE/STORAGE":   "#95a5a6",
    "OTHR WHSE/ST":   "#95a5a6",
    "STOR CONDOS":    "#95a5a6",
    "BANK SERV":      "#2ecc71",
    "POSTAL SERV":    "#3498db",
    "LIQUOR":         "#8e44ad",
    "AUTO REP SER":   "#d35400",
    "RE AG/BRKR/M":   "#16a085",
    "OTHR PER SER":   "#c0392b",
    "OTHR BUS SER":   "#7f8c8d",
    "MISC SERV":      "#7f8c8d",
    "BLDG MATERLS":   "#d35400",
    "PHONE COMMUN":   "#7f8c8d",
    "FIRE PROTECT":   "#e74c3c",
    "COMMUNITY PK":   "#27ae60",
    "DISTRICT PK":    "#27ae60",
    "NEIGHBRHD PK":   "#27ae60",
    "OTHER PARK":     "#27ae60",
    "PLAYGROUNDS":    "#27ae60",
    "PRIMARY SCH":    "#3498db",
    "CHURCHES":       "#8e44ad",
    "GEN RESORTS":    "#1abc9c",
    "LAND/TAKEOFF":   "#2c3e50",
    "OTHR PROTECT":   "#2c3e50",
    "PROTEC FUNCT":   "#2c3e50",
    "HIST/MONUMNT":   "#795548",
    "OTHR CULT":      "#9c27b0",
    "ELEC SERV":      "#ff9800",
    "ELEC REG SUB":   "#ff9800",
    "TENNIS COURT":   "#26a69a",
    "WATR STORAGE":   "#607d8b",
    "POLICE PROTC":   "#1565c0",
    "OSAG RANCHES":   "#558b2f",
    "DESIG FOREST":   "#558b2f",
    "WTR TREATMNT":   "#607d8b",
    "OTHR GVRN SV":   "#607d8b",
    "OTHR FIN/INS":   "#2ecc71",
    "OTHR MISC SV":   "#7f8c8d",
    "OTHR AG LAND":   "#8bc34a",
}
DEFAULT_COLOR = "#607d8b"


def geocode(street, city="Point Roberts", zip_code="98281"):
    params = {
        "Street":      street,
        "City":        city,
        "ZIP":         zip_code,
        "outSR":       "4326",
        "f":           "json",
    }
    url = f"{GEOCODER}/findAddressCandidates?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read().decode())
        candidates = data.get("candidates", [])
        if not candidates:
            return None
        best = max(candidates, key=lambda c: c["score"])
        if best["score"] < 60:
            return None
        return {
            "lng": best["location"]["x"],
            "lat": best["location"]["y"],
            "score": best["score"],
            "matched": best["address"],
        }
    except Exception as e:
        print(f"    ERROR geocoding '{street}': {e}")
        return None


def prop_url(prop_id):
    return f"https://property.whatcomcounty.us/propertyaccess/Property.aspx?cid=0&year=2025&prop_id={prop_id}"


print("Loading parcel data...")
with open("parcel_data.json") as f:
    raw = json.load(f)

parcels = [
    p for p in raw["commercial_only"]
    if (p.get("property_use_description") or "").strip() not in SLIP_TYPES
]
print(f"  {len(parcels)} non-condo commercial parcels to geocode")

features = []
skipped  = 0

for i, p in enumerate(parcels):
    num    = str(p.get("situs_num") or "").strip()
    street = (p.get("situs_street") or "").strip()

    if not num or not street:
        skipped += 1
        continue

    address = f"{num} {street}"
    print(f"  [{i+1}/{len(parcels)}] {address} ...", end=" ", flush=True)
    coords = geocode(address)

    if not coords:
        print("no match")
        skipped += 1
        continue

    print(f"✓  ({coords['lat']:.5f}, {coords['lng']:.5f})  score={coords['score']}")

    use   = (p.get("property_use_description") or "").strip()
    color = USE_COLORS.get(use, DEFAULT_COLOR)

    props = {
        "prop_id":    p.get("prop_id"),
        "address":    address,
        "use":        use,
        "owner":      (p.get("title_owner_name") or "").strip(),
        "zoning":     (p.get("zoning_description") or "").strip(),
        "mkt_value":  p.get("market") or 0,
        "land_value": p.get("market_land_val") or 0,
        "impr_value": p.get("market_improvement_val") or 0,
        "yr_blt":     p.get("yr_blt") or "",
        "sqft":       p.get("sqft_la") or "",
        "imprv_type": (p.get("imprv_type") or "").strip(),
        "legal":      (p.get("legal_description") or "").strip()[:120],
        "tax_yr":     6558,   # approx annual from earlier data
        "color":      color,
        "county_url": prop_url(p.get("prop_id", "")),
        "is_reef":    (num == "1334" and street == "GULF RD"),
        "geocode_score": coords["score"],
    }

    features.append({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [coords["lng"], coords["lat"]],
        },
        "properties": props,
    })

    time.sleep(0.05)  # be polite to the county server

geojson = {
    "type": "FeatureCollection",
    "features": features,
}

with open("businesses.geojson", "w") as f:
    json.dump(geojson, f, indent=2)

print(f"\nDone. {len(features)} features written to businesses.geojson")
print(f"Skipped {skipped} parcels (no address)")
