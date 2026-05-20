import type { Tour } from '@/lib/types/cms'

/**
 * Casa Venturas tours, traduction française (France / Québec / Belgique / Suisse).
 *
 * Source : lib/cms/data/tours.en.ts. Toute modification doit conserver la
 * parité structurelle avec la version EN (mêmes slugs, mêmes prix, mêmes
 * URLs d'images). Seul le texte visible change.
 *
 * Application du contrat docs/i18n-translation-contract.md :
 *  - Zéro em-dash.
 *  - Tutoiement (direct, ton familier caribéen).
 *  - Noms propres conservés (El Yunque, Vieques, Casa Santurce, Zoe, Bali).
 *  - Prix en USD conservés tel quel.
 */

const BOKUN_PRODUCT_ID: Record<string, number | undefined> = {
  'el-yunque': toNum(process.env.NEXT_PUBLIC_BOKUN_PRODUCT_EL_YUNQUE),
  catamaran: toNum(process.env.NEXT_PUBLIC_BOKUN_PRODUCT_CATAMARAN),
  salsa: toNum(process.env.NEXT_PUBLIC_BOKUN_PRODUCT_SALSA),
}

function toNum(v: string | undefined): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

const rawTours: Tour[] = [
  {
    slug: 'el-yunque',
    name: 'El Yunque, journée vibrante en forêt tropicale',
    shortName: 'El Yunque',
    category: 'Forêt tropicale · Aventure',
    tagColor: '#72D4A0',
    thumbBg: '#111E14',
    price: 89,
    priceNote: 'par personne, transport inclus',
    duration: '6–7h',
    groupSize: '≤ 13',
    level: 'Modéré',
    description: "Toboggans naturels, sauts de falaise de 5 à 20 pieds, lianes au-dessus de la rivière et sentiers boueux en pleine jungle. Ton guide local te fait vivre la forêt tropicale avec son histoire et ses coins cachés. Transport depuis ton hôtel inclus.",
    highlights: [
      'Toboggan naturel creusé dans la rivière de la forêt tropicale',
      'Sauts de falaise de 5, 10 à 15 et 20 pieds dans une eau cristalline',
      'Liane au-dessus de la rivière pour te balancer',
      "Randonnée guidée en jungle avec commentaires sur l'écosystème",
      'Transport retour vers ton hôtel à San Juan',
      'Photos du jour partagées par ton guide en fin de tour',
    ],
    whatToBring: [
      "Chaussures d'eau ou vieilles baskets (elles vont se mouiller et s'embourber)",
      'Rechange et sac étanche',
      "Housse étanche pour le téléphone (photos dans l'eau)",
      'Crème solaire, eau et un petit encas',
      "Gilet de sauvetage dispo si tu n'es pas à l'aise à la nage",
    ],
    heroTag: 'Forêt tropicale · Parc National El Yunque',
    photos: [
      '/images/tours/el-yunque/dsc8267-hd.jpg',
      '/images/tours/el-yunque/dsc8278-hd.jpg',
      '/images/tours/el-yunque/dsc8314-hd.jpg',
      '/images/tours/el-yunque/dsc8332-hd.jpg',
      '/images/tours/el-yunque/dsc8354-hd.jpg',
      '/images/tours/el-yunque/dsc8453-hd.jpg',
      '/images/tours/el-yunque/dsc8463-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/el-yunque/dsc8314-hd.jpg',
      '/images/tours/el-yunque/dsc8278-hd.jpg',
      '/images/tours/el-yunque/dsc8267-hd.jpg',
      '/images/tours/el-yunque/dsc8332-hd.jpg',
      '/images/tours/el-yunque/dsc8354-hd.jpg',
      '/images/tours/el-yunque/dsc8453-hd.jpg',
      '/images/tours/el-yunque/dsc8463-hd.jpg',
    ],
    video: 'https://www.youtube.com/watch?v=_qz8fcMaor8',
    tripAdvisorProductUrl: 'https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    slug: 'catamaran',
    name: 'Catamaran privé à Vieques',
    shortName: 'Catamaran',
    category: 'Navigation · Luxe',
    tagColor: '#72C4D4',
    thumbBg: '#0A141E',
    price: 249,
    pricedPerPerson: false,
    priceNote: "pour 12 personnes max",
    duration: 'Journée complète',
    groupSize: '≤ 12',
    level: undefined,
    includes: 'Charter privé',
    description: "Monte à bord d'un catamaran Bali de 40 pieds et vis une expérience privée inoubliable sur les eaux cristallines de Vieques. Conçu pour ton confort, ton espace et ton style, réservé à ton groupe seul.",
    highlights: [
      'Charter privé de journée complète sur un catamaran Bali de 40 pieds',
      "Navigation vers Punta Arena, l'une des plages les plus isolées de Vieques",
      'Équipement de natation, snorkel et paddle',
      'Retour au coucher du soleil vers la marina de Humacao',
      'Équipage et capitaine professionnels',
    ],
    whatToBring: [
      'Crème solaire, chapeau, serviette, rechange',
      'Maillot de bain et chaussures à semelles non-marquantes pour le bateau',
    ],
    address: 'Plaza Mayor, Palmas del Mar, Humacao',
    heroTag: 'Navigation · Punta Arena, Vieques',
    photos: [
      '/images/tours/catamaran/CatamaranGroup.png',
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/bathroom-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/catamaran/CatamaranGroup.png',
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/bathroom-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    tripAdvisorProductUrl: 'https://www.tripadvisor.com/AttractionProductReview-g147319-d34092341-Private_Luxury_Sailing_Catamaran_Day_to_Vieques-Puerto_Rico.html',
  },
  {
    slug: 'salsa',
    name: 'Salsa sur le rooftop au coucher du soleil',
    shortName: 'Salsa',
    category: 'Culture · Danse',
    tagColor: '#D4A872',
    thumbBg: '#1E0E08',
    price: 65,
    priceNote: 'par personne, piña colada incluse',
    duration: '2–3h',
    groupSize: 'Ouvert',
    level: 'Débutant',
    includes: 'Piña colada',
    description: "La professeure Zoe initie les débutants absolus sur le rooftop de Casa Santurce au coucher du soleil. Ambiance conviviale, piña colada offerte, vue panoramique sur la ville. Todo suena mejor con salsa.",
    highlights: [
      'Initiation à la salsa de 2 à 3h avec la professeure Zoe',
      'Piña colada offerte à la fin du cours',
      'Coucher de soleil depuis le rooftop de Casa Santurce',
      "Ambiance conviviale, rencontre d'autres voyageurs",
      'Aucune expérience nécessaire',
    ],
    whatToBring: [
      'Chaussures confortables pour bouger',
      'Arrive 10 minutes en avance',
    ],
    address: '1050 Calle Marianna, 00907 San Juan, Casa Santurce Rooftop',
    heroTag: 'Danse · Casa Santurce Rooftop',
    photos: [
      '/images/tours/salsa/salsapic7-hd.jpg',
      '/images/tours/salsa/salsapic5-hd.jpg',
      '/images/tours/salsa/salsapic6-hd.jpg',
      '/images/tours/salsa/salsapic3-hd.jpg',
      '/images/tours/salsa/salsapic8-hd.jpg',
      '/images/tours/salsa/salsasite1-hd.jpg',
      '/images/tours/salsa/salsasite2-hd.jpg',
      '/images/tours/salsa/salsasite3-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/salsa/salsapic3-hd.jpg',
      '/images/tours/salsa/salsapic5-hd.jpg',
      '/images/tours/salsa/salsapic6-hd.jpg',
      '/images/tours/salsa/salsapic7-hd.jpg',
      '/images/tours/salsa/salsapic8-hd.jpg',
      '/images/tours/salsa/salsasite1-hd.jpg',
      '/images/tours/salsa/salsasite2-hd.jpg',
      '/images/tours/salsa/salsasite3-hd.jpg',
    ],
  },
]

export const tours: Tour[] = rawTours.map(t => ({
  ...t,
  bokunProductId: BOKUN_PRODUCT_ID[t.slug],
}))
