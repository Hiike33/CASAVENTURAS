import type { Guide } from '@/lib/types/cms'

/**
 * Named guides & instructors at Casa Venturas.
 * Names sourced from real TripAdvisor reviews (lib/cms/data/reviews.ts).
 * Rendered as Person[] schema — E-E-A-T signal for AI search engines.
 */
export const guides: Guide[] = [
  {
    name: 'Eliu',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
    description: 'Senior El Yunque rainforest guide. Experienced with mixed-age groups from young children to senior guests.',
  },
  {
    name: 'Juelz',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
    description: 'El Yunque guide known for hospitality and making groups feel like family.',
  },
  {
    name: 'Paul',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
  },
  {
    name: 'Catherine "La Taína"',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
    description: 'Native Puerto Rican guide, expert in local culture and El Yunque ecosystem.',
  },
  {
    name: 'Justice',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
    description: 'Specializes in first-time rainforest visitors. Deep knowledge of jungle flora and Puerto Rican culture.',
  },
  {
    name: 'Rodriguez',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
  },
  {
    name: 'Kendra',
    jobTitle: 'El Yunque Tour Guide',
    tours: ['el-yunque'],
    description: 'Family-focused guide, experienced with children aged 5 and up. Teaches about rainforest animals and plants.',
  },
  {
    name: 'Zoe',
    jobTitle: 'Salsa Instructor',
    tours: ['salsa'],
    description: 'Professional salsa instructor on the Casa Santurce rooftop. Teaches absolute beginners at sunset.',
  },
]
