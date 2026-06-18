const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const normalizeCounty = (name = "") =>
  String(name)
    .toLowerCase()
    .replace(/\bcity\b/g, "")
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]/g, "")

const formatCount = (value) => {
  const number = toNumber(value)
  return number === null ? "N/A" : number.toLocaleString()
}

const formatRate = (value) => {
  const number = toNumber(value)
  return number === null ? "N/A" : `${number.toFixed(1)} per 100k`
}

const formatDecimal = (value) => {
  const number = toNumber(value)
  return number === null
    ? "N/A"
    : number.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

const formatPercent = (value) => {
  const number = toNumber(value)

  if (number === null) {
    return "N/A"
  }

  const normalized = number <= 1 ? number * 100 : number
  return `${normalized.toFixed(1)}%`
}

const formatPriorityScore = (value) => {
  const number = toNumber(value)
  return number === null ? "N/A" : number.toFixed(1)
}

const ownershipPercent = (part, total) => {
  const partValue = toNumber(part)
  const totalValue = toNumber(total)

  if (partValue === null || totalValue === null || totalValue === 0) {
    return null
  }

  return (partValue / totalValue) * 100
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const getPriorityScore = (priority) =>
  priority?.priority_score ??
  priority?.planning_priority_score ??
  priority?.score ??
  priority?.index_score ??
  null

const getPriorityLevel = (priority) =>
  priority?.priority_level ??
  priority?.risk_level ??
  priority?.level ??
  priority?.category ??
  "Not available"

const getPriorityRank = (priority, priorityIndex, countyName) => {
  const explicitRank =
    priority?.rank ?? priority?.priority_rank ?? priority?.county_rank ?? null

  if (explicitRank !== null && explicitRank !== undefined) {
    return explicitRank
  }

  if (!Array.isArray(priorityIndex) || !countyName) {
    return null
  }

  const rankIndex = priorityIndex.findIndex(
    (row) => normalizeCounty(row?.county) === normalizeCounty(countyName)
  )

  return rankIndex >= 0 ? rankIndex + 1 : null
}

const getRiskValue = (priority, keys) => {
  for (const key of keys) {
    if (priority?.[key] !== undefined && priority?.[key] !== null) {
      return priority[key]
    }

    if (
      priority?.component_scores?.[key] !== undefined &&
      priority?.component_scores?.[key] !== null
    ) {
      return priority.component_scores[key]
    }
  }

  return null
}

const buildRiskDrivers = (priority) => {
  const flags = Array.isArray(priority?.reason_flags)
    ? priority.reason_flags.slice(0, 5)
    : []

  if (flags.length === 0) {
    return "No risk-driver flags available."
  }

  return flags.join("; ")
}

const buildRows = ({
  selectedA,
  selectedB,
  countyADensity,
  countyBDensity,
  countyACounties,
  countyBCounties,
  countyAGap,
  countyBGap,
  countyAPriority,
  countyBPriority,
  priorityIndex,
}) => [
  [
    "Planning priority score",
    formatPriorityScore(getPriorityScore(countyAPriority)),
    formatPriorityScore(getPriorityScore(countyBPriority)),
  ],
  [
    "Priority level",
    getPriorityLevel(countyAPriority),
    getPriorityLevel(countyBPriority),
  ],
  [
    "County rank",
    getPriorityRank(countyAPriority, priorityIndex, selectedA)
      ? `${getPriorityRank(countyAPriority, priorityIndex, selectedA)} of 47`
      : "N/A",
    getPriorityRank(countyBPriority, priorityIndex, selectedB)
      ? `${getPriorityRank(countyBPriority, priorityIndex, selectedB)} of 47`
      : "N/A",
  ],
  [
    "Access risk",
    formatPriorityScore(
      getRiskValue(countyAPriority, ["access_risk", "access_risk_score"])
    ),
    formatPriorityScore(
      getRiskValue(countyBPriority, ["access_risk", "access_risk_score"])
    ),
  ],
  [
    "Service risk",
    formatPriorityScore(
      getRiskValue(countyAPriority, ["service_risk", "service_risk_score"])
    ),
    formatPriorityScore(
      getRiskValue(countyBPriority, ["service_risk", "service_risk_score"])
    ),
  ],
  [
    "Ownership/equity risk",
    formatPriorityScore(
      getRiskValue(countyAPriority, [
        "ownership_equity_risk",
        "ownership_risk",
        "equity_risk",
        "ownership_equity_risk_score",
      ])
    ),
    formatPriorityScore(
      getRiskValue(countyBPriority, [
        "ownership_equity_risk",
        "ownership_risk",
        "equity_risk",
        "ownership_equity_risk_score",
      ])
    ),
  ],
  [
    "Population pressure",
    formatPriorityScore(
      getRiskValue(countyAPriority, [
        "population_pressure",
        "population_pressure_score",
      ])
    ),
    formatPriorityScore(
      getRiskValue(countyBPriority, [
        "population_pressure",
        "population_pressure_score",
      ])
    ),
  ],
  [
    "Population 2019",
    formatCount(countyADensity?.population_2019),
    formatCount(countyBDensity?.population_2019),
  ],
  [
    "Land area",
    `${formatDecimal(countyADensity?.area_km2)} km2`,
    `${formatDecimal(countyBDensity?.area_km2)} km2`,
  ],
  [
    "Population density per km2",
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
    formatPercent(ownershipPercent(countyACounties?.private, countyACounties?.total)),
    formatPercent(ownershipPercent(countyBCounties?.private, countyBCounties?.total)),
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

const buildInterpretation = ({
  selectedA,
  selectedB,
  countyADensity,
  countyBDensity,
  countyAGap,
  countyBGap,
  countyAPriority,
  countyBPriority,
}) => {
  const densityA = toNumber(countyADensity?.facilities_per_100k_population)
  const densityB = toNumber(countyBDensity?.facilities_per_100k_population)
  const coverageA = toNumber(countyAGap?.coverage_score)
  const coverageB = toNumber(countyBGap?.coverage_score)
  const scoreA = toNumber(getPriorityScore(countyAPriority))
  const scoreB = toNumber(getPriorityScore(countyBPriority))

  const statements = []

  if (densityA !== null && densityB !== null) {
    const strongerCounty = densityA >= densityB ? selectedA : selectedB
    const weakerCounty = densityA < densityB ? selectedA : selectedB

    statements.push(
      `${strongerCounty} has the higher facility density, while ${weakerCounty} shows lower facility availability relative to population.`
    )
  }

  if (coverageA !== null && coverageB !== null) {
    const strongerCoverageCounty = coverageA >= coverageB ? selectedA : selectedB
    const weakerCoverageCounty = coverageA < coverageB ? selectedA : selectedB

    statements.push(
      `${strongerCoverageCounty} has stronger selected-service coverage, while ${weakerCoverageCounty} may need closer review of service availability gaps.`
    )
  }

  if (scoreA !== null && scoreB !== null) {
    const higherPriorityCounty = scoreA >= scoreB ? selectedA : selectedB

    statements.push(
      `${higherPriorityCounty} has the higher planning priority score in this comparison, meaning it should receive closer planning attention based on the current index inputs.`
    )
  }

  if (statements.length === 0) {
    return "This report compares county-level access, ownership, selected service coverage, and planning priority indicators. Use the metrics above to identify access gaps, service gaps, and planning priorities."
  }

  return statements.join(" ")
}

export default function CountyComparisonReportButton({
  selectedA,
  selectedB,
  countyADensity,
  countyBDensity,
  countyACounties,
  countyBCounties,
  countyAGap,
  countyBGap,
  countyAPriority,
  countyBPriority,
  priorityIndex,
}) {
  const handlePrintReport = () => {
    const generatedAt = new Date().toLocaleString()
    const safeSelectedA = escapeHtml(selectedA)
    const safeSelectedB = escapeHtml(selectedB)
    const safeGeneratedAt = escapeHtml(generatedAt)

    const rankA = getPriorityRank(countyAPriority, priorityIndex, selectedA)
    const rankB = getPriorityRank(countyBPriority, priorityIndex, selectedB)

    const rows = buildRows({
      selectedA,
      selectedB,
      countyADensity,
      countyBDensity,
      countyACounties,
      countyBCounties,
      countyAGap,
      countyBGap,
      countyAPriority,
      countyBPriority,
      priorityIndex,
    })

    const interpretation = buildInterpretation({
      selectedA,
      selectedB,
      countyADensity,
      countyBDensity,
      countyAGap,
      countyBGap,
      countyAPriority,
      countyBPriority,
    })

    const reportRows = rows
      .map(
        ([label, valueA, valueB]) => `
          <tr>
            <td>${escapeHtml(label)}</td>
            <td>${escapeHtml(valueA)}</td>
            <td>${escapeHtml(valueB)}</td>
          </tr>
        `
      )
      .join("")

    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <title>${safeSelectedA} vs ${safeSelectedB} County Planning Report</title>
          <style>
            @page {
              size: A4;
              margin: 14mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              line-height: 1.4;
              background: #ffffff;
            }

            h1 {
              font-size: 25px;
              margin: 0 0 4px;
              letter-spacing: -0.02em;
            }

            h2 {
              font-size: 16px;
              margin: 18px 0 9px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 7px;
            }

            h3 {
              margin: 0 0 9px;
              font-size: 16px;
            }

            .meta {
              color: #475569;
              font-size: 12px;
              margin: 0 0 16px;
            }

            .summary {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin: 14px 0;
              page-break-inside: avoid;
            }

            .card {
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              padding: 12px;
              background: #f8fafc;
              page-break-inside: avoid;
            }

            .priority-card {
              border: 1px solid #99f6e4;
              background: #f0fdfa;
            }

            .metric {
              margin: 4px 0;
              font-size: 12px;
            }

            .driver {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #ccfbf1;
              font-size: 11px;
              color: #334155;
            }

            .note,
            .interpretation {
              border-radius: 12px;
              padding: 12px;
              margin-top: 14px;
              font-size: 12px;
              page-break-inside: avoid;
            }

            .note {
              background: #ecfeff;
              border: 1px solid #99f6e4;
            }

            .interpretation {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11.5px;
              page-break-inside: auto;
            }

            thead {
              display: table-header-group;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            th {
              background: #0f766e;
              color: white;
              text-align: left;
              padding: 7px;
            }

            td {
              border: 1px solid #cbd5e1;
              padding: 6px 7px;
              vertical-align: top;
            }

            .footer {
              margin-top: 18px;
              color: #475569;
              font-size: 10.5px;
              page-break-inside: avoid;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>

        <body>
          <h1>County Planning Comparison Report</h1>

          <p class="meta">
            Kenya Health Facilities Dashboard<br />
            Counties: ${safeSelectedA} vs ${safeSelectedB}<br />
            Generated: ${safeGeneratedAt}
          </p>

          <div class="summary">
            <div class="card">
              <h3>${safeSelectedA}</h3>
              <p class="metric"><strong>Population:</strong> ${formatCount(
                countyADensity?.population_2019
              )}</p>
              <p class="metric"><strong>Total facilities:</strong> ${formatCount(
                countyADensity?.total_facilities
              )}</p>
              <p class="metric"><strong>Facility density:</strong> ${formatRate(
                countyADensity?.facilities_per_100k_population
              )}</p>
              <p class="metric"><strong>Overall coverage:</strong> ${formatPercent(
                countyAGap?.coverage_score
              )}</p>
            </div>

            <div class="card">
              <h3>${safeSelectedB}</h3>
              <p class="metric"><strong>Population:</strong> ${formatCount(
                countyBDensity?.population_2019
              )}</p>
              <p class="metric"><strong>Total facilities:</strong> ${formatCount(
                countyBDensity?.total_facilities
              )}</p>
              <p class="metric"><strong>Facility density:</strong> ${formatRate(
                countyBDensity?.facilities_per_100k_population
              )}</p>
              <p class="metric"><strong>Overall coverage:</strong> ${formatPercent(
                countyBGap?.coverage_score
              )}</p>
            </div>
          </div>

          <div class="summary">
            <div class="card priority-card">
              <h3>${safeSelectedA} Planning Priority</h3>
              <p class="metric"><strong>Score:</strong> ${formatPriorityScore(
                getPriorityScore(countyAPriority)
              )}</p>
              <p class="metric"><strong>Level:</strong> ${escapeHtml(
                getPriorityLevel(countyAPriority)
              )}</p>
              <p class="metric"><strong>Rank:</strong> ${
                rankA ? `${escapeHtml(rankA)} of 47` : "N/A"
              }</p>
              <p class="driver"><strong>Risk drivers:</strong> ${escapeHtml(
                buildRiskDrivers(countyAPriority)
              )}</p>
            </div>

            <div class="card priority-card">
              <h3>${safeSelectedB} Planning Priority</h3>
              <p class="metric"><strong>Score:</strong> ${formatPriorityScore(
                getPriorityScore(countyBPriority)
              )}</p>
              <p class="metric"><strong>Level:</strong> ${escapeHtml(
                getPriorityLevel(countyBPriority)
              )}</p>
              <p class="metric"><strong>Rank:</strong> ${
                rankB ? `${escapeHtml(rankB)} of 47` : "N/A"
              }</p>
              <p class="driver"><strong>Risk drivers:</strong> ${escapeHtml(
                buildRiskDrivers(countyBPriority)
              )}</p>
            </div>
          </div>

          <div class="note">
            <strong>Planning note:</strong>
            This report compares county facility access, ownership mix, selected service coverage, and planning priority indicators.
            Facility-density values are rates per 100,000 people, not percentages.
          </div>

          <h2>Comparison Metrics</h2>

          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>${safeSelectedA}</th>
                <th>${safeSelectedB}</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows}
            </tbody>
          </table>

          <h2>Planning Interpretation</h2>

          <div class="interpretation">
            ${escapeHtml(interpretation)}
          </div>

          <p class="footer">
            Data source: Kenya Health Facilities Dashboard<br />
            Dataset: Kenya health facilities, county population, service coverage, and planning priority processed data<br />
            Generated from: County Explorer<br />
            Dashboard: https://kenya-health-dashboard.vercel.app/<br />
            County Explorer: https://kenya-health-dashboard.vercel.app/county-explorer
          </p>
        </body>
      </html>
    `

    const reportWindow = window.open(
      "",
      "_blank",
      "width=900,height=1100"
    )

    if (!reportWindow) {
      alert("Please allow pop-ups to generate the report.")
      return
    }

    reportWindow.document.open()
    reportWindow.document.write(reportHtml)
    reportWindow.document.close()

    window.setTimeout(() => {
      reportWindow.focus()
      reportWindow.print()
    }, 250)
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
