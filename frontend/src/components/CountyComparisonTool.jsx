import { useMemo, useState } from "react"

const normalizeCounty = (name = "") =>
  name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]/g, "")

const findCounty = (rows, countyName) =>
  rows.find((row) => normalizeCounty(row.county) === normalizeCounty(countyName))

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatCount = (value) => {
  const number = toNumber(value)
  return number === null ? "—" : number.toLocaleString()
}

const formatRate = (value) => {
  const number = toNumber(value)
  return number === null ? "—" : `${number.toFixed(1)} per 100k`
}

const formatDecimal = (value) => {
  const number = toNumber(value)
  return number === null ? "—" : number.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })
}

const formatArea = (value) => {
  const number = toNumber(value)
  return number === null ? "—" : `${number.toLocaleString()} km²`
}

const formatPercent = (value) => {
  const number = toNumber(value)

  if (number === null) {
    return "—"
  }

  const normalized = number <= 1 ? number * 100 : number
  return `${normalized.toFixed(1)}%`
}

const ownershipPercent = (part, total) => {
  const partValue = toNumber(part)
  const totalValue = toNumber(total)

  if (partValue === null || totalValue === null || totalValue === 0) {
    return null
  }

  return (partValue / totalValue) * 100
}

const getHigherSide = (a, b, shouldHighlight) => {
  if (!shouldHighlight) {
    return null
  }

  const aValue = toNumber(a)
  const bValue = toNumber(b)

  if (aValue === null || bValue === null || aValue === bValue) {
    return null
  }

  return aValue > bValue ? "A" : "B"
}

function MetricCell({ value, formatter, isHighlighted }) {
  return (
    <td
      className={`px-4 py-3 text-sm ${
        isHighlighted
          ? "rounded-xl bg-teal-50 font-semibold text-teal-900 ring-1 ring-inset ring-teal-100"
          : "text-slate-700"
      }`}
    >
      {formatter(value)}
    </td>
  )
}

function SummaryCard({ title, density }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Population
          </dt>
          <dd className="mt-1 text-2xl font-bold text-slate-950">
            {formatCount(density?.population_2019)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total facilities
          </dt>
          <dd className="mt-1 text-2xl font-bold text-slate-950">
            {formatCount(density?.total_facilities)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Facility density
          </dt>
          <dd className="mt-1 text-2xl font-bold text-teal-800">
            {formatRate(density?.facilities_per_100k_population)}
          </dd>
        </div>
      </dl>
    </article>
  )
}

export default function CountyComparisonTool({
  accessDensity,
  counties,
  serviceGap,
}) {
  const [selectedA, setSelectedA] = useState("Nairobi")
  const [selectedB, setSelectedB] = useState("Turkana")

  const countyOptions = useMemo(() => {
    return accessDensity
      .map((row) => row.county)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  }, [accessDensity])

  const countyADensity = findCounty(accessDensity, selectedA)
  const countyBDensity = findCounty(accessDensity, selectedB)

  const countyACounties = findCounty(counties, selectedA)
  const countyBCounties = findCounty(counties, selectedB)

  const countyAGap = findCounty(serviceGap, selectedA)
  const countyBGap = findCounty(serviceGap, selectedB)

  const sameCounty = normalizeCounty(selectedA) === normalizeCounty(selectedB)

  const metricGroups = [
    {
      title: "Population & Geography",
      rows: [
        {
          label: "Population 2019",
          a: countyADensity?.population_2019,
          b: countyBDensity?.population_2019,
          formatter: formatCount,
          highlight: true,
        },
        {
          label: "Land area",
          a: countyADensity?.area_km2,
          b: countyBDensity?.area_km2,
          formatter: formatArea,
          highlight: true,
        },
        {
          label: "Population density per km²",
          a: countyADensity?.density_per_km2,
          b: countyBDensity?.density_per_km2,
          formatter: formatDecimal,
          highlight: true,
        },
      ],
    },
    {
      title: "Facility Access",
      rows: [
        {
          label: "Total facilities",
          a: countyADensity?.total_facilities,
          b: countyBDensity?.total_facilities,
          formatter: formatCount,
          highlight: true,
        },
        {
          label: "Facilities per 100,000 people",
          a: countyADensity?.facilities_per_100k_population,
          b: countyBDensity?.facilities_per_100k_population,
          formatter: formatRate,
          highlight: true,
        },
        {
          label: "Public facilities per 100,000 people",
          a: countyADensity?.public_facilities_per_100k_population,
          b: countyBDensity?.public_facilities_per_100k_population,
          formatter: formatRate,
          highlight: true,
        },
        {
          label: "ART facilities per 100,000 people",
          a: countyADensity?.art_facilities_per_100k_population,
          b: countyBDensity?.art_facilities_per_100k_population,
          formatter: formatRate,
          highlight: true,
        },
      ],
    },
    {
      title: "Ownership Mix",
      rows: [
        {
          label: "% Public",
          a: ownershipPercent(countyACounties?.public, countyACounties?.total),
          b: ownershipPercent(countyBCounties?.public, countyBCounties?.total),
          formatter: formatPercent,
          highlight: false,
        },
        {
          label: "% Private",
          a: ownershipPercent(countyACounties?.private, countyACounties?.total),
          b: ownershipPercent(countyBCounties?.private, countyBCounties?.total),
          formatter: formatPercent,
          highlight: false,
        },
        {
          label: "% Faith-Based",
          a: ownershipPercent(
            countyACounties?.faith_based,
            countyACounties?.total
          ),
          b: ownershipPercent(
            countyBCounties?.faith_based,
            countyBCounties?.total
          ),
          formatter: formatPercent,
          highlight: false,
        },
      ],
    },
    {
      title: "Service Coverage",
      rows: [
        {
          label: "Overall coverage score",
          a: countyAGap?.coverage_score,
          b: countyBGap?.coverage_score,
          formatter: formatPercent,
          highlight: true,
        },
        {
          label: "FP coverage",
          a: countyAGap?.fp_coverage,
          b: countyBGap?.fp_coverage,
          formatter: formatPercent,
          highlight: true,
        },
        {
          label: "ART coverage",
          a: countyAGap?.art_coverage,
          b: countyBGap?.art_coverage,
          formatter: formatPercent,
          highlight: true,
        },
        {
          label: "C-IMCI coverage",
          a: countyAGap?.c_imci_coverage,
          b: countyBGap?.c_imci_coverage,
          formatter: formatPercent,
          highlight: true,
        },
        {
          label: "IPD coverage",
          a: countyAGap?.ipd_coverage,
          b: countyBGap?.ipd_coverage,
          formatter: formatPercent,
          highlight: true,
        },
        {
          label: "HBC coverage",
          a: countyAGap?.hbc_coverage,
          b: countyBGap?.hbc_coverage,
          formatter: formatPercent,
          highlight: true,
        },
      ],
    },
  ]

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Side-by-Side Comparison
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Compare Two Counties
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Select two counties to compare population-adjusted healthcare
              access, ownership mix, and service coverage indicators.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                County A
              </span>
              <select
                value={selectedA}
                onChange={(event) => setSelectedA(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                {countyOptions.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                County B
              </span>
              <select
                value={selectedB}
                onChange={(event) => setSelectedB(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                {countyOptions.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {sameCounty ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-medium text-amber-900">
            Select two different counties to compare.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <SummaryCard title={selectedA} density={countyADensity} />
            <SummaryCard title={selectedB} density={countyBDensity} />
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-bold text-slate-950">
                Comparison Metrics
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Highlighted cells show the higher value for that metric. Ownership
                mix is shown as descriptive context and is not highlighted.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-1 p-3">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Metric
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {selectedA}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {selectedB}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {metricGroups.map((group) => (
                    <>
                      <tr key={`${group.title}-heading`}>
                        <td
                          colSpan="3"
                          className="bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600"
                        >
                          {group.title}
                        </td>
                      </tr>

                      {group.rows.map((row) => {
                        const higherSide = getHigherSide(
                          row.a,
                          row.b,
                          row.highlight
                        )

                        return (
                          <tr key={`${group.title}-${row.label}`}>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {row.label}
                            </td>

                            <MetricCell
                              value={row.a}
                              formatter={row.formatter}
                              isHighlighted={higherSide === "A"}
                            />

                            <MetricCell
                              value={row.b}
                              formatter={row.formatter}
                              isHighlighted={higherSide === "B"}
                            />
                          </tr>
                        )
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}