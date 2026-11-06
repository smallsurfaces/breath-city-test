#!/usr/bin/env python3
"""
fit_hotspots.py — map station markers on the static IBOCA map image to station ids.

Method: marker centres were read by eye off the 1549x977 screenshot (MARKERS,
with the value printed on each marker for reference). A similarity transform
  x = a + s*lng,  y = b - s*lat   (uniform scale, no rotation; fine at this
  extent near the equator)
is fitted by least squares, iterating: fit -> assign each station to its
nearest unused marker (greedy by distance) -> refit. Hotspot = the marker
centre (the eye-read point), so the hotspot always sits on a drawn marker;
the fit only decides WHICH station a marker is.
Usage: python3 -I _build/fit_hotspots.py <iboca-panel dir>
"""
import json, math, os, sys
OUT = sys.argv[1]
# (x, y, value shown on the marker in the screenshot)
MARKERS = [(1023,52,"32"),(879,114,"56"),(785,192,"60"),(949,188,"57"),(1057,269,"41"),
 (911,323,"58"),(732,360,"--"),(718,391,"72"),(907,419,"68"),(972,457,"35"),(956,515,"36"),
 (681,516,"90"),(809,496,"76"),(817,564,"65"),(719,601,"113"),(667,654,"110"),(770,658,"63"),
 (907,669,"41"),(826,790,"93")]
st = json.load(open(os.path.join(OUT,"data/stations.json")))["stations"]
def fit(pairs):
    # least squares for s, a, b with x = a + s*lng, y = b - s*lat
    n=len(pairs); 
    ml=sum(p["lng"] for p,_ in pairs)/n; mt=sum(p["lat"] for p,_ in pairs)/n
    mx=sum(m[0] for _,m in pairs)/n; my=sum(m[1] for _,m in pairs)/n
    num=sum((p["lng"]-ml)*(m[0]-mx) - (p["lat"]-mt)*(m[1]-my) for p,m in pairs)
    den=sum((p["lng"]-ml)**2 + (p["lat"]-mt)**2 for p,_ in pairs)
    s=num/den; return s, mx - s*ml, my + s*mt
# seed: northernmost station <-> topmost marker, southernmost <-> lowest marker
N=max(st,key=lambda p:p["lat"]); S=min(st,key=lambda p:p["lat"])
top=min(MARKERS,key=lambda m:m[1]); bot=max(MARKERS,key=lambda m:m[1])
s,a,b = fit([(N,top),(S,bot)])
for it in range(6):
    proj={p["id"]:(a+s*p["lng"], b-s*p["lat"]) for p in st}
    cand=sorted((math.dist(proj[p["id"]],m[:2]),p["id"],i) for p in st for i,m in enumerate(MARKERS))
    used_p,used_m,assign=set(),set(),{}
    for d,pid,i in cand:
        if pid in used_p or i in used_m: continue
        used_p.add(pid); used_m.add(i); assign[pid]=(i,d)
    byid={p["id"]:p for p in st}
    s,a,b = fit([(byid[pid],MARKERS[i]) for pid,(i,d) in assign.items()])
res=[]
for pid,(i,d) in sorted(assign.items()):
    p=byid[pid]; m=MARKERS[i]
    res.append({"stationId":pid,"nombre":p["nombre"],"x":m[0],"y":m[1],"markerValue":m[2],"fitResidualPx":round(d,1)})
json.dump({"_method":"Marker centres read by eye from the 1549x977 screenshot; station identity assigned by a least-squares lat/long->pixel similarity fit (x = a + s*lng, y = b - s*lat) with greedy nearest assignment, iterated. Hotspot position = the marker centre.",
 "transform":{"s":round(s,3),"a":round(a,2),"b":round(b,2)},"image":{"w":1549,"h":977},"hotspots":res},
 open(os.path.join(OUT,"data/hotspots.json"),"w"),ensure_ascii=False,indent=1)
for r in res: print(r)
