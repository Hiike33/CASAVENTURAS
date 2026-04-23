import type { FAQ } from '@/lib/types/cms'
import { tours } from './tours.es.ts'

const priceOf = (slug: string): number => {
  const t = tours.find(x => x.slug === slug)
  if (!t) throw new Error(`tour not found: ${slug}`)
  return t.price
}

/**
 * FAQs generales en español.
 * Paridad estructural con faqs.en.ts: mismos ids, mismas preguntas (traducidas).
 * Aplicación del contrato docs/i18n-translation-contract.md :
 *  - Cero em-dashes.
 *  - Forma "tú" directa.
 *  - Contracciones naturales ("es nuestro" no "es de nosotros").
 *  - Nombres propios conservados (Casa Venturas, El Yunque, Vieques, Zoe, etc.).
 */
export const generalFaqs: FAQ[] = [
  {
    id: 'gen-location',
    question: '¿Dónde está Casa Venturas?',
    answer: 'Casa Venturas está en San Juan, Puerto Rico. Ofrecemos tres experiencias principales: un tour de día por el bosque El Yunque, un chárter privado en catamarán a Vieques (marina en Humacao) y clases de salsa al atardecer en una azotea de San Juan.',
  },
  {
    id: 'gen-group-size',
    question: '¿Qué tan pequeños son los grupos?',
    answer: 'El Yunque tiene un máximo de 13 personas. El catamarán es un chárter privado para hasta 12 personas, solo tu grupo. Las clases de salsa son de grupo abierto con capacidad flexible.',
  },
  {
    id: 'gen-pickup',
    question: '¿Incluyen recogida en el hotel?',
    answer: `Sí para el tour de El Yunque. La recogida desde cualquier hotel de San Juan está incluida en el precio de $${priceOf('el-yunque')}/persona. La recogida para el catamarán desde San Juan se puede coordinar bajo petición (la marina queda a 1h de San Juan, en Humacao). La salsa es acceso libre en la azotea de Casa Santurce en San Juan.`,
  },
  {
    id: 'gen-cancellation',
    question: '¿Cuál es la política de cancelación?',
    answer: 'Cancelación gratis hasta 24 horas antes del tour. La reserva es directa desde nuestra web, sin comisiones de OTAs.',
  },
  {
    id: 'gen-tripadvisor',
    question: '¿Casa Venturas está en TripAdvisor?',
    answer: 'Sí. Casa Venturas tiene 5.0 estrellas con 1,458 reseñas, ocupa el #10 de 152 Tours en San Juan y el #1 de 99 Servicios de Transporte en San Juan según TripAdvisor. También aparecemos destacados en las guías de viaje de KAYAK.',
  },
  {
    id: 'gen-how-to-book',
    question: '¿Cómo reservo?',
    answer: 'Reserva directo en casaventuras.com, completa el formulario en la página del tour que quieres. También puedes escribirnos a micasaventuras@gmail.com o por WhatsApp al +1 929 372 4529. Reservar directo te ahorra hasta un 25% frente a OTAs como Viator.',
  },
  {
    id: 'gen-passport',
    question: '¿Necesito pasaporte para visitar Puerto Rico?',
    answer: 'No. Puerto Rico es un territorio de EE.UU., así que los ciudadanos estadounidenses solo necesitan una identificación oficial con foto (licencia de conducir o ID estatal). Los visitantes internacionales siguen las mismas reglas que para entrar a EE.UU. continental.',
  },
  {
    id: 'gen-best-time',
    question: '¿Cuándo es la mejor época para visitar Puerto Rico?',
    answer: 'De diciembre a abril es la temporada seca y fresca, el momento ideal para El Yunque y el catamarán. La temporada de huracanes va de junio a noviembre (pico en septiembre), pero los tours salen a diario salvo que haya una tormenta con nombre activa. Ofrecemos reprogramación flexible si el clima cambia.',
  },
  {
    id: 'gen-mosquitoes',
    question: '¿Qué pasa con los mosquitos y el Zika?',
    answer: 'Los mosquitos son más activos de agosto a octubre. La transmisión del Zika en Puerto Rico ha sido casi nula desde hace años. Trae repelente con DEET para El Yunque (es una selva, lo vas a querer). El catamarán y la azotea de salsa son ambientes ventilados, con muy pocos mosquitos.',
  },
  {
    id: 'gen-safety',
    question: '¿Es San Juan seguro para los turistas?',
    answer: 'Sí, muy seguro. Las zonas turísticas como el Viejo San Juan, Condado e Isla Verde están bien patrulladas. Usa el sentido común: no dejes objetos de valor en el carro de alquiler y pide un Uber de noche. Nuestro tour de El Yunque te recoge en tu hotel y te deja ahí mismo, así que nunca tienes que navegar por tu cuenta.',
  },
  {
    id: 'gen-languages',
    question: '¿Los guías hablan inglés y español?',
    answer: 'Sí, totalmente bilingües. Todos los tours van por defecto en inglés, y los guías cambian al español, francés o portugués cuando lo pides. Zoe da la clase de salsa con conteos en inglés y español.',
  },
  {
    id: 'gen-tipping',
    question: '¿Cómo funciona la propina?',
    answer: 'La propina se agradece pero nunca es obligatoria. Quienes quieren dar propina suelen dejar entre 10 y 15% del precio del tour, o $5 a $10 por persona, en efectivo al final. Los guías y los conductores reparten las propinas en partes iguales.',
  },
]

/**
 * FAQs por tour (traducción ES).
 * Renderizadas como JSON-LD FAQPage en cada página de tour ES.
 */
export const tourFaqs: Record<string, FAQ[]> = {
  'el-yunque': [
    {
      id: 'ey-fitness',
      question: '¿Qué nivel físico requiere el tour de El Yunque?',
      answer: 'Moderado. El tour incluye una caminata por senderos embarrados hasta llegar al río y al tobogán natural. Puedes saltarte los saltos desde los acantilados (5, 10–15 o 20 pies) en cualquier momento. No hay presión para saltar desde donde no te sientas cómodo.',
    },
    {
      id: 'ey-what-to-bring',
      question: '¿Qué debo llevar para El Yunque?',
      answer: 'Zapatos de agua o tenis viejos (se van a mojar y embarrar), ropa de cambio y una bolsa seca, funda impermeable para el teléfono, protector solar, agua y algo para picar. Hay chaleco salvavidas disponible si no eres nadador seguro.',
    },
    {
      id: 'ey-kids-seniors',
      question: '¿El Yunque es apto para niños y adultos mayores?',
      answer: 'Sí. Hemos guiado grupos con niños de 5 años y adultos mayores. Los guías ajustan el ritmo y eligen puntos de acceso más fácil. Las reseñas mencionan familias con niños de 5 años y abuelos que se sienten seguros e incluidos.',
    },
    {
      id: 'ey-duration',
      question: '¿Cuánto dura el tour de El Yunque?',
      answer: 'De 6 a 7 horas en total, incluyendo la recogida en tu hotel de San Juan, la caminata guiada por la selva con comentario ecológico, el tiempo en el tobogán natural y los saltos, y el regreso en transporte.',
    },
    {
      id: 'ey-why-us',
      question: '¿Qué hace especial a El Yunque frente a otros tours de selva?',
      answer: 'El Yunque es la única selva tropical del sistema de Bosques Nacionales de EE.UU. Alberga especies únicas como el loro puertorriqueño, el coquí y árboles de 300 años. Te llevamos a rincones escondidos (el tobogán natural, los saltos, la liana) a los que no llegan los tours grandes en autobús.',
    },
    {
      id: 'ey-reservation-gov',
      question: '¿Necesito una reservación en Recreation.gov?',
      answer: 'No. Cuando reservas con nosotros, todos los permisos y tarifas del parque están incluidos. Los visitantes que entran solos en carro de alquiler tienen que reservar su acceso en recreation.gov, pero eso no aplica a los tours guiados.',
    },
    {
      id: 'ey-cliff-age',
      question: '¿Hay una edad mínima para los saltos de acantilado?',
      answer: 'No hay edad mínima porque los saltos son siempre opcionales. Las plataformas van desde 5 pies (los niños pueden saltarla con sus papás al lado) hasta 20 pies (solo adultos). Puedes saltarte cualquiera o todas. Hemos tenido niños de 5 años saltando el más bajo y abuelos viendo desde la orilla del río. Cero presión en ambos lados.',
    },
    {
      id: 'ey-rain',
      question: '¿Qué pasa si llueve?',
      answer: 'La lluvia ligera es parte de la experiencia en la selva. Las cascadas fluyen con más fuerza y el bosque cobra vida. Si hay una tormenta fuerte o un aviso de inundación repentina, reprogramamos sin costo o te devolvemos el dinero completo.',
    },
  ],
  catamaran: [
    {
      id: 'cat-departure',
      question: '¿De dónde sale el catamarán?',
      answer: 'Desde Plaza Mayor, la marina de Palmas del Mar en Humacao, a 1 hora en carro de San Juan. El transporte privado desde San Juan se puede coordinar bajo petición al momento de reservar.',
    },
    {
      id: 'cat-capacity',
      question: '¿Cuánta gente cabe en el catamarán?',
      answer: 'Hasta 12 personas. El barco es un catamarán Bali de 40 pies reservado en exclusiva para tu grupo, sin desconocidos a bordo.',
    },
    {
      id: 'cat-inclusions',
      question: `¿Qué incluye el precio de $${priceOf('catamaran')} por persona?`,
      answer: 'Chárter privado de día completo, navegación a la playa Punta Arena en Vieques, equipo de natación, snorkel y paddleboard, regreso al atardecer y tripulación profesional con capitán.',
    },
    {
      id: 'cat-weather',
      question: '¿El catamarán sale con mal tiempo?',
      answer: 'El tour sale aunque esté nublado o llueva, salvo que las condiciones del mar sean inseguras (aviso de tormenta, oleaje alto). Si el capitán cancela por seguridad, recibes reembolso completo o reprogramación gratis.',
    },
    {
      id: 'cat-seasickness',
      question: '¿Me voy a marear?',
      answer: 'La ruta de Humacao a Vieques está protegida por el Vieques Sound, así que el agua está más tranquila que en el Caribe abierto. Si te mareas fácilmente, toma Dramamine 30 minutos antes de embarcar. Los caramelos de jengibre también ayudan, y la tripulación suele tener a bordo.',
    },
    {
      id: 'cat-bathroom',
      question: '¿Hay baño a bordo?',
      answer: 'Sí. El catamarán Bali de 40 pies tiene un baño marino privado y cerrado en la cubierta inferior.',
    },
    {
      id: 'cat-age-min',
      question: '¿Cuál es la edad mínima para el catamarán?',
      answer: 'Los niños que ya caminan son bienvenidos. Por razones de seguridad y seguro, los bebés menores de 2 años no pueden subir a bordo. Proporcionamos chalecos salvavidas en tallas de niño.',
    },
  ],
  salsa: [
    {
      id: 'sal-experience',
      question: '¿Necesito experiencia de baile para la clase de salsa?',
      answer: 'No. La instructora Zoe se especializa en principiantes absolutos. La clase te enseña los primeros pasos desde cero, en un ambiente divertido y social, nada parecido a una clase formal de estudio.',
    },
    {
      id: 'sal-location',
      question: '¿Dónde se dicta la clase de salsa?',
      answer: 'En la azotea de Casa Santurce, en 1050 Calle Marianna, 00907 San Juan. Vista panorámica de la ciudad, brisa caribeña y luz de atardecer. Queda a 20 minutos en Uber o taxi desde el Viejo San Juan.',
    },
    {
      id: 'sal-time',
      question: '¿A qué hora empieza la clase de salsa?',
      answer: 'Todos los días a las 5 PM. La clase dura 2 a 3 horas e incluye una piña colada gratis al final mientras el sol se esconde sobre el skyline de San Juan.',
    },
    {
      id: 'sal-wear',
      question: '¿Qué debo vestir para la salsa?',
      answer: 'Zapatos cómodos para moverte. Los tenis funcionan, no se necesitan tacones. Ropa casual. Llega 10 minutos antes.',
    },
    {
      id: 'sal-partner',
      question: '¿Tengo que llevar pareja de baile?',
      answer: 'No. La mayoría de los estudiantes llegan solos o con amigos. Zoe rota las parejas durante la clase para que todos bailen con varias personas. Si vienes en pareja y quieres quedarte con ella, solo avísale a Zoe.',
    },
    {
      id: 'sal-accessibility',
      question: '¿La azotea es accesible en silla de ruedas?',
      answer: 'A la azotea se llega por un ascensor y un tramo de escaleras. Si tienes alguna condición de movilidad, escríbenos antes de reservar. Podemos coordinar una sede alternativa a nivel de calle para la misma noche.',
    },
    {
      id: 'sal-private',
      question: '¿Qué pasa si no puedo ir a la clase de las 5 PM?',
      answer: 'Hay clases privadas en horarios flexibles bajo petición. Mismo precio, misma instructora, y podemos coordinar una sede distinta si hace falta. Escríbenos para organizarlo.',
    },
  ],
}

export const faqById: Record<string, FAQ> = Object.fromEntries(
  [
    ...generalFaqs,
    ...Object.values(tourFaqs).flat(),
  ].map(f => [f.id, f]),
)
