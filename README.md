# Kenya Health Facilities Dashboard

A full-stack healthcare analytics dashboard that explores health facility distribution, ownership patterns, service availability, population-adjusted access, and county-level healthcare planning insights across Kenya.

Built using FastAPI, React, Pandas, Tailwind CSS, Recharts, and React Leaflet.

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

## Version 2.0.0 Update

Version 2 expands the dashboard from facility distribution analytics into population-adjusted healthcare access analysis.

Version 1 helped answer:

```text
Where are health facilities located?
```

Version 2 now helps answer:

```text
How does facility availability compare to population size?
```

New V2 features:

* Population-Adjusted Access section
* Facility density per 100,000 people
* Public facility density per 100,000 people
* ART facility density per 100,000 people
* County Explorer page
* Side-by-side county comparison tool
* Ownership mix comparison
* Service coverage comparison
* County-level planning view

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

## Project Overview

This project analyses cleaned Kenya health facilities data to identify healthcare access patterns and planning opportunities across counties.

The dashboard helps answer questions such as:

* Which counties have the highest concentration of health facilities?
* Which counties have the fewest facilities?
* What ownership categories dominate healthcare provision?
* What facility categories are most common?
* How widely available are key healthcare services?
* Which counties show potential ART service gaps?
* Which counties have the lowest overall healthcare service coverage?
* How are facilities distributed geographically across Kenya?
* How does facility availability compare to population size?
* Which counties have lower facility density after adjusting for population?
* How do two counties compare across facility access, ownership mix, and service coverage?
* Can facilities be searched, filtered, and exported for further analysis?

The project was developed as a portfolio-ready full-stack data analytics application.

---

## Features

### National Overview

* Total facilities
* Counties covered
* Provinces covered
* Facility categories
* National service availability
* County-level facility distribution

### Population-Adjusted Access

* Total facility density per 100,000 people
* Public facility density per 100,000 people
* ART facility density per 100,000 people
* Population covered
* Lowest facility density counties
* Lowest public facility density watchlist
* Lowest ART facility density watchlist

### County Explorer

* Compare any two counties side by side
* Default comparison: Nairobi vs Turkana
* Population comparison
* Facility access comparison
* Ownership mix comparison
* Service coverage comparison
* Same-county comparison guard
* Highlighting for higher numeric values where comparison is meaningful

### Interactive Visualisations

* Ownership breakdown pie chart
* Facility category bar chart
* Top 10 counties by facility count
* Counties with the fewest facilities
* Service availability comparison chart
* ART service gap analysis
* Multi-service coverage score analysis
* Population-adjusted access visualisations

### Facility Finder

* Search facilities by name
* Filter by county
* Filter by ownership
* Filter by facility category
* Pagination
* CSV export of filtered results

### Kenya County Choropleth Map

* Interactive county boundary map
* Dynamic choropleth colouring
* Hover tooltips
* County ownership breakdown
* Clickable county information panel
* Dynamic legend

---

## Technology Stack

### Backend

* FastAPI
* Pandas
* OpenPyXL
* Uvicorn

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Recharts
* React Leaflet
* Leaflet

### Deployment

* Render for backend
* Vercel for frontend

### Version Control

* Git
* GitHub

---

## Project Structure

```text
kenya-health-dashboard/
│
├── backend/
│   ├── data/
│   │   └── county_population.csv
│   ├── data_loader.py
│   ├── main.py
│   ├── utils.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessDensitySection.jsx
│   │   │   └── CountyComparisonTool.jsx
│   │   ├── data/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapPage.jsx
│   │   │   └── CountyExplorer.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
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
└── README.md
```

---

## API Endpoints

| Endpoint             | Description                                 |
| -------------------- | ------------------------------------------- |
| `/`                  | API status                                  |
| `/summary`           | National summary statistics                 |
| `/ownership`         | Ownership breakdown                         |
| `/facility-types`    | Facility category breakdown                 |
| `/counties`          | County-level facility statistics            |
| `/services`          | County service availability                 |
| `/service-gap-score` | Multi-service county coverage scoring       |
| `/population`        | County-level population data                |
| `/access-density`    | Population-adjusted facility access metrics |
| `/facilities`        | Searchable and paginated facility records   |
| `/facilities/export` | CSV export for filtered facilities          |

---

## Key Metrics Added in Version 2

Version 2 adds population-adjusted metrics including:

```text
facilities_per_100k_population
public_facilities_per_100k_population
art_facilities_per_100k_population
```

These metrics help compare counties more fairly by adjusting facility availability against population size.

Example:

```text
10.4 public facility density means about 10.4 public health facilities for every 100,000 people.
```

---

## Key Insights

Some examples from the analysis include:

* Nairobi contains the highest number of recorded health facilities.
* Several counties have significantly fewer facilities despite large geographic coverage.
* Private ownership contributes substantially to healthcare provision.
* Service availability varies considerably across counties.
* ART coverage is uneven and highlights potential planning opportunities.
* Facility quantity alone does not necessarily indicate broad healthcare service availability.
* Population-adjusted facility density gives a clearer view of access than raw facility counts alone.
* County-to-county comparison helps reveal differences in facility access, ownership mix, and service coverage.

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/arapkirui513-hub/kenya-health-dashboard.git
cd kenya-health-dashboard
```

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

python -m uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

County Explorer local route:

```text
http://localhost:5173/county-explorer
```

---

## Release History

### v1.0.0

Initial full-stack dashboard release with facility distribution, ownership analysis, service availability, Facility Finder, CSV export, and county map.

### v2.0.0

- County Insight Briefs that translate selected county comparisons into plain-language planning notes
Population-adjusted access analysis and County Explorer comparison tool.

Completed:

* Population-Adjusted Access section
* County population dataset integration
* `/population` endpoint
* `/access-density` endpoint
* County Explorer page
* Side-by-side county comparison tool
* V2 screenshots and completion report

### Post-Release V2 Enhancement

After the `v2.0.0` release, the County Explorer was extended with **County Insight Briefs**.

This feature adds short planning interpretations below the county comparison summary cards. The briefs explain facility access, geography context, and service coverage differences between the selected counties.

---

## Future Enhancements

* Downloadable county comparison reports
* Advanced geographic access indicators
* Facility trend analysis
* Enhanced filtering and comparison workflows
* County planning-priority index combining facility counts, population, geography, and service coverage
* Route-level code splitting to reduce frontend bundle size

---

## Author

**Kevin Kirui**

Data Analytics | Data Science | Full-Stack Analytics Projects

GitHub:

https://github.com/arapkirui513-hub

LinkedIn:

https://www.linkedin.com/in/kevin-kirui-ba9593275/
