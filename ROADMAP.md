# Kenya Health Facilities Dashboard Roadmap



## Product Direction



The Kenya Health Facilities Dashboard has evolved from a facility distribution dashboard into a healthcare planning intelligence system.



The project now connects facility records, population-adjusted access, ownership patterns, service availability, county planning priority, and KDHS-based health need indicators.



Core product question:



```text

To what extent does the county-level distribution of healthcare facilities in Kenya reflect both public health need and healthcare market dynamics?

```



Core portfolio message:



```text

I build health data products that turn messy public datasets into practical planning intelligence.

```



---



## Current Release State



Current release:



```text

v4.0.2

```



Current release focus:



```text

Planning report polish, export support, methodology explanation, and user-facing resilience.

```



Release status:



```text

Production deployed and stable.

```



---



## V1 - Core Dashboard Foundation



### Product Question



```text

Where are Kenya's health facilities, and how are they distributed?

```



### Goal



Create a working full-stack dashboard that transforms raw Kenya health facility data into a usable national and county-level analytics view.



### Completed Scope



* Facility distribution dashboard

* County-level facility counts

* Ownership analysis

* Facility type breakdown

* Service availability analysis

* ART service gap analysis

* Facility search and filters

* CSV export

* FastAPI backend

* React frontend

* Vercel frontend deployment

* Render backend deployment

* Public API documentation

* v1.0.0 release



### Planning Value



V1 established the foundation for exploring facility distribution and service availability across Kenya.



---



## V2 - Population-Adjusted Access and Market Dynamics



### Product Question



```text

Are facilities distributed according to population and ownership patterns?

```



### Goal



Move beyond raw facility counts by adding population-adjusted access and ownership-market interpretation.



### Completed Scope



* County population dataset

* `/population` endpoint

* `/access-density` endpoint

* Population-adjusted facility access

* Facilities per 100,000 people

* Public facilities per 100,000 people

* ART facilities per 100,000 people

* County Explorer

* Side-by-side county comparison

* County Insight Brief

* Ownership \& Market Dynamics section

* Printable report foundation

* Mobile polish

* Backend security and reliability improvements

* V2 completion report



### Planning Value



V2 made the dashboard more analytical by showing that raw facility count is not enough. Facility access must be interpreted against population size and ownership mix.



---



## V3 - County Planning Priority Index



### Product Question



```text

Which counties should planners pay attention to first?

```



### Goal



Create a county-level planning signal that combines multiple risk dimensions into one prioritization layer.



### Completed Scope



* `/planning-priority-index` endpoint

* Access risk scoring

* Service risk scoring

* Ownership risk scoring

* Population pressure scoring

* Priority score from 0 to 100

* High, Medium, and Low priority levels

* National ranking

* Component risk scores

* Reason flags

* Top planning priority counties

* Planning Priority dashboard section

* County Explorer priority integration

* V3 completion report



### Planning Value



V3 turned separate indicators into a planning workflow. Users can identify counties that may need closer review based on access, services, ownership, and population pressure.



---



## V4 - Health Need Index



### Product Question



```text

Which counties show higher health need based on KDHS 2022 indicators?

```



### Goal



Add a health-need layer so planning analysis is not limited to facilities and service availability.



### Completed Scope



* KDHS 2022 county indicator data layer

* `/kdhs-indicators` endpoint

* `/health-need-index` endpoint

* Health Need Index

* Health need score from 0 to 100

* Health need levels

* Component scores

* Input metrics

* Reason flags

* Health Need Index dashboard section

* County Explorer health-need comparison

* V4 formula documentation

* V4 indicator dictionary

* V4 completion report

* v4.0.0 release



### Planning Value



V4 connected supply-side facility analysis with population health need signals. This allows users to compare facility access against indicators such as teenage pregnancy, family planning need, maternal care gaps, and child immunization gaps.



---



## V4.0.2 - Planning Report Polish



### Product Question



```text

Can users export, explain, and share the planning insights?

```



### Goal



Improve the planner-facing workflow around interpretation, reporting, filtering, and export.



### Completed Scope



* Planning-grade County Explorer print report

* Planning Priority data added to print report

* Priority score, level, rank, and component risks in report

* Risk drivers in report

* Planning interpretation section

* Planning Priority CSV export

* Priority-level filters

* Low priority default view

* Methodology modal

* Improved loading states

* Improved error states

* Improved empty states

* Backend version updated to v4.0.2

* V4.0.2 completion report

* v4.0.2 tag pushed

* Render backend redeployed



### Planning Value



V4.0.2 made the system easier to use in planning conversations. Users can now explain the index, filter priority groups, export planning data, and generate printable county comparison reports.



---



## V5 - Need-Access Gap Intelligence



### Product Question



```text

Which counties combine higher health need with weaker access or readiness signals?

```



### Current State



```text

Early backend/API work is present, but V5 is not yet packaged as a formal portfolio release.

```



### Planned Scope



* Need-access mismatch scoring

* High need plus low access flag

* County intervention watchlist

* Need-access gap dashboard layer

* Public-sector intervention priority

* County Explorer need-access interpretation

* Methodology documentation

* Screenshots

* Completion report

* Formal release tag only if packaged as a complete release



### Planning Value



V5 would connect health need and access into a more direct intervention signal. This would help identify counties where higher need appears alongside weaker facility access, weaker service readiness, or higher planning priority.



---



## Future Improvements



Possible future improvements include:



* Map-based need-access mismatch layer

* County intervention watchlist

* Downloadable county planning briefs

* More health outcome indicators

* Facility quality and staffing indicators if reliable data becomes available

* Time-series comparison if updated datasets become available

* More advanced methodology validation

* Automated API tests

* Frontend test coverage

* Deeper mobile reporting workflow

* Better cold-start handling for hosted backend services



---



## Portfolio Relevance



This roadmap shows progression across:



* Data cleaning

* Healthcare analytics

* Feature engineering

* Index design

* API development

* Frontend data storytelling

* Product thinking

* Planning workflow design

* Documentation



The project is positioned primarily for data and analytics roles, secondarily for health-tech and digital health roles, and supportively for full-stack development roles.







