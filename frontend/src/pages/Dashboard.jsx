import { lazy, Suspense, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { API_BASE } from "../config/api"
import LazySection from "../components/LazySection"
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

const AccessDensitySection = lazy(() =>
  import("../components/AccessDensitySection")
)

const NeedAccessGapSection = lazy(() =>
  import("../components/NeedAccessGapSection")
)

const PriorityIndexSection = lazy(() =>
  import("../components/PriorityIndexSection")
)

const HealthNeedIndexSection = lazy(() =>
  import("../components/HealthNeedIndexSection")
)

const MarketDynamicsSection = lazy(() =>
  import("../components/MarketDynamicsSection")
)

const COLORS = [
  "#047857",
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#064e3b",
]

const formatNumber = (value) => Number(value || 0).toLocaleString()

const getMaxValue = (items, key) => {
  const values = items.map((item) => Number(item[key])).filter(Number.isFinite)
  return Math.max(...values, 1)
}

function SectionFallback({ label = "Loading section..." }) {
  return (
    <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:mt-8">
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
  )
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [ownership, setOwnership] = useState([])
  const [facilityTypes, setFacilityTypes] = useState([])
  const [counties, setCounties] = useState([])
  const [services, setServices] = useState([])
  const [serviceGapScores, setServiceGapScores] = useState([])
  const [facilities, setFacilities] = useState([])
  const [facilityTotal, setFacilityTotal] = useState(0)

  const [search, setSearch] = useState("")
  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedOwnership, setSelectedOwnership] = useState("")
  const [selectedFacilityType, setSelectedFacilityType] = useState("")

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const [loading, setLoading] = useState(true)
  const [facilityLoading, setFacilityLoading] = useState(true)
  const [facilityFinderVisible, setFacilityFinderVisible] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/summary`),
      axios.get(`${API_BASE}/ownership`),
      axios.get(`${API_BASE}/facility-types`),
      axios.get(`${API_BASE}/counties`),
      axios.get(`${API_BASE}/services`),
      axios.get(`${API_BASE}/service-gap-score`),
    ])
      .then(
        ([
          summaryResponse,
          ownershipResponse,
          facilityTypesResponse,
          countiesResponse,
          servicesResponse,
          serviceGapResponse,
        ]) => {
          setSummary(summaryResponse.data)
          setOwnership(ownershipResponse.data)
          setFacilityTypes(facilityTypesResponse.data)
          setCounties(countiesResponse.data)
          setServices(servicesResponse.data)
          setServiceGapScores(serviceGapResponse.data)
          setLoading(false)
        }
      )
      .catch(() => {
        setError(
          "Could not load dashboard data. The backend may still be waking up. Please refresh or try again in a moment."
        )
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!facilityFinderVisible) {
      return undefined
    }

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

    return undefined
  }, [
    facilityFinderVisible,
    search,
    selectedCounty,
    selectedOwnership,
    selectedFacilityType,
    page,
    pageSize,
  ])

  const topCounties = counties.slice(0, 10)
  const bottomCounties = counties.slice(-5).reverse()
  const lowestServiceCoverage = serviceGapScores.slice(0, 10)

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

  const handleExport = () => {
    const params = new URLSearchParams()

    if (search) params.append("search", search)
    if (selectedCounty) params.append("county", selectedCounty)
    if (selectedOwnership) params.append("ownership", selectedOwnership)
    if (selectedFacilityType) {
      params.append("facility_type", selectedFacilityType)
    }

    const url = `${API_BASE}/facilities/export?${params.toString()}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-3xl">
              Kenya Health Facilities Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:text-sm lg:leading-6">
              Explore facility distribution, ownership, and service availability
              across Kenya.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Link
              to="/map"
              className="flex min-h-12 items-center justify-center rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-auto"
            >
              County Map
            </Link>

            <Link
              to="/county-explorer"
              className="flex min-h-12 items-center justify-center rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 sm:w-auto"
            >
              County Explorer
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {loading && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-slate-600">
              Loading dashboard data. This may take a moment if the backend is
              waking up.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {summary && (
          <>
            <section className="mb-6 sm:mb-8">
              <h2 className="text-2xl font-bold text-slate-950 sm:text-xl">
                National Overview
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-600 sm:text-sm sm:leading-6">
                Key summary statistics from the cleaned Kenya health facilities
                dataset.
              </p>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Facilities"
                value={summary.total_facilities}
                description="Cleaned records"
              />

              <MetricCard
                title="Counties Covered"
                value={summary.counties_covered}
                description="Kenya counties"
              />

              <MetricCard
                title="Provinces Covered"
                value={summary.provinces_covered}
                description="Historical groups"
              />

              <MetricCard
                title="Facility Categories"
                value={summary.facility_types}
                description="Type groups"
              />
            </section>

            <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
              <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
                About this dashboard
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                This dashboard analyses cleaned Kenya health facilities data to
                identify healthcare access patterns, ownership patterns, and
                selected service gaps across counties.
              </p>
            </section>

            <section className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
                  Ownership Breakdown
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Number of health facilities by ownership category.
                </p>

                <MobileBarList
                  items={ownership}
                  labelKey="category"
                  valueKey="count"
                  formatter={formatNumber}
                />

                <div className="mt-6 hidden h-80 md:block">
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
                          <Cell
                            key={entry.category}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
                <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
                  Quick Insight
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Public and private facilities make up the largest share of
                  Kenya's health facility network.
                </p>

                <div className="mt-5 space-y-3">
                  {ownership.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-slate-700">
                        {item.category}
                      </span>
                      <span className="font-bold text-health-700">
                        {formatNumber(item.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <ChartSection
              title="Facility Categories"
              description="Distribution of health facilities by broad facility category."
            >
              <MobileBarList
                items={facilityTypes}
                labelKey="category"
                valueKey="count"
                formatter={formatNumber}
              />

              <div className="mt-6 hidden h-80 md:block">
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
            </ChartSection>

            <section className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-2">
              <ChartCard
                title="Top 10 Counties by Number of Facilities"
                description="Counties with the highest number of recorded health facilities."
              >
                <MobileBarList
                  items={topCounties}
                  labelKey="county"
                  valueKey="total"
                  formatter={formatNumber}
                />

                <div className="mt-6 hidden h-96 md:block">
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
              </ChartCard>

              <ChartCard
                title="Counties with Fewest Facilities"
                description="Counties with the lowest number of recorded health facilities."
              >
                <div className="mt-5 space-y-3">
                  {bottomCounties.map((county) => (
                    <div
                      key={county.county}
                      className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {county.county}
                        </p>
                        <p className="text-sm text-slate-500">
                          {county.province} Province
                        </p>
                      </div>
                      <p className="text-xl font-bold text-health-700">
                        {formatNumber(county.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </section>

            <section className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-2">
              <ChartCard
                title="Service Availability"
                description="Number of facilities offering selected key health services nationally."
              >
                <MobileBarList
                  items={serviceChartData}
                  labelKey="service"
                  valueKey="count"
                  formatter={formatNumber}
                />

                <div className="mt-6 hidden h-80 md:block">
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
              </ChartCard>

              <ChartCard
                title="Possible ART Service Gaps"
                description="Counties with the lowest ART availability as a share of facilities."
              >
                <div className="mt-5 space-y-3">
                  {lowestArtCoverage.map((county) => (
                    <div
                      key={county.county}
                      className="rounded-xl border bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-800">
                          {county.county}
                        </p>
                        <p className="font-bold text-health-700">
                          {county.coverage.toFixed(1)}%
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {county.art} ART facilities out of {county.total} total
                        facilities
                      </p>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </section>

            <ChartSection
              title="Lowest Service Coverage Scores"
              description="Average percentage of facilities offering FP, IPD, HBC, C-IMCI and ART. Lower scores may indicate broader service availability gaps."
            >
              <MobileBarList
                items={lowestServiceCoverage}
                labelKey="county"
                valueKey="coverage_score"
                formatter={(value) => `${Number(value || 0).toFixed(1)}%`}
              />

              <div className="mt-6 hidden h-96 md:block">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={lowestServiceCoverage}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="county" type="category" width={130} />
                    <Tooltip />
                    <Bar dataKey="coverage_score" fill="#047857" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartSection>

            <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
              <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
                Key Findings
              </h3>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
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
                  title="Multi-service coverage gaps"
                  text="The service coverage score highlights counties where selected services are less widely available across existing facilities."
                />

                <FindingCard
                  title="Planning opportunity"
                  text="County-level comparisons can help planners identify where facility distribution and service coverage may need closer review."
                />
              </div>
            </section>

            <LazySection minHeight="360px">
              <Suspense
                fallback={
                  <SectionFallback label="Loading population-adjusted access..." />
                }
              >
                <AccessDensitySection apiBase={API_BASE} />
              </Suspense>
            </LazySection>

            <LazySection minHeight="360px">
              <Suspense
                fallback={
                  <SectionFallback label="Loading need-access gap index..." />
                }
              >
                <NeedAccessGapSection />
              </Suspense>
            </LazySection>

            <LazySection minHeight="360px">
              <Suspense
                fallback={
                  <SectionFallback label="Loading planning priority index..." />
                }
              >
                <PriorityIndexSection apiBase={API_BASE} />
              </Suspense>
            </LazySection>

            <LazySection minHeight="360px">
              <Suspense
                fallback={<SectionFallback label="Loading health need index..." />}
              >
                <HealthNeedIndexSection apiBase={API_BASE} />
              </Suspense>
            </LazySection>

            <LazySection minHeight="360px">
              <Suspense
                fallback={
                  <SectionFallback label="Loading ownership and market dynamics..." />
                }
              >
                <MarketDynamicsSection />
              </Suspense>
            </LazySection>

            <LazySection
              minHeight="420px"
              onVisible={() => setFacilityFinderVisible(true)}
            >
              <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
                <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
                  Facility Finder
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Search and filter individual health facilities by county,
                  ownership, category, and name.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div>
                    <label htmlFor="facility-search" className="sr-only">
                      Search facility name
                    </label>
                    <input
                      id="facility-search"
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                      }}
                      placeholder="Search facility name..."
                      className="min-h-12 w-full rounded-2xl border px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="county-filter" className="sr-only">
                      Filter by county
                    </label>
                    <select
                      id="county-filter"
                      aria-label="Filter by county"
                      value={selectedCounty}
                      onChange={(event) => {
                        setSelectedCounty(event.target.value)
                        setPage(1)
                      }}
                      className="min-h-12 w-full rounded-2xl border px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:text-sm"
                    >
                      <option value="">All counties</option>
                      {counties.map((county) => (
                        <option key={county.county} value={county.county}>
                          {county.county}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ownership-filter" className="sr-only">
                      Filter by ownership
                    </label>
                    <select
                      id="ownership-filter"
                      aria-label="Filter by ownership"
                      value={selectedOwnership}
                      onChange={(event) => {
                        setSelectedOwnership(event.target.value)
                        setPage(1)
                      }}
                      className="min-h-12 w-full rounded-2xl border px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:text-sm"
                    >
                      <option value="">All ownership</option>
                      {ownership.map((item) => (
                        <option key={item.category} value={item.category}>
                          {item.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="facility-category-filter" className="sr-only">
                      Filter by facility category
                    </label>
                    <select
                      id="facility-category-filter"
                      aria-label="Filter by facility category"
                      value={selectedFacilityType}
                      onChange={(event) => {
                        setSelectedFacilityType(event.target.value)
                        setPage(1)
                      }}
                      className="min-h-12 w-full rounded-2xl border px-4 py-3 text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:text-sm"
                    >
                      <option value="">All facility categories</option>
                      {facilityTypes.map((item) => (
                        <option key={item.category} value={item.category}>
                          {item.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <p className="text-sm leading-6 text-slate-500">
                    Showing {startResult.toLocaleString()}-
                    {endResult.toLocaleString()} of{" "}
                    {facilityTotal.toLocaleString()} matching facilities.
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:flex">
                    <button
                      onClick={handleExport}
                      className="min-h-11 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      Export CSV
                    </button>

                    <button
                      onClick={() => {
                        setSearch("")
                        setSelectedCounty("")
                        setSelectedOwnership("")
                        setSelectedFacilityType("")
                        setPage(1)
                      }}
                      className="min-h-11 rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3 md:hidden">
                  {facilityLoading ? (
                    <div className="rounded-2xl border bg-slate-50 p-5 text-center text-sm text-slate-500">
                      Loading facilities...
                    </div>
                  ) : facilities.length > 0 ? (
                    facilities.map((facility) => (
                      <FacilityCard
                        key={facility.facility_code}
                        facility={facility}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border bg-slate-50 p-5 text-center text-sm text-slate-500">
                      No facilities found for the selected filters.
                    </div>
                  )}
                </div>

                <div className="mt-6 hidden overflow-x-auto md:block">
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
                          <td
                            colSpan="7"
                            className="px-4 py-6 text-center text-slate-500"
                          >
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
                            <td className="px-4 py-3">
                              {facility.facility_category}
                            </td>
                            <td className="px-4 py-3">
                              {facility.ownership_category}
                            </td>
                            <td className="px-4 py-3">{facility.beds}</td>
                            <td className="px-4 py-3">
                              {facility.operational_status}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-6 text-center text-slate-500"
                          >
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

                  <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
                    <button
                      onClick={() =>
                        setPage((currentPage) =>
                          Math.max(currentPage - 1, 1)
                        )
                      }
                      disabled={page === 1}
                      className="rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      onClick={() =>
                        setPage((currentPage) =>
                          Math.min(currentPage + 1, totalPages || 1)
                        )
                      }
                      disabled={page >= totalPages}
                      className="rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            </LazySection>
          </>
        )}
      </main>
    </div>
  )
}

function MetricCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-health-700 sm:mt-3 sm:text-3xl">
        {Number(value).toLocaleString()}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm">
        {description}
      </p>
    </div>
  )
}

function ChartSection({ title, description, children }) {
  return (
    <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
      <h3 className="text-xl font-bold text-slate-950 sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {children}
    </section>
  )
}

function ChartCard({ title, description, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-xl font-bold text-slate-950 sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      {children}
    </div>
  )
}

function MobileBarList({ items, labelKey, valueKey, formatter }) {
  const max = getMaxValue(items, valueKey)

  return (
    <div className="mt-5 space-y-3 md:hidden">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0
        const width = value > 0 ? `${Math.max((value / max) * 100, 8)}%` : "0%"

        return (
          <div
            key={item[labelKey]}
            className="rounded-2xl border bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                {item[labelKey]}
              </p>
              <p className="shrink-0 text-sm font-bold text-health-700">
                {formatter(value)}
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-700"
                style={{ width }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FacilityCard({ facility }) {
  return (
    <article className="rounded-2xl border bg-slate-50 p-4">
      <h4 className="font-bold leading-6 text-slate-900">
        {facility.facility_name}
      </h4>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            County
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {facility.county}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            District
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {facility.district}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {facility.facility_category}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ownership
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {facility.ownership_category}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Beds
          </dt>
          <dd className="mt-1 font-medium text-slate-800">{facility.beds}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </dt>
          <dd className="mt-1 font-medium text-slate-800">
            {facility.operational_status}
          </dd>
        </div>
      </dl>
    </article>
  )
}

function FindingCard({ title, text }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  )
}

export default Dashboard