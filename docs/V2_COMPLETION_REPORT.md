# Kenya Health Facilities Dashboard – Version 2 Completion Report

## Project

**Kenya Health Facilities Dashboard**

Live dashboard:

```text
https://kenya-health-dashboard.vercel.app/
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

Version 2 expands the Kenya Health Facilities Dashboard from descriptive facility analytics into population-adjusted healthcare access analysis.

Version 1 answered:

```text
Where are health facilities located?
```

Version 2 now helps answer:

```text
How does facility availability compare to population size?
```

This makes the dashboard more useful for county comparison, healthcare planning, public health analysis, and portfolio review.

---

## V2 Features Completed

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

---

## Testing Completed

Confirmed locally:

```text
/county-explorer route loads
Nairobi vs Turkana loads by default
Dropdown selectors show county options
Summary cards render correctly
Metrics table renders correctly
Same-county guard works
Higher-value highlighting works
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
```

The dashboard now supports:

```text
National facility overview
County facility distribution
Population-adjusted facility access
County-to-county comparison
Ownership mix analysis
Service coverage comparison
```

---

## Impact

Version 2 makes the project stronger because it moves from simple counting to access analysis.

The dashboard can now support questions such as:

```text
Which counties have fewer facilities relative to population size?
Which counties have stronger public facility availability?
How do two counties compare across facility access and service coverage?
Where might population size and geographic spread affect healthcare access?
```

This improves the project for:

```text
healthcare planning
county comparison
public health storytelling
portfolio demonstration
data analytics review
```

---

## Recommended Next Feature

Recommended next task:

```text
V2 Task 3: County Insight Briefs
```

This would add short written interpretations to the County Explorer page.

Example:

```text
Nairobi has a higher facility density than Turkana, while Turkana has a much larger land area and lower population density. This suggests that geographic access challenges may remain important even when facility-per-population metrics appear close.
```

This would help non-technical users understand what the numbers mean.
