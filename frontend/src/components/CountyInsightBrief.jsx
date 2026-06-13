const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatRate = (value) => {
  const number = toNumber(value)
  return number === null ? "unknown" : `${number.toFixed(1)} per 100k`
}

const formatPercent = (value) => {
  const number = toNumber(value)

  if (number === null) {
    return "unknown"
  }

  const normalized = number <= 1 ? number * 100 : number
  return `${normalized.toFixed(1)}%`
}

const compareValues = (a, b) => {
  const aValue = toNumber(a)
  const bValue = toNumber(b)

  if (aValue === null || bValue === null) {
    return null
  }

  if (aValue === bValue) {
    return "equal"
  }

  return aValue > bValue ? "A" : "B"
}

function buildFacilityInsight(selectedA, selectedB, countyADensity, countyBDensity) {
  const higherDensity = compareValues(
    countyADensity?.facilities_per_100k_population,
    countyBDensity?.facilities_per_100k_population
  )

  if (!higherDensity) {
    return "Facility access density could not be compared because one or both counties have missing access-density data."
  }

  if (higherDensity === "equal") {
    return `${selectedA} and ${selectedB} have the same facility density at ${formatRate(
      countyADensity?.facilities_per_100k_population
    )}.`
  }

  const strongerCounty = higherDensity === "A" ? selectedA : selectedB
  const lowerCounty = higherDensity === "A" ? selectedB : selectedA

  const strongerValue =
    higherDensity === "A"
      ? countyADensity?.facilities_per_100k_population
      : countyBDensity?.facilities_per_100k_population

  const lowerValue =
    higherDensity === "A"
      ? countyBDensity?.facilities_per_100k_population
      : countyADensity?.facilities_per_100k_population

  return `${strongerCounty} has higher facility density than ${lowerCounty}, at ${formatRate(
    strongerValue
  )} compared with ${formatRate(
    lowerValue
  )}. This suggests stronger facility availability relative to population size.`
}

function buildGeographyInsight(selectedA, selectedB, countyADensity, countyBDensity) {
  const largerArea = compareValues(
    countyADensity?.area_km2,
    countyBDensity?.area_km2
  )

  const higherPopulationDensity = compareValues(
    countyADensity?.density_per_km2,
    countyBDensity?.density_per_km2
  )

  if (!largerArea || !higherPopulationDensity) {
    return "Geographic context could not be fully compared because one or both counties have missing area or population-density data."
  }

  const largerCounty = largerArea === "A" ? selectedA : selectedB
  const denserCounty = higherPopulationDensity === "A" ? selectedA : selectedB

  return `${largerCounty} has the larger land area, while ${denserCounty} has the higher population density. This matters because facility-per-population metrics do not fully capture travel distance or physical access barriers.`
}

function buildServiceInsight(selectedA, selectedB, countyAGap, countyBGap) {
  const higherCoverage = compareValues(
    countyAGap?.coverage_score,
    countyBGap?.coverage_score
  )

  if (!higherCoverage) {
    return "Service coverage could not be compared because one or both counties have missing service-gap data."
  }

  if (higherCoverage === "equal") {
    return `${selectedA} and ${selectedB} have the same overall service coverage score at ${formatPercent(
      countyAGap?.coverage_score
    )}.`
  }

  const strongerCounty = higherCoverage === "A" ? selectedA : selectedB
  const lowerCounty = higherCoverage === "A" ? selectedB : selectedA

  const strongerValue =
    higherCoverage === "A"
      ? countyAGap?.coverage_score
      : countyBGap?.coverage_score

  const lowerValue =
    higherCoverage === "A"
      ? countyBGap?.coverage_score
      : countyAGap?.coverage_score

  return `${strongerCounty} has a higher overall service coverage score than ${lowerCounty}, at ${formatPercent(
    strongerValue
  )} compared with ${formatPercent(
    lowerValue
  )}. This may indicate broader availability of selected priority services.`
}

export default function CountyInsightBrief({
  selectedA,
  selectedB,
  countyADensity,
  countyBDensity,
  countyAGap,
  countyBGap,
}) {
  const insights = [
    {
      title: "Facility access",
      text: buildFacilityInsight(
        selectedA,
        selectedB,
        countyADensity,
        countyBDensity
      ),
    },
    {
      title: "Geography context",
      text: buildGeographyInsight(
        selectedA,
        selectedB,
        countyADensity,
        countyBDensity
      ),
    },
    {
      title: "Service coverage",
      text: buildServiceInsight(selectedA, selectedB, countyAGap, countyBGap),
    },
  ]

  return (
    <section className="rounded-3xl border border-teal-100 bg-teal-50/60 p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        Planning Interpretation
      </p>

      <h3 className="mt-2 text-xl font-bold text-slate-950">
        County Insight Brief
      </h3>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        These notes translate the comparison into planning language using the
        selected counties&apos; facility access, geography, and service coverage
        metrics.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {insights.map((insight) => (
          <article
            key={insight.title}
            className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
          >
            <h4 className="text-sm font-bold text-slate-950">
              {insight.title}
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {insight.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}