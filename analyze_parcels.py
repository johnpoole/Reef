"""
Analyze Point Roberts commercial parcel data from parcel_data.json
"""
import json
from collections import defaultdict

with open("parcel_data.json") as f:
    data = json.load(f)

parcels = data["commercial_only"]

# Exclude individual marina condo slips and storage condos (repetitive unit records)
SLIP_TYPES = {"MARINE CONDO", "STOR CONDOS"}
non_slip = [p for p in parcels if (p.get("property_use_description") or "").strip() not in SLIP_TYPES]

# ── Summary by use type ───────────────────────────────────────
by_use = defaultdict(list)
for p in non_slip:
    use = (p.get("property_use_description") or "UNKNOWN").strip()
    by_use[use].append(p)

print(f"\n{'='*70}")
print(f"  POINT ROBERTS: {len(non_slip)} Non-Condo Commercial Parcels")
print(f"  (Excluded {len(parcels)-len(non_slip)} individual marina boat slips / storage units)")
print(f"{'='*70}\n")
print(f"  {'USE TYPE':<35} {'COUNT':>5}  {'TOTAL MKT VALUE':>16}")
print(f"  {'-'*33:<35} {'-'*4:>5}  {'-'*14:>16}")
for use, ps in sorted(by_use.items(), key=lambda x: -sum(p.get("market", 0) or 0 for p in x[1])):
    total = sum(p.get("market", 0) or 0 for p in ps)
    print(f"  {use:<35} {len(ps):>5}  ${total:>15,}")

# ── Eating & drinking places ──────────────────────────────────
print(f"\n{'='*70}")
print(f"  EATING & DRINKING PLACES")
print(f"{'='*70}")
eat_drink = [
    p for p in non_slip
    if any(x in (p.get("property_use_description") or "")
           for x in ("EAT", "DRINK", "RESTAU", "FOOD", "BAR"))
]
eat_drink.sort(key=lambda p: (p.get("situs_street") or "", int(p.get("situs_num") or 0)))
print(f"\n  {'Address':<28} {'Use':<22} {'Owner':<32} {'Mkt Val':>12}  {'Yr':>5}  {'SqFt':>6}")
print("  " + "-" * 110)
for p in eat_drink:
    addr = f"{p.get('situs_num','') or ''} {p.get('situs_street','') or ''}".strip()
    use  = (p.get("property_use_description") or "")[:21]
    own  = (p.get("title_owner_name") or "")[:31]
    val  = p.get("market") or 0
    yr   = p.get("yr_blt") or ""
    sqft = p.get("sqft_la") or ""
    print(f"  {addr:<28} {use:<22} {own:<32} ${val:>11,}  {yr:>5}  {sqft:>6}")

# ── All major commercial properties >$300K ───────────────────
print(f"\n{'='*70}")
print(f"  MAJOR COMMERCIAL PROPERTIES (assessed value > $300K)")
print(f"{'='*70}")
big = [p for p in non_slip if (p.get("market") or 0) > 300000]
big.sort(key=lambda p: -(p.get("market") or 0))
print(f"\n  {'Address':<28} {'Use':<28} {'Owner':<30} {'Mkt Val':>12}  {'Yr':>5}  {'SqFt':>7}")
print("  " + "-" * 115)
for p in big:
    addr = f"{p.get('situs_num','') or ''} {p.get('situs_street','') or ''}".strip()
    use  = (p.get("property_use_description") or "")[:27]
    own  = (p.get("title_owner_name") or "")[:29]
    val  = p.get("market") or 0
    yr   = p.get("yr_blt") or ""
    sqft = p.get("sqft_la") or ""
    print(f"  {addr:<28} {use:<28} {own:<30} ${val:>11,}  {yr:>5}  {sqft:>7}")

# ── The Reef vs neighbors on Gulf Rd ─────────────────────────
print(f"\n{'='*70}")
print(f"  GULF RD CORRIDOR — All commercial parcels")
print(f"{'='*70}")
gulf = [p for p in non_slip if (p.get("situs_street") or "").strip() == "GULF RD"]
gulf.sort(key=lambda p: int(p.get("situs_num") or 0))
print(f"\n  {'#':<6} {'Use':<28} {'Owner':<32} {'Mkt Val':>12}  {'Yr':>5}  {'SqFt':>7}")
print("  " + "-" * 98)
for p in gulf:
    num  = p.get("situs_num") or ""
    use  = (p.get("property_use_description") or "")[:27]
    own  = (p.get("title_owner_name") or "")[:31]
    val  = p.get("market") or 0
    yr   = p.get("yr_blt") or ""
    sqft = p.get("sqft_la") or ""
    marker = " ◄ THE REEF" if str(num) == "1334" else ""
    print(f"  {str(num):<6} {use:<28} {own:<32} ${val:>11,}  {yr:>5}  {sqft:>7}{marker}")

# ── Marina detail ─────────────────────────────────────────────
print(f"\n{'='*70}")
print(f"  MARINA (Point Roberts Resort LP) — consolidated")
print(f"{'='*70}")
marina = [p for p in parcels if "POINT ROBERTS RESORT LP" in (p.get("title_owner_name") or "")]
total_marina_val = sum(p.get("market", 0) or 0 for p in marina)
use_counts = defaultdict(int)
use_vals   = defaultdict(int)
for p in marina:
    use = (p.get("property_use_description") or "").strip()
    use_counts[use] += 1
    use_vals[use]   += (p.get("market") or 0)
print(f"\n  Total parcels/units owned: {len(marina)}")
print(f"  Total assessed value:      ${total_marina_val:,}")
print(f"\n  {'Asset Type':<30} {'Units':>6}  {'Total Value':>14}")
print("  " + "-" * 55)
for use, cnt in sorted(use_counts.items(), key=lambda x: -use_vals[x[0]]):
    print(f"  {use:<30} {cnt:>6}  ${use_vals[use]:>13,}")

# ── Golf course ───────────────────────────────────────────────
print(f"\n{'='*70}")
print(f"  GOLF COURSE")
print(f"{'='*70}")
golf = [p for p in parcels if "GOLF" in (p.get("property_use_description") or "").upper()]
for p in golf:
    print(f"\n  Address:  {p.get('situs_num','')} {p.get('situs_street','')}")
    print(f"  Owner:    {p.get('title_owner_name','')}")
    print(f"  Use:      {p.get('property_use_description','')}")
    print(f"  Value:    ${(p.get('market') or 0):,}")
    print(f"  Yr Built: {p.get('yr_blt','')}")
    print(f"  Sq Ft:    {p.get('sqft_la','')}")
    print(f"  Zoning:   {p.get('zoning_description','')}")
