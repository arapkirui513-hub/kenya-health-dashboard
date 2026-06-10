import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"

const COLORS = ["#047857", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#064e3b"]

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [ownership, setOwnership] = useState([])
  const [facilityTypes, setFacilityTypes] = useState([])
  const [counties, setCounties] = useState([])
  const [services, setServices] = useState([])
  const [facilities, setFacilities] = useState([])
  const [facilityTotal, setFacilityTotal] = useState(0)

  const [search, setSearch] = useState("")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedOwnership, setSelectedOwnership] = useState("")
  const [selectedFacilityType, setSelectedFacilityType] = useState("")

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [facilityLoading, setFacilityLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/summary`),
      axios.get(`${API_BASE}/ownership`),
      axios.get(`${API_BASE}/facility-types`),
      axios.get(`${API_BASE}/counties`),
      axios.get(`${API_BASE}/services`),
    ])
      .then(
        ([
          summaryResponse,
          ownershipResponse,
          facilityTypesResponse,
          countiesResponse,
          servicesResponse,
        ]) => {
          setSummary(summaryResponse.data)
          setOwnership(ownershipResponse.data)
          setFacilityTypes(facilityTypesResponse.data)
          setCounties(countiesResponse.data)
          setServices(servicesResponse.data)
          setLoading(false)
        }
      )
      .catch(() => {
        setError("Could not load dashboard data. Make sure the backend is running.")
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setFacilityLoading(true)

    const params = {
      page,
      page_size: pageSize,
    }

    if (search) params.search = search
    if (selectedCounty) params.county = selectedCounty
    if (selectedOwnership) params.ownership = selectedOwnership
    if (selectedFacilityType) params.facility_type = selectedFacilityType

    axios
      .get(`${API_BASE}/facilities`, { params })
      .then((response) => {
        setFacilities(response.data.results)
        setFacilityTotal(response.data.total)
        setFacilityLoading(false)
      })
      .catch(() => {
        setFacilityLoading(false)
      })
  }, [search, selectedCounty, selectedOwnership, selectedFacilityType, page, pageSize])

  const topCounties = counties.slice(0, 10)
  const bottomCounties = counties.slice(-5).reverse()

  const nationalServices = services.reduce(
    (totals, county) => {
      totals.fp += county.fp
      totals.ipd += county.ipd
      totals.hbc += county.hbc
      totals.c_imci += county.c_imci
      totals.art += county.art
      return totals
    },
    { fp: 0, ipd: 0, hbc: 0, c_imci: 0, art: 0 }
  )

  const serviceChartData = [
    { service: "Family Planning", count: nationalServices.fp },
    { service: "Inpatient Care", count: nationalServices.ipd },
    { service: "Home-Based Care", count: nationalServices.hbc },
    { service: "C-IMCI", count: nationalServices.c_imci },
    { service: "ART", count: nationalServices.art },
  ]

  const lowestArtCoverage = [...services]
    .map((county) => ({
      county: county.county,
      total: county.total,
      art: county.art,
      coverage: county.total > 0 ? (county.art / county.total) * 100 : 0,
    }))
    .sort((a, b) => a.coverage - b.coverage)
    .slice(0, 5)

  const totalPages = Math.ceil(facilityTotal / pageSize)
  const startResult = facilityTotal === 0 ? 0 : (page - 1) * pageSize + 1
  const endResult = Math.min(page * pageSize, facilityTotal)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Kenya Health Facilities Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Explore facility distribution, ownership, and service availability across Kenya.
      </p>
    </div>

    <Link
      to="/map"
      className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
    >
      County Map
    </Link>
  </div>
</header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-slate-600">Loading dashboard data...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {summary && (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900">
                National Overview
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Key summary statistics from the cleaned Kenya health facilities dataset.
              </p>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Facilities"
                value={summary.total_facilities}
                description="Cleaned facility records"
              />

              <MetricCard
                title="Counties Covered"
                value={summary.counties_covered}
                description="Kenya counties represented"
              />

              <MetricCard
                title="Provinces Covered"
                value={summary.provinces_covered}
                description="Historical province grouping"
              />

              <MetricCard
                title="Facility Categories"
                value={summary.facility_types}
                description="Broad facility type groups"
              />
            </section>

            <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                About this dashboard
              </h3>
              <p className="mt-3 text-slate-600">
                This dashboard analyses cleaned Kenya health facilities data to help identify
                healthcare access patterns and possible service gaps. It focuses on facility
                distribution, ownership, facility categories, and selected service availability
                across counties.
              </p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Ownership Breakdown
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Number of health facilities by ownership category.
                </p>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ownership}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {ownership.map((entry, index) => (
                          <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Insight
                </h3>
                <p className="mt-4 text-slate-600">
                  Public and private facilities make up the largest share of Kenya’s health
                  facility network.
                </p>

                <div className="mt-6 space-y-3">
                  {ownership.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between border-b pb-2 text-sm"
                    >
                      <span className="font-medium text-slate-700">
                        {item.category}
                      </span>
                      <span className="font-semibold text-health-700">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Facility Categories
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Distribution of health facilities by broad facility category.
              </p>

              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={facilityTypes}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={130} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Top 10 Counties by Number of Facilities
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Counties with the highest number of recorded health facilities.
                </p>

                <div className="mt-6 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCounties}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="county" type="category" width={110} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#059669" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Counties with Fewest Facilities
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Counties with the lowest number of recorded health facilities.
                </p>

                <div className="mt-6 space-y-3">
                  {bottomCounties.map((county) => (
                    <div
                      key={county.county}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {county.county}
                        </p>
                        <p className="text-sm text-slate-500">
                          {county.province} Province
                        </p>
                      </div>
                      <p className="text-xl font-bold text-health-700">
                        {county.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Service Availability
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Number of facilities offering selected key health services nationally.
                </p>

                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={serviceChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 90, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="service" type="category" width={140} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#047857" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Possible ART Service Gaps
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Counties with the lowest ART availability as a share of facilities.
                </p>

                <div className="mt-6 space-y-3">
                  {lowestArtCoverage.map((county) => (
                    <div
                      key={county.county}
                      className="rounded-lg border bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800">
                          {county.county}
                        </p>
                        <p className="font-bold text-health-700">
                          {county.coverage.toFixed(1)}%
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {county.art} ART facilities out of {county.total} total facilities
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Key Findings
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <FindingCard
                  title="Facility concentration"
                  text="Nairobi has the highest number of recorded health facilities, while Lamu has the fewest."
                />

                <FindingCard
                  title="Most common facility type"
                  text="Dispensaries are the most common broad facility category in the cleaned dataset."
                />

                <FindingCard
                  title="Ownership pattern"
                  text="Public facilities form the largest ownership category, followed closely by private facilities."
                />

                <FindingCard
                  title="Service availability"
                  text="Family Planning and Inpatient Care are among the most available selected services nationally."
                />

                <FindingCard
                  title="Potential service gaps"
                  text="Some counties show low ART service availability compared with their total number of facilities."
                />

                <FindingCard
                  title="Planning opportunity"
                  text="County-level comparisons can help planners identify where facility distribution and service coverage may need closer review."
                />
              </div>
            </section>

            <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Facility Finder
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter individual health facilities by county, ownership,
                category, and name.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search facility name..."
                  className="rounded-lg border px-3 py-2 text-sm"
                />

                <select
                  value={selectedCounty}
                  onChange={(event) => {
                    setSelectedCounty(event.target.value)
                    setPage(1)
                  }}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">All counties</option>
                  {counties.map((county) => (
                    <option key={county.county} value={county.county}>
                      {county.county}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedOwnership}
                  onChange={(event) => {
                    setSelectedOwnership(event.target.value)
                    setPage(1)
                  }}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">All ownership</option>
                  {ownership.map((item) => (
                    <option key={item.category} value={item.category}>
                      {item.category}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedFacilityType}
                  onChange={(event) => {
                    setSelectedFacilityType(event.target.value)
                    setPage(1)
                  }}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">All facility categories</option>
                  {facilityTypes.map((item) => (
                    <option key={item.category} value={item.category}>
                      {item.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {startResult.toLocaleString()}–{endResult.toLocaleString()} of{" "}
                  {facilityTotal.toLocaleString()} matching facilities.
                </p>

                <button
                  onClick={() => {
                    setSearch("")
                    setSelectedCounty("")
                    setSelectedOwnership("")
                    setSelectedFacilityType("")
                    setPage(1)
                  }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear filters
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-slate-600">
                      <th className="px-4 py-3">Facility Name</th>
                      <th className="px-4 py-3">County</th>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Ownership</th>
                      <th className="px-4 py-3">Beds</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {facilityLoading ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-slate-500">
                          Loading facilities...
                        </td>
                      </tr>
                    ) : facilities.length > 0 ? (
                      facilities.map((facility) => (
                        <tr
                          key={facility.facility_code}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {facility.facility_name}
                          </td>
                          <td className="px-4 py-3">{facility.county}</td>
                          <td className="px-4 py-3">{facility.district}</td>
                          <td className="px-4 py-3">{facility.facility_category}</td>
                          <td className="px-4 py-3">{facility.ownership_category}</td>
                          <td className="px-4 py-3">{facility.beds}</td>
                          <td className="px-4 py-3">{facility.operational_status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-slate-500">
                          No facilities found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages || 1}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                    disabled={page === 1}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setPage((currentPage) => Math.min(currentPage + 1, totalPages || 1))
                    }
                    disabled={page >= totalPages}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function MetricCard({ title, value, description }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-health-700">
        {Number(value).toLocaleString()}
      </p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function FindingCard({ title, text }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

export default Dashboard
