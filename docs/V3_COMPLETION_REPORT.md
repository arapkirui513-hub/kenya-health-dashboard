# Version 3 Completion Report

# Kenya Health Facilities Dashboard

## Report Summary

Version 3 turns the Kenya Health Facilities Dashboard from an analysis tool into a planning prioritization tool.

Version 1 answered:

```text
Where are facilities located?
Who owns them?
What services exist?
Which counties appear underserved by selected services?
```

Version 2 answered:

```text
Are facilities distributed fairly when population, county comparison, service coverage, and ownership mix are considered?
```

Version 3 answers:

```text
Which counties should planners pay attention to first?
```

The core V3 feature is the **County Planning Priority Index**.

This index ranks all 47 counties using a score from 0 to 100.

Higher scores indicate higher planning priority.

---

## Current Version

Current release target:

```text
v3.0.0
```

Current status:

```text
Version 3 complete
```

Production frontend:

```text
https://kenya-health-dashboard.vercel.app/
```

County Explorer:

```text
https://kenya-health-dashboard.vercel.app/county-explorer
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

## V3 Core Feature

## County Planning Priority Index

The County Planning Priority Index ranks all 47 counties by planning priority.

Each county receives:

```text
priority_score
priority_level
component_scores
input_metrics
reason_flags
```

Priority levels:

```text
High: 70–100
Medium: 40–69
Low: 0–39
```

The endpoint returns all 47 counties sorted by `priority_score` descending.

---

## Scoring Formula

Final score:

```text
Priority Score =
Access Risk × 0.40
+ Service Risk × 0.30
+ Ownership Risk × 0.20
+ Population Pressure × 0.10
```

Component weights:

| Component           | Weight | Meaning                                                                 |
| ------------------- | -----: | ----------------------------------------------------------------------- |
| Access Risk         |    40% | Facility density, public facility density, and ART facility density     |
| Service Risk        |    30% | Inverse of selected service coverage score                              |
| Ownership Risk      |    20% | Public dependence, private concentration, or faith-based/NGO dependence |
| Population Pressure |    10% | Population size and population density percentile pressure              |

---

## Backend Work Completed

New endpoint:

```text
GET /planning-priority-index
```

Endpoint behavior:

```text
Calculates fresh on every request
Processes all 47 counties
Returns all counties sorted by priority_score descending
Uses fallback rules instead of skipping counties
Includes reason_flags for planning interpretation
```

Production validation:

```text
/planning-priority-index returned 47 counties
```

Top priority counties during validation:

```text
Bomet      80.09 High
Mombasa    74.33 High
Kiambu     71.95 High
Mandera    71.74 High
Busia      70.33 High
```

---

## Frontend Work Completed

## Main Dashboard

Added:

```text
County Planning Priority Index
```

The dashboard now shows:

```text
High priority county count
Medium priority county count
Low priority county count
Counties ranked
Highest priority county
Top 10 planning priority counties
Component scores
Reason flags
Plain-language explanation of each score component
```

Production validation:

```text
High priority: 5
Medium priority: 34
Low priority: 8
Counties ranked: 47
Highest priority county: Bomet
```

---

## County Explorer

County Explorer now includes V3 priority data.

Added:

```text
Planning priority cards
Priority score
Priority level badge
Reason flags
Planning Priority metric group
```

New comparison fields:

```text
priority_score
priority_level
access_risk
service_risk
ownership_risk
population_pressure
```

Production validation example:

```text
Nairobi priority score: 68.5
Turkana priority score: 60.0
Both counties show Medium priority
```

---

## Infrastructure Fix

During V3 deployment, Render attempted to build the backend with Python 3.14.3, causing pandas installation to fail.

Fix applied:

```text
.python-version
3.12.11
```

Production backend was restored after pinning the Python runtime.

---

## V3 Task Completion

| Task                                                  | Status      |
| ----------------------------------------------------- | ----------- |
| V3 Task 1: Scoring Formula Definition                 | Complete    |
| V3 Task 2: Backend Endpoint                           | Complete    |
| V3 Task 3: Main Dashboard Priority Index Section      | Complete    |
| V3 Task 4: County Explorer Priority Score Integration | Complete    |
| V3 Task 5: Documentation and Release                  | In progress |

---

## Release Recommendation

Recommended release tag:

```text
v3.0.0
```

Release title:

```text
Release v3.0.0 County Planning Priority Index
```

Release summary:

```text
Version 3 adds a county-level planning priority index that ranks all 47 counties using access risk, service risk, ownership risk, and population pressure.
```

---

## Future Scope

Recommended future improvements:

```text
Add disease-burden-adjusted priority index when reliable county-level disease burden data is available
Add 2009 to 2019 population growth adjustment
Add priority score export
Add priority score to printable county comparison reports
Add priority trend simulation if future data updates are added
```

---

## Final Status

Version 3 successfully turns the Kenya Health Facilities Dashboard from descriptive analysis into planning prioritization.

The dashboard now helps users identify which counties may need closer planning attention first.
