// Reviews are kept in their original English (authenticity signal , these
// are real TripAdvisor quotes from real guests, translating them would
// distort the voice). The D-018 decision allows translating only the
// review title for social-proof accessibility in ES/FR UIs.
//
// For now we re-export the EN data. When we add a title_es field to the
// Review type (Phase 2b), this file will override it with ES titles.
export { reviews } from './reviews.en'
