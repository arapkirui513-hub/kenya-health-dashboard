import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import CountyComparisonTool from "../components/CountyComparisonTool"
import { API_BASE } from "../config/api"

export default function CountyExplorer() {
  const [accessDensity, setAccessDensity] = useState([])
  const [counties, setCounties] = useState([])
  const [serviceGap, setServiceGap] = useState([])
  const [priorityIndex, setPriorityIndex] = useState([])
  const [healthNeedIndex, setHealthNeedIndex] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCountyExplorerData = async () => {
      try {
        setLoading(true)
        setError("")

        const [
          accessResponse,
          countiesResponse,
          serviceGapResponse,
          priorityIndexResponse,
          healthNeedResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE}/access-density`),
          axios.get(`${API_BASE}/counties`),
          axios.get(`${API_BASE}/service-gap-score`),
          axios.get(`${API_BASE}/planning-priority-index`),
          axios.get(`${API_BASE}/county-health-needs`),
        ])

        setAccessDensity(accessResponse.data || [])
        setCounties(countiesResponse.data || [])
        setServiceGap(serviceGapResponse.data || [])
        setPriorityIndex(priorityIndexResponse.data || [])
        setHealthNeedIndex(healthNeedResponse.data || [])
      } catch (err) {
        console.error(err)
        setError("Unable to load county comparison data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCountyExplorerData()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                County-Level Planning
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">
                County Explorer
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Compare counties using access, ownership, geography, service
                coverage, planning priority, and KDHS health-need indicators.
              </p>
            </div>

            <Link
              to="/"
              className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-slate-600">
              Loading county comparison data...
            </p>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </section>
        ) : (
          <CountyComparisonTool
            accessDensity={accessDensity}
            counties={counties}
            serviceGap={serviceGap}
            priorityIndex={priorityIndex}
            healthNeedIndex={healthNeedIndex}
          />
        )}
      </div>
    </main>
  )
}
