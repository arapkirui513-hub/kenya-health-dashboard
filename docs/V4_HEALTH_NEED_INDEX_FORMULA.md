# V4 Health Need Index Formula

## Purpose

The Health Need Index uses KDHS 2022 county-level indicators to estimate which counties show the highest health need based on reproductive health, maternal care, and child immunization signals.

The index complements the V3 County Planning Priority Index.

## Main Question

Which counties show the highest health need based on KDHS 2022 service-use and outcome indicators?

## Score Range

```text
0-100
```

Higher score means higher health need.

## Formula

```text
Health Need Index =
Teenage Pregnancy Risk x 0.15
+ Family Planning Need Risk x 0.25
+ Maternal Care Gap Risk x 0.40
+ Child Immunization Gap Risk x 0.20
```

## Components

### 1. Teenage Pregnancy Risk

```text
Teenage Pregnancy Risk = teenage_pregnancy_pct
```

Higher teenage pregnancy indicates higher reproductive health need.

### 2. Family Planning Need Risk

```text
Family Planning Need Risk =
(unmet_need_family_planning_pct x 0.60)
+ ((100 - modern_contraceptive_use_pct) x 0.40)
```

This combines unmet need for family planning and low modern contraceptive use.

### 3. Maternal Care Gap Risk

```text
Maternal Care Gap Risk =
((100 - anc_4plus_visits_pct) x 0.35)
+ ((100 - skilled_delivery_pct) x 0.35)
+ ((100 - facility_delivery_pct) x 0.30)
```

This captures gaps in antenatal care, skilled delivery, and facility delivery.

### 4. Child Immunization Gap Risk

```text
Child Immunization Gap Risk =
100 - fully_vaccinated_basic_pct
```

Lower basic vaccination coverage indicates higher child health need.

## Health Need Levels

```text
High Health Need: 60-100
Moderate Health Need: 35-59
Lower Health Need: 0-34
```

## Reason Flags

Future backend implementation should include reason flags such as:

* High teenage pregnancy
* High unmet need for family planning
* Low modern contraceptive use
* Low ANC 4+ visit coverage
* Low skilled delivery coverage
* Low facility delivery coverage
* Low basic vaccination coverage

## Selected KDHS Indicators Used

```text
teenage_pregnancy_pct
modern_contraceptive_use_pct
unmet_need_family_planning_pct
anc_4plus_visits_pct
skilled_delivery_pct
facility_delivery_pct
fully_vaccinated_basic_pct
```

## Implementation Plan

V4 Task 4 will implement:

```text
GET /health-need-index
```

The endpoint should return all 47 counties with:

* health_need_score
* health_need_level
* component_scores
* input_metrics
* reason_flags
