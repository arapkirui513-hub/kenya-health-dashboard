import { useEffect, useMemo, useState } from "react"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://kenya-health-dashboard-api.onrender.com"

function formatScore(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) return "0.0"

  return number.toFixed(1)
}

function normalizeScore(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) return 0

  return number <= 1 ? number * 100 : number
}

function normalizeGapLevel(level, score) {
  const text = String(level || "").toLowerCase()

  if (text.includes("high")) return "High"
  if (text.includes("moderate") || text.includes("medium")) return "Moderate"
  if (text.includes("low") || text.includes("lower")) return "Lower"

  const normalizedScore = normalizeScore(score)

  if (normalizedScore >= 70) return "High"
  if (normalizedScore >= 40) return "Moderate"

  return "Lower"
}

function getReasonFlags(row) {
  const flags =
    row.reason_flags ||
    row.reasonFlags ||
    row.flags ||
    row.reasons ||
    row.gap_reasons ||
    []

  if (Array.isArray(flags)) return flags.filter(Boolean)

  if (typeof flags === "string") {
    return flags
      .split(",")
      .map((flag) => flag.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeRows(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.data ||
      payload?.results ||
      payload?.counties ||
      payload?.items ||
      []

  return rows.map((row) => {
    const rawScore =
      row.gap_score ??
      row.need_access_gap_score ??
      row.need_access_score ??
      row.score ??
      0

    const score = normalizeScore(rawScore)
    const gapLevel = normalizeGapLevel(
      row.gap_level || row.concern_level || row.priority_level,
      score
    )

    return {
      county: row.county || row.county_name || row.name || "Unknown county",
      score,
      gapLevel,
      reasonFlags: getReasonFlags(row),
    }
  })
}

function badgeClass(level) {
  if (level === "High") {
    return "bg-red-100 text-red-700 border-red-200"
  }

  if (level === "Moderate") {
    return "bg-amber-100 text-amber-700 border-amber-200"
  }

  return "bg-emerald-100 text-emerald-700 border-emerald-200"
}

function countByLevel(rows, level) {
  return rows.filter((row) => row.gapLevel === level).length
}

export default function NeedAccessGapSection() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadNeedAccessGap() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_BASE_URL}/need-access-gap-index`)

        if (!response.ok) {
          throw new Error("Could not load need-access gap data. The backend may still be waking up. Please refresh or try again in a moment.")
        }

        const payload = await response.json()
        const normalizedRows = normalizeRows(payload)

        if (isMounted) {
          setRows(normalizedRows)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load need-access gap data. Please refresh or try again in a moment.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadNeedAccessGap()

    return () => {
      isMounted = false
    }
  }, [])

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => b.score - a.score)
  }, [rows])

  const topTenRows = sortedRows.slice(0, 10)
  const highestGapCounty = sortedRows[0]

  const averageGapScore = useMemo(() => {
    if (!rows.length) return 0

    const total = rows.reduce((sum, row) => sum + row.score, 0)

    return total / rows.length
  }, [rows])

  const highCount = countByLevel(rows, "High")
  const moderateCount = countByLevel(rows, "Moderate")
  const lowerCount = countByLevel(rows, "Lower")

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            V5 Planning Intelligence
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            Need vs Access Gap
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Counties are ranked by where population need appears high while
            healthcare access remains limited. Use this section to identify
            counties that may need closer planning attention.
          </p>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Loading need-access gap insights. This may take a moment if the backend is waking up.
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          No need-access gap records are available.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Highest gap concern
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {highestGapCounty?.county}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Score: {formatScore(highestGapCounty?.score)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average gap score
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatScore(averageGapScore)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Across {rows.length} counties
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                High concern
              </p>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {highCount}
              </p>
              <p className="mt-1 text-sm text-red-700">counties</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                Moderate / Lower
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-700">
                {moderateCount} / {lowerCount}
              </p>
              <p className="mt-1 text-sm text-amber-700">counties</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h3 className="font-semibold text-slate-900">
                Top 10 Need-Access Gap Counties
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Higher scores indicate stronger need-access mismatch.
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {topTenRows.map((row, index) => (
                <div
                  key={`${row.county}-${index}`}
                  className="grid gap-4 px-4 py-4 md:grid-cols-[48px_1fr_120px]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {row.county}
                      </h4>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                          row.gapLevel
                        )}`}
                      >
                        {row.gapLevel} gap
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Gap score</span>
                        <span>{formatScore(row.score)}</span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, row.score)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {row.reasonFlags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {row.reasonFlags.map((flag) => (
                          <span
                            key={`${row.county}-${flag}`}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-end">
                    <p className="text-xl font-bold text-slate-900">
                      {formatScore(row.score)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
