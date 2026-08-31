# TODOS

## Agents / Sourcing

### Replace LinkedIn scraping with a compliant integration

**What:** `linkedinScraper.ts` and `/api/agent/linkedin` currently automate a real LinkedIn login (when credentials are set) plus DOM scraping to extract job listings. Per plan-eng-review (2026-08-31), the authenticated-login path is being removed entirely — this TODO tracks what actually replaces it.

**Why:** LinkedIn jobs are a valuable source, but automated login + scraping is explicitly against LinkedIn's ToS and is actively detected (account/IP ban risk). There's no compliant way to keep the current approach; it just gets deleted, not fixed. The real need (surfacing LinkedIn job listings for users) is still unmet after that removal.

**Context:** The only compliant paths are (a) LinkedIn's official Jobs API, which requires limited partner/developer access LinkedIn grants selectively, or (b) a licensed third-party job-data provider that already has a legitimate LinkedIn data feed. Neither is something to build in a normal coding session — this requires a business-side step (applying for partner access, or evaluating/paying for a data vendor) before any code gets written. Whoever picks this up should start there, not by looking for a "better scraper."

**Effort:** L
**Priority:** P3
**Depends on:** None (but blocked in practice on external partner/vendor access being obtained first)

## Admin

### Build a real System Queries log for the admin dashboard

**What:** `AdminDashboardContent.tsx`'s "System Queries" tab shows hardcoded mock log lines (fake timestamps, a fabricated "Crawling Remotive API page 3..." message, etc.) — self-aware in a code comment as demo data. Per plan-eng-review (2026-08-31), the sibling "User Registry" tab was rewired to real data in the same pass; this tab was deliberately left as tracked scope instead, since it needs actual infrastructure this app doesn't have yet.

**Why:** An admin's "system queries" / audit log view is only meaningful if backed by something that actually records events (scrape attempts, extraction results, errors) as they happen — right now nothing in the codebase writes such a log anywhere.

**Context:** Building this for real means adding an events/audit table (e.g. a `scrape_events` table written to by `scout/route.ts` and the agent files whenever a source is fetched or fails), then querying and rendering the most recent rows here instead of the mock array. Whoever picks this up should design the event schema first — what's actually useful to show an admin (source, status, timestamp, error message) — before touching this component.

**Effort:** M
**Priority:** P3
**Depends on:** None
