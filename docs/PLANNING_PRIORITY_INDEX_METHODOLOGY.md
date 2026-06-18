# County Planning Priority Index Methodology



## Purpose



The County Planning Priority Index is a planning signal that ranks Kenya's counties using access, service, ownership, and population-pressure indicators.



The index helps answer this question:



```text

Which counties should planners pay attention to first?

```



The score is not a final decision. It is a structured signal for review, comparison, and planning discussion.



---



## Output



The backend endpoint returns one record per county.



Endpoint:



```text

GET /planning-priority-index

```



Each county record includes:



* County name

* Priority score

* Priority level

* Component scores

* Input metrics

* Reason flags



The output is sorted from highest priority score to lowest priority score.



---



## Data Inputs



The index combines data from three backend data layers.



### 1. Access Density



Source function:



```text

get_access_density()

```



Input metrics used:



* Total facilities

* Population 2019

* Population density

* Facilities per 100,000 people

* Public facilities per 100,000 people

* ART facilities per 100,000 people



### 2. Service Gap Score



Source function:



```text

get_service_gap_score()

```



Input metric used:



* Coverage score



The coverage score is based on average selected service coverage across:



* FP

* IPD

* HBC

* C-IMCI

* ART



### 3. County Ownership Breakdown



Source function:



```text

get_county_breakdown()

```



Ownership categories used:



* Public

* Private

* Faith-based

* NGO

* Community

* Academic



The backend calculates ownership shares from these categories.



---



## County Matching



The backend normalizes county names before joining datasets.



County keys are created using:



```text

normalize_county_name()

```



This reduces join errors caused by formatting differences across datasets.



---



## Main Formula



The final priority score is calculated as:



```text

Priority Score =

  Access Risk * 0.40

+ Service Risk * 0.30

+ Ownership Risk * 0.20

+ Population Pressure * 0.10

```



The score is clamped between 0 and 100.



Higher scores indicate stronger planning concern.



---



## Priority Levels



Priority levels are assigned from the final priority score.



```text

High: score >= 70

Medium: score >= 40 and < 70

Low: score < 40

```



---



## Component 1 - Access Risk



Access risk contributes 40% of the final priority score.



Access risk combines three sub-signals:



```text

Access Risk =

  Facility Density Risk * 0.50

+ Public Facility Density Risk * 0.30

+ ART Facility Density Risk * 0.20

```



### Facility Density Risk



Metric:



```text

facilities_per_100k_population

```



Thresholds:



```text

<= 15 facilities per 100,000 people: maximum risk

>= 30 facilities per 100,000 people: zero risk

Between 15 and 30: linearly scaled risk

```



Reason flag added when risk is maximum:



```text

Facilities per 100k below critical threshold

```



Missing value behavior:



```text

Maximum access risk is used.

```



Reason flag:



```text

Facilities per 100k unavailable; maximum access risk used

```



### Public Facility Density Risk



Metric:



```text

public_facilities_per_100k_population

```



Thresholds:



```text

<= 8 public facilities per 100,000 people: maximum risk

>= 18 public facilities per 100,000 people: zero risk

Between 8 and 18: linearly scaled risk

```



Reason flag added when risk is maximum:



```text

Public facilities per 100k below minimum planning threshold

```



Missing value behavior:



```text

Maximum public access risk is used.

```



Reason flag:



```text

Public facilities per 100k unavailable; maximum public access risk used

```



### ART Facility Density Risk



Metric:



```text

art_facilities_per_100k_population

```



Thresholds:



```text

0 ART facilities per 100,000 people: maximum risk

>= 5 ART facilities per 100,000 people: zero risk

Between 0 and 5: linearly scaled risk

```



Reason flag added when ART facility density is zero:



```text

ART facility density is zero

```



Missing value behavior:



```text

Maximum ART risk is used.

```



Reason flag:



```text

ART facility density unavailable; maximum ART risk used

```



---



## Component 2 - Service Risk



Service risk contributes 30% of the final priority score.



Metric:



```text

coverage_score

```



Formula:



```text

Service Risk = 100 - coverage_score

```



Interpretation:



* Higher coverage score means lower service risk.

* Lower coverage score means higher service risk.



Missing value behavior:



```text

Neutral service risk of 50 is used.

```



Reason flag:



```text

Service coverage unavailable; neutral risk used

```



Reason flag added when service risk is high:



```text

High service risk from low coverage score

```



This flag is added when:



```text

service_risk >= 70

```



---



## Component 3 - Ownership Risk



Ownership risk contributes 20% of the final priority score.



The backend calculates three ownership share signals:



* Public share

* Private share

* Faith-based plus NGO share



Ownership risk is the maximum of:



* Public-sector dependence risk

* Private-market concentration risk

* Faith-based/NGO dependence risk



Formula:



```text

Ownership Risk = max(

  Public Dependence Risk,

  Private Concentration Risk,

  Faith-Based/NGO Dependence Risk

)

```



### Public Dependence Risk



Metric:



```text

public_share

```



Thresholds:



```text

< 60% public share: zero risk

>= 85% public share: maximum risk

Between 60% and 85%: linearly scaled risk

```



Reason flag added at maximum risk:



```text

High public-sector dependence

```



### Private Concentration Risk



Metric:



```text

private_share

```



Thresholds:



```text

< 50% private share: zero risk

>= 75% private share: maximum risk

Between 50% and 75%: linearly scaled risk

```



Reason flag added at maximum risk:



```text

High private-market concentration

```



### Faith-Based/NGO Dependence Risk



Metric:



```text

faith_ngo_share

```



Thresholds:



```text

< 20% faith-based plus NGO share: zero risk

>= 40% faith-based plus NGO share: risk score of 70

Between 20% and 40%: linearly scaled up to 70

```



Reason flag added at high dependence:



```text

Strong faith-based/NGO dependence

```



### Missing Ownership Data



Missing ownership-share values use a neutral ownership risk.



```text

Ownership risk = 50

```



Reason flag:



```text

Ownership mix unavailable; neutral risk used

```



---



## Component 4 - Population Pressure



Population pressure contributes 10% of the final priority score.



The backend calculates percentile scores for:



* Population size

* Population density



Formula:



```text

Population Pressure =

  Population Size Percentile * 0.60

+ Population Density Percentile * 0.40

```



The score is clamped between 0 and 100.



Missing value behavior:



```text

Neutral population pressure of 50 is used.

```



Reason flag:



```text

Population data unavailable; neutral pressure used

```



---



## Zero-Facility Edge Case



If a county has zero recorded facilities, the backend applies an edge-case rule.



Rules:



```text

Access Risk = 100

Service Risk = 100

Priority Score = max(priority_score, 85)

```



Reason flag:



```text

Zero facilities recorded

```



This prevents a county with no recorded facilities from receiving an artificially low planning priority score.



---



## Input Metrics Returned



Each county record includes input metrics used for interpretation:



* Facilities per 100,000 people

* Public facilities per 100,000 people

* ART facilities per 100,000 people

* Coverage score

* Public share

* Private share

* Faith-based plus NGO share

* 2019 population

* Population density



---



## Component Scores Returned



Each county record includes:



* Access risk

* Service risk

* Ownership risk

* Population pressure



These values help users understand why a county received its priority score.



---



## Reason Flags



Reason flags explain high-risk signals.



Examples include:



* Facilities per 100k below critical threshold

* Public facilities per 100k below minimum planning threshold

* ART facility density is zero

* High service risk from low coverage score

* High public-sector dependence

* High private-market concentration

* Strong faith-based/NGO dependence

* Zero facilities recorded



Reason flags make the index easier to interpret and audit.



---



## Interpretation Guidance



Use the Planning Priority Index to support review of counties that may need closer planning attention.



A higher score suggests stronger concern across access, service, ownership, or population-pressure signals.



A lower score suggests lower relative concern based on the available indicators.



The score should be interpreted alongside:



* Local planning judgment

* Disease burden

* Budget availability

* Facility quality

* Staffing levels

* Stock availability

* Geography

* Travel time

* Referral networks

* Community-level demand



---



## Limitations



The index does not measure every planning factor.



Current limitations include:



* It does not measure facility quality.

* It does not measure staffing levels.

* It does not measure medicine or commodity stock levels.

* It does not measure patient outcomes.

* It does not include road-network travel time.

* It does not include facility workload.

* It does not include county budget or expenditure.

* It depends on available facility, population, ownership, and service data.

* It should not be used as the only basis for real-world resource allocation.



---



## Summary



The County Planning Priority Index turns multiple county-level signals into a structured planning score.



It combines:



```text

Access Risk * 0.40

Service Risk * 0.30

Ownership Risk * 0.20

Population Pressure * 0.10

```



The result is a 0-100 score that helps users compare counties, identify risk drivers, and prioritize deeper review.







