import { useEffect, useMemo, useState } from "react"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://kenya-health-dashboard-api.onrender.com"

function pct(value, total) {
  if (!total || total === 0) return 0
  return (Number(value || 0) / Number(total)) * 100
}

function formatPct(value) {
  return `${value.toFixed(1)}%`
}

function normalizeCountyName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/['â€™]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getMarketInterpretation(county) {
  const privateShare = county.privateShare
  const publicShare = county.publicShare
  const faithNgoShare = county.faithNgoShare

  if (privateShare >= 50) {
    return "Private-led market activity"
  }

  if (publicShare >= 60) {
    return "High public-sector dependence"
  }

  if (faithNgoShare >= 20) {
    return "Strong faith-based/NGO presence"
  }

  if (Math.abs(privateShare - publicShare) <= 10) {
    return "Balanced ownership mix"
  }

  return "Mixed ownership pattern"
}

export default function MarketDynamicsSection() {
  const [counties, setCounties] = useState([])
  const [accessDensity, setAccessDensity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadMarketData() {
      try {
        setLoading(true)
        setError("")

        const [countiesResponse, accessResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/counties`),
          fetch(`${API_BASE_URL}/access-density`),
        ])

        if (!countiesResponse.ok) {
          throw new Error("Could not load county ownership data. The backend may still be waking up. Please refresh or try again in a moment.")
        }

        if (!accessResponse.ok) {
          throw new Error("Could not load access density data. The backend may still be waking up. Please refresh or try again in a moment.")
        }

        const countiesData = await countiesResponse.json()
        const accessData = await accessResponse.json()

        setCounties(countiesData)
        setAccessDensity(accessData)
      } catch (err) {
        setError(err.message || "Unable to load market dynamics data. Please refresh or try again in a moment.")
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
  }, [])

  const marketData = useMemo(() => {
    const densityByCounty = new Map(
      accessDensity.map((item) => [
        normalizeCountyName(item.county),
        item.facilities_per_100k_population,
      ])
    )

    return counties
      .map((county) => {
        const total = Number(county.total || 0)

        const privateShare = pct(county.private, total)
        const publicShare = pct(county.public, total)
        const faithNgoShare = pct(
          Number(county.faith_based || 0) + Number(county.ngo || 0),
          total
        )

        const imbalanceScore = Math.abs(privateShare - publicShare)
        const facilitiesPer100k =
          densityByCounty.get(normalizeCountyName(county.county)) || null

        return {
          ...county,
          total,
          privateShare,
          publicShare,
          faithNgoShare,
          imbalanceScore,
          facilitiesPer100k,
          interpretation: getMarketInterpretation({
            privateShare,
            publicShare,
            faithNgoShare,
          }),
        }
      })
      .filter((county) => county.total > 0)
  }, [counties, accessDensity])

  const mostPrivate = [...marketData]
    .sort((a, b) => b.privateShare - a.privateShare)
    .slice(0, 5)

  const mostPublic = [...marketData]
    .sort((a, b) => b.publicShare - a.publicShare)
    .slice(0, 5)

  const strongestFaithNgo = [...marketData]
    .sort((a, b) => b.faithNgoShare - a.faithNgoShare)
    .slice(0, 5)

  const lowDensityHighImbalance = [...marketData]
    .filter((county) => county.facilitiesPer100k !== null)
    .sort((a, b) => {
      if (a.facilitiesPer100k !== b.facilitiesPer100k) {
        return a.facilitiesPer100k - b.facilitiesPer100k
      }

      return b.imbalanceScore - a.imbalanceScore
    })
    .slice(0, 5)

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading ownership and market dynamics. This may take a moment if the backend is waking up.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </section>
    )
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          V2 Task 5
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Ownership & Market Dynamics
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          This section compares county-level ownership patterns to show where healthcare
          delivery is more private-led, public-sector dependent, or supported by
          faith-based and NGO facilities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MarketCard
          title="Highest Private Share"
          description="Counties where private facilities form the largest ownership share."
          rows={mostPrivate}
          valueKey="privateShare"
        />

        <MarketCard
          title="Highest Public Share"
          description="Counties with stronger dependence on public facilities."
          rows={mostPublic}
          valueKey="publicShare"
        />

        <MarketCard
          title="Strongest Faith/NGO Presence"
          description="Counties with notable mission or NGO-supported delivery."
          rows={strongestFaithNgo}
          valueKey="faithNgoShare"
        />
      </div>

      <div className="rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Low Facility Density + Ownership Imbalance
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            These counties combine lower population-adjusted facility access with a stronger
            ownership imbalance between public and private providers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">County</th>
                <th className="px-4 py-3">Facilities / 100k</th>
                <th className="px-4 py-3">Private Share</th>
                <th className="px-4 py-3">Public Share</th>
                <th className="px-4 py-3">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowDensityHighImbalance.map((county) => (
                <tr key={county.county}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {county.county}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {Number(county.facilitiesPer100k).toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatPct(county.privateShare)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatPct(county.publicShare)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {county.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          How to read this section
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>
            High private share may suggest stronger healthcare market activity.
          </li>
          <li>
            High public share may suggest greater dependence on government service delivery.
          </li>
          <li>
            High faith/NGO share may suggest mission-driven or community-supported care.
          </li>
        </ul>
      </div>
    </section>
  )
}

function MarketCard({ title, description, rows, valueKey }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <div className="mt-4 space-y-3">
        {rows.map((county) => (
          <div key={county.county}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">
                {county.county}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {formatPct(county[valueKey])}
              </span>
            </div>

            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-600"
                style={{ width: `${Math.min(county[valueKey], 100)}%` }}
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {county.interpretation}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
