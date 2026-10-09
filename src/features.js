/**
 * Stratos Feature Flags
 * METIS AI is on by default. Hide it in a web build with VITE_ENABLE_AI=false
 * (the desktop app always shows it).
 */
import { isTauri } from './services/WebApi'

export const AI_ENABLED = isTauri || import.meta.env.VITE_ENABLE_AI !== 'false';
