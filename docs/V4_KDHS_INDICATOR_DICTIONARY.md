# V4 KDHS 2022 Indicator Dictionary

## Purpose

This file documents the KDHS 2022 county-level indicators selected for the Kenya Health Facilities Dashboard V4 health need data layer.

V4 adds health outcome and service-use indicators to complement the V3 County Planning Priority Index.

## Source

Kenya Demographic and Health Survey 2022 Key Indicators Report.

Implemented by:

* Kenya National Bureau of Statistics
* Ministry of Health
* The DHS Program / ICF

## Dataset file

```text
backend/data/kdhs_2022_county_indicators.csv
```

## Join key

```text
county
```

County names should match the existing dashboard county naming style. For example, the join key uses "Nairobi City" instead of "Nairobi".

## Selected indicators

| Column                         | Source table | Meaning                                                                               |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------- |
| teenage_pregnancy_pct          | Table 6C     | Percentage of women age 15–19 who have ever been pregnant                             |
| modern_contraceptive_use_pct   | Table 8C     | Percentage of currently married women age 15–49 using any modern contraceptive method |
| unmet_need_family_planning_pct | Table 9C     | Percentage of currently married women age 15–49 with unmet need for family planning   |
| anc_4plus_visits_pct           | Table 10C    | Percentage of women with 4+ ANC visits for most recent live birth                     |
| skilled_delivery_pct           | Table 10C    | Percentage of live births delivered by a skilled provider                             |
| facility_delivery_pct          | Table 10C    | Percentage of live births delivered in a health facility                              |
| fully_vaccinated_basic_pct     | Table 11C    | Percentage of children age 12–23 months fully vaccinated for basic antigens           |

## Source table notes

The selected indicators come from county-level KDHS tables:

```text
Table 6C: Teenage pregnancy by county
Table 8C: Current use of contraception by county
Table 9C: Need and demand for family planning by county
Table 10C: Maternal care indicators by county
Table 11C: Vaccinations by county
```

## V4 interpretation direction

These indicators will support a future health-need data layer.

High-need signals may include:

* Higher teenage pregnancy
* Higher unmet need for family planning
* Lower modern contraceptive use
* Lower ANC 4+ visit coverage
* Lower skilled delivery coverage
* Lower facility delivery coverage
* Lower full vaccination coverage

## V4 Task 1 status

Initial KDHS county indicator CSV created.

Current dataset includes:

```text
47 counties
7 selected indicators
county-level join key
```

## Next step

Create a backend endpoint:

```text
GET /kdhs-indicators
```

The endpoint should return all 47 county indicator rows.
