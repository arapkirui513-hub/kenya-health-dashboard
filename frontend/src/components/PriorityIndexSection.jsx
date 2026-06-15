import { useEffect, useMemo, useState } from "react"
import axios from "axios"

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A"
  }

  return Number(value).toFixed(1)
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A"
  }

  return Number(value).toLocaleString()
}

function getPriorityBadgeClass(level) {
  if (level === "High") {
    return "border-red-200 bg-red-50 text-red-700"
  }

  if (level === "Medium") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function PrioritySummaryCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
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

function PriorityIndexSection({ apiBase }) {
  const [priorityIndex, setPriorityIndex] = useState([])
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
        setError("Could not load the County Planning Priority Index.")
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
      topPriorityCounties: priorityIndex.slice(0, 10),
    }
  }, [priorityIndex])

  if (loading) {
    return (
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm font-semibold text-slate-700">
          Loading County Planning Priority Index...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm font-semibold text-red-700">{error}</p>
      </section>
    )
  }

  return (
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

        <div className="rounded-2xl border bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Highest priority county
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {summary.highestPriorityCounty?.county || "N/A"}
          </p>
          <p className="text-sm text-slate-500">
            Score: {formatScore(summary.highestPriorityCounty?.priority_score)}
          </p>
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
        <h3 className="text-lg font-bold text-slate-950">
          Top 10 planning priority counties
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Sorted from highest to lowest priority score.
        </p>

        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
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
              {summary.topPriorityCounties.map((county) => {
                const flags = Array.isArray(county.reason_flags)
                  ? county.reason_flags.slice(0, 3)
                  : []

                return (
                  <tr key={county.county} className="border-b last:border-0">
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
                      {formatScore(county.component_scores?.population_pressure)}
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
                          <span className="text-xs text-slate-400">
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
          {summary.topPriorityCounties.map((county) => {
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
                    <p className="font-bold text-slate-950">{county.county}</p>
                    <p className="text-sm text-slate-500">
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
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Access
                    </p>
                    <p className="font-bold text-slate-900">
                      {formatScore(county.component_scores?.access_risk)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Service
                    </p>
                    <p className="font-bold text-slate-900">
                      {formatScore(county.component_scores?.service_risk)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {flags.map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-slate-900">Access Risk</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Measures facility density, public facility density, and ART facility
            density per 100,000 people.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-slate-900">Service Risk</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Converts service coverage into risk, so lower coverage increases the
            planning priority score.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-slate-900">Ownership Risk</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Flags strong dependence on one ownership segment, including public,
            private, faith-based, or NGO providers.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-slate-900">
            Population Pressure
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Uses population size and population density percentiles across all
            47 counties.
          </p>
        </div>
      </div>
    </section>
  )
}

export default PriorityIndexSection
