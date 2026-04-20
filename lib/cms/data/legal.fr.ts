// FR legal content will land in Phase 8. For now we re-export EN so any
// link into /fr/privacy (or terms / cookies) resolves with the canonical
// text instead of 404ing. When the French translation is authored, this
// file replaces the re-exports with the same shape as legal.es.ts.
export { privacy, terms, cookies } from './legal.en'
