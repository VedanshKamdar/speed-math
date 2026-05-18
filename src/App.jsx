import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './screens/Home'
import SessionSetup from './screens/SessionSetup'
import ActiveSession from './screens/ActiveSession'
import SessionResults from './screens/SessionResults'
import StatsDashboard from './screens/StatsDashboard'
import ReferenceSheet from './screens/ReferenceSheet'
import { useLocation } from 'react-router-dom'

// Bottom nav shows only on these routes (where it makes sense).
const NAV_ROUTES = ['/', '/stats', '/reference']

function Shell({ children }) {
  const { pathname } = useLocation()
  const showNav = NAV_ROUTES.includes(pathname)
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-fg)',
        // leave room for fixed bottom nav when shown
        paddingBottom: showNav ? 'calc(56px + env(safe-area-inset-bottom))' : 0,
      }}
    >
      <main className="flex-1 flex flex-col">{children}</main>
      {showNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/session/setup"   element={<SessionSetup />} />
        <Route path="/session/active"  element={<ActiveSession />} />
        <Route path="/session/results" element={<SessionResults />} />
        <Route path="/stats"           element={<StatsDashboard />} />
        <Route path="/reference"       element={<ReferenceSheet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
