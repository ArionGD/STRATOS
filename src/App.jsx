import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './landing/LandingPage'
import Features from './landing/Features'
import Product from './landing/Product'
import Pricing from './landing/Pricing'
import Support from './landing/Support'
import Login from './auth/Login'
import Register from './auth/Register'
import Dashboard from './dashboard/Dashboard'
import useUserStore from './store/useUserStore'
import { isTauri } from './services/WebApi'

// Hosted web build: the dashboard needs a signed-in session
function RequireAuth({ children }) {
  const { user, token } = useUserStore()
  if (isTauri || (user && token)) return children
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Suite */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/product" element={<Product />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />
        
        {/* Auth & App */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<RequireAuth><Dashboard /></RequireAuth>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
