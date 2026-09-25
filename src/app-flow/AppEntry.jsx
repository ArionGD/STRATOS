import React from 'react'
import { Navigate } from 'react-router-dom'
import useUserStore from '../store/useUserStore'
import { hasOnboarded } from './appMode'

// App launch: signed in -> dashboard, first launch -> welcome, otherwise -> get started
export default function AppEntry() {
  const { user, token } = useUserStore()
  if (user && token) return <Navigate to="/app" replace />
  return <Navigate to={hasOnboarded() ? '/start' : '/welcome'} replace />
}
