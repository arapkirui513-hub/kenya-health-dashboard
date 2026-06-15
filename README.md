# Kenya Health Facilities Dashboard

A full-stack healthcare analytics dashboard that explores health facility distribution, ownership patterns, service availability, population-adjusted access, county comparison, and county-level healthcare planning insights across Kenya.

The project helps users move from raw facility records into practical healthcare planning signals.

---

## Live Demo

### Frontend

https://kenya-health-dashboard.vercel.app/

### County Explorer

https://kenya-health-dashboard.vercel.app/county-explorer

### Backend API

https://kenya-health-dashboard-api.onrender.com/

### API Documentation

https://kenya-health-dashboard-api.onrender.com/docs

### GitHub Repository

https://github.com/arapkirui513-hub/kenya-health-dashboard

---

## Version 2 Update

Version 2 expands the dashboard from facility distribution analytics into population-adjusted healthcare access analysis, county comparison, planning interpretation, printable reporting, backend reliability, mobile polish, and ownership-based market dynamics analysis.

Version 1 helped answer:

```text
Where are health facilities located across Kenya?
What services are available?
What ownership categories dominate healthcare provision?
Which counties appear underserved by selected services?
```

Version 2 now helps answer:

```text
Are facilities distributed according to population size?
Which counties have lower population-adjusted facility access?
How do two counties compare across access, ownership, geography, and service coverage?
What does ownership mix suggest about healthcare market structure?
Which counties depend more on public, private, faith-based, or NGO-supported care?
```

New V2 features:

* Population-adjusted facility access analysis
* County population integration using 2019 population data
* Facility density per 100,000 people
* Public facility density per 100,000 people
* ART facility density per 100,000 people
* County Explorer comparison page
* Ownership mix comparison
* Geography and population comparison
* Service gap comparison
* County insight briefs
* Printable county comparison reports
* Ownership & Market Dynamics dashboard section
* Backend API hardening and validation
* Mobile and UI polish
* Production release tagging through v2.4.0

V2 Completion Report:

```text
docs/V2_COMPLETION_REPORT.md
```

---

## Screenshots

### Homepage

![Homepage V2](docs/screenshots/homepage-v2.png)

### Population-Adjusted Access

![Population-Adjusted Access V2](docs/screenshots/population-adjusted-access-v2.png)

### County Explorer

![County Explorer V2](docs/screenshots/county-explorer-v2.png)

### County Comparison Table

![County Comparison Table V2](docs/screenshots/county-comparison-table-v2.png)

---

## Project Question

The dashboard is built around this core question:

```text
To what extent does the county-level distribution of healthcare facilities in Kenya reflect both public health need and healthcare market dynamics?
```

The dashboard helps answer questions such as:

* Which counties have the most health facilities?
* Which counties have fewer facilities relative to population size?
* What ownership categories dominate healthcare provision?
* Which counties rely more on public facilities?
* Which counties have stronger private healthcare market activity?
* Which counties show strong faith-based or NGO-supported delivery?
* Which counties appear underserved by selected services?
* How do two counties compare across facility access, ownership mix, geography, and service coverage?

---

## Features

### 1. National Dashboard Overview

The homepage summarizes national facility distribution and service availability.

Key views include:

* Total facilities
* County distribution
* Ownership breakdown
* Facility type breakdown
* Service availability overview
* County-level analytics

---

### 2. Population-Adjusted Access

The dashboard includes a Version 2 access intelligence section using 2019 county population data.

It shows:

* Total population matched to facility data
* Total facilities
* Facilities per 100,000 people
* Public facilities per 100,000 people
* ART facilities per 100,000 people
* Lowest access-density county watchlists

This improves the dashboard by shifting analysis from raw facility counts to population-adjusted planning indicators.

---

### 3. County Explorer

The County Explorer page allows users to compare two counties side by side.

Comparison areas include:

* Population
* Land area
* Population density
* Total facilities
* Facility access per 100,000 people
* Public facility access per 100,000 people
* ART facility access per 100,000 people
* Ownership mix
* Service gap score
* Selected service coverage indicators

This helps users compare counties in a planning-focused way rather than relying on national totals alone.

---

### 4. County Insight Briefs

The County Explorer includes short interpretation briefs that explain differences between selected counties.

Insight areas include:

* Facility access
* Public-sector access
* ART access
* Geography and population density
* Ownership mix
* Service coverage

The goal is to make the comparison useful for non-technical users, health planners, students, analysts, and portfolio reviewers.

---

### 5. Downloadable County Comparison Reports

Users can generate printable county comparison reports.

Report includes:

* Selected counties
* Summary metrics
* Comparison table
* Insight brief
* Report timestamp
* Dashboard links

This makes the dashboard useful beyond screen-based exploration.

---

### 6. Ownership & Market Dynamics

The Ownership & Market Dynamics section analyzes county-level ownership patterns.

It shows:

* Counties with the highest private facility share
* Counties with the highest public facility share
* Counties with the strongest faith-based or NGO presence
* Counties with low facility density and ownership imbalance
* Simple market interpretation labels

Ownership share metrics include:

```text
Private share = private facilities / total facilities × 100
Public share = public facilities / total facilities × 100
Faith/NGO share = (faith_based + ngo) / total facilities × 100
```

Interpretation examples:

* High private share may suggest stronger healthcare market activity.
* High public share may suggest public-sector dependence.
* High faith-based or NGO share may suggest mission-driven or community-supported care.
* Balanced ownership may suggest mixed healthcare provision.

This section completes the market dynamics side of the original project question.

---

### 7. Facility Finder

The dashboard includes a searchable and filterable facility table.

Users can:

* Search facilities
* Filter by county
* Filter by ownership
* Filter by facility type
* Filter by selected services
* Export facility results as CSV

---

### 8. County Map

The dashboard includes a county-level map for spatial exploration.

It supports:

* County-level visual analysis
* Facility distribution context
* Planning-focused geographic interpretation

---

### 9. Backend API

The FastAPI backend exposes structured healthcare analytics endpoints.

Main endpoint groups include:

* Facility records
* County summaries
* Ownership summaries
* Service availability
* Access density
* Service gap scoring
* CSV export
* Health check

The backend powers both the dashboard and the public API documentation.

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Recharts
* React Leaflet
* Axios
* Lucide React

### Backend

* FastAPI
* Python
* Pandas
* Uvicorn
* Pydantic

### Deployment

* Vercel for frontend
* Render for backend
* GitHub for version control and releases
* GitHub Actions for backend keep-awake workflow

---

## Version Control

The project uses feature branches and release tags.

Example branches used during V2:

```text
v2-access-density-ui
v2-market-dynamics
docs-printable-county-reports
feature/service-gap-insights
feature/backend-health-check
```

Release tags:

```text
v1.0.0
v2.0.0
v2.1.0
v2.2.0
v2.2.1
v2.3.0
v2.4.0
```

---

## Project Structure

```text
kenya-health-dashboard/
│
├── backend/
│   ├── main.py
│   ├── utils.py
│   ├── requirements.txt
│   └── data/
│       └── county_population.csv
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessDensitySection.jsx
│   │   │   ├── CountyComparisonReportButton.jsx
│   │   │   ├── CountyComparisonTool.jsx
│   │   │   ├── CountyInsightBrief.jsx
│   │   │   └── MarketDynamicsSection.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── CountyExplorer.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── V1_COMPLETION_REPORT.md
│   ├── V2_COMPLETION_REPORT.md
│   └── screenshots/
│       ├── homepage-v2.png
│       ├── population-adjusted-access-v2.png
│       ├── county-explorer-v2.png
│       └── county-comparison-table-v2.png
│
├── .github/
│   └── workflows/
│       └── keep-backend-awake.yml
│
├── README.md
└── .gitignore
```

---

## API Endpoints

| Endpoint                   | Purpose                             |
| -------------------------- | ----------------------------------- |
| `/`                        | API root                            |
| `/health`                  | Backend health check                |
| `/facilities`              | Facility records                    |
| `/counties`                | County-level facility summaries     |
| `/ownership`               | Ownership breakdown                 |
| `/facility-types`          | Facility type breakdown             |
| `/services`                | Service availability summary        |
| `/service-gap-score`       | Multi-service county gap scoring    |
| `/population`              | County population data              |
| `/access-density`          | Population-adjusted facility access |
| `/download/facilities.csv` | CSV export                          |

---

## Key Metrics Added in Version 2

Version 2 adds population-adjusted and planning-oriented metrics including:

```text
Facilities per 100,000 people
Public facilities per 100,000 people
ART facilities per 100,000 people
Service gap score
Ownership mix
Private ownership share
Public ownership share
Faith/NGO ownership share
Ownership imbalance
Population density
County comparison deltas
```

---

## Data Sources

The dashboard uses Kenya health facility data and county-level population data.

Version 2 integrates:

* County facility records
* Facility ownership categories
* Facility service availability fields
* 2019 county population values
* County land area values
* Derived county density metrics

Population values are used to calculate per-100,000 access indicators.

---

## Interpretation Framework

The dashboard does not claim causation.

It provides structured indicators that support planning discussion.

Example interpretation patterns:

* A county with many facilities may still have low access if its population is large.
* A county with fewer facilities may show better access if its population is smaller.
* A high public facility share may suggest public-sector dependence.
* A high private facility share may suggest stronger healthcare market activity.
* A strong faith-based or NGO share may suggest mission-supported service delivery.
* Service availability gaps may reveal counties that need closer program planning.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/arapkirui513-hub/kenya-health-dashboard.git
cd kenya-health-dashboard
```

---

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Run the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173/
```

---

## Environment Variables

Frontend production can use:

```text
VITE_API_BASE_URL=https://kenya-health-dashboard-api.onrender.com
```

Local development can use:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## Testing Checklist

Before release, confirm:

* Frontend starts locally
* Backend starts locally
* `/health` returns a healthy status
* `/counties` returns county summaries
* `/access-density` returns 47 counties
* Dashboard homepage loads
* Population-Adjusted Access section renders
* Ownership & Market Dynamics section renders
* County Explorer page loads
* County comparison works
* Printable report generates
* Production frontend redeploys successfully
* Production backend responds

---

## Release History

### v1.0.0

Initial full-stack dashboard release with facility distribution, ownership analysis, service availability, Facility Finder, CSV export, and county map.

Included:

* Facility distribution dashboard
* Ownership analysis
* Service availability summary
* Facility Finder
* CSV export
* County map
* FastAPI backend
* React frontend
* Vercel and Render deployment

---

### v2.0.0

Population-adjusted access and Version 2 dashboard expansion.

Added:

* County population dataset
* Population-adjusted facility access
* Facilities per 100,000 people
* Public facilities per 100,000 people
* ART facilities per 100,000 people
* Access-density watchlists
* V2 screenshots and completion report

---

### v2.1.0

County Explorer comparison release.

Added:

* County Explorer page
* Two-county comparison interface
* Population comparison
* Access density comparison
* Ownership mix comparison
* Service coverage comparison
* County comparison table

---

### v2.2.0

County insight briefs and printable comparison reports.

Added:

* County insight brief logic
* Plain-language comparison summaries
* Printable county comparison report
* Report timestamp and dashboard links
* Portfolio-ready reporting flow

---

### v2.2.1

Documentation and release polish.

Added:

* Report refinements
* Documentation cleanup
* Release alignment fixes

---

### v2.3.0

Backend hardening, mobile polish, and API standardization release.

Added:

* Backend API validation and security improvements
* Cleaner API version reporting
* Improved production readiness
* Mobile UI polish
* Stable release checkpoint before ownership analysis

---

### v2.4.0

Ownership and market dynamics analysis release.

Added:

* Ownership & Market Dynamics dashboard section
* Private facility share analysis by county
* Public facility share analysis by county
* Faith-based/NGO presence analysis
* Low facility density + ownership imbalance table
* Simple county-level market interpretation labels

---

## Current Status

Current release:

```text
v2.4.0
```

Current production status:

```text
Live and stable
```

Current project stage:

```text
Version 2 complete
```

---

## Recommended Next Phase

Recommended next phase:

```text
V3: County Planning Priority Index
```

V3 can combine the strongest signals from Version 2 into a single planning score.

Potential inputs:

* Facilities per 100,000 people
* Public facilities per 100,000 people
* ART facilities per 100,000 people
* Service gap score
* Ownership imbalance
* Population density
* Total population

The goal would be to help users identify counties that may need closer planning attention based on access, service coverage, population pressure, and ownership structure.

---

## Portfolio Value

This project demonstrates:

* Healthcare data cleaning
* Backend API design
* Frontend dashboard development
* Population-adjusted analytics
* Healthcare access interpretation
* County comparison logic
* Ownership and market dynamics analysis
* Production deployment
* Documentation and release management

It shows how fragmented healthcare data can be structured into tools that support planning, prioritization, and decision-making.
