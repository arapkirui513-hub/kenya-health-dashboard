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
        setAccessDensity(response.data)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load population-adjusted access data.")
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
      facilitiesPer100k: calculateRate(totals.totalFacilities, totals.population),
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
      <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading population-adjusted access data...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    )
  }

  return (
    <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-health-700">
            Version 2 Access Intelligence
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Population-Adjusted Access
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This section compares facility availability against county population
            size. It helps identify counties where raw facility counts may look
            adequate, but population-adjusted access is low.
          </p>
        </div>

        <div className="rounded-lg bg-health-50 px-4 py-3 text-sm text-health-800">
          {accessDensity.length} counties matched with 2019 population data
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <AccessMetricCard
          title="National facility density"
          value={formatRate(nationalMetrics.facilitiesPer100k)}
          suffix="per 100k"
          description="All facilities per 100,000 people"
        />

        <AccessMetricCard
          title="Public facility density"
          value={formatRate(nationalMetrics.publicPer100k)}
          suffix="per 100k"
          description="Public facilities per 100,000 people"
        />

        <AccessMetricCard
          title="ART facility density"
          value={formatRate(nationalMetrics.artPer100k)}
          suffix="per 100k"
          description="ART facilities per 100,000 people"
        />

        <AccessMetricCard
          title="Population covered"
          value={nationalMetrics.totalPopulation.toLocaleString()}
          suffix=""
          description="2019 census population across 47 counties"
        />
      </div>

      <div className="mt-5 rounded-lg border border-health-100 bg-health-50 p-4">
        <h3 className="text-sm font-semibold text-health-900">
          How to read these numbers
        </h3>

        <p className="mt-2 text-sm leading-6 text-health-800">
          These values are not percentages. They show how many facilities are
          available for every 100,000 people. For example, a public facility
          density of 10.4 means there are about 10.4 public health facilities
          for every 100,000 people.
        </p>

        <p className="mt-2 text-sm leading-6 text-health-800">
          Formula: facility density = number of facilities divided by population,
          multiplied by 100,000.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Lowest Facility Density Counties
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Counties with the fewest facilities per 100,000 people.
          </p>

          <div className="mt-5 h-80">
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

        <div className="rounded-xl border p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Lowest Access-Density Watchlist
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Counties that may need closer planning review based on public and ART
            facility density.
          </p>

          <div className="mt-5 grid gap-4">
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
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-health-700">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-semibold text-slate-500">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function DensityList({ title, rows, metricKey, formatRate }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="mt-3 divide-y rounded-lg border">
        {rows.map((row) => (
          <div
            key={`${title}-${row.county}`}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="font-medium text-slate-700">{row.county}</span>
            <span className="text-slate-600">
              {formatRate(row[metricKey])} per 100k
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AccessDensitySection