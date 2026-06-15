import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import kenyaCounties from "../data/ken_admin1.json"
import { API_BASE } from "../config/api"

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
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

function MapResizeHandler({ countiesLoaded }) {
  const map = useMap()

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize()
    }

    const firstResize = window.setTimeout(resizeMap, 150)
    const secondResize = window.setTimeout(resizeMap, 500)

    return () => {
      window.clearTimeout(firstResize)
      window.clearTimeout(secondResize)
    }
  }, [map, countiesLoaded])

  return null
}

function MapLegend({ mobile = false }) {
  return (
    <div
      className={
        mobile
          ? "rounded-2xl border bg-white p-4 text-sm shadow-sm sm:hidden"
          : "pointer-events-none absolute bottom-4 right-4 z-[1000] hidden rounded-2xl bg-white p-3 text-xs shadow-lg sm:block"
      }
    >
      <p className="mb-2 font-semibold text-slate-900">
        Facilities per County
      </p>

      <div className={mobile ? "grid grid-cols-2 gap-2" : "space-y-1"}>
        {BUCKETS.map((bucket, i) => (
          <div key={bucket} className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-sm border border-gray-300"
              style={{ backgroundColor: COLORS[i] }}
            />
            <span className="text-slate-700">
              {bucket}
              {i < BUCKETS.length - 1 ? `–${BUCKETS[i + 1] - 1}` : "+"}
            </span>
          </div>
        ))}
      </div>
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
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{county.county}</h3>
          <p className="text-sm text-slate-500">{county.province} Province</p>
        </div>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xl leading-none text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          aria-label="Close county info"
        >
          ×
        </button>
      </div>

      <p className="mb-4 text-2xl font-black text-emerald-700">
        {county.total?.toLocaleString()} facilities
      </p>

      <div className="grid gap-2 text-sm">
        {ownershipRows.map(([label, count]) => (
          <div
            key={label}
            className="flex justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2"
          >
            <span className="text-slate-600">{label}</span>
            <span className="font-semibold text-slate-900">{count ?? 0}</span>
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
      layer.bindTooltip(
       `<strong>${escapeHtml(geoName)}</strong><br/>No matching data`,
       {
         sticky: true,
       }
      )
      return
    }

    layer.bindTooltip(
      `
       <strong>${escapeHtml(countyData.county)}</strong><br/>
       Total facilities: ${escapeHtml(countyData.total)}<br/>
       Public: ${escapeHtml(countyData.public)} (${escapeHtml(percentage(
        countyData.public,
        countyData.total
      ))})<br/>
       Private: ${escapeHtml(countyData.private)} (${escapeHtml(percentage(
        countyData.private,
        countyData.total
      ))})<br/>
       Faith-Based: ${escapeHtml(countyData.faith_based)} (${escapeHtml(percentage(
        countyData.faith_based,
        countyData.total
      ))})<br/>
       NGO: ${escapeHtml(countyData.ngo)} (${escapeHtml(percentage(countyData.ngo, countyData.total))})
      `,
      { sticky: true }
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-3xl">
              Kenya County Facility Map
            </h1>

            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 lg:text-sm lg:leading-6">
              Choropleth map showing total recorded health facilities by county.
            </p>
          </div>

          <Link
            to="/"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-lg">
            County Facility Distribution
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Darker counties have more recorded health facilities. Tap a county
            to view its facility ownership breakdown.
          </p>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">Loading map data...</p>
          )}

          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="relative h-[440px] min-h-[440px] overflow-hidden rounded-2xl border bg-slate-100 sm:h-[560px] lg:h-[620px]">
                  <MapContainer
                    center={[0.5, 37.8]}
                    zoom={6}
                    minZoom={5}
                    maxZoom={8}
                    scrollWheelZoom={false}
                    touchZoom
                    dragging
                    className="h-full w-full"
                  >
                    <MapResizeHandler countiesLoaded={counties.length} />

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

                <div className="space-y-4">
                  {selectedCounty ? (
                    <CountyInfoCard
                      county={selectedCounty}
                      onClose={() => setSelectedCounty(null)}
                    />
                  ) : (
                    <div className="rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      Tap a county on the map to view its facility ownership
                      breakdown.
                    </div>
                  )}

                  <MapLegend mobile />

                  <div className="rounded-2xl border bg-white p-4 text-sm leading-6 text-slate-600">
                    Facility range:{" "}
                    <span className="font-semibold text-slate-900">
                      {minTotal.toLocaleString()}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-900">
                      {maxTotal.toLocaleString()}
                    </span>{" "}
                    facilities per county.
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default MapPage