# GitHub Copilot Instructions – Kenya Health Facilities Dashboard

## Project Overview

This repository contains the Kenya Health Facilities Dashboard, a full-stack healthcare analytics platform for exploring health facility distribution, ownership patterns, service availability, county-level access gaps, and geographic health infrastructure patterns across Kenya.

The project is currently at:

Version: v1.0.0 – Portfolio Release
Status: Production deployed and stable

Production links:

Frontend:
https://kenya-health-dashboard.vercel.app/

Backend:
https://kenya-health-dashboard-api.onrender.com

API Docs:
https://kenya-health-dashboard-api.onrender.com/docs

GitHub:
https://github.com/arapkirui513-hub/kenya-health-dashboard

## Main Product Goal

The dashboard helps users understand:

* Where health facilities are located across Kenya
* How facilities are distributed by county
* How ownership varies between public, private, faith-based, NGO, community, and academic facilities
* Which services are available by county
* Which counties may have service availability gaps
* How facility distribution relates to future population-adjusted and health-need analytics

The project should remain portfolio-ready, stable, readable, and easy to explain to healthcare, data, and product reviewers.

## Technology Stack

Backend:

* FastAPI
* Pandas
* OpenPyXL
* Uvicorn

Frontend:

* React
* Vite
* Tailwind CSS
* Axios
* Recharts
* React Leaflet
* Leaflet

Deployment:

* Frontend: Vercel
* Backend: Render

## Current Completed Features

The following v1.0.0 features are already complete and should not be broken:

* National overview cards
* Ownership breakdown
* Facility category chart
* Top counties chart
* Lowest facility counties chart
* Service availability chart
* ART service gap analysis
* Multi-service coverage scoring
* Facility finder
* Facility search
* County filtering
* Ownership filtering
* Facility category filtering
* Pagination
* CSV export
* Kenya county choropleth map
* County hover interaction
* County tooltip
* County detail panel
* Dynamic legend
* Restricted CORS
* README documentation
* Screenshots
* GitHub release v1.0.0

## Existing Backend Endpoints

Preserve existing endpoint behavior unless a task specifically requires a safe extension.

Current endpoints include:

* `/summary`
* `/ownership`
* `/facility-types`
* `/counties`
* `/services`
* `/facilities`
* `/facilities/export`
* `/service-gap-score`

Potential next endpoints for v1.1.0 may include:

* `/health`
* `/population`
* `/access-density`
* `/health-need-score`
* `/county-comparison`

Do not invent or use a frontend API route unless the backend endpoint exists or the current task asks you to create it.

## Development Rules

Before editing code:

1. Inspect the existing repository structure.
2. Identify the files already responsible for the feature.
3. Reuse existing naming patterns.
4. Reuse existing API patterns.
5. Reuse existing Tailwind styling patterns.
6. Keep the change small and reviewable.
7. Avoid rewriting working architecture.
8. Avoid deleting or replacing working features.
9. Avoid adding unnecessary dependencies.
10. Explain the implementation plan before making large changes.

## Backend Rules

When editing backend code:

* Keep FastAPI endpoints simple and readable.
* Use Pandas for data aggregation and merging.
* Return JSON-friendly response objects.
* Keep existing response formats stable.
* Add clear error handling for missing files, missing columns, or empty data.
* Normalize county names before joining datasets.
* Do not hard-code fake analytics results.
* Do not silently ignore failed data joins.
* Prefer transparent calculations over complex hidden scoring logic.
* Add lightweight endpoints when needed, such as `/health`, for deployment monitoring.
* Make sure new endpoints appear in FastAPI Swagger docs.

## Frontend Rules

When editing frontend code:

* Use the existing API base URL configuration.
* Use Axios for API requests.
* Use Recharts for charts.
* Use React Leaflet only for map-related features.
* Keep sections visually consistent with the existing dashboard.
* Add loading states for every new API call.
* Add error states for every new API call.
* Avoid overcomplicated state management.
* Keep components readable.
* Keep chart labels clear.
* Avoid cluttered dashboards.
* Do not remove existing charts, maps, filters, or export features unless explicitly requested.

## Data Rules

The current dataset contains 10,483 health facilities.

Current analysis includes:

* Counties
* Provinces
* Facility categories
* Ownership categories
* FP
* IPD
* HBC
* C-IMCI
* ART

Future v1.1.0 work may include:

* 2009 county population data
* 2019 county population data
* County population growth
* Facilities per 100,000 population
* Disease burden indicators
* Health need gap scoring
* Population-adjusted access metrics

When adding population or disease burden data:

* Store data files clearly in the backend data folder.
* Use clean column names.
* Include county names in a consistent format.
* Normalize county names before merging.
* Keep formulas transparent.
* Do not claim causal relationships from descriptive data.
* Label modelled or proxy indicators clearly.

## v1.1.0 Product Direction

The next version should focus on population-adjusted and health-need analytics.

The key product question is:

Are health facilities distributed according to population size and health need?

Priority features:

1. Backend health check endpoint
2. Backend uptime keep-alive workflow
3. County population layer
4. Facilities per 100,000 population
5. 2009 vs 2019 population growth
6. Service coverage rankings
7. Disease burden layer
8. Health need gap score
9. County comparison tool
10. PDF county report export

Recommended first v1.1.0 feature:

Add population-adjusted facility access using county population data.

## UI and UX Principles

The dashboard should feel:

* Clean
* Professional
* Healthcare-focused
* Easy to scan
* Useful for planning and portfolio review

Use clear section titles.

Good examples:

* Population-Adjusted Access
* Lowest Facility Density Counties
* Service Coverage Rankings
* Health Need Gap
* County Comparison
* Priority Gap Counties

Avoid vague titles.

Avoid overcrowding the dashboard with too many charts in one section.

## Code Quality Rules

All changes should:

* Be easy to review
* Use clear variable names
* Avoid duplicated logic where practical
* Avoid unnecessary abstraction
* Preserve existing functionality
* Build successfully
* Run locally
* Keep the app deployable on Vercel and Render

## Testing and Validation

After making changes, check:

Backend:

* FastAPI server starts successfully
* Existing endpoints still respond
* New endpoints return valid JSON
* New endpoints appear in `/docs`
* No data loading errors occur

Frontend:

* Vite dev server starts successfully
* Production build succeeds
* Existing dashboard sections still render
* New sections handle loading states
* New sections handle API errors
* Charts display readable labels
* Filters and CSV export still work

## Deployment Rules

Do not change deployment configuration unless the task specifically asks for it.

Current deployment:

* Frontend: Vercel
* Backend: Render

Known production observation:

The frontend may appear slow on first load because the Render free-tier backend can cold start after inactivity.

A valid improvement is to add:

* `/health` backend endpoint
* GitHub Actions keep-alive workflow
* Better frontend loading message

## Pull Request Rules

For pull requests:

* Keep the scope narrow.
* Describe what changed.
* Mention affected files.
* Mention how the change was tested.
* Do not mix unrelated features in one PR.
* Do not include large rewrites unless explicitly requested.

## Important Constraints

Do not:

* Remove existing working features
* Rewrite the whole frontend
* Rewrite the whole backend
* Invent fake data
* Invent endpoints without implementing them
* Break deployed URLs
* Change existing API response formats without a clear reason
* Add heavy dependencies for simple tasks
* Make the project harder to explain

Always prioritize a stable, portfolio-ready healthcare analytics dashboard.
