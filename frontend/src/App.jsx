import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import MapPage from "./pages/MapPage"
import CountyExplorer from "./pages/CountyExplorer"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/county-explorer" element={<CountyExplorer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
