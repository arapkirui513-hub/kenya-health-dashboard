import { useEffect, useMemo, useState } from "react"
import axios from "axios"

const formatScore = (value) => Number(value || 0).toFixed(2)

const getLevelStyles = (level) => {
  if (level === "High Health Need") {
    return "bg-rose-50 text-rose-700 ring-rose-200"
  }

  if (level === "Moderate Health Need") {
    return "bg-amber-50 text-amber-700 ring-amber-200"
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-200"
}

const getScoreBarWidth = (score) => {
  const value = Number(score || 0)
  return `${Math.min(Math.max(value, 0), 100)}%`
}

function HealthNeedIndexSection({ apiBase }) {
  const [healthNeedIndex, setHealthNeedIndex] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios
      .get(`${apiBase}/health-need-index`)
      .then((response) => {
        setHealthNeedIndex(response.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load the Health Need Index.")
        setLoading(false)
      })
  }, [apiBase])

  const summary = useMemo(() => {
    if (!healthNeedIndex.length) {
      return {
        topCounty: null,
        averageScore: 0,
        highCount: 0,
        moderateCount: 0,
        lowerCount: 0,
      }
    }

    const totalScore = healthNeedIndex.reduce(
      (sum, county) => sum + Number(county.health_need_score || 0),
      0
    )

    return {
      topCounty: healthNeedIndex[0],
      averageScore: totalScore / healthNeedIndex.length,
      highCount: healthNeedIndex.filter(
        (county) => county.health_need_level === "High Health Need"
      ).length,
      moderateCount: healthNeedIndex.filter(
        (county) => county.health_need_level === "Moderate Health Need"
      ).length,
      lowerCount: healthNeedIndex.filter(
        (county) => county.health_need_level === "Lower Health Need"
      ).length,
    }
  }, [healthNeedIndex])

  const topCounties = healthNeedIndex.slice(0, 10)

  if (loading) {
    return (
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm font-medium text-slate-500">
          Loading Health Need Index...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm font-medium text-rose-700">{error}</p>
      </section>
    )
  }

  return (
    <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            KDHS 2022 Health Need
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
            Health Need Index
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This index ranks counties using KDHS 2022 reproductive health,
            maternal care, and child immunization indicators. Higher scores
            indicate greater health need.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-wide text-slate-300">
            Highest need county
          </p>
          <p className="mt-1 text-lg font-bold">
            {summary.topCounty?.county || "N/A"}
          </p>
          <p className="text-sm text-slate-300">
            Score {formatScore(summary.topCounty?.health_need_score)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Average score</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {formatScore(summary.averageScore)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across 47 counties</p>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">High need</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">
            {summary.highCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Score 60-100</p>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Moderate need</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.moderateCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Score 35-59</p>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Lower need</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {summary.lowerCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Score 0-34</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-900">
          Formula summary
        </p>
        <p className="mt-2 text-sm leading-6 text-emerald-900">
          Health Need Index = Teenage Pregnancy Risk 15% + Family Planning Need
          Risk 25% + Maternal Care Gap Risk 40% + Child Immunization Gap Risk
          20%.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-base font-bold text-slate-950">
            Top 10 health-need counties
          </h4>
          <p className="text-xs text-slate-500">Sorted by score descending</p>
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-2xl border sm:block">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Key flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {topCounties.map((county, index) => (
                <tr key={county.county}>
                  <td className="px-4 py-3 font-semibold text-slate-500">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-950">
                    {county.county}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-36 items-center gap-3">
                      <span className="w-12 font-semibold text-slate-950">
                        {formatScore(county.health_need_score)}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-emerald-600"
                          style={{
                            width: getScoreBarWidth(county.health_need_score),
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLevelStyles(
                        county.health_need_level
                      )}`}
                    >
                      {county.health_need_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {county.reason_flags?.length
                      ? county.reason_flags.slice(0, 2).join(", ")
                      : "No major flags"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 sm:hidden">
          {topCounties.map((county, index) => (
            <div key={county.county} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    #{index + 1}
                  </p>
                  <p className="text-base font-bold text-slate-950">
                    {county.county}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLevelStyles(
                    county.health_need_level
                  )}`}
                >
                  {county.health_need_level}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-950">
                Score {formatScore(county.health_need_score)}
              </p>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: getScoreBarWidth(county.health_need_score) }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {county.reason_flags?.length
                  ? county.reason_flags.slice(0, 3).join(", ")
                  : "No major flags"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HealthNeedIndexSection