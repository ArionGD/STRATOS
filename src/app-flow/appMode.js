/**
 * Stratos App Mode
 * True when running inside the Android app (Expo WebView shell). The app gets
 * its own first-launch flow (welcome -> intro -> get started) and native-feel
 * styling; the website in a normal browser is unchanged.
 *
 * Preview it in any browser with `?app=1` (remembered for the tab; `?app=0` turns it off).
 */
import { isNativeShell } from '../services/NativeBridge'

const ONBOARDED_KEY = 'stratos-app-onboarded'

function detect() {
  if (typeof window === 'undefined') return false
  if (isNativeShell || /StratosAndroid/i.test(navigator.userAgent)) return true
  try {
    const flag = new URLSearchParams(window.location.search).get('app')
    if (flag === '1') sessionStorage.setItem('stratos-app-mode', '1')
    if (flag === '0') sessionStorage.removeItem('stratos-app-mode')
    return sessionStorage.getItem('stratos-app-mode') === '1'
  } catch {
    return false
  }
}

export const isAppMode = detect()

if (isAppMode && typeof document !== 'undefined') {
  document.documentElement.classList.add('app-mode')
}

export function hasOnboarded() {
  try { return localStorage.getItem(ONBOARDED_KEY) === '1' } catch { return false }
}

export function markOnboarded() {
  try { localStorage.setItem(ONBOARDED_KEY, '1') } catch { /* private mode: show intro again next time */ }
}
