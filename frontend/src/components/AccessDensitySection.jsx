import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

function AccessDensitySection({ apiBase }) {
  const [accessDensity, setAccessDensity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios
      .get(`${apiBase}/access-density`)
      .then((response) => {
        setAccessDensity(response.data || [])
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load population-adjusted access data. The backend may still be waking up. Please refresh or try again in a moment.")
        setLoading(false)
      })
  }, [apiBase])

  const formatRate = (value) => Number(value || 0).toFixed(1)

  const calculateRate = (count, population) => {
    if (!population) return 0
    return (count / population) * 100000
  }

  const nationalMetrics = useMemo(() => {
    if (!accessDensity.length) {
      return {
        totalPopulation: 0,
        facilitiesPer100k: 0,
        publicPer100k: 0,
        artPer100k: 0,
      }
    }

    const totals = accessDensity.reduce(
      (acc, county) => {
        const population = Number(county.population_2019 || 0)
        const totalFacilities = Number(county.total_facilities || 0)

        const publicFacilities =
          county.public_facilities !== undefined
            ? Number(county.public_facilities || 0)
            : (Number(county.public_facilities_per_100k_population || 0) /
                100000) *
              population

        const artFacilities =
          county.art_facilities !== undefined
            ? Number(county.art_facilities || 0)
            : (Number(county.art_facilities_per_100k_population || 0) /
                100000) *
              population

        acc.totalFacilities += totalFacilities
        acc.publicFacilities += publicFacilities
        acc.artFacilities += artFacilities
        acc.population += population

        return acc
      },
      {
        totalFacilities: 0,
        publicFacilities: 0,
        artFacilities: 0,
        population: 0,
      }
    )

    return {
      totalPopulation: totals.population,
      facilitiesPer100k: calculateRate(
        totals.totalFacilities,
        totals.population
      ),
      publicPer100k: calculateRate(totals.publicFacilities, totals.population),
      artPer100k: calculateRate(totals.artFacilities, totals.population),
    }
  }, [accessDensity])

  const lowestFacilityDensity = [...accessDensity]
    .sort(
      (a, b) =>
        a.facilities_per_100k_population - b.facilities_per_100k_population
    )
    .slice(0, 10)

  const lowestPublicDensity = [...accessDensity]
    .sort(
      (a, b) =>
        a.public_facilities_per_100k_population -
        b.public_facilities_per_100k_population
    )
    .slice(0, 5)

  const lowestArtDensity = [...accessDensity]
    .sort(
      (a, b) =>
        a.art_facilities_per_100k_population -
        b.art_facilities_per_100k_population
    )
    .slice(0, 5)

  if (loading) {
    return (
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm text-slate-500">
          Loading population-adjusted access data. This may take a moment if the backend is waking up.
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    )
  }

  return (
    <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-health-700 sm:text-sm">
            Version 2 Access Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Population-Adjusted Access
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Compare facility availability against county population size to
            identify lower-access counties.
          </p>
        </div>

        <div className="rounded-2xl bg-health-50 px-4 py-3 text-sm font-medium text-health-800">
          {accessDensity.length} counties matched with 2019 population data
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <AccessMetricCard
          title="National facility density"
          value={formatRate(nationalMetrics.facilitiesPer100k)}
          suffix="per 100k"
          description="All facilities"
        />

        <AccessMetricCard
          title="Public facility density"
          value={formatRate(nationalMetrics.publicPer100k)}
          suffix="per 100k"
          description="Public facilities"
        />

        <AccessMetricCard
          title="ART facility density"
          value={formatRate(nationalMetrics.artPer100k)}
          suffix="per 100k"
          description="ART facilities"
        />

        <AccessMetricCard
          title="Population covered"
          value={nationalMetrics.totalPopulation.toLocaleString()}
          suffix=""
          description="2019 census"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-health-100 bg-health-50 p-4">
        <h3 className="text-sm font-semibold text-health-900">
          How to read these numbers
        </h3>

        <p className="mt-2 text-sm leading-6 text-health-800">
          These values are not percentages. They show how many facilities are
          available for every 100,000 people.
        </p>

        <p className="mt-2 text-sm leading-6 text-health-800">
          Formula: facility density = facilities / population * 100,000.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-2">
        <div className="rounded-2xl border p-4 sm:p-5">
          <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
            Lowest Facility Density Counties
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Counties with the fewest facilities per 100,000 people.
          </p>

          <MobileDensityBarList
            rows={lowestFacilityDensity}
            metricKey="facilities_per_100k_population"
            formatRate={formatRate}
          />

          <div className="mt-5 hidden h-80 md:block">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lowestFacilityDensity}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="county" type="category" width={110} />
                <Tooltip
                  formatter={(value) => [
                    `${formatRate(value)} per 100k`,
                    "Facilities",
                  ]}
                />
                <Bar dataKey="facilities_per_100k_population" fill="#047857" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5">
          <h3 className="text-xl font-bold text-slate-950 sm:text-lg">
            Lowest Access-Density Watchlist
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Counties that may need closer review based on public and ART
            facility density.
          </p>

          <div className="mt-5 grid gap-5">
            <DensityList
              title="Lowest public facility density"
              rows={lowestPublicDensity}
              metricKey="public_facilities_per_100k_population"
              formatRate={formatRate}
            />

            <DensityList
              title="Lowest ART facility density"
              rows={lowestArtDensity}
              metricKey="art_facilities_per_100k_population"
              formatRate={formatRate}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function AccessMetricCard({ title, value, suffix, description }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case">
        {title}
      </p>

      <p className="mt-2 text-xl font-black text-health-700 sm:text-2xl">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-semibold text-slate-500 sm:text-sm">
            {suffix}
          </span>
        )}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm">
        {description}
      </p>
    </div>
  )
}

function MobileDensityBarList({ rows, metricKey, formatRate }) {
  const maxValue = Math.max(
    ...rows.map((row) => Number(row[metricKey]) || 0),
    1
  )

  return (
    <div className="mt-5 space-y-3 md:hidden">
      {rows.map((row) => {
        const value = Number(row[metricKey]) || 0
        const width =
          value > 0 ? `${Math.max((value / maxValue) * 100, 8)}%` : "0%"

        return (
          <div key={row.county} className="rounded-2xl border bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                {row.county}
              </p>

              <p className="shrink-0 text-sm font-bold text-health-700">
                {formatRate(value)} per 100k
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

function DensityList({ title, rows, metricKey, formatRate }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>

      <div className="mt-3 overflow-hidden rounded-2xl border">
        {rows.map((row) => (
          <div
            key={`${title}-${row.county}`}
            className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm last:border-b-0"
          >
            <span className="min-w-0 truncate font-semibold text-slate-700">
              {row.county}
            </span>

            <span className="shrink-0 font-medium text-slate-600">
              {formatRate(row[metricKey])} per 100k
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AccessDensitySection
