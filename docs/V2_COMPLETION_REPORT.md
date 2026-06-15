# Version 2 Completion Report

# Kenya Health Facilities Dashboard

## Report Summary

Version 2 expands the Kenya Health Facilities Dashboard from a facility distribution project into a stronger healthcare planning and interpretation tool.

Version 1 focused on:

```text
facility distribution
ownership distribution
service availability
facility search
county map
CSV export
```

Version 2 adds:

```text
population-adjusted access
county comparison
county insight briefs
printable reports
backend hardening
mobile polish
ownership-based market dynamics
```

The dashboard now supports a stronger answer to the original project question:

> To what extent does the county-level distribution of healthcare facilities in Kenya reflect both public health need and healthcare market dynamics?

Version 2 addresses both sides of the question.

Public health need side:

```text
population-adjusted facility access
public facility access
ART facility access
service gap scoring
county comparison
```

Market dynamics side:

```text
ownership mix
private share
public share
faith-based/NGO share
ownership imbalance
market interpretation labels
```

---

## Current Version

Current release:

```text
v2.4.0
```

Current status:

```text
Version 2 complete
```

Production frontend:

```text
https://kenya-health-dashboard.vercel.app/
```

Production backend:

```text
https://kenya-health-dashboard-api.onrender.com/
```

API documentation:

```text
https://kenya-health-dashboard-api.onrender.com/docs
```

---

## Core Project Question

The project is guided by this question:

```text
To what extent does the county-level distribution of healthcare facilities in Kenya reflect both public health need and healthcare market dynamics?
```

Version 2 improves the dashboard by making this question measurable through structured indicators.

The dashboard now helps users ask:

```text
Are facilities distributed according to population size?
Which counties have lower facility access per 100,000 people?
Which counties rely more on public facilities?
Which counties have stronger private facility presence?
Which counties have stronger faith-based or NGO-supported delivery?
How do two counties compare across access, ownership, geography, and service coverage?
```

---

## V2 Features Completed

Completed Version 2 tasks:

```text
V2 Task 1: Population-Adjusted Access
V2 Task 2: County Explorer Comparison Tool
V2 Task 3: County Insight Briefs
V2 Task 4: Downloadable County Comparison Reports
V2 Task 5: Ownership & Market Dynamics Analysis
```

Supporting releases:

```text
v2.3.0: Backend hardening, mobile polish, and API standardization
v2.4.0: Ownership & Market Dynamics Analysis
```

---

## Release Timeline

| Release | Focus                                | Status   |
| ------- | ------------------------------------ | -------- |
| v1.0.0  | Initial full-stack dashboard release | Complete |
| v2.0.0  | Population-adjusted access           | Complete |
| v2.1.0  | County Explorer comparison           | Complete |
| v2.2.0  | Insight briefs and printable reports | Complete |
| v2.2.1  | Documentation and release polish     | Complete |
| v2.3.0  | Backend hardening and mobile polish  | Complete |
| v2.4.0  | Ownership and market dynamics        | Complete |

---

# Task 1: Population-Adjusted Access

## Goal

Task 1 addressed a key limitation in Version 1.

Version 1 showed raw facility counts by county.

Raw counts alone can mislead users because a county with many people may need more facilities than a county with a smaller population.

Task 1 added population-adjusted access metrics so users can compare counties more fairly.

---

## Data Added

New dataset:

```text
backend/data/county_population.csv
```

Dataset includes:

```text
county
population_2019
households_2019
land_area_sq_km
population_density
```

The population dataset covers all 47 counties.

National population total used:

```text
47,564,296
```

---

## Backend Support

Task 1 added or supported these endpoints:

```text
/population
/access-density
```

### `/population`

Returns county population records.

Expected count:

```text
47 counties
```

### `/access-density`

Returns population-adjusted access metrics.

Expected count:

```text
47 counties
```

---

## County Name Normalization

Task 1 added county name normalization support.

File:

```text
backend/utils.py
```

Normalization handles county naming differences such as:

```text
TAITA/TAVETA → Taita Taveta
ELGEYO/MARAKWET → Elgeyo Marakwet
THARAKA-NITHI → Tharaka Nithi
HOMA BAY → Homa Bay
TRANS NZOIA → Trans Nzoia
MURANG’A → Murang’a
```

This reduced join errors between facility data and population data.

---

## Metrics Added

Task 1 added:

```text
Facilities per 100,000 people
Public facilities per 100,000 people
ART facilities per 100,000 people
```

These metrics help compare county access while accounting for population size.

---

## Frontend Section Added

Component:

```text
frontend/src/components/AccessDensitySection.jsx
```

User-facing title:

```text
Population-Adjusted Access
```

The section shows:

```text
National access metrics
Access-density watchlists
Lowest facility density counties
Lowest public facility density counties
Lowest ART facility density counties
```

---

## Why Task 1 Matters

Task 1 moved the dashboard from descriptive analytics into planning-oriented analytics.

Example:

```text
A county may have many facilities in raw numbers, but still have low access when compared against population size.
```

This matters for health planning because access depends on both supply and population need.

---

# Task 2: County Explorer Comparison Tool

## Goal

Task 2 added a dedicated page for comparing two counties side by side.

Page:

```text
/county-explorer
```

The goal was to help users compare counties using access, ownership, geography, and service coverage indicators.

---

## Frontend Page Added

File:

```text
frontend/src/pages/CountyExplorer.jsx
```

The page fetches:

```text
/access-density
/counties
/service-gap-score
```

The implementation follows a frontend-first approach.

Data is fetched once, then filtered in React for selected counties.

---

## Component Added

Main comparison component:

```text
frontend/src/components/CountyComparisonTool.jsx
```

The tool allows users to select two counties and compare them side by side.

---

## Metrics Compared

The County Explorer compares:

```text
Population
Land area
Population density
Total facilities
Facilities per 100,000 people
Public facilities per 100,000 people
ART facilities per 100,000 people
Service gap score
Ownership mix
Selected service coverage indicators
```

---

## Design Value

The County Explorer improves the dashboard’s value for planning discussions by helping users see county differences quickly.

It makes comparison easier than scanning national tables.

---

## Why Task 2 Matters

Task 2 made the dashboard more interactive and useful for focused analysis.

Instead of asking:

```text
What does the national picture look like?
```

Users can ask:

```text
How does County A compare with County B?
```

This supports portfolio storytelling, county-level planning, and data interpretation.

---

# Task 3: County Insight Briefs

## Goal

Task 3 added interpretation support to the County Explorer.

The goal was to help users understand what the comparison means, not just view numbers.

---

## Component Added

File:

```text
frontend/src/components/CountyInsightBrief.jsx
```

---

## Insight Areas

The insight brief provides interpretation across:

```text
Facility access
Public-sector access
ART access
Geography
Population density
Ownership mix
Service coverage
```

---

## Example Interpretation Areas

The insight brief can explain patterns such as:

```text
One county has higher facility access per 100,000 people.
One county has stronger public-sector access.
One county has stronger ART facility availability.
One county has higher population density.
One county has stronger private or public ownership presence.
```

---

## Why Task 3 Matters

Task 3 improved usability.

Many dashboards show charts but leave interpretation to the user.

This feature helps users read the data faster and reduces cognitive load.

It also makes the project stronger for healthcare workflow and product storytelling because it shows how analytics can support decision-making.

---

# Task 4: Downloadable County Comparison Reports

## Goal

Task 4 added printable reporting from the County Explorer.

The goal was to let users export county comparisons into a practical format for review, sharing, or documentation.

---

## Component Added

File:

```text
frontend/src/components/CountyComparisonReportButton.jsx
```

---

## Report Includes

The downloadable report includes:

```text
Selected counties
Summary metrics
Comparison table
Insight brief
Timestamp
Dashboard links
```

---

## Report Use Cases

The report can support:

```text
team discussions
student project presentation
portfolio demonstration
planning review
county comparison documentation
```

---

## Why Task 4 Matters

Task 4 moved the dashboard beyond screen-based exploration.

It created a shareable output that users can print or save.

This helps explain the project to reviewers and team members.

---

# Supporting Release: v2.3.0 Backend Hardening and Mobile Polish

## Goal

The v2.3.0 release improved production readiness before adding the ownership market dynamics layer.

---

## Main Improvements

v2.3.0 included:

```text
backend API validation
security hardening
API version cleanup
mobile UI polish
stable production checkpoint
```

---

## Backend Health Check

The backend includes:

```text
/health
```

This supports basic uptime and deployment verification.

---

## Why v2.3.0 Matters

This release made the project safer and more stable before adding more dashboard complexity.

It also improved the reliability of the public API and frontend experience.

---

# Task 5: Ownership & Market Dynamics Analysis

## Goal

Task 5 extends Version 2 from population-adjusted access analysis into ownership-based healthcare market interpretation.

The project question asks:

> To what extent does the county-level distribution of healthcare facilities in Kenya reflect both public health need and healthcare market dynamics?

Earlier V2 tasks addressed the public health need side by comparing facility access against population size, geography, service coverage, and county-level planning context.

Task 5 addresses the market dynamics side by analyzing county-level facility ownership mix.

---

## User-Facing Section

Added dashboard section:

```text
Ownership & Market Dynamics
```

---

## Component Added

File:

```text
frontend/src/components/MarketDynamicsSection.jsx
```

The component is imported into:

```text
frontend/src/pages/Dashboard.jsx
```

---

## Data Sources Used

Task 5 uses existing API data.

No new dataset was required.

Endpoints used:

```text
/counties
/access-density
```

The `/counties` endpoint provides county-level ownership totals including:

```text
public
private
faith_based
ngo
community
academic
total
```

The `/access-density` endpoint provides population-adjusted facility access values.

---

## Metrics Added

Task 5 computes ownership percentages in React:

```text
Private share = private facilities / total facilities × 100
Public share = public facilities / total facilities × 100
Faith/NGO share = (faith_based + ngo) / total facilities × 100
```

---

## Dashboard Outputs

The section shows:

```text
1. Counties with the highest private facility share
2. Counties with the highest public facility share
3. Counties with the strongest faith-based/NGO presence
4. Counties with low facility density and ownership imbalance
5. Simple market interpretation labels per county
```

---

## Interpretation Logic

The dashboard uses ownership mix to provide simple county-level interpretation labels.

Examples:

```text
High private share may suggest stronger healthcare market activity.
High public share may suggest public-sector dependence.
High faith/NGO share may suggest mission-driven or community-supported service delivery.
Balanced private/public ownership may suggest mixed healthcare provision.
```

---

## Why Task 5 Matters

Task 5 strengthens the dashboard because facility distribution is not only a public access issue.

Ownership patterns help explain how healthcare delivery is structured across counties.

A county with many private facilities may reflect stronger market activity, urban demand, or higher ability to pay.

A county with high public-sector dependence may reflect greater reliance on government service delivery.

A county with strong faith-based or NGO presence may reflect mission-supported care, community-based delivery, or historical service networks.

This gives the project a stronger analytical answer to the original research question by combining:

```text
Population-adjusted access
County comparison
Service coverage
Ownership mix
Market interpretation
```

---

## Implementation Approach

Task 5 was implemented frontend-first.

This kept the task safe and fast because the required ownership totals already existed in the `/counties` API response.

No backend changes were needed.

---

## Files Changed

```text
frontend/src/components/MarketDynamicsSection.jsx
frontend/src/pages/Dashboard.jsx
```

---

## Release

Task 5 was released as:

```text
v2.4.0
```

---

# Technical Summary

## Backend Files

Key backend files:

```text
backend/main.py
backend/utils.py
backend/data/county_population.csv
backend/requirements.txt
```

---

## Frontend Files

Key frontend files:

```text
frontend/src/pages/Dashboard.jsx
frontend/src/pages/CountyExplorer.jsx
frontend/src/components/AccessDensitySection.jsx
frontend/src/components/CountyComparisonTool.jsx
frontend/src/components/CountyInsightBrief.jsx
frontend/src/components/CountyComparisonReportButton.jsx
frontend/src/components/MarketDynamicsSection.jsx
```

---

## Main API Endpoints Used in V2

| Endpoint             | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `/population`        | County population data                        |
| `/access-density`    | Population-adjusted facility access           |
| `/counties`          | County-level facility and ownership summaries |
| `/service-gap-score` | Multi-service county gap scoring              |
| `/health`            | Backend health check                          |

---

## Testing Completed

The following checks were completed across V2 tasks:

```text
Backend starts locally
Frontend starts locally
Production backend responds
Production frontend loads
/counties endpoint returns county data
/population endpoint returns 47 rows
/access-density endpoint returns 47 rows
County Explorer loads
County comparison works
Population-Adjusted Access section renders
Ownership & Market Dynamics section renders
Printable report button works
Frontend build passes
Git branches merged into main
Release tags created and aligned
```

---

## Production Verification

Production frontend:

```text
https://kenya-health-dashboard.vercel.app/
```

Production backend:

```text
https://kenya-health-dashboard-api.onrender.com/
```

API docs:

```text
https://kenya-health-dashboard-api.onrender.com/docs
```

Verified production features:

```text
Dashboard homepage
Population-Adjusted Access
County Explorer
County comparison
Printable reports
Ownership & Market Dynamics
```

---

# Current V2 Status

Completed:

```text
V2 Task 1: Population-Adjusted Access
V2 Task 2: County Explorer Comparison Tool
V2 Task 3: County Insight Briefs
V2 Task 4: Downloadable County Comparison Reports
V2 Task 5: Ownership & Market Dynamics Analysis
```

Current release:

```text
v2.4.0
```

Current status:

```text
Version 2 complete
```

---

# Analytical Value Added

Version 2 adds a stronger planning layer to the dashboard.

The dashboard now combines:

```text
Raw facility distribution
Population-adjusted access
Public-sector access
ART access
Service availability
Ownership mix
Market dynamics
County comparison
Plain-language interpretation
Printable reporting
```

This makes the dashboard useful for:

```text
health planning discussion
county comparison
student project presentation
portfolio review
healthcare analytics demonstration
data cleaning demonstration
product thinking demonstration
```

---

# Portfolio Interpretation

This project demonstrates the ability to turn fragmented healthcare facility data into a structured analytics product.

Key skills demonstrated:

```text
data cleaning
county name normalization
API design
React dashboard development
population-adjusted analysis
service gap analysis
ownership analysis
market interpretation
frontend state management
production deployment
release management
technical documentation
```

The strongest portfolio story is:

```text
The project started as a facility dashboard, then evolved into a planning intelligence tool that compares healthcare access, service coverage, and ownership market structure across Kenyan counties.
```

---

# Limitations

The dashboard has useful planning indicators, but it does not prove causation.

Known limitations:

```text
Facility presence does not guarantee service quality.
Facility counts do not measure staffing levels.
Facility counts do not measure equipment availability.
Population-adjusted access does not fully capture travel time or road access.
Ownership mix does not directly measure affordability.
Service availability fields depend on source data completeness.
```

These limitations should be stated when presenting the project.

---

# Recommended Next Feature

Recommended next phase:

```text
V3: County Planning Priority Index
```

V3 should combine the strongest signals from Version 2 into a single planning score.

Potential inputs:

```text
1. Facilities per 100,000 people
2. Public facilities per 100,000 people
3. ART facilities per 100,000 people
4. Service gap score
5. Ownership imbalance
6. Population density
7. Total population
```

The goal would be to help users identify counties that may need closer planning attention based on access, service coverage, population pressure, and ownership structure.

---

# Suggested V3 Output

A County Planning Priority Index could show:

```text
Highest planning priority counties
Lowest access counties
Counties with high population pressure
Counties with public-sector dependence
Counties with high ownership imbalance
Counties with weak selected service coverage
```

This would make the dashboard more actionable while staying aligned with the original project question.

---

# Release Notes

## v1.0.0

Released:

```text
Initial full-stack dashboard
```

Included:

```text
Facility distribution
Ownership analysis
Service availability
Facility Finder
CSV export
County map
FastAPI backend
React frontend
Production deployment
```

---

## v2.0.0

Released:

```text
Population-Adjusted Access
```

Included:

```text
County population dataset
Population endpoint
Access-density endpoint
Facilities per 100,000 people
Public facilities per 100,000 people
ART facilities per 100,000 people
Access-density watchlists
```

---

## v2.1.0

Released:

```text
County Explorer Comparison Tool
```

Included:

```text
County Explorer page
Two-county selectors
Access comparison
Population comparison
Ownership mix comparison
Service gap comparison
```

---

## v2.2.0

Released:

```text
County Insight Briefs and Printable Reports
```

Included:

```text
County insight brief component
Plain-language county comparison interpretation
Printable county comparison report
Report timestamp
Dashboard links
```

---

## v2.2.1

Released:

```text
Documentation and release polish
```

Included:

```text
Documentation refinements
Report cleanup
Release alignment
```

---

## v2.3.0

Released:

```text
Backend hardening, mobile polish, and API standardization
```

Included:

```text
API validation improvements
Security hardening
Version reporting cleanup
Mobile UI polish
Production stability improvements
```

---

## v2.4.0

Released:

```text
Ownership & Market Dynamics Analysis
```

Included:

```text
Ownership & Market Dynamics dashboard section
Private ownership share analysis
Public ownership share analysis
Faith-based/NGO ownership share analysis
Low facility density + ownership imbalance table
County-level market interpretation labels
```

---

# Final V2 Summary

Version 2 is complete.

It adds a stronger planning and interpretation layer to the Kenya Health Facilities Dashboard.

The dashboard now answers the project question more directly by combining:

```text
public health need indicators
population-adjusted access
service coverage
county comparison
ownership mix
market dynamics
```

This makes the project stronger as a healthcare data analytics portfolio project and as a practical demonstration of workflow-first healthcare intelligence.
