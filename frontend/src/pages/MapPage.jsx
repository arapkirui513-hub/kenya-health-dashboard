import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import kenyaCounties from "../data/ken_admin1.json"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"

const BUCKETS = [0, 100, 200, 300, 500]
const COLORS = ["#d1fae5", "#6ee7b7", "#34d399", "#059669", "#065f46"]

function normalizeCountyName(name) {
  return name
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getColor(total) {
  if (total == null) return "#e5e7eb"

  for (let i = BUCKETS.length - 1; i >= 0; i--) {
    if (total >= BUCKETS[i]) {
      return COLORS[i]
    }
  }

  return COLORS[0]
}

function MapLegend() {
  return (
    <div className="absolute bottom-8 right-4 z-[1000] rounded-lg bg-white p-3 text-sm shadow-md">
      <p className="mb-2 font-semibold text-slate-900">Facilities per County</p>

      {BUCKETS.map((bucket, i) => (
        <div key={bucket} className="mb-1 flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-sm border border-gray-300"
            style={{ backgroundColor: COLORS[i] }}
          />
          <span className="text-slate-700">
            {bucket}
            {i < BUCKETS.length - 1 ? `–${BUCKETS[i + 1] - 1}` : "+"}
          </span>
        </div>
      ))}
    </div>
  )
}

function CountyInfoCard({ county, onClose }) {
  if (!county) return null

  const ownershipRows = [
    ["Public", county.public],
    ["Private", county.private],
    ["Faith-Based", county.faith_based],
    ["NGO", county.ngo],
    ["Community", county.community],
    ["Academic", county.academic],
  ]

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{county.county}</h3>
          <p className="text-sm text-slate-500">{county.province} Province</p>
        </div>

        <button
          onClick={onClose}
          className="text-xl leading-none text-slate-400 hover:text-slate-700"
          aria-label="Close county info"
        >
          ×
        </button>
      </div>

      <p className="mb-4 text-2xl font-bold text-emerald-700">
        {county.total?.toLocaleString()} facilities
      </p>

      <div className="space-y-2 text-sm">
        {ownershipRows.map(([label, count]) => (
          <div key={label} className="flex justify-between gap-4">
            <span className="text-slate-600">{label}</span>
            <span className="font-medium text-slate-900">{count ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapPage() {
  const geoJsonRef = useRef(null)

  const [counties, setCounties] = useState([])
  const [selectedCounty, setSelectedCounty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios
      .get(`${API_BASE}/counties`)
      .then((response) => {
        setCounties(response.data)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load county data.")
        setLoading(false)
      })
  }, [])

  const countyDataMap = useMemo(() => {
    return new Map(
      counties.map((county) => [normalizeCountyName(county.county), county])
    )
  }, [counties])

  const totals = counties.map((county) => county.total)
  const minTotal = totals.length ? Math.min(...totals) : 0
  const maxTotal = totals.length ? Math.max(...totals) : 0

  function getCountyData(feature) {
    const geoName = feature.properties.adm1_name
    const normalizedName = normalizeCountyName(geoName)
    return countyDataMap.get(normalizedName)
  }

  function countyStyle(feature) {
    const countyData = getCountyData(feature)

    return {
      fillColor: getColor(countyData?.total),
      weight: 0.8,
      opacity: 1,
      color: "#f8fafc",
      fillOpacity: 0.85,
    }
  }

  function highlightFeature(e) {
    const layer = e.target

    layer.setStyle({
      weight: 4,
      color: "#111827",
      fillOpacity: 0.95,
      dashArray: "",
    })

    layer.bringToFront()
  }

  function resetHighlight(e) {
    if (geoJsonRef.current) {
      geoJsonRef.current.resetStyle(e.target)
    }
  }

  function percentage(value, total) {
    if (!total) return "0%"
    return `${Math.round(((value ?? 0) / total) * 100)}%`
  }

  function onEachCounty(feature, layer) {
    const geoName = feature.properties.adm1_name
    const countyData = getCountyData(feature)

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: () => {
        if (countyData) {
          setSelectedCounty(countyData)
        }
      },
    })

    if (!countyData) {
      layer.bindTooltip(`<strong>${geoName}</strong><br/>No matching data`, {
        sticky: true,
      })
      return
    }

    layer.bindTooltip(
      `
        <strong>${countyData.county}</strong><br/>
        Total facilities: ${countyData.total}<br/>
        Public: ${countyData.public} (${percentage(countyData.public, countyData.total)})<br/>
        Private: ${countyData.private} (${percentage(countyData.private, countyData.total)})<br/>
        Faith-Based: ${countyData.faith_based} (${percentage(countyData.faith_based, countyData.total)})<br/>
        NGO: ${countyData.ngo} (${percentage(countyData.ngo, countyData.total)})
      `,
      { sticky: true }
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Kenya County Facility Map
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Choropleth map showing total recorded health facilities by county.
            </p>
          </div>

          <Link
            to="/"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            County Facility Distribution
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Darker counties have more recorded health facilities. Hover for a
            quick summary or click a county to keep its details visible.
          </p>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">Loading map data...</p>
          )}

          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mt-6 flex flex-col gap-4 lg:flex-row">
                <div className="relative h-[600px] flex-1 overflow-hidden rounded-xl border">
                  <MapContainer
                    center={[0.5, 37.8]}
                    zoom={6}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <GeoJSON
                      ref={geoJsonRef}
                      data={kenyaCounties}
                      style={countyStyle}
                      onEachFeature={onEachCounty}
                    />
                  </MapContainer>

                  <MapLegend />
                </div>

                <div className="lg:w-72">
                  {selectedCounty ? (
                    <CountyInfoCard
                      county={selectedCounty}
                      onClose={() => setSelectedCounty(null)}
                    />
                  ) : (
                    <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                      Click a county on the map to view its facility ownership
                      breakdown.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                Facility range: {minTotal.toLocaleString()} to{" "}
                {maxTotal.toLocaleString()} facilities per county.
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default MapPage