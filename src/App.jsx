import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import { isAppMode } from './app-flow/appMode'
import AppEntry from './app-flow/AppEntry'
import Welcome from './app-flow/Welcome'
import Intro from './app-flow/Intro'
import GetStarted from './app-flow/GetStarted'

// Hosted web build: the dashboard needs a signed-in session
function RequireAuth({ children }) {
  const { user, token } = useUserStore()
  if (isTauri || (user && token)) return children
  return <Navigate to={isAppMode ? '/' : '/login'} replace />
}

// Android app: screens slide in like native navigation (opacity only for the
// dashboard, whose fixed bars must not sit inside a transformed parent)
function AppScreen({ children }) {
  const { pathname } = useLocation()
  if (!isAppMode) return children
  const dashboard = pathname === '/app'
  return (
    <motion.div
      key={pathname}
      initial={dashboard ? { opacity: 0 } : { opacity: 0, x: 28 }}
      animate={dashboard ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[100dvh]"
    >
      {children}
    </motion.div>
  )
}

function AppRoutes() {
  return (
    <AppScreen>
      <Routes>
        {isAppMode ? (
          <>
            {/* Android app: first-launch flow instead of the marketing site */}
            <Route path="/" element={<AppEntry />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/start" element={<GetStarted />} />
          </>
        ) : (
          <>
            {/* Landing Suite */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/product" element={<Product />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/support" element={<Support />} />
          </>
        )}

        {/* Auth & App */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppScreen>
  )
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
