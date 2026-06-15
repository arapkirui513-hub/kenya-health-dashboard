import { Fragment, useMemo, useState } from "react"
import CountyInsightBrief from "./CountyInsightBrief"
import CountyComparisonReportButton from "./CountyComparisonReportButton"

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

  return number === null
    ? "—"
    : number.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })
}


const formatPriorityScore = (value) => {
  const number = toNumber(value)
  return number === null ? "N/A" : number.toFixed(1)
}

const formatPriorityLevel = (value) => value || "N/A"

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


const getPriorityBadgeClass = (level) => {
  if (level === "High") {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (level === "Medium") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700"
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

function MobileMetricCard({ row, selectedA, selectedB }) {
  const higherSide = getHigherSide(row.a, row.b, row.highlight)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-950">{row.label}</h4>

      <div className="mt-3 grid gap-3">
        <div
          className={`rounded-xl border p-3 ${
            higherSide === "A"
              ? "border-teal-100 bg-teal-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {selectedA}
          </p>
          <p
            className={`mt-1 text-base font-bold ${
              higherSide === "A" ? "text-teal-900" : "text-slate-900"
            }`}
          >
            {row.formatter(row.a)}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            higherSide === "B"
              ? "border-teal-100 bg-teal-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {selectedB}
          </p>
          <p
            className={`mt-1 text-base font-bold ${
              higherSide === "B" ? "text-teal-900" : "text-slate-900"
            }`}
          >
            {row.formatter(row.b)}
          </p>
        </div>
      </div>
    </article>
  )
}


function PriorityReasonCard({ title, priority }) {
  const flags = Array.isArray(priority?.reason_flags)
    ? priority.reason_flags.slice(0, 5)
    : []

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-950 sm:text-lg">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">Planning priority</p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(
            priority?.priority_level
          )}`}
        >
          {priority?.priority_level || "N/A"}
        </span>
      </div>

      <p className="mt-4 text-3xl font-black text-slate-950">
        {formatPriorityScore(priority?.priority_score)}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Higher scores signal stronger planning attention.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {flags.length > 0 ? (
          flags.map((flag) => (
            <span
              key={flag}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
            >
              {flag}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-400">No major flags</span>
        )}
      </div>
    </article>
  )
}

function SummaryCard({ title, density }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-base font-bold text-slate-950 sm:text-lg">{title}</h3>

      <dl className="mt-4 grid grid-cols-3 gap-2 sm:block sm:space-y-3">
        <div className="rounded-2xl bg-slate-50 p-2 sm:bg-transparent sm:p-0">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
            Population
          </dt>
          <dd className="mt-1 text-base font-bold text-slate-950 sm:text-2xl">
            {formatCount(density?.population_2019)}
          </dd>
        </div>

        <div className="rounded-2xl bg-slate-50 p-2 sm:bg-transparent sm:p-0">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
            Total facilities
          </dt>
          <dd className="mt-1 text-base font-bold text-slate-950 sm:text-2xl">
            {formatCount(density?.total_facilities)}
          </dd>
        </div>

        <div className="rounded-2xl bg-teal-50 p-2 sm:bg-transparent sm:p-0">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
            Facility density
          </dt>
          <dd className="mt-1 text-base font-bold text-teal-800 sm:text-2xl">
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
  priorityIndex,
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

  const countyAPriority = findCounty(priorityIndex, selectedA)
  const countyBPriority = findCounty(priorityIndex, selectedB)

  const sameCounty = normalizeCounty(selectedA) === normalizeCounty(selectedB)

  const metricGroups = [
    {
      title: "Planning Priority",
      rows: [
        {
          label: "Priority score",
          a: countyAPriority?.priority_score,
          b: countyBPriority?.priority_score,
          formatter: formatPriorityScore,
          highlight: true,
        },
        {
          label: "Priority level",
          a: countyAPriority?.priority_level,
          b: countyBPriority?.priority_level,
          formatter: formatPriorityLevel,
          highlight: false,
        },
        {
          label: "Access risk",
          a: countyAPriority?.component_scores?.access_risk,
          b: countyBPriority?.component_scores?.access_risk,
          formatter: formatPriorityScore,
          highlight: true,
        },
        {
          label: "Service risk",
          a: countyAPriority?.component_scores?.service_risk,
          b: countyBPriority?.component_scores?.service_risk,
          formatter: formatPriorityScore,
          highlight: true,
        },
        {
          label: "Ownership risk",
          a: countyAPriority?.component_scores?.ownership_risk,
          b: countyBPriority?.component_scores?.ownership_risk,
          formatter: formatPriorityScore,
          highlight: true,
        },
        {
          label: "Population pressure",
          a: countyAPriority?.component_scores?.population_pressure,
          b: countyBPriority?.component_scores?.population_pressure,
          formatter: formatPriorityScore,
          highlight: true,
        },
      ],
    },
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
    <section className="space-y-4 sm:space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 sm:text-sm">
              Side-by-Side Comparison
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">
              Compare Two Counties
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:block">
              Select two counties to compare access, ownership, and service
              coverage.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                County A
              </span>
              <select
                value={selectedA}
                onChange={(event) => setSelectedA(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:text-sm"
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
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:text-sm"
              >
                {countyOptions.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </label>

            <div className="col-span-full">
              <CountyComparisonReportButton
                selectedA={selectedA}
                selectedB={selectedB}
                countyADensity={countyADensity}
                countyBDensity={countyBDensity}
                countyACounties={countyACounties}
                countyBCounties={countyBCounties}
                countyAGap={countyAGap}
                countyBGap={countyBGap}
              />
            </div>
          </div>
        </div>
      </div>

      {sameCounty ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
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

          <section className="grid gap-4 sm:grid-cols-2">
            <PriorityReasonCard title={selectedA} priority={countyAPriority} />
            <PriorityReasonCard title={selectedB} priority={countyBPriority} />
          </section>

          <CountyInsightBrief
            selectedA={selectedA}
            selectedB={selectedB}
            countyADensity={countyADensity}
            countyBDensity={countyBDensity}
            countyAGap={countyAGap}
            countyBGap={countyBGap}
          />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-950 sm:text-lg">
                Comparison Metrics
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Highlighted values show the higher value for that metric.
                Ownership mix is shown as descriptive context and is not
                highlighted.
              </p>
            </div>

            <div className="space-y-5 p-4 md:hidden">
              {metricGroups.map((group) => (
                <section key={group.title} className="space-y-3">
                  <h4 className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                    {group.title}
                  </h4>

                  <div className="grid gap-3">
                    {group.rows.map((row) => (
                      <MobileMetricCard
                        key={`${group.title}-${row.label}`}
                        row={row}
                        selectedA={selectedA}
                        selectedB={selectedB}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                    <Fragment key={group.title}>
                      <tr>
                        <td
                          colSpan={3}
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
                    </Fragment>
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