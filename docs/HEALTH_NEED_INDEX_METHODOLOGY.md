# Health Need Index Methodology



## Purpose



The Health Need Index is a county-level planning signal built from KDHS 2022 health indicators.



The index helps answer this question:



```text

Which counties show higher health need based on KDHS 2022 indicators?

```



The score is designed for comparison and planning review. It is not a clinical score, disease-burden estimate, or final resource allocation rule.



---



## Output



The backend endpoint returns one record per county.



Primary endpoint:



```text

GET /health-need-index

```



Alias endpoint:



```text

GET /county-health-needs

```



Each county record includes:



* County name

* Health need score

* Health need level

* Component scores

* Input metrics

* Reason flags



The output is sorted from highest health need score to lowest health need score.



---



## Data Source



The index uses KDHS 2022 county-level indicator data loaded by the backend.



Source function:



```text

get_kdhs_indicators()

```



Index function:



```text

get_health_need_index()

```



---



## Input Metrics



The Health Need Index uses these county-level KDHS indicators:



* Teenage pregnancy percentage

* Modern contraceptive use percentage

* Unmet need for family planning percentage

* ANC 4+ visits percentage

* Skilled delivery percentage

* Facility delivery percentage

* Fully vaccinated basic percentage



Backend field names:



```text

teenage_pregnancy_pct

modern_contraceptive_use_pct

unmet_need_family_planning_pct

anc_4plus_visits_pct

skilled_delivery_pct

facility_delivery_pct

fully_vaccinated_basic_pct

```



---



## Main Formula



The final health need score is calculated as:



```text

Health Need Score =

  Teenage Pregnancy Risk * 0.15

+ Family Planning Need Risk * 0.25

+ Maternal Care Gap Risk * 0.40

+ Child Immunization Gap Risk * 0.20

```



The score is clamped between 0 and 100.



Higher scores indicate higher estimated health need based on the available KDHS indicators.



---



## Health Need Levels



Health need levels are assigned from the final health need score.



```text

High Health Need: score >= 60

Moderate Health Need: score >= 35 and < 60

Lower Health Need: score < 35

```



---



## Component 1 - Teenage Pregnancy Risk



Teenage pregnancy risk uses the teenage pregnancy percentage directly.



Metric:



```text

teenage_pregnancy_pct

```



Formula:



```text

Teenage Pregnancy Risk = teenage_pregnancy_pct

```



Contribution to final score:



```text

15%

```



Interpretation:



* Higher teenage pregnancy percentage increases the health need score.

* Lower teenage pregnancy percentage reduces the health need score.



Reason flag threshold:



```text

teenage_pregnancy_pct >= 20

```



Reason flag:



```text

High teenage pregnancy

```



---



## Component 2 - Family Planning Need Risk



Family planning need risk combines unmet need for family planning and low modern contraceptive use.



Metrics:



```text

unmet_need_family_planning_pct

modern_contraceptive_use_pct

```



Formula:



```text

Family Planning Need Risk =

  unmet_need_family_planning_pct * 0.60

+ (100 - modern_contraceptive_use_pct) * 0.40

```



Contribution to final score:



```text

25%

```



Interpretation:



* Higher unmet need for family planning increases the risk score.

* Lower modern contraceptive use increases the risk score.

* The component gives more weight to unmet need than contraceptive-use gap.



Reason flag threshold:



```text

unmet_need_family_planning_pct >= 20

```



Reason flag:



```text

High unmet need for family planning

```



Reason flag threshold:



```text

modern_contraceptive_use_pct < 50

```



Reason flag:



```text

Low modern contraceptive use

```



---



## Component 3 - Maternal Care Gap Risk



Maternal care gap risk combines gaps in ANC 4+ visits, skilled delivery, and facility delivery.



Metrics:



```text

anc_4plus_visits_pct

skilled_delivery_pct

facility_delivery_pct

```



Formula:



```text

Maternal Care Gap Risk =

  (100 - anc_4plus_visits_pct) * 0.35

+ (100 - skilled_delivery_pct) * 0.35

+ (100 - facility_delivery_pct) * 0.30

```



Contribution to final score:



```text

40%

```



Interpretation:



* Lower ANC 4+ visit coverage increases the risk score.

* Lower skilled delivery coverage increases the risk score.

* Lower facility delivery coverage increases the risk score.

* ANC 4+ visits and skilled delivery receive slightly higher weight than facility delivery.



Reason flag threshold:



```text

anc_4plus_visits_pct < 50

```



Reason flag:



```text

Low ANC 4+ visit coverage

```



Reason flag threshold:



```text

skilled_delivery_pct < 80

```



Reason flag:



```text

Low skilled delivery coverage

```



Reason flag threshold:



```text

facility_delivery_pct < 70

```



Reason flag:



```text

Low facility delivery coverage

```



---



## Component 4 - Child Immunization Gap Risk



Child immunization gap risk is calculated from full basic vaccination coverage.



Metric:



```text

fully_vaccinated_basic_pct

```



Formula:



```text

Child Immunization Gap Risk = 100 - fully_vaccinated_basic_pct

```



Contribution to final score:



```text

20%

```



Interpretation:



* Lower full basic vaccination coverage increases the risk score.

* Higher full basic vaccination coverage reduces the risk score.



Reason flag threshold:



```text

fully_vaccinated_basic_pct < 70

```



Reason flag:



```text

Low basic vaccination coverage

```



---



## Component Scores Returned



Each county record includes component scores for:



* Teenage pregnancy risk

* Family planning need risk

* Maternal care gap risk

* Child immunization gap risk



These component scores help users understand why a county received its final health need score.



---



## Input Metrics Returned



Each county record also returns the input metrics used in the calculation:



* Teenage pregnancy percentage

* Modern contraceptive use percentage

* Unmet need for family planning percentage

* ANC 4+ visits percentage

* Skilled delivery percentage

* Facility delivery percentage

* Fully vaccinated basic percentage



This makes the score easier to review and audit.



---



## Reason Flags



Reason flags explain high-need signals.



Possible reason flags include:



* High teenage pregnancy

* High unmet need for family planning

* Low modern contraceptive use

* Low ANC 4+ visit coverage

* Low skilled delivery coverage

* Low facility delivery coverage

* Low basic vaccination coverage



Reason flags are useful because they show which input indicators are driving concern.



---



## Interpretation Guidance



Use the Health Need Index as a planning-support signal.



A higher score suggests stronger relative health need based on the selected KDHS indicators.



A lower score suggests lower relative health need based on the selected KDHS indicators.



The score should be interpreted alongside:



* Facility access

* Service availability

* County Planning Priority Index

* Local epidemiology

* County budgets

* Staffing levels

* Facility quality

* Referral pathways

* Geography and travel time

* Community-level context



---



## Relationship to the Planning Priority Index



The Health Need Index and County Planning Priority Index answer different questions.



The Planning Priority Index focuses on supply-side and readiness-related signals:



* Facility access

* Public facility access

* ART facility access

* Service coverage

* Ownership mix

* Population pressure



The Health Need Index focuses on selected population health indicators:



* Teenage pregnancy

* Family planning need

* Maternal care gaps

* Child immunization gaps



Together, they help compare:



```text

Where access or readiness may be weaker

```



against:



```text

Where health need may be higher

```



This creates the foundation for future Need-Access Gap Intelligence.



---



## Limitations



The Health Need Index does not measure every factor needed for health planning.



Current limitations include:



* It uses selected KDHS 2022 indicators only.

* It does not include all disease burden indicators.

* It does not include mortality data.

* It does not include morbidity data.

* It does not measure facility quality.

* It does not measure staffing levels.

* It does not measure medicine or commodity stock levels.

* It does not measure real-time service utilization.

* It does not include travel-time or road-network access.

* It should not be used as the only basis for resource allocation.



---



## Summary



The Health Need Index turns selected KDHS 2022 county indicators into a structured 0-100 planning signal.



The final score uses:



```text

Teenage Pregnancy Risk * 0.15

Family Planning Need Risk * 0.25

Maternal Care Gap Risk * 0.40

Child Immunization Gap Risk * 0.20

```



The result helps users compare counties by relative health need and connect health indicators to planning discussions.







