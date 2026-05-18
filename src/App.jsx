import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './screens/Home'
import SessionSetup from './screens/SessionSetup'
import ActiveSession from './screens/ActiveSession'
import SessionResults from './screens/SessionResults'
import StatsDashboard from './screens/StatsDashboard'
import ReferenceSheet from './screens/ReferenceSheet'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-900 text-white pb-16">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session/setup" element={<SessionSetup />} />
        <Route path="/session/active" element={<ActiveSession />} />
        <Route path="/session/results" element={<SessionResults />} />
        <Route path="/stats" element={<StatsDashboard />} />
        <Route path="/reference" element={<ReferenceSheet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
