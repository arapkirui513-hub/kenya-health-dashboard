# Kenya Health Facilities Dashboard – Version 2 Completion Report

## Project

**Kenya Health Facilities Dashboard**

Live dashboard:

```text
https://kenya-health-dashboard.vercel.app/
```

County Explorer:

```text
https://kenya-health-dashboard.vercel.app/county-explorer
```

Backend API:

```text
https://kenya-health-dashboard-api.onrender.com
```

Repository:

```text
https://github.com/arapkirui513-hub/kenya-health-dashboard
```

---

## Version 2 Summary

Version 2 expands the Kenya Health Facilities Dashboard from descriptive facility analytics into population-adjusted healthcare access analysis, county-level comparison, planning interpretation, and printable reporting.

Version 1 answered:

```text
Where are health facilities located?
```

Version 2 now helps answer:

```text
How does facility availability compare to population size?
```

Version 2 also helps answer:

```text
How do two counties compare across access, ownership, geography, and service coverage?
What does a county comparison mean in plain planning language?
How can county comparison outputs be shared as a report?
```

This makes the dashboard more useful for:

```text
county comparison
healthcare planning
public health analysis
portfolio review
non-technical planning discussions
stakeholder communication
offline reporting
```

---

## V2 Features Completed

Completed Version 2 tasks:

```text
V2 Task 1: Population-Adjusted Access
V2 Task 2: County Explorer Comparison Tool
V2 Task 3: County Insight Briefs
V2 Task 4: Downloadable County Comparison Reports
```

---

## Task 1: Population-Adjusted Access

### Objective

Add population-adjusted access metrics so users can compare counties fairly based on population size, not only raw facility counts.

### Backend Additions

A new county population dataset was added:

```text
backend/data/county_population.csv
```

The dataset includes:

```text
47 counties
2019 population
2019 households
county land area
population density
```

The population total was validated against the KNBS 2019 census total:

```text
47,564,296 people
```

### County Name Normalization

A county normalization utility was added:

```text
backend/utils.py
```

This handles county-name differences across datasets.

Examples handled:

```text
TAITA/TAVETA       -> Taita Taveta
ELGEYO/MARAKWET    -> Elgeyo Marakwet
THARAKA-NITHI      -> Tharaka Nithi
NAIROBI CITY       -> Nairobi
MURANG'A           -> Murang'a
```

This prevents silent join errors when combining population and facility datasets.

### New Backend Endpoints

Two new backend endpoints were added:

```text
/population
/access-density
```

The `/population` endpoint returns county-level population data.

The `/access-density` endpoint joins health facility totals with population data and returns access-density metrics.

New metrics include:

```text
facilities_per_100k_population
public_facilities_per_100k_population
art_facilities_per_100k_population
```

### Frontend Additions

A new frontend section was added:

```text
frontend/src/components/AccessDensitySection.jsx
```

The section appears on the main dashboard as:

```text
Population-Adjusted Access
```

It includes:

```text
National facility density
Public facility density
ART facility density
Population covered
Lowest facility density counties chart
Lowest public facility density watchlist
Lowest ART facility density watchlist
```

### Validation

Confirmed:

```text
/population returns 47 counties
/access-density returns 47 counties
No missing population rows
No duplicate county rows
No failed county joins
Existing V1 endpoints still work
Production frontend build passes
```

---

## Task 2: County Explorer Comparison Tool

### Objective

Add a county-level comparison tool that allows users to compare any two counties side by side.

This improves the dashboard’s value for planning discussions by helping users see county differences across population, facility access, ownership mix, and service coverage.

### Frontend Page Added

Created:

```text
frontend/src/pages/CountyExplorer.jsx
```

This page:

```text
Fetches access-density data
Fetches county ownership data
Fetches service-gap-score data
Stores full datasets in state
Passes data into the comparison component
Handles loading and error states
```

### Comparison Component Added

Created:

```text
frontend/src/components/CountyComparisonTool.jsx
```

This component:

```text
Provides two county dropdown selectors
Defaults to Nairobi and Turkana
Prevents same-county comparisons
Displays summary cards for both selected counties
Displays grouped comparison metrics
Highlights the higher numeric value where comparison is meaningful
Keeps ownership mix descriptive without winner highlighting
Uses county-name normalization to avoid filtering mismatches
```

### Route Added

Updated:

```text
frontend/src/App.jsx
```

Added route:

```text
/county-explorer
```

Live page:

```text
https://kenya-health-dashboard.vercel.app/county-explorer
```

### Dashboard Navigation Added

Updated:

```text
frontend/src/pages/Dashboard.jsx
```

Added a `County Explorer` navigation button beside the existing `County Map` button.

---

## Task 3: County Insight Briefs

### Objective

Add short written interpretations to the County Explorer page so users can understand what the selected county comparison means.

This turns the County Explorer from a metrics display into a planning interpretation tool.

### Frontend Component Added

Created:

```text
frontend/src/components/CountyInsightBrief.jsx
```

The component generates three planning notes:

```text
Facility access
Geography context
Service coverage
```

### Placement

The County Insight Brief appears on the County Explorer page between:

```text
summary cards
comparison metrics table
```

### What the Brief Explains

The brief helps users interpret:

```text
which county has stronger facility density
how land area and population density affect access interpretation
which county has stronger selected service coverage
```

### Example Insight

```text
Nairobi has higher facility density than Turkana, while Turkana has the larger land area. This suggests that geographic access may remain a planning issue even when facility-per-population metrics are compared directly.
```

### Value Added

County Insight Briefs make the dashboard easier to understand for non-technical users by translating numeric differences into planning language.

This improves the dashboard for:

```text
planning discussions
portfolio review
public health storytelling
county-level comparison
stakeholder communication
```

### Testing

Confirmed:

```text
County Insight Brief appears on the County Explorer page
Insight text updates when selected counties change
Same-county guard still works
Comparison metrics table still works
Production build passes
```

---

## Task 4: Downloadable County Comparison Reports

### Objective

Add a report export workflow to the County Explorer so users can save selected county comparisons for planning discussions, team review, offline use, and portfolio demonstration.

### Frontend Component Added

Created:

```text
frontend/src/components/CountyComparisonReportButton.jsx
```

This component adds a:

```text
Print / Save Report
```

button to the County Explorer comparison panel.

### Placement

The report button appears near the county selectors inside the County Explorer comparison card.

It uses the currently selected counties and generates a clean printable report in a new browser window.

### Report Includes

The generated report includes:

```text
selected county names
generation timestamp
population
total facilities
facility density per 100,000 people
land area
population density
ownership mix
service coverage metrics
planning note
dashboard links
```

### Technical Approach

The feature is frontend-only.

It does not add:

```text
new backend endpoints
new PDF libraries
new server-side report generation
```

Instead, it uses the browser print workflow.

Users can choose:

```text
Print
Save as PDF
```

from the browser print dialog.

### Value Added

This feature makes the County Explorer more useful for:

```text
planning discussions
stakeholder review
team presentations
offline analysis
portfolio demonstration
public health reporting
```

### Testing

Confirmed:

```text
Print / Save Report button appears on the County Explorer page
Report opens in a new browser window
Report includes selected county summary metrics
Report includes comparison metrics table
Browser print dialog opens
Report can be saved as PDF
Production build passes
```

---

## County Explorer Metrics

The County Explorer compares counties using the following groups.

### Population & Geography

```text
Population 2019
Land area
Population density per km²
```

### Facility Access

```text
Total facilities
Facilities per 100,000 people
Public facilities per 100,000 people
ART facilities per 100,000 people
```

### Ownership Mix

```text
% Public
% Private
% Faith-Based
```

### Service Coverage

```text
Overall coverage score
FP coverage
ART coverage
C-IMCI coverage
IPD coverage
HBC coverage
```

---

## Technical Design Decisions

### Frontend-Only County Comparison

The County Explorer uses existing endpoints instead of adding a new backend comparison endpoint.

Endpoints used:

```text
/access-density
/counties
/service-gap-score
```

Reason:

```text
Each dataset has only 47 county-level records.
The frontend can fetch all data once and filter in React state.
A new backend endpoint would add complexity without clear value at this stage.
```

### Fetch Once, Filter Locally

The County Explorer fetches the three datasets once when the page loads.

County selection changes do not trigger new API calls.

This keeps the page fast and avoids unnecessary backend requests.

### County Name Normalization

A frontend county-name normalizer was added to prevent filtering issues caused by apostrophes and casing differences.

This is especially important for county names such as:

```text
Murang'a
Murang'A
```

### Derived Insight Text

County Insight Briefs are generated from the selected county data already available inside the County Explorer.

No new backend endpoint was needed.

The insight brief uses:

```text
facility density
land area
population density
overall service coverage score
```

This keeps the feature simple, fast, and frontend-only.

### Browser-Based Report Export

Downloadable County Comparison Reports use the browser print workflow.

The report is generated client-side from the same selected county data already loaded in the County Explorer.

No new backend endpoint or PDF library was added.

This keeps the feature lightweight and easy to maintain.

---

## Testing Completed

Confirmed locally:

```text
/county-explorer route loads
Nairobi vs Turkana loads by default
Dropdown selectors show county options
Summary cards render correctly
County Insight Brief renders correctly
County Insight Brief updates when selected counties change
Metrics table renders correctly
Same-county guard works
Higher-value highlighting works
Print / Save Report button appears
Printable report opens in a new browser window
Browser print dialog opens
Report can be saved as PDF
County Explorer button appears on the homepage
Production build passes
```

Build command:

```bash
npm run build
```

Build result:

```text
✓ built successfully
```

Note:

```text
The build shows a large chunk-size warning, but the build succeeds. This can be improved later through route-level code splitting.
```

---

## Current V2 Status

Completed:

```text
V2 Task 1: Population-Adjusted Access
V2 Task 2: County Explorer Comparison Tool
V2 Task 3: County Insight Briefs
V2 Task 4: Downloadable County Comparison Reports
```

The dashboard now supports:

```text
National facility overview
County facility distribution
Population-adjusted facility access
County-to-county comparison
Ownership mix analysis
Service coverage comparison
Plain-language county insight briefs
Printable county comparison reports
Save-as-PDF report workflow
```

---

## Impact

Version 2 makes the project stronger because it moves from simple counting to access analysis, planning interpretation, and report sharing.

The dashboard can now support questions such as:

```text
Which counties have fewer facilities relative to population size?
Which counties have stronger public facility availability?
How do two counties compare across facility access and service coverage?
Where might population size and geographic spread affect healthcare access?
What does a county comparison mean in simple planning language?
How can county comparison outputs be shared with a team or reviewer?
```

This improves the project for:

```text
healthcare planning
county comparison
public health storytelling
portfolio demonstration
data analytics review
non-technical stakeholder communication
offline reporting
```

---

## Recommended Next Feature

Recommended next task:

```text
V2 Task 5: County Planning Priority Index
```

This would combine facility access, population density, public facility availability, ART access, and service coverage into a planning-priority score.

The goal would be to help users identify counties that may need closer review based on multiple indicators, not just one metric.

Possible inputs:

```text
facilities per 100,000 people
public facilities per 100,000 people
ART facilities per 100,000 people
overall service coverage score
population density
land area
```

This would move the dashboard from comparison into prioritization.

---

## Release Notes

### v2.0.0

Released:

```text
Population-Adjusted Access
County Explorer Comparison Tool
```

### v2.1.0

Added:

```text
County Insight Briefs
```

This enhancement extends the County Explorer with plain-language planning interpretations for selected county comparisons.

### v2.2.0

Added:

```text
Printable County Comparison Reports
```

This enhancement allows users to print or save selected county comparisons as PDF reports using the browser print workflow.
