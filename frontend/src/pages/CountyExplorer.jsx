import { useEffect, useState } from "react"
import CountyComparisonTool from "../components/CountyComparisonTool"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://kenya-health-dashboard-api.onrender.com"

export default function CountyExplorer() {
  const [data, setData] = useState({
    accessDensity: [],
    counties: [],
    serviceGap: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCountyExplorerData() {
      try {
        setLoading(true)
        setError(null)

        const [accessRes, countiesRes, serviceGapRes] = await Promise.all([
          fetch(`${API_BASE_URL}/access-density`),
          fetch(`${API_BASE_URL}/counties`),
          fetch(`${API_BASE_URL}/service-gap-score`),
        ])

        if (!accessRes.ok) {
          throw new Error("Failed to load access-density data")
        }

        if (!countiesRes.ok) {
          throw new Error("Failed to load county ownership data")
        }

        if (!serviceGapRes.ok) {
          throw new Error("Failed to load service coverage data")
        }

        const [accessDensity, counties, serviceGap] = await Promise.all([
          accessRes.json(),
          countiesRes.json(),
          serviceGapRes.json(),
        ])

        if (
          !Array.isArray(accessDensity) ||
          !Array.isArray(counties) ||
          !Array.isArray(serviceGap)
        ) {
          throw new Error("One or more API responses did not return an array")
        }

        if (isMounted) {
          setData({
            accessDensity,
            counties,
            serviceGap,
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load County Explorer data")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCountyExplorerData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            County-Level Planning
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            County Explorer
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Compare two Kenyan counties side by side using population-adjusted
            facility access, ownership mix, and service coverage indicators.
          </p>
        </section>

        {loading && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Loading county comparison data...
            </p>
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </section>
        )}

        {!loading && !error && (
          <CountyComparisonTool
            accessDensity={data.accessDensity}
            counties={data.counties}
            serviceGap={data.serviceGap}
          />
        )}
      </div>
    </main>
  )
}