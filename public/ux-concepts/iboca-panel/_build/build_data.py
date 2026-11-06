#!/usr/bin/env python3
"""
build_data.py — one-off fixture builder for the IBOCA panel prototype.

Reads IBOCA service responses saved on 2026-11-06 plus the local IBOCA asset
kit, and writes the static data/ and assets/ files the prototype loads.
Nothing here runs at page time; the page never calls IBOCA servers.

Usage (paths are arguments so the script is portable across machines):
  python3 -I _build/build_data.py --resp <saved-responses-dir> \
      --kit <_bogota-iboca-assets dir> --out <iboca-panel dir>

Outputs:
  data/stations.json        19 stations, no base64 (photos extracted)
  data/recommendations.json band x tipo (salud = R, ambiente = A)
  data/mock-forecast.json   48 hourly points per station x pollutant (_mock)
  data/mock-history.json    5 days x 24 hours per station x pollutant (_mock)
  data/hotspots.json        station marker positions on the static map image
  assets/stations/*.jpg     station photos (deduped), assets/icons/*.png
"""
import argparse
import base64
import hashlib
import json
import math
import os
import random
import shutil
import subprocess
import tempfile
from datetime import datetime, timedelta

BANDS = [  # name, lo, hi, IBOCA rango_id
    ("Bajo", 0, 50, 3),
    ("Moderado", 51, 100, 4),
    ("Regular", 101, 150, 5),
    ("Alto", 151, 200, 6),
    ("Peligroso", 201, 500, 7),
]
KIT_FOLDER = {3: "1-bajo", 4: "2-moderado", 5: "3-regular", 6: "4-alto", 7: "5-peligroso"}
POLS = ["pm25", "pm10", "o3"]
# A station whose last O3 reading is older than this (relative to the fixture
# snapshot, never the viewer's clock) is treated as "does not measure O3".
NO_MONITOR_DAYS = 30


def band_of(v):
    if v is None:
        return None
    for name, lo, hi, _ in BANDS:
        if v <= hi:
            return name
    return "Peligroso"


def num(x):
    if x is None or x == "--" or x == "":
        return None
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def parse_dt(s):
    return datetime.strptime(s, "%Y-%m-%d %H:%M:%S") if s else None


def load(path):
    with open(path, encoding="utf-8") as fh:
        d = json.load(fh)
    return d["data"] if isinstance(d, dict) and "data" in d else d


def write_json(path, obj):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=1)


def photo_to_jpg(data_uri, dest):
    """Decode a base64 data URI and write a JPEG, max 800px wide, q75 (sips)."""
    raw = base64.b64decode(data_uri.split(",", 1)[1])
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "in.png")
        with open(src, "wb") as fh:
            fh.write(raw)
        w = int(subprocess.check_output(["sips", "-g", "pixelWidth", src]).decode().split()[-1])
        args = ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "75"]
        if w > 800:
            args += ["--resampleWidth", "800"]
        subprocess.check_call(args + [src, "--out", dest], stdout=subprocess.DEVNULL)
    return hashlib.sha1(raw).hexdigest()


def diurnal(hour, pol):
    """Plausible daily shape, 1.0 = mean. PM peaks morning rush; O3 midday."""
    if pol == "o3":
        return 0.45 + 1.1 * max(0.0, math.sin((hour - 7) / 12 * math.pi)) ** 1.5
    return 1.0 + 0.35 * math.exp(-((hour - 8) ** 2) / 6) + 0.15 * math.exp(-((hour - 20) ** 2) / 8) - 0.25 * math.exp(-((hour - 15) ** 2) / 10)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--resp", required=True)
    ap.add_argument("--kit", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    stations_raw = load(os.path.join(a.resp, "allstations.json"))
    snap = max(parse_dt(s["pm25_last_date"]) for s in stations_raw if s.get("pm25_last_date"))
    snap_s = snap.strftime("%Y-%m-%d %H:%M")

    # ---- stations + photos -------------------------------------------------
    os.makedirs(os.path.join(a.out, "assets/stations"), exist_ok=True)
    seen = {}
    counts = {}
    for s in stations_raw:
        if s.get("imagen"):
            h = hashlib.sha1(s["imagen"].encode()).hexdigest()
            counts[h] = counts.get(h, 0) + 1
    stations = []
    for s in sorted(stations_raw, key=lambda x: x["id"]):
        photo = None
        if s.get("imagen"):
            h = hashlib.sha1(s["imagen"].encode()).hexdigest()
            if h in seen:
                photo = seen[h]
            else:
                # an image shared by several stations is IBOCA's generic placeholder
                name = "generic-skyline.jpg" if counts[h] > 1 else "station-%d.jpg" % s["id"]
                photo_to_jpg(s["imagen"], os.path.join(a.out, "assets/stations", name))
                photo = "assets/stations/" + name
                seen[h] = photo
        fields = {
            "pm25": ("pm25_iboca", "pm25_concentracion", "pm25_last_date", "rango_nombre_pm25"),
            "pm10": ("pm10_iboca", "pm10_concentracion", "pm10_last_date", "rango_nombre_pm10"),
            "o3": ("O3_iboca", "O3_concentracion", "o3_last_date", "rango_nombre_o3"),
        }
        pols = {}
        for p, (fi, fc, fd, fr) in fields.items():
            idx = num(s.get(fi))
            last = s.get(fd)
            status = "ok" if idx is not None else "sin-datos"
            if p == "o3" and last and (snap - parse_dt(last)).days > NO_MONITOR_DAYS:
                status = "sin-monitor"
                idx = None
            conc = num(s.get(fc)) if status != "sin-monitor" else None
            pols[p] = {
                "index": None if idx is None else int(round(idx)),
                "band": (s.get(fr) or "").strip().capitalize() if idx is not None else None,
                "concentration": conc,
                "lastDate": last[:16] if last else None,
                "status": status,
            }
        head = num(s.get("iboca"))
        stations.append({
            "id": s["id"],
            "nombre": s["nombre"],
            "abreviatura": s.get("abreviatura"),
            "localidad": (s.get("localidad") or "").strip() or None,
            "lat": float(s["latitud"]),
            "lng": float(s["longitud"]),
            "photo": photo,
            "iboca": {
                "index": None if head is None else int(round(head)),
                "band": (s.get("rango_nombre") or "").strip().capitalize() if head is not None else None,
                "note": "Headline IBOCA; equal to the PM2.5 sub-index at all 19 stations in this snapshot",
            },
            "pollutants": pols,
        })
    write_json(os.path.join(a.out, "data/stations.json"), {
        "_source": "IBOCA allstations response saved 2026-11-06 (06:00 Bogota readings). Base64 photos extracted to assets/stations/.",
        "_rules": {
            "time": "All *_last_date values are America/Bogota local time, zoneless, as served.",
            "sinDatos": "status sin-datos = the fixture index is '--' or null. Never derived from the viewer's clock.",
            "sinMonitor": "status sin-monitor (O3 only) = last O3 reading more than %d days before the snapshot. Inferred: IBOCA has no 'measures this pollutant' flag." % NO_MONITOR_DAYS,
        },
        "snapshot": snap_s,
        "stations": stations,
    })

    # ---- recommendations ---------------------------------------------------
    os.makedirs(os.path.join(a.out, "assets/icons"), exist_ok=True)
    kit_files = {}
    for tipo_dir in ("salud", "ambiente"):
        for root, _, files in os.walk(os.path.join(a.kit, tipo_dir)):
            for f in files:
                if f.endswith(".png"):
                    kit_files[f.rsplit("-", 1)[-1][:-4]] = os.path.join(root, f)
    probes = {3: "rr_10.4.json", 4: "rr_50.6.json", 5: "rr_100.9.json", 6: "rr_150.4.json", 7: "rr_200.6.json"}
    recs = {}
    missing_icons = []
    for name, lo, hi, rid in BANDS:
        items = load(os.path.join(a.resp, probes[rid]))
        out = {"salud": [], "ambiente": []}
        for it in sorted(items, key=lambda x: (x["tipo"], x["posicion"])):
            ts = it["url_img"].rsplit("-", 1)[-1][:-4]
            icon = None
            if ts in kit_files:
                dest = "assets/icons/%s.png" % ts
                shutil.copyfile(kit_files[ts], os.path.join(a.out, dest))
                icon = dest
            else:
                missing_icons.append(ts)
            out["salud" if it["tipo"] == "R" else "ambiente"].append({"titulo": it["titulo"].strip(), "icon": icon})
        entry = {"range": "%d-%d" % (lo, hi), "rango_id": rid, **out}
        if name == "Peligroso":
            entry["note"] = "IBOCA returns recommendations only for 201-300. Values 301-500 reuse this set (recomendationsRange/300.4 and /400.4 returned zero items)."
        recs[name] = entry
    write_json(os.path.join(a.out, "data/recommendations.json"), {
        "_source": "IBOCA recomendationsRange responses saved 2026-11-06 (probe values 10.4, 50.6, 100.9, 150.4, 200.6). Icons from the local IBOCA asset kit, matched by upload timestamp.",
        "_missingIcons": missing_icons,
        "bands": recs,
    })

    # ---- forecast (mock, seeded) -------------------------------------------
    rnd = random.Random(20261106)
    fc_raw = load([os.path.join(a.resp, f) for f in os.listdir(a.resp) if f.startswith("forecastInformation_") and f.endswith(".json")][0])
    # forecast fecha is UTC epoch; Bogota = UTC-5, no DST
    real_fc = {(datetime.utcfromtimestamp(p["fecha"]) - timedelta(hours=5)): float(p["iboca"]) for p in fc_raw}
    forecast = {}
    for st in stations:
        forecast[st["id"]] = {}
        for p in POLS:
            cur = st["pollutants"][p]["index"]
            if cur is None:
                forecast[st["id"]][p] = None
                continue
            base = max(4.0, cur / diurnal(snap.hour, p))
            drift = rnd.uniform(-0.15, 0.2)
            pts, src = [], "mock"
            for i in range(48):
                t = snap + timedelta(hours=i)
                if i == 0:
                    v = cur
                elif st["id"] == 11 and p == "pm25" and t in real_fc:
                    v = real_fc[t]
                    src = "mixed"
                else:
                    v = base * diurnal(t.hour, p) * (1 + drift * i / 48) * rnd.uniform(0.93, 1.07)
                pts.append({"t": t.strftime("%Y-%m-%d %H:%M"), "v": int(round(min(500, max(0, v))))})
            forecast[st["id"]][p] = {"src": src, "points": pts}
    write_json(os.path.join(a.out, "data/mock-forecast.json"), {
        "_mock": True,
        "_note": "Example data. IBOCA's forecastInformation returns ~17 hourly overall-IBOCA points to 23:00 today, with no pollutant and no next days. Tunal PM2.5 hours 07:00-23:00 on 2026-11-06 are the real forecastInformation values (src 'mixed'); everything else is generated around each station's current sub-index with a plausible daily shape (src 'mock'). Point 0 is the current fixture reading.",
        "snapshot": snap_s,
        "series": forecast,
    })

    # ---- history (real for Tunal, mock elsewhere) ----------------------------
    hist_raw = load(os.path.join(a.resp, "stationHistoricalHours_11.json"))
    pol_key = {"PM25": "pm25", "PM10": "pm10", "O3": "o3"}
    real_h = {}
    for r in hist_raw:
        real_h[(pol_key[r["contaminante_name"]], r["fecha_inicio"][:13])] = r["calc_iboca"]
    days = [(snap.replace(hour=0) - timedelta(days=d)) for d in range(5, 0, -1)]
    history = {}
    for st in stations:
        history[st["id"]] = {}
        for p in POLS:
            pd = st["pollutants"][p]
            if pd["status"] == "sin-monitor":
                history[st["id"]][p] = None
                continue
            if st["id"] == 11:
                dd = []
                for d in days:
                    vals = [real_h.get((p, (d + timedelta(hours=h)).strftime("%Y-%m-%d %H"))) for h in range(24)]
                    dd.append({"date": d.strftime("%Y-%m-%d"), "values": vals})
                history[st["id"]][p] = {"src": "real", "days": dd}
                continue
            cur = pd["index"]
            if cur is None:  # no current index: seed from the other PM sub-index or a neutral level
                other = st["pollutants"]["pm10" if p == "pm25" else "pm25"]["index"]
                cur = other if other is not None else 45
            base = max(4.0, cur / diurnal(snap.hour, p))
            dd = []
            for d in days:
                f = rnd.uniform(0.75, 1.25)
                dd.append({"date": d.strftime("%Y-%m-%d"), "values": [int(round(min(500, max(0, base * f * diurnal(h, p) * rnd.uniform(0.9, 1.1))))) for h in range(24)]})
            history[st["id"]][p] = {"src": "mock", "days": dd}
    write_json(os.path.join(a.out, "data/mock-history.json"), {
        "_mock": True,
        "_note": "Example data except Tunal (id 11): Tunal's series are the real hourly calc_iboca values from stationHistoricalHours/11 saved 2026-11-06 (src 'real'; null = hour missing in the response). Other stations are generated around the current sub-index (src 'mock'). Days are the 5 full Bogota-local days before the snapshot.",
        "snapshot": snap_s,
        "series": history,
    })
    print("snapshot", snap_s, "stations", len(stations), "photos", len(seen), "missing icons", missing_icons)


if __name__ == "__main__":
    main()
