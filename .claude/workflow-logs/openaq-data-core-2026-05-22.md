# Workflow Log — OpenAQ v3 Data Core (Phase 1: data layer only)
**Agent:** developer
**Agent ID:** session ended — ID not captured (record when known)
**Project:** /Users/journeyprojects/Library/CloudStorage/OneDrive-Personal/BreatheOS (repo: ~/Code/smallsurfaces/breath-city-test)
**Started:** 2026-05-22
**Last updated:** 2026-05-22

## Status
IN PROGRESS — polish-then-merge pass (resumed 2026-05-22). Bug-tester PASS + senior-developer
APPROVAL to merge into dev already given. 2 cheap senior-dev follow-ups applied + committed +
verified; merging to dev next. Earlier bug-fix pass (3 medium bugs) is done + committed.

## Polish-then-merge result (2026-05-22)
Commits (one per fix, on feature/openaq-data-core):
- 665385d fix(openaq): represent unknown reading age as null, not +Infinity (follow-up #3)
  -> types.ts ageHours: number -> number | null; adapter.ts computeAgeHours returns null for
     undateable timestamp (clock-skew clamp kept for parseable future dates); isStale =
     ageHours === null || ageHours > STALE_THRESHOLD_HOURS; comments updated to "unknown age
     => stale". Non-finite VALUE drop unchanged. Files: types.ts (+9/-3), adapter.ts (+12/-9).
- 0f6edca docs(openaq): correct route caching comments (follow-up #2) -> route.ts comments ONLY:
     route reads searchParams => dynamic => route-level revalidate is a no-op; real guard is
     per-fetch next:{revalidate:600} in client.ts. Kept `export const revalidate = 600` as
     documented fallback. Behavior unchanged. File: route.ts (+14/-5).
Verification: tsc --noEmit CLEAN (both fixes). Throwaway computeAgeHours trace confirmed
''/'not-a-date'/undefined -> ageHours null + isStale true; 3h reading -> 3/fresh; +60h future ->
0/fresh (clamp); 100h -> 100/stale. Trace deleted. Live: london/pm25 200, 30 stations, ageHours
all clean numbers (no Infinity leak), 27 stale / 3 fresh — IDENTICAL to original build; sample
Haringey Roadside ageHours~90113 isStale true. Dev server (npm run dev) stopped; port 3000 clear.
NOT touched: pagination/freshness-ranked cap (getLocationsByBbox + .slice(0,30)) — deferred
ticket. main untouched. No prototype files (direction-1-mapbox-v2/ untouched).

## Polish-then-merge pass (2026-05-22) — senior-dev follow-ups #2 + #3
Scope: exactly two follow-ups, one commit each, then PR feature/openaq-data-core -> dev and merge
(have senior-dev sign-off). Then pull so local dev == origin/dev.
- Fix 1 (follow-up #3): make ageHours honest. types.ts ageHours -> `number | null`;
  computeAgeHours returns null (not +Infinity) for an undateable reading (keep clock-skew clamp
  for parseable future dates); isStale = ageHours === null || ageHours > STALE_THRESHOLD_HOURS;
  update comments to "unknown age => stale". Non-finite VALUE drop (BUG 3) stays as-is.
- Fix 2 (follow-up #2): correct caching comments in route.ts ONLY (comment-only, behavior
  unchanged). Truth: route reads searchParams => dynamic => route-level `revalidate` is a no-op;
  real protection is per-fetch next:{revalidate:600} in client.ts. Keep the export as documented
  fallback. Keep `export const revalidate = 600`.
- NOT touched: pagination/freshness-ranked cap (getLocationsByBbox + .slice(0,30)) — deferred
  ticket for before a 3rd city. main untouched. No prototype files.

## Bug-fix pass result (2026-05-22)
Commits (one per fix, on feature/openaq-data-core):
- 8435352 fix(openaq): isolate per-station /latest failures in mapInBatches (BUG 1)
- 5e0ad4d fix(openaq): treat unparseable reading timestamp as stale, not fresh (BUG 2)
- 267365d fix(openaq): drop stations whose joined reading value is non-finite (BUG 3)
Diff: src/lib/openaq/adapter.ts only, +40/-7. No other source files touched; route.ts,
types.ts, client.ts unchanged; prototype dir empty. No non-blocking observations fixed
(cap-before-freshness, pagination, case-sensitive allowlist, nested null-deref) — left for
senior-developer per dispatch scope.
Verification: tsc --noEmit CLEAN. Throwaway guard trace confirmed both inversions fixed
(''/'not-a-date'/undefined -> isStale:true; null/NaN value -> station dropped) then deleted.
Live: london/pm25 200/30 (3 fresh 27 stale, all finite, Haringey ageHours~90110 isStale:true),
accra/pm25 200/21 (17 fresh 4 stale, all finite). Counts match the original build exactly.
Env note: bare `next dev` 500s because globals.css imports dist/css/tokens.css; the correct dev
command is `npm run dev` (concurrently runs watch:tokens). Ran `npm run build:tokens` once to
generate dist/css/tokens.css (gitignored artifact), then `npm run dev` -> home 200, API 200.
Dev server stopped; port 3000 clear.

## Bug-fix pass (2026-05-22) — runtime validation at OpenAQ boundary
Root cause (all 3): upstream OpenAQ fields typed as clean but not validated at runtime. OpenAQ
is an external API boundary, so runtime validation here is correct and in-policy.
- BUG 1 — mapInBatches uses Promise.all; one flaky /latest rejection collapses the whole city
  -> 502 for all stations. Fix: settle each station independently, map rejection to null, reuse
  existing .filter(s => s !== null). Keep bounded concurrency.
- BUG 2 — computeAgeHours: NaN from a bad/empty/undefined datetime.utc returns 0 -> isStale
  false (a broken timestamp reads as FRESH). Fix: guard non-finite parse before the clamp; treat
  unparseable as stale/unknown age, never fresh. Preserve clock-skew clamp for future dates.
- BUG 3 — fetchStations copies reading.value with no finite check; OpenAQ emits null mid-
  calibration -> NaN downstream. Fix: drop station when value is not Number.isFinite.
BUG 2 + BUG 3 folded into one validation of the joined reading. types.ts value:number unchanged
(fix makes the contract true at runtime). Scope: adapter.ts ONLY. No observations fixed.

## Task summary
Build the OpenAQ v3 data-core: a server-side typed client + adapter that fetches real
air-quality data and exposes it through a cached Next.js route handler. Data layer ONLY
(no UI, no prototype wiring). Additive — new files only. Branch `feature/openaq-data-core`
off latest `dev`. Do NOT open a PR; build + verify + commit, then report to main context
for the bug-tester -> senior-developer review chain.

## Intake (pre-confirmed)
1. Feature: OpenAQ v3 data core (client + adapter + cached route handler)
2. Branch: feature/openaq-data-core off origin/dev
3. Spec: the dispatch prompt + plan at ~/.claude/plans/playful-hatching-marshmallow.md
4. Kit: N/A (non-visual task)

## Completed steps
- [x] Read AGENT.md + plan + all listed skills — completed 2026-05-22
- [x] Confirmed repo path, build-safety whitelist, repo exists, git clean on main — completed 2026-05-22
- [x] Read existing Sensor shape (sensors.ts) — import, never modify — completed 2026-05-22
- [x] Confirmed env keys present (OPENAQ_API_KEY server-only), gitignore covers .env*.local — completed 2026-05-22
- [x] Created workflow log — completed 2026-05-22

## Current step
Build complete and verified live against the OpenAQ API. All files committed to
feature/openaq-data-core in 3 increments + this log. Reporting to main context.
NO PR opened (review chain handled from main context).

## Completed steps (build phase)
- [x] Branch feature/openaq-data-core off dev (b5d6202) — 2026-05-22
- [x] src/lib/openaq/types.ts — 2026-05-22 (commit 9673637)
- [x] src/lib/openaq/cities.ts — 2026-05-22 (commit 9673637)
- [x] src/lib/openaq/client.ts — 2026-05-22 (commit d4f3350)
- [x] src/lib/openaq/adapter.ts — 2026-05-22 (commit d4f3350)
- [x] src/app/api/stations/route.ts — 2026-05-22 (commit 2b582d7)
- [x] .env.example — 2026-05-22 (commit 2b582d7)
- [x] npm install (deps were not present in this clone) — 2026-05-22
- [x] tsc --noEmit clean (zero errors) — 2026-05-22
- [x] Live verification: London pm25 200 (30 stations), Accra pm25 200 (21 stations),
      London no2 200 (cold-cache, exercises bounded-batch), all 4x 400 cases — 2026-05-22
- [x] Bounded-batch concurrency fix (LATEST_FETCH_CONCURRENCY=6) after first Accra
      request hit a transient 502 from bursting 30 parallel /latest calls past 60/min — 2026-05-22
- [x] Prototype build-standard self-check (data-layer items pass) — 2026-05-22
- [x] Confirmed prototype files untouched (git status on direction-1-mapbox-v2/ empty) — 2026-05-22
- [x] Dev server stopped — 2026-05-22

## Pending steps (NOT this agent — main context / review chain)
- [ ] bug-tester run (self-triggers on build-clean)
- [ ] senior-developer review (architecture + secret handling) before any merge
- [ ] PR feature/openaq-data-core -> dev (opened from main context after review)
- [ ] security-expert audit before any Netlify deploy (a secret is now in play)

## Handoff notes
- Sensor type lives in src/app/direction-1-mapbox-v2/sensors.ts — import { Sensor, SensorQuality }.
  Do NOT modify that file or any direction-1-mapbox-v2/* file.
- OpenAQ upstream facts are probe-verified (live API today), see dispatch prompt. Build from
  those, not docs. Key facts: values are NOT in /locations — must call /locations/{id}/latest;
  per-sensor staleness is rampant (derive freshness from the specific parameter sensor's
  datetime.utc, never location headline date); bbox is the only working geo filter.
- Named consts required: MAX_STATIONS_PER_CITY=30, STALE_THRESHOLD_HOURS=24.
- Caching: revalidate=600 (10 min). Key is server-only — never log it, never NEXT_PUBLIC.
- Verified bboxes: London -0.510,51.287,0.334,51.692 ; Accra -0.35,5.45,0.10,5.85.

## Surprises / upstream quirks hit
- Deps were NOT installed in this repo clone (no node_modules). Ran `npm install` (701
  pkgs) before tsc/dev. The bare `tsc` / `next` are not on PATH — must invoke via
  ./node_modules/.bin/.
- Transient 502 on the FIRST Accra request: 30 parallel /latest calls landing right after
  London's 30+30 calls burst past the 60/min limit; several exhausted their 429 retries
  together. Fixed by bounding /latest concurrency to 6 (mapInBatches). Cold-cache London
  no2 then returned 200 in ~1.4s, confirming the fix. NOTE for senior-developer: the
  per-minute budget is comfortable in steady state (x-ratelimit-remaining was 59 right
  after a single locations probe) — the only risk is the parallel burst, now bounded.
- Per-parameter staleness is dramatic and real: "Haringey Roadside" pm25 is ~90,109h old
  (isStale true) while its no2 is 1.5h old (isStale false) on the SAME location. Confirms
  freshness MUST come from the parameter sensor, not the location headline (it does).
- London pm25: of 30 stations only 3 are fresh (27 stale). Accra pm25: 21 stations, 17
  fresh. Real data — "show all, flag age" is doing real work. Downstream consumers should
  decide stale handling (toLegacySensors has excludeStale for triangulation).
- next dev warns about multiple lockfiles (it picked ~/package-lock.json as workspace root,
  detected the repo's own package-lock.json too). Benign, pre-existing, not introduced by
  this task — left untouched (would be a config change outside this data-layer scope).
- tsconfig.tsbuildinfo is tracked in the repo (pre-existing) and churns on every tsc run; I
  did NOT stage its churn. The repo tracks workflow logs (April log is tracked), so I
  committed this log to match convention.

## Blockers
None.
