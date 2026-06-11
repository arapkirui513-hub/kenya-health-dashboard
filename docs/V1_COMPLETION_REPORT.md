# Kenya Health Facilities Dashboard – Version 1 Completion Report

**Project:** Kenya Health Facilities Dashboard
**Version:** v1.0.0 – Portfolio Release
**Status:** Production deployed and stable
**Prepared for:** Version 2 planning
**Date:** June 2026

---

# 1. Executive Summary

The Kenya Health Facilities Dashboard has successfully reached Version 1.0.0.

The project has moved from a local analytics prototype into a deployed full-stack healthcare analytics platform. It now supports national-level health facility exploration, county-level analysis, facility search, service availability review, ART gap analysis, multi-service coverage scoring, geographic visualisation, public API access, and production deployment.

Version 1 now serves as a portfolio-ready healthcare analytics product that demonstrates:

* Healthcare data analytics
* Backend API development
* Frontend dashboard development
* Geospatial visualisation
* Service gap analysis
* Cloud deployment
* Documentation
* Release management
* Basic production reliability improvements

The project is ready to move into Version 2, focused on population-adjusted access, disease burden analysis, and health need intelligence.

---

# 2. Live Project Links

## Frontend

https://kenya-health-dashboard.vercel.app/

## Backend API

https://kenya-health-dashboard-api.onrender.com

## API Documentation

https://kenya-health-dashboard-api.onrender.com/docs

## GitHub Repository

https://github.com/arapkirui513-hub/kenya-health-dashboard

## Production Health Check

https://kenya-health-dashboard-api.onrender.com/health

## Release

v1.0.0 – Portfolio Release

---

# 3. Project Objective

The objective of Version 1 was to build a healthcare analytics dashboard that helps users explore:

* Health facility distribution across Kenya
* Facility ownership patterns
* Facility categories
* County-level facility distribution
* Service availability
* ART service gaps
* Multi-service coverage gaps
* Geographic differences in health facility access

The platform makes health facility data easier to explore without requiring users to work directly with spreadsheets or raw datasets.

---

# 4. Dataset Coverage

The dashboard analyzes:

```text
10,483 health facilities
```

The dataset includes:

* Counties
* Provinces
* Facility categories
* Ownership categories
* Service indicators

Services analyzed:

* FP
* IPD
* HBC
* C-IMCI
* ART

---

# 5. Technology Stack

## Backend

* FastAPI
* Pandas
* OpenPyXL
* Uvicorn

Backend responsibilities:

* Data loading
* Data cleaning support
* Aggregation
* Analytics calculations
* API endpoint management
* CSV export
* Health check endpoint

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Recharts
* React Leaflet
* Leaflet

Frontend responsibilities:

* Dashboard UI
* API data fetching
* Charts and visualisations
* County map rendering
* Facility search and filtering
* CSV export interaction
* Loading and error handling

## Deployment

Frontend:

```text
Vercel
```

Backend:

```text
Render
```

Automation:

```text
GitHub Actions
```

---

# 6. Backend Features Completed

## 6.1 Summary Endpoint

Endpoint:

```text
/summary
```

Provides:

* Total facilities
* Counties covered
* Provinces covered
* Facility categories
* Ownership categories

Status:

```text
Complete
```

---

## 6.2 Ownership Breakdown

Endpoint:

```text
/ownership
```

Provides:

* Public facilities
* Private facilities
* Faith-based facilities
* NGO facilities
* Community facilities
* Academic facilities

Status:

```text
Complete
```

---

## 6.3 Facility Categories

Endpoint:

```text
/facility-types
```

Provides:

* Facility category counts

Status:

```text
Complete
```

---

## 6.4 County Statistics

Endpoint:

```text
/counties
```

Provides:

* Facility totals by county
* Ownership breakdown by county

Status:

```text
Complete
```

---

## 6.5 Service Availability

Endpoint:

```text
/services
```

Provides:

* FP availability
* IPD availability
* HBC availability
* C-IMCI availability
* ART availability

Status:

```text
Complete
```

---

## 6.6 Facility Finder API

Endpoint:

```text
/facilities
```

Features:

* County filtering
* Ownership filtering
* Facility category filtering
* Search by facility name
* Pagination

Status:

```text
Complete
```

---

## 6.7 CSV Export

Endpoint:

```text
/facilities/export
```

Features:

* Export filtered facilities
* Download CSV directly

Status:

```text
Complete
```

---

## 6.8 Service Gap Scoring

Endpoint:

```text
/service-gap-score
```

Features:

* Calculates percentage coverage across FP, IPD, HBC, C-IMCI, and ART
* Generates county-level service coverage score
* Supports identification of counties with lower service availability

Status:

```text
Complete
```

---

## 6.9 Health Check Endpoint

Endpoint:

```text
/health
```

Response:

```json
{
  "status": "ok",
  "service": "Kenya Health Facilities Dashboard API",
  "version": "v1.0.0"
}
```

Purpose:

* Supports uptime monitoring
* Supports GitHub Actions keep-alive workflow
* Confirms backend availability

Status:

```text
Complete
```

---

# 7. Frontend Features Completed

## 7.1 National Overview Cards

Displays:

* Total facilities
* Counties covered
* Provinces covered
* Facility categories

Status:

```text
Complete
```

---

## 7.2 Ownership Pie Chart

Displays:

* Ownership distribution across facilities

Status:

```text
Complete
```

---

## 7.3 Facility Category Chart

Displays:

* Facility category frequencies

Status:

```text
Complete
```

---

## 7.4 Top Counties Chart

Displays:

* Counties with the highest facility counts

Status:

```text
Complete
```

---

## 7.5 Lowest Facility Counties Chart

Displays:

* Counties with the lowest facility counts

Status:

```text
Complete
```

---

## 7.6 Service Availability Chart

Displays:

* County-level service availability

Status:

```text
Complete
```

---

## 7.7 ART Service Gap Analysis

Displays:

* Counties with the lowest ART coverage

Status:

```text
Complete
```

---

## 7.8 Multi-Service Coverage Scoring

Displays:

* Counties with the lowest overall service coverage scores

Purpose:

* Helps identify counties that may need broader healthcare service expansion

Status:

```text
Complete
```

---

## 7.9 Facility Finder

Features:

* Search by facility name
* County filter
* Ownership filter
* Facility category filter
* Pagination
* CSV export

Status:

```text
Complete
```

---

# 8. Geographic Analytics Completed

## Kenya County Choropleth Map

Features:

* County boundaries
* Dynamic colouring
* Hover interaction
* Tooltip information
* Ownership statistics
* County detail panel
* Dynamic legend

Status:

```text
Complete
```

Impact:

The choropleth map gives the project a strong visual and analytical layer. It helps users move from table-based data exploration to geographic interpretation.

---

# 9. Production and Reliability Improvements

## 9.1 CORS Restriction

Previous configuration:

```python
allow_origins=["*"]
```

Updated configuration:

* Restricted to approved deployment origins

Benefit:

* Reduced attack surface
* Improved production-readiness
* Safer frontend-backend communication

Status:

```text
Complete
```

---

## 9.2 Backend Health Endpoint

Added:

```text
GET /health
```

Purpose:

* Confirms backend is running
* Supports uptime pings
* Improves deployment monitoring

Status:

```text
Complete
```

---

## 9.3 GitHub Actions Keep-Alive Workflow

Added workflow file:

```text
.github/workflows/keep-backend-awake.yml
```

Purpose:

* Pings the Render backend health endpoint every 10 minutes
* Reduces first-load delays caused by backend cold starts
* Can be triggered manually from GitHub Actions

Health endpoint used:

```text
https://kenya-health-dashboard-api.onrender.com/health
```

Status:

```text
Complete
```

---

# 10. Documentation Completed

## README

The project README now includes:

* Project overview
* Live frontend link
* Backend API link
* API documentation link
* Features
* Technology stack
* Screenshots
* API endpoints
* Local setup instructions
* Deployment details
* Release information

Status:

```text
Complete
```

---

## Screenshots

Added:

* Dashboard overview
* County map
* County detail panel

Status:

```text
Complete
```

---

## GitHub Copilot Instructions

Added:

```text
.github/copilot-instructions.md
```

Purpose:

* Gives Copilot project context
* Reduces hallucinated code changes
* Guides future feature development
* Protects existing architecture
* Defines Version 2 direction

Status:

```text
Complete
```

---

# 11. Release Management

Version released:

```text
v1.0.0 – Portfolio Release
```

Release includes:

* Stable deployed frontend
* Stable deployed backend
* Public API documentation
* Dashboard analytics
* Facility finder
* CSV export
* Choropleth map
* Service gap scoring
* Screenshots
* Documentation

Status:

```text
Complete
```

---

# 12. GitHub and Portfolio Improvements

## GitHub Profile README

A special GitHub profile repository was created or updated:

```text
arapkirui513-hub
```

Purpose:

* Makes the GitHub profile more portfolio-focused
* Highlights healthcare workflow and data systems positioning
* Features the Kenya Health Facilities Dashboard as the flagship project
* Links live projects, GitHub repositories, and contact information

Status:

```text
Complete or in progress depending on final push confirmation
```

---

## LinkedIn Project Promotion

The Kenya Health Facilities Dashboard was added or prepared for LinkedIn as a featured project.

Positioning:

* Full-stack healthcare analytics platform
* 10,483 facility records
* County-level facility access analysis
* Service gap scoring
* Geospatial health infrastructure visualisation
* Public API and deployed dashboard

Status:

```text
Complete or in progress depending on final LinkedIn profile update
```

---

# 13. Version 1 Deployment Verification

| Component                          | Status   |
| ---------------------------------- | -------- |
| Frontend deployment                | Complete |
| Backend deployment                 | Complete |
| API docs                           | Complete |
| Health endpoint                    | Complete |
| GitHub Actions keep-alive workflow | Complete |
| Choropleth map                     | Complete |
| Facility finder                    | Complete |
| Pagination                         | Complete |
| CSV export                         | Complete |
| Service gap scoring                | Complete |
| README screenshots                 | Complete |
| GitHub release                     | Complete |
| GitHub Copilot instructions        | Complete |

---

# 14. Known Observation

## Frontend Initial Load Delay

Observed:

* First load may occasionally take several seconds.

Likely cause:

* Render free-tier backend cold start.

Current mitigation:

* Added `/health` endpoint
* Added GitHub Actions keep-alive workflow that pings the backend every 10 minutes

Remaining limitation:

* A paid backend hosting plan would provide stronger reliability than keep-alive pings.

Impact:

```text
Low to medium
```

Status:

```text
Monitoring
```

---

# 15. Version 1 Outcome

Version 1 successfully achieved its original goal.

The project now demonstrates:

* Data analytics
* Healthcare operations awareness
* API development
* Frontend development
* Geospatial analytics
* Cloud deployment
* Documentation
* Release management
* AI-assisted development workflow
* Basic production monitoring

Overall assessment:

```text
Successful Version 1 delivery
```

Current project status:

```text
Production ready
```

---

# 16. Version 2 Direction

Version 2 should move the project from descriptive healthcare analytics into need-adjusted healthcare access intelligence.

Version 1 answered:

```text
Where are health facilities located, and what services are available?
```

Version 2 should answer:

```text
Are health facilities distributed according to population size and health need?
```

---

# 17. Recommended Version 2 Theme

Recommended version name:

```text
v2.0.0 – Population and Health Need Intelligence
```

Core idea:

Add population and disease burden data so the dashboard can compare facility supply against healthcare need.

---

# 18. Proposed Version 2 Data Additions

## 18.1 County Population Data

Add:

* 2009 county population
* 2019 county population
* Population growth
* Population density if available

Purpose:

* Calculate facility access relative to population
* Avoid misleading county comparisons based only on raw facility counts

Key metrics:

```text
facilities_per_100k_population
public_facilities_per_100k_population
private_facilities_per_100k_population
art_facilities_per_100k_population
```

---

## 18.2 Disease Burden Data

Add selected county-level disease burden indicators.

Recommended starting indicators:

* HIV burden or HIV prevalence
* Malaria burden
* Under-5 mortality
* Maternal health indicator
* NCD or chronic disease indicator

Purpose:

* Compare health facility and service coverage against health need
* Identify counties where burden appears high but service availability is low

---

## 18.3 Health Need Gap Score

Create a transparent score that compares:

* Disease burden pressure
* Service availability
* Facility access density

Suggested simple formula:

```text
Health Need Gap = Disease Burden Score - Service Coverage Score
```

Interpretation:

| Pattern                             | Meaning                     |
| ----------------------------------- | --------------------------- |
| High burden + low service coverage  | Priority gap county         |
| High burden + high service coverage | High-need but better served |
| Low burden + low service coverage   | Monitor                     |
| Low burden + high service coverage  | Better positioned           |

---

# 19. Recommended Version 2 Backend Endpoints

## Population Endpoint

```text
/population
```

Returns:

* County
* Population 2009
* Population 2019
* Population growth

---

## Access Density Endpoint

```text
/access-density
```

Returns:

* County
* Total facilities
* Population
* Facilities per 100,000 population
* Public facilities per 100,000 population
* ART facilities per 100,000 population

---

## Disease Burden Endpoint

```text
/disease-burden
```

Returns:

* County
* Disease indicators
* Disease burden score

---

## Health Need Score Endpoint

```text
/health-need-score
```

Returns:

* County
* Service coverage score
* Disease burden score
* Access density score
* Health need gap score
* Priority level

---

## County Comparison Endpoint

```text
/county-comparison
```

Returns side-by-side county metrics for:

* Facility count
* Ownership
* Services
* Population
* Access density
* Disease burden
* Health need gap

---

# 20. Recommended Version 2 Frontend Features

## 20.1 Population-Adjusted Access Section

Show:

* Facilities per 100,000 population
* Public facilities per 100,000 population
* ART facilities per 100,000 population

Visuals:

* Bar chart of lowest facility density counties
* Ranking table

---

## 20.2 Population vs Facility Distribution

Show:

* Whether facility counts align with population size

Visual:

```text
Scatter plot
X-axis: Population
Y-axis: Total facilities
Bubble size: Service coverage score
```

---

## 20.3 Health Need Gap Ranking

Show:

* Counties with high disease burden and low service coverage

Visual:

```text
County | Disease burden score | Service coverage score | Need gap | Priority level
```

---

## 20.4 County Comparison Tool

Allow users to compare two counties side by side.

Compare:

* Population
* Facility count
* Facilities per 100,000 population
* Ownership mix
* Service availability
* Disease burden indicators
* Health need gap score

---

## 20.5 PDF County Report Export

Generate downloadable county reports with:

* County overview
* Facility count
* Ownership mix
* Service coverage
* Population-adjusted access
* Disease burden indicators
* Health need gap interpretation

---

# 21. Recommended Version 2 Build Order

## Phase 1 – Data Foundation

* Add county population CSV
* Normalize county names
* Validate all 47 counties
* Add `/population`
* Add `/access-density`

## Phase 2 – Frontend Population Analytics

* Add population-adjusted access chart
* Add lowest facility density counties table
* Add interpretation text

## Phase 3 – Disease Burden Layer

* Add disease burden dataset
* Add `/disease-burden`
* Add burden score calculation

## Phase 4 – Health Need Gap Score

* Add `/health-need-score`
* Create priority classification
* Add ranking table and chart

## Phase 5 – County Comparison Tool

* Add county selector
* Add side-by-side comparison cards
* Add comparison summary

## Phase 6 – Report Export

* Add PDF export for county analytics
* Include population, services, burden, and recommendations

---

# 22. Version 2 Success Criteria

Version 2 will be successful if the dashboard can answer:

* Which counties have low facility access relative to population?
* Which counties have low public facility density?
* Which counties have low ART facility access relative to population?
* Which counties have high health burden but low service coverage?
* Which counties should be prioritized for deeper health planning review?
* How do two counties compare across population, services, and need?

---

# 23. Recommended Next Immediate Task

Start Version 2 with the cleanest, highest-value feature:

```text
Add county population data and calculate facilities per 100,000 population
```

Why this comes first:

* It is easier than disease burden data
* It builds directly on existing county metrics
* It improves the dashboard’s analytical quality immediately
* It creates the foundation for health equity and need-adjusted scoring

Recommended first Version 2 issue:

```text
Add county population layer and access density endpoint
```

Acceptance criteria:

* Add `county_population.csv`
* Include all 47 counties
* Add 2009 and 2019 population fields
* Normalize county names
* Add `/population`
* Add `/access-density`
* Return facilities per 100,000 population
* Keep existing endpoints unchanged
* Add clear error handling for missing population data

---

# 24. Final Assessment

Version 1 is complete and strong enough for portfolio presentation.

The project now has a stable base, live deployment, public API, documentation, release tag, automation, and a clear healthcare analytics story.

Version 2 should build on this by adding population-adjusted and disease-burden-aware analytics.

Project status:

```text
Version 1 complete
Version 2 ready to begin
```
