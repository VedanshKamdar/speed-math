import { Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-brand-900 text-white">
      <Routes>
        <Route path="/" element={<div className="p-8 text-center">Home</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
