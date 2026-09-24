/**
 * Stratos Feature Flags
 * METIS AI is off in the hosted web build for now.
 * Re-enable it there by building with VITE_ENABLE_AI=true.
 */
import { isTauri } from './services/WebApi'

export const AI_ENABLED = isTauri || import.meta.env.VITE_ENABLE_AI === 'true';
