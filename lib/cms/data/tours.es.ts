import type { Tour } from '@/lib/types/cms'

/**
 * Casa Venturas tours , traducción al español (Puerto Rico).
 *
 * Fuente: lib/cms/data/tours.en.ts. Toda modificación debe mantener paridad
 * estructural con la versión EN (mismos slugs, mismos precios, mismas URLs
 * de imágenes). Solo el texto visible cambia.
 *
 * Aplicación del contrato docs/i18n-translation-contract.md :
 *  - Cero em-dashes (,).
 *  - Forma "tú" (directa, tono de bienvenida caribeña).
 *  - Nombres propios conservados (El Yunque, Vieques, Casa Santurce, Zoe).
 *  - Precios en USD conservados tal cual.
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
    name: 'El Yunque, tour vibrante de día',
    shortName: 'El Yunque',
    category: 'Selva · Aventura',
    tagColor: '#72D4A0',
    thumbBg: '#111E14',
    price: 89,
    priceNote: 'por persona, transporte incluido',
    duration: '6–7h',
    groupSize: '≤ 13',
    level: 'Moderado',
    description: 'Toboganes naturales, saltos desde acantilados de 5 a 20 pies, lianas sobre el río y senderos de selva fangosa. Tu guía local te abre la puerta a los rincones escondidos del bosque, con historia y cultura incluidas. Transporte desde tu hotel incluido.',
    highlights: [
      'Tobogán natural tallado en el río del bosque',
      'Saltos desde acantilados de 5, 10–15 y 20 pies al agua cristalina',
      'Liana sobre el río para balancearte',
      'Caminata guiada por la selva con comentario ecológico',
      'Transporte de regreso a tu hotel en San Juan',
      'Fotos del día compartidas por tu guía al final del tour',
    ],
    whatToBring: [
      'Zapatillas de agua o tenis viejos (se van a mojar y embarrar)',
      'Ropa de cambio y una bolsa seca',
      'Funda impermeable para el teléfono (para fotos en el agua)',
      'Protector solar, agua y algo para picar',
      'Hay chalecos salvavidas si no eres nadador seguro',
    ],
    heroTag: 'Selva · Bosque Nacional El Yunque',
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
    name: 'Catamarán privado a Vieques',
    shortName: 'Catamarán',
    category: 'Navegación · Lujo',
    tagColor: '#72C4D4',
    thumbBg: '#0A141E',
    price: 249,
    pricedPerPerson: false,
    priceNote: 'para hasta 12 personas, todo incluido',
    duration: 'Día completo',
    groupSize: '≤ 12',
    level: undefined,
    includes: 'Almuerzo y barra',
    description: 'Sube a bordo de un catamarán Bali de 40 pies y disfruta de una experiencia privada inolvidable por las aguas cristalinas de Vieques. Diseñado para tu comodidad, amplitud y estilo, reservado solo para tu grupo.',
    highlights: [
      'Chárter privado de día completo en catamarán Bali de 40 pies',
      'Navegación a Punta Arena, una de las playas más escondidas de Vieques',
      'Equipo de natación, snorkel y paddleboard',
      'Barra abierta (ron, cerveza, refrescos)',
      'Almuerzo servido en cubierta',
      'Regreso al atardecer a la marina de Humacao',
      'Tripulación profesional y capitán a bordo',
    ],
    whatToBring: [
      'Protector solar, sombrero, toalla, ropa de cambio',
      'Traje de baño y zapatos de suela blanda para el barco',
    ],
    address: 'Plaza Mayor, Palmas del Mar, Humacao',
    heroTag: 'Navegación · Punta Arena, Vieques',
    photos: [
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    tripAdvisorProductUrl: 'https://www.tripadvisor.com/AttractionProductReview-g147319-d34092341-Private_Luxury_Sailing_Catamaran_Day_to_Vieques-Puerto_Rico.html',
  },
  {
    slug: 'salsa',
    name: 'Salsa en la azotea al atardecer',
    shortName: 'Salsa',
    category: 'Cultura · Baile',
    tagColor: '#D4A872',
    thumbBg: '#1E0E08',
    price: 65,
    priceNote: 'por persona, piña colada incluida',
    duration: '2–3h',
    groupSize: 'Abierto',
    level: 'Principiante',
    includes: 'Piña colada',
    description: 'La instructora Zoe enseña los primeros pasos de salsa en la azotea de Casa Santurce al atardecer. Ambiente social y divertido, piña colada gratis, vista panorámica de la ciudad. Todo suena mejor con salsa.',
    highlights: [
      'Iniciación a la salsa de 2–3h con la instructora Zoe',
      'Piña colada gratis al final de la clase',
      'Atardecer desde la azotea de Casa Santurce',
      'Ambiente social, conoce otros viajeros',
      'No se necesita experiencia previa',
    ],
    whatToBring: [
      'Zapatos cómodos para moverte',
      'Llega 10 minutos antes',
    ],
    address: '1050 Calle Marianna, 00907 San Juan, Casa Santurce Rooftop',
    heroTag: 'Baile · Casa Santurce Rooftop',
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
