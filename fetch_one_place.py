"""
Fetch a single Point Roberts business by name from Google Places nearbysearch
and add it to google_places.json, then rebuild businesses.geojson.

Usage: python fetch_one_place.py "Business Name" <lat> <lng>
       python fetch_one_place.py "Ollie Otter Bakery"   # uses PR center if no coords
"""
import json, os, sys, urllib.request, urllib.parse

_env = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env):
    for line in open(_env):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

API_KEY = os.environ.get("GOOGLE_PLACES_API_KEY") or ""
if not API_KEY:
    raise RuntimeError("Set GOOGLE_PLACES_API_KEY in .env")

BASE_URL = "https://maps.googleapis.com/maps/api/place"
PR_CENTER = (48.982, -123.075)

name_query = sys.argv[1] if len(sys.argv) > 1 else input("Business name: ")
lat  = float(sys.argv[2]) if len(sys.argv) > 2 else PR_CENTER[0]
lng  = float(sys.argv[3]) if len(sys.argv) > 3 else PR_CENTER[1]

params = {
    "location": f"{lat},{lng}",
    "radius":   2500,
    "keyword":  name_query,
    "key":      API_KEY,
}
url = f"{BASE_URL}/nearbysearch/json?{urllib.parse.urlencode(params)}"
print(f"Searching for: {name_query!r}")

with urllib.request.urlopen(url, timeout=15) as r:
    result = json.loads(r.read().decode())

print("Status:", result.get("status"))
results = result.get("results", [])
if not results:
    raise RuntimeError("No results — check spelling or API quota")

for i, p in enumerate(results[:5]):
    print(f"  [{i}] {p.get('name')} | {p.get('vicinity')} | {p.get('place_id')}")

pick = int(input("Select entry [0]: ") or "0")
place = results[pick]
print(f"\nAdding: {place['name']} | {place['vicinity']}")

with open("google_places.json", encoding="utf-8") as fh:
    places = json.load(fh)

if any(p.get("place_id") == place.get("place_id") for p in places):
    print("Already in google_places.json.")
else:
    places.append(place)
    with open("google_places.json", "w", encoding="utf-8") as fh:
        json.dump(places, fh, indent=2, ensure_ascii=False)
    print(f"Added. google_places.json now has {len(places)} entries.")

print("\nRebuilding businesses.geojson...")
import subprocess
subprocess.run([sys.executable, "rebuild_businesses.py"], check=True)
