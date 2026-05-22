# Workflow Log — OpenAQ v3 Data Core (Phase 1: data layer only)
**Agent:** developer
**Agent ID:** session ended — ID not captured (record when known)
**Project:** /Users/journeyprojects/Library/CloudStorage/OneDrive-Personal/BreatheOS (repo: ~/Code/smallsurfaces/breath-city-test)
**Started:** 2026-05-22
**Last updated:** 2026-05-22

## Status
COMPLETE (build + verification done; awaiting bug-tester -> senior-developer review chain from main context. NO PR opened, per dispatch.)

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
