# Workflow Log — Direction 1 Mapbox v2 Port

**Agent:** developer
**Agent ID:** —
**Project:** /Users/journeyprojects/Documents/GitHub/breath-city-test/
**Started:** 2026-04-02
**Last updated:** 2026-04-02

## Status
IN PROGRESS

## Completed steps
- [x] Workflow log created — 2026-04-02

## Current step
All prototype source files read. Creating route directory and writing ported files.

## Pending steps
- [ ] Read all prototype source files (App.tsx, components/*, data/*, lib/*, utils/*)
- [ ] Read target repo structure (existing direction-1-mapbox for patterns)
- [ ] Read target repo src/app/page.tsx for homepage link pattern
- [ ] Read target repo package.json for installed deps
- [ ] Create route directory: src/app/direction-1-mapbox-v2/
- [ ] Port all components with 'use client' and process.env token
- [ ] Add homepage link to page.tsx
- [ ] Run npm run build inside target repo
- [ ] Deploy to Netlify
- [ ] Report deploy URL

## Handoff notes
- Source: /Users/journeyprojects/Desktop/Breathe Cities/design/prototypes/air-quality-map/src/
- Target: /Users/journeyprojects/Documents/GitHub/breath-city-test/src/app/direction-1-mapbox-v2/
- Token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN (already in .env.local)
- No new npm installs unless a package is missing from package.json
- Use inline styles (not Tailwind) for new prototype-specific styles
- Check existing direction-1-mapbox/ for AnnotationLayer reuse

## Blockers
None yet
