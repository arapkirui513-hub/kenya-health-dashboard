const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatCount = (value) => {
  const number = toNumber(value)
  return number === null ? "—" : number.toLocaleString()
}

const formatRate = (value) => {
  const number = toNumber(value)
  return number === null ? "—" : `${number.toFixed(1)} per 100k`
}

const formatDecimal = (value) => {
  const number = toNumber(value)
  return number === null
    ? "—"
    : number.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

const formatPercent = (value) => {
  const number = toNumber(value)

  if (number === null) {
    return "—"
  }

  const normalized = number <= 1 ? number * 100 : number
  return `${normalized.toFixed(1)}%`
}

const ownershipPercent = (part, total) => {
  const partValue = toNumber(part)
  const totalValue = toNumber(total)

  if (partValue === null || totalValue === null || totalValue === 0) {
    return null
  }

  return (partValue / totalValue) * 100
}

const buildRows = ({
  countyADensity,
  countyBDensity,
  countyACounties,
  countyBCounties,
  countyAGap,
  countyBGap,
}) => [
  [
    "Population 2019",
    formatCount(countyADensity?.population_2019),
    formatCount(countyBDensity?.population_2019),
  ],
  [
    "Land area",
    `${formatDecimal(countyADensity?.area_km2)} km²`,
    `${formatDecimal(countyBDensity?.area_km2)} km²`,
  ],
  [
    "Population density per km²",
    formatDecimal(countyADensity?.density_per_km2),
    formatDecimal(countyBDensity?.density_per_km2),
  ],
  [
    "Total facilities",
    formatCount(countyADensity?.total_facilities),
    formatCount(countyBDensity?.total_facilities),
  ],
  [
    "Facilities per 100,000 people",
    formatRate(countyADensity?.facilities_per_100k_population),
    formatRate(countyBDensity?.facilities_per_100k_population),
  ],
  [
    "Public facilities per 100,000 people",
    formatRate(countyADensity?.public_facilities_per_100k_population),
    formatRate(countyBDensity?.public_facilities_per_100k_population),
  ],
  [
    "ART facilities per 100,000 people",
    formatRate(countyADensity?.art_facilities_per_100k_population),
    formatRate(countyBDensity?.art_facilities_per_100k_population),
  ],
  [
    "% Public",
    formatPercent(ownershipPercent(countyACounties?.public, countyACounties?.total)),
    formatPercent(ownershipPercent(countyBCounties?.public, countyBCounties?.total)),
  ],
  [
    "% Private",
    formatPercent(
      ownershipPercent(countyACounties?.private, countyACounties?.total)
    ),
    formatPercent(
      ownershipPercent(countyBCounties?.private, countyBCounties?.total)
    ),
  ],
  [
    "% Faith-Based",
    formatPercent(
      ownershipPercent(countyACounties?.faith_based, countyACounties?.total)
    ),
    formatPercent(
      ownershipPercent(countyBCounties?.faith_based, countyBCounties?.total)
    ),
  ],
  [
    "Overall coverage score",
    formatPercent(countyAGap?.coverage_score),
    formatPercent(countyBGap?.coverage_score),
  ],
  [
    "FP coverage",
    formatPercent(countyAGap?.fp_coverage),
    formatPercent(countyBGap?.fp_coverage),
  ],
  [
    "ART coverage",
    formatPercent(countyAGap?.art_coverage),
    formatPercent(countyBGap?.art_coverage),
  ],
  [
    "C-IMCI coverage",
    formatPercent(countyAGap?.c_imci_coverage),
    formatPercent(countyBGap?.c_imci_coverage),
  ],
  [
    "IPD coverage",
    formatPercent(countyAGap?.ipd_coverage),
    formatPercent(countyBGap?.ipd_coverage),
  ],
  [
    "HBC coverage",
    formatPercent(countyAGap?.hbc_coverage),
    formatPercent(countyBGap?.hbc_coverage),
  ],
]

export default function CountyComparisonReportButton({
  selectedA,
  selectedB,
  countyADensity,
  countyBDensity,
  countyACounties,
  countyBCounties,
  countyAGap,
  countyBGap,
}) {
  const handlePrintReport = () => {
    const generatedAt = new Date().toLocaleString()

    const rows = buildRows({
      countyADensity,
      countyBDensity,
      countyACounties,
      countyBCounties,
      countyAGap,
      countyBGap,
    })

    const reportRows = rows
      .map(
        ([label, valueA, valueB]) => `
          <tr>
            <td>${label}</td>
            <td>${valueA}</td>
            <td>${valueB}</td>
          </tr>
        `
      )
      .join("")

    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <title>${selectedA} vs ${selectedB} County Comparison Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              margin: 40px;
              line-height: 1.5;
            }

            h1 {
              font-size: 28px;
              margin-bottom: 4px;
            }

            h2 {
              font-size: 18px;
              margin-top: 28px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 8px;
            }

            .meta {
              color: #475569;
              font-size: 13px;
              margin-bottom: 24px;
            }

            .summary {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin: 24px 0;
            }

            .card {
              border: 1px solid #cbd5e1;
              border-radius: 14px;
              padding: 16px;
              background: #f8fafc;
            }

            .card h3 {
              margin-top: 0;
              margin-bottom: 10px;
              font-size: 18px;
            }

            .metric {
              margin: 6px 0;
              font-size: 14px;
            }

            .note {
              background: #ecfeff;
              border: 1px solid #99f6e4;
              border-radius: 14px;
              padding: 16px;
              margin-top: 20px;
              font-size: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              font-size: 13px;
            }

            th {
              background: #0f766e;
              color: white;
              text-align: left;
              padding: 10px;
            }

            td {
              border: 1px solid #cbd5e1;
              padding: 9px;
              vertical-align: top;
            }

            .footer {
              margin-top: 32px;
              color: #64748b;
              font-size: 12px;
            }

            @media print {
              body {
                margin: 24px;
              }
            }
          </style>
        </head>

        <body>
          <h1>County Comparison Report</h1>

          <p class="meta">
            Kenya Health Facilities Dashboard<br />
            Generated: ${generatedAt}
          </p>

          <div class="summary">
            <div class="card">
              <h3>${selectedA}</h3>
              <p class="metric"><strong>Population:</strong> ${formatCount(
                countyADensity?.population_2019
              )}</p>
              <p class="metric"><strong>Total facilities:</strong> ${formatCount(
                countyADensity?.total_facilities
              )}</p>
              <p class="metric"><strong>Facility density:</strong> ${formatRate(
                countyADensity?.facilities_per_100k_population
              )}</p>
            </div>

            <div class="card">
              <h3>${selectedB}</h3>
              <p class="metric"><strong>Population:</strong> ${formatCount(
                countyBDensity?.population_2019
              )}</p>
              <p class="metric"><strong>Total facilities:</strong> ${formatCount(
                countyBDensity?.total_facilities
              )}</p>
              <p class="metric"><strong>Facility density:</strong> ${formatRate(
                countyBDensity?.facilities_per_100k_population
              )}</p>
            </div>
          </div>

          <div class="note">
            <strong>Planning note:</strong>
            This report compares county facility access, ownership mix, and selected service coverage indicators.
            Facility-density values are rates per 100,000 people, not percentages.
          </div>

          <h2>Comparison Metrics</h2>

          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>${selectedA}</th>
                <th>${selectedB}</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows}
            </tbody>
          </table>

          <p class="footer">
            Source: Kenya Health Facilities Dashboard<br />
            Dashboard: https://kenya-health-dashboard.vercel.app/<br />
            County Explorer: https://kenya-health-dashboard.vercel.app/county-explorer
          </p>

          <script>
            window.onload = function () {
              window.print()
            }
          </script>
        </body>
      </html>
    `

    const reportWindow = window.open("", "_blank", "width=900,height=1100")

    if (!reportWindow) {
      alert("Please allow pop-ups to generate the report.")
      return
    }

    reportWindow.document.open()
    reportWindow.document.write(reportHtml)
    reportWindow.document.close()
  }

  return (
    <button
      type="button"
      onClick={handlePrintReport}
     className="min-h-11 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
    >
      Print / Save Report
    </button>
  )
}