"""
Fetch parcel lot polygons within ~100m of The Reef (1334 Gulf Rd)
from Whatcom County GIS ArcGIS REST API.
Outputs: lots.geojson  (WGS84, with all assessor attributes)
"""

import json
import urllib.request
import urllib.parse

PACS      = "https://gis.whatcomcounty.us/arcgis/rest/services/Applications/PACSGIS_Viewer/MapServer"
LAYER_TAX = 28

# The Reef — WGS84
REEF_LNG  = -123.08337
REEF_LAT  =  48.98453

# ~100m bounding box: 0.0009° lat, 0.00135° lng at this latitude
BBOX_PAD_LAT = 0.0009
BBOX_PAD_LNG = 0.00135

def get(url, params):
    full = f"{url}?{urllib.parse.urlencode(params)}"
    print(f"  URL: {full[:120]}...")
    with urllib.request.urlopen(full, timeout=30) as r:
        raw = r.read().decode()
    data = json.loads(raw)
    if "error" in data:
        print(f"  API error: {data['error']}")
    return data

print("Querying Whatcom County GIS for parcels within ~100m of The Reef...")

# Envelope bounding box in WGS84
xmin = REEF_LNG - BBOX_PAD_LNG
xmax = REEF_LNG + BBOX_PAD_LNG
ymin = REEF_LAT - BBOX_PAD_LAT
ymax = REEF_LAT + BBOX_PAD_LAT

resp = get(f"{PACS}/{LAYER_TAX}/query", {
    "geometry":      f"{xmin},{ymin},{xmax},{ymax}",
    "geometryType":  "esriGeometryEnvelope",
    "inSR":          "4326",
    "spatialRel":    "esriSpatialRelIntersects",
    "outFields":     "prop_id,situs_num,situs_street,title_owner_name,"
                     "property_use_cd,property_use_description,"
                     "zoning,zoning_description,"
                     "market_land_val,market_improvement_val,market,"
                     "appraised_val_total,taxable_val_total,"
                     "yr_blt,sqft_la,imprv_type,legal_description,"
                     "lot,block,subdv_description,Hyperlink",
    "returnGeometry": "true",
    "outSR":         "4326",
    "f":             "json",
})

esri_features = resp.get("features", [])
print(f"  Got {len(esri_features)} parcels")

# Convert Esri JSON -> GeoJSON
def esri_to_geojson_polygon(rings):
    return {"type": "Polygon", "coordinates": rings}

def esri_to_geojson_multipolygon(rings):
    # Esri rings: outer rings are CW, holes are CCW — for simplicity wrap each ring
    return {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}

geojson_features = []
for f in esri_features:
    geom = f.get("geometry", {})
    rings = geom.get("rings", [])
    props = f.get("attributes", {})

    addr = f"{props.get('situs_num','') or ''} {props.get('situs_street','') or ''}".strip()
    use  = (props.get('property_use_description') or '').strip()
    val  = props.get('market') or 0
    print(f"  {addr or '(no address)':<30}  {use:<30}  ${val:>10,}")

    if rings:
        gj_feature = {
            "type": "Feature",
            "geometry": esri_to_geojson_polygon(rings),
            "properties": props
        }
        geojson_features.append(gj_feature)

geojson = {
    "type": "FeatureCollection",
    "features": geojson_features
}

with open("lots.geojson", "w") as fh:
    json.dump(geojson, fh)

print(f"\nSaved: lots.geojson  ({len(geojson_features)} features)")
