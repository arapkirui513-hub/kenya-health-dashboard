import { useEffect, useMemo, useState } from "react"
import axios from "axios"

const PRIORITY_LEVEL_FILTERS = [
  { label: "All counties", value: "All" },
  { label: "High priority", value: "High" },
  { label: "Medium priority", value: "Medium" },
  { label: "Low priority", value: "Low" },
]

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A"
  }

  return Number(value).toFixed(1)
}

function getPriorityBadgeClass(level) {
  if (level === "High") {
    return "border-red-300 bg-red-50 text-red-800"
  }

  if (level === "Medium") {
    return "border-amber-300 bg-amber-50 text-amber-800"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-800"
}

function getFilterButtonClass(isSelected) {
  return isSelected
    ? "border-slate-950 bg-slate-950 text-white"
    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
}

function normalizeCounty(name = "") {
  return String(name)
    .toLowerCase()
    .replace(/\bcity\b/g, "")
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function getNationalRank(priorityIndex, countyName) {
  const rankIndex = priorityIndex.findIndex(
    (county) => normalizeCounty(county.county) === normalizeCounty(countyName)
  )

  return rankIndex >= 0 ? rankIndex + 1 : "N/A"
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = String(value)

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function PrioritySummaryCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{description}</p>
    </div>
  )
}

function ScoreBar({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="mt-2 h-2 rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-teal-600"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

function MethodologyModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="priority-methodology-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Methodology
            </p>
            <h3
              id="priority-methodology-title"
              className="mt-2 text-xl font-bold text-slate-950"
            >
              How the County Planning Priority Index works
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The index ranks Kenya&apos;s 47 counties by planning priority using
              access, service, ownership, and population-pressure signals. Higher
              scores indicate counties that should be reviewed earlier.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            aria-label="Close methodology modal"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-800">High priority</p>
            <p className="mt-1 text-sm text-red-800">70 to 100</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-800">Medium priority</p>
            <p className="mt-1 text-sm text-amber-800">40 to 69</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-800">Low priority</p>
            <p className="mt-1 text-sm text-emerald-800">Below 40</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">Access risk</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Measures facility availability relative to population. It uses
              total facility density, public facility density, and ART facility
              density per 100,000 people.
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">Service risk</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Converts selected service coverage into risk. Lower coverage
              increases the planning priority score.
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">Ownership risk</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Flags strong dependence on one ownership segment, including
              public, private, faith-based, or NGO providers.
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">
              Population pressure
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Uses population size and population density percentiles across all
              47 counties to highlight demand pressure.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <p className="text-sm font-bold text-teal-900">How to use the score</p>
          <p className="mt-2 text-sm leading-6 text-teal-900">
            Use the score as a planning signal, not as a final decision. Start
            with high-priority counties, then review the component scores and
            risk drivers to understand why a county ranks higher.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-950">Interpretation limits</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>The index does not replace local planning judgment.</li>
            <li>It does not measure facility quality, staffing, stock levels, or patient outcomes.</li>
            <li>It should be reviewed alongside local disease burden, budget, geography, and operational constraints.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function PriorityIndexSection({ apiBase }) {
  const [priorityIndex, setPriorityIndex] = useState([])
  const [selectedPriorityLevel, setSelectedPriorityLevel] = useState("Low")
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    setLoading(true)
    setError("")

    axios
      .get(`${apiBase}/planning-priority-index`)
      .then((response) => {
        if (!isMounted) return
        setPriorityIndex(Array.isArray(response.data) ? response.data : [])
        setLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        setError("Could not load the County Planning Priority Index. The backend may still be waking up. Please refresh or try again in a moment.")
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [apiBase])

  const summary = useMemo(() => {
    const high = priorityIndex.filter(
      (county) => county.priority_level === "High"
    ).length
    const medium = priorityIndex.filter(
      (county) => county.priority_level === "Medium"
    ).length
    const low = priorityIndex.filter(
      (county) => county.priority_level === "Low"
    ).length

    return {
      high,
      medium,
      low,
      highestPriorityCounty: priorityIndex[0],
    }
  }, [priorityIndex])

  const filteredPriorityIndex = useMemo(() => {
    if (selectedPriorityLevel === "All") {
      return priorityIndex
    }

    return priorityIndex.filter(
      (county) => county.priority_level === selectedPriorityLevel
    )
  }, [priorityIndex, selectedPriorityLevel])

  const activeFilter = PRIORITY_LEVEL_FILTERS.find(
    (filter) => filter.value === selectedPriorityLevel
  )

  const handleExportCsv = () => {
    const header = [
      "National Rank",
      "County",
      "Priority Score",
      "Priority Level",
      "Access Risk",
      "Service Risk",
      "Ownership Risk",
      "Population Pressure",
      "Risk Drivers",
    ]

    const rows = filteredPriorityIndex.map((county) => {
      const flags =
        Array.isArray(county.reason_flags) && county.reason_flags.length > 0
          ? county.reason_flags.join("; ")
          : "No major flags"

      return [
        getNationalRank(priorityIndex, county.county),
        county.county || "",
        formatScore(county.priority_score),
        county.priority_level || "",
        formatScore(county.component_scores?.access_risk),
        formatScore(county.component_scores?.service_risk),
        formatScore(county.component_scores?.ownership_risk),
        formatScore(county.component_scores?.population_pressure),
        flags,
      ]
    })

    const dateStamp = new Date().toISOString().slice(0, 10)
    const filterSlug =
      selectedPriorityLevel === "All"
        ? "all-counties"
        : `${selectedPriorityLevel.toLowerCase()}-priority`

    downloadCsv(`kenya-planning-priority-index-${filterSlug}-${dateStamp}.csv`, [
      header,
      ...rows,
    ])
  }

  if (loading) {
    return (
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm font-semibold text-slate-700">
          Loading County Planning Priority Index. This may take a moment if the backend is waking up.
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm font-semibold text-red-800">{error}</p>
      </section>
    )
  }

  return (
    <>
      <section className="mt-6 rounded-3xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              V3 planning layer
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-xl">
              County Planning Priority Index
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This index ranks counties by planning priority using access risk,
              service risk, ownership risk, and population pressure. Higher scores
              signal counties that planners should review first.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <div className="rounded-2xl border bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Highest priority county
              </p>
              <p className="mt-1 text-lg font-bold text-slate-950">
                {summary.highestPriorityCounty?.county || "N/A"}
              </p>
              <p className="text-sm text-slate-700">
                Score: {formatScore(summary.highestPriorityCounty?.priority_score)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsMethodologyOpen(true)}
              className="min-h-11 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              View Methodology
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredPriorityIndex.length === 0}
              className="min-h-11 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PrioritySummaryCard
            title="High priority"
            value={summary.high}
            description="Counties scoring 70 to 100"
          />
          <PrioritySummaryCard
            title="Medium priority"
            value={summary.medium}
            description="Counties scoring 40 to 69"
          />
          <PrioritySummaryCard
            title="Low priority"
            value={summary.low}
            description="Counties scoring below 40"
          />
          <PrioritySummaryCard
            title="Counties ranked"
            value={priorityIndex.length}
            description="All counties remain in the index"
          />
        </div>

        <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                {activeFilter?.label || "All counties"}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Showing {filteredPriorityIndex.length} of {priorityIndex.length}{" "}
                counties in the Planning Priority Index.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRIORITY_LEVEL_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedPriorityLevel(filter.value)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${getFilterButtonClass(
                    selectedPriorityLevel === filter.value
                  )}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredPriorityIndex.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed bg-white p-6 text-sm font-medium text-slate-700">
              No counties match this priority filter. Try All counties or another priority level.
            </div>
          ) : (
            <>
              <div className="mt-5 hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-slate-700">
                      <th className="px-3 py-3">Rank</th>
                      <th className="px-3 py-3">County</th>
                      <th className="px-3 py-3">Score</th>
                      <th className="px-3 py-3">Level</th>
                      <th className="px-3 py-3">Access</th>
                      <th className="px-3 py-3">Service</th>
                      <th className="px-3 py-3">Ownership</th>
                      <th className="px-3 py-3">Population</th>
                      <th className="px-3 py-3">Main signals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPriorityIndex.map((county) => {
                      const flags = Array.isArray(county.reason_flags)
                        ? county.reason_flags.slice(0, 3)
                        : []

                      return (
                        <tr key={county.county} className="border-b last:border-0">
                          <td className="px-3 py-4 font-semibold text-slate-700">
                            {getNationalRank(priorityIndex, county.county)}
                          </td>
                          <td className="px-3 py-4 font-semibold text-slate-900">
                            {county.county}
                          </td>
                          <td className="px-3 py-4">
                            <span className="font-bold text-slate-950">
                              {formatScore(county.priority_score)}
                            </span>
                            <ScoreBar value={county.priority_score} />
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(
                                county.priority_level
                              )}`}
                            >
                              {county.priority_level}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            {formatScore(county.component_scores?.access_risk)}
                          </td>
                          <td className="px-3 py-4">
                            {formatScore(county.component_scores?.service_risk)}
                          </td>
                          <td className="px-3 py-4">
                            {formatScore(county.component_scores?.ownership_risk)}
                          </td>
                          <td className="px-3 py-4">
                            {formatScore(
                              county.component_scores?.population_pressure
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-wrap gap-1">
                              {flags.length > 0 ? (
                                flags.map((flag) => (
                                  <span
                                    key={flag}
                                    className="rounded-full bg-white px-2 py-1 text-xs text-slate-600"
                                  >
                                    {flag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-700">
                                  No major flags
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 space-y-3 md:hidden">
                {filteredPriorityIndex.map((county) => {
                  const flags = Array.isArray(county.reason_flags)
                    ? county.reason_flags.slice(0, 3)
                    : []

                  return (
                    <div
                      key={county.county}
                      className="rounded-2xl border bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Rank {getNationalRank(priorityIndex, county.county)}
                          </p>
                          <p className="font-bold text-slate-950">
                            {county.county}
                          </p>
                          <p className="text-sm text-slate-700">
                            Priority score: {formatScore(county.priority_score)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(
                            county.priority_level
                          )}`}
                        >
                          {county.priority_level}
                        </span>
                      </div>

                      <ScoreBar value={county.priority_score} />

                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-700">
                            Access
                          </p>
                          <p className="font-bold text-slate-900">
                            {formatScore(county.component_scores?.access_risk)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-700">
                            Service
                          </p>
                          <p className="font-bold text-slate-900">
                            {formatScore(county.component_scores?.service_risk)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-700">
                            Ownership
                          </p>
                          <p className="font-bold text-slate-900">
                            {formatScore(county.component_scores?.ownership_risk)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-700">
                            Population
                          </p>
                          <p className="font-bold text-slate-900">
                            {formatScore(
                              county.component_scores?.population_pressure
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
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
                          <span className="text-xs text-slate-700">
                            No major flags
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-bold text-slate-900">Access Risk</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Measures facility density, public facility density, and ART facility
              density per 100,000 people.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-bold text-slate-900">Service Risk</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Converts service coverage into risk, so lower coverage increases the
              planning priority score.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-bold text-slate-900">Ownership Risk</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Flags strong dependence on one ownership segment, including public,
              private, faith-based, or NGO providers.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-bold text-slate-900">
              Population Pressure
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Uses population size and population density percentiles across all
              47 counties.
            </p>
          </div>
        </div>
      </section>

      {isMethodologyOpen ? (
        <MethodologyModal onClose={() => setIsMethodologyOpen(false)} />
      ) : null}
    </>
  )
}

export default PriorityIndexSection


