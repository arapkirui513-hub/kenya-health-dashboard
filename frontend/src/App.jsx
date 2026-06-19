import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const Dashboard = lazy(() => import("./pages/Dashboard"))
const MapPage = lazy(() => import("./pages/MapPage"))
const CountyExplorer = lazy(() => import("./pages/CountyExplorer"))

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-700">
            Loading page...
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/county-explorer" element={<CountyExplorer />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App