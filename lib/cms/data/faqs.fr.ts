import type { FAQ } from '@/lib/types/cms'
import { tours } from './tours.fr.ts'

const priceOf = (slug: string): number => {
  const t = tours.find(x => x.slug === slug)
  if (!t) throw new Error(`tour not found: ${slug}`)
  return t.price
}

/**
 * FAQs générales en français.
 * Parité structurelle avec faqs.en.ts : mêmes ids, mêmes questions
 * (traduites), même ordre.
 * Application du contrat docs/i18n-translation-contract.md :
 *  - Zéro em-dash.
 *  - Tutoiement, voix directe.
 *  - Contractions naturelles ("c'est", "on").
 *  - Noms propres conservés (Casa Venturas, El Yunque, Vieques, Zoe).
 */
export const generalFaqs: FAQ[] = [
  {
    id: 'gen-location',
    question: 'Où se trouve Casa Venturas ?',
    answer: "Casa Venturas est à San Juan, Porto Rico. On propose trois expériences phares : une journée dans la forêt tropicale d'El Yunque, un charter privé en catamaran à Vieques (marina à Humacao) et des cours de salsa au coucher du soleil sur un rooftop à San Juan.",
  },
  {
    id: 'gen-group-size',
    question: 'Quelle est la taille des groupes ?',
    answer: "El Yunque plafonne à 13 personnes par tour. Le catamaran est un charter privé pour 12 personnes max, juste ton groupe. Les cours de salsa sont en groupe ouvert avec une capacité flexible.",
  },
  {
    id: 'gen-pickup',
    question: "Proposez-vous une prise en charge à l'hôtel ?",
    answer: `Oui pour le tour El Yunque. La prise en charge depuis n'importe quel hôtel de la zone San Juan est incluse dans le prix de $${priceOf('el-yunque')} par personne. Pour le catamaran, on peut organiser une prise en charge depuis San Juan sur demande (la marina est à 1h de San Juan, à Humacao). La salsa est en auto-accès sur le rooftop de Casa Santurce à San Juan.`,
  },
  {
    id: 'gen-cancellation',
    question: "Quelle est votre politique d'annulation ?",
    answer: "Annulation gratuite jusqu'à 24h avant le tour. La réservation est directe depuis notre site, sans commission d'agence de voyage en ligne.",
  },
  {
    id: 'gen-tripadvisor',
    question: 'Casa Venturas est-il sur TripAdvisor ?',
    answer: "Oui. Casa Venturas affiche 5.0 étoiles avec 1 458 avis et le rang #10 sur 152 tours à San Juan sur TripAdvisor. On est aussi cités dans les KAYAK Travel Guides.",
  },
  {
    id: 'gen-how-to-book',
    question: 'Comment réserver ?',
    answer: "Réserve directement sur casaventuras.com, remplis le formulaire de réservation sur la page du tour qui t'intéresse. Tu peux aussi écrire à micasaventuras@gmail.com ou WhatsApp au +1 929 372 4529. Les réservations directes t'économisent jusqu'à 25% par rapport à Viator et autres agences.",
  },
  {
    id: 'gen-passport',
    question: 'Faut-il un passeport pour visiter Porto Rico ?',
    answer: "Non. Porto Rico est un territoire américain, donc les citoyens américains ont juste besoin d'une pièce d'identité avec photo (permis de conduire ou carte d'État). Les visiteurs internationaux suivent les mêmes règles que pour entrer aux États-Unis continentaux.",
  },
  {
    id: 'gen-best-time',
    question: 'Quelle est la meilleure période pour visiter Porto Rico ?',
    answer: "De décembre à avril, c'est la saison sèche et plus fraîche, le moment idéal pour El Yunque et le catamaran. La saison des ouragans va de juin à novembre (pic en septembre), mais les tours partent tous les jours sauf tempête nommée active. On propose une reprogrammation flexible si la météo tourne.",
  },
  {
    id: 'gen-mosquitoes',
    question: 'Et les moustiques et le Zika ?',
    answer: "Les moustiques sont les plus actifs d'août à octobre. La transmission du Zika à Porto Rico est proche de zéro depuis des années. Prends un répulsif au DEET pour El Yunque (c'est la jungle, tu en voudras). Le catamaran et le rooftop salsa sont ventilés, peu de moustiques.",
  },
  {
    id: 'gen-safety',
    question: 'San Juan est-il sûr pour les touristes ?',
    answer: "Oui, très sûr. Les zones touristiques comme Vieux San Juan, Condado et Isla Verde sont bien patrouillées. Juste du bon sens : ne laisse pas d'objets de valeur dans la voiture de location, et prends un Uber la nuit. Notre tour El Yunque te prend à ton hôtel et te ramène, donc tu ne navigues seul nulle part.",
  },
  {
    id: 'gen-languages',
    question: 'Vos guides parlent-ils anglais et espagnol ?',
    answer: "Oui, bilingues complets. Tous les tours sont par défaut en anglais, et les guides passent à l'espagnol, au français ou au portugais sur demande. Zoe enseigne la salsa en comptant à la fois en anglais et en espagnol.",
  },
  {
    id: 'gen-tipping',
    question: 'Comment fonctionnent les pourboires ?',
    answer: "Les pourboires sont appréciés mais jamais obligatoires. Les clients qui veulent laisser quelque chose donnent en général 10 à 15% du prix du tour, ou 5 à 10$ par personne, en espèces à la fin du tour. Guides et chauffeurs se partagent les pourboires à parts égales.",
  },
]

/**
 * FAQs par tour, rendues en FAQPage JSON-LD sur chaque page de tour.
 * Sources factuelles : lib/cms/data/tours.en.ts (highlights + whatToBring)
 * et recherche concurrentielle sur les inquiétudes fréquentes par type
 * d'expérience.
 */
export const tourFaqs: Record<string, FAQ[]> = {
  'el-yunque': [
    {
      id: 'ey-fitness',
      question: "Quel niveau physique pour le tour El Yunque ?",
      answer: "Modéré. Le tour inclut une marche sur des sentiers boueux de jungle pour atteindre la rivière et le toboggan naturel. Tu peux passer ton tour sur les sauts de falaise (5, 10-15 ou 20 pieds) à tout moment. Aucune pression pour sauter si tu n'es pas à l'aise.",
    },
    {
      id: 'ey-what-to-bring',
      question: "Quoi apporter pour El Yunque ?",
      answer: "Chaussures d'eau ou vieilles baskets (elles vont se mouiller et s'embourber), une tenue de rechange et un sac étanche, une housse étanche pour le téléphone, de la crème solaire, de l'eau et un petit encas. Un gilet de sauvetage est dispo si tu n'es pas à l'aise à la nage.",
    },
    {
      id: 'ey-kids-seniors',
      question: "El Yunque est-il adapté aux enfants et aux seniors ?",
      answer: "Oui. On a déjà guidé des groupes avec des enfants de 5 ans et des seniors. Nos guides adaptent le rythme et choisissent les spots les plus faciles d'accès. Les avis mentionnent des familles avec des enfants de 5 ans et des seniors qui se sont sentis en sécurité et bien intégrés.",
    },
    {
      id: 'ey-duration',
      question: "Combien de temps dure le tour El Yunque ?",
      answer: "6 à 7 heures au total, incluant la prise en charge à l'hôtel à San Juan, la randonnée guidée en jungle avec commentaires sur l'écosystème, le temps au toboggan naturel et aux sauts de falaise, puis le retour en transport.",
    },
    {
      id: 'ey-why-us',
      question: "Qu'est-ce qui rend El Yunque unique face aux autres forêts tropicales ?",
      answer: "El Yunque est la seule forêt tropicale du système des forêts nationales américaines. Elle abrite des espèces uniques comme le perroquet de Porto Rico, la grenouille coquí et des arbres de 300 ans. On t'emmène dans des coins cachés (toboggan naturel, sauts de falaise, liane) où les gros tours en bus ne vont jamais.",
    },
    {
      id: 'ey-reservation-gov',
      question: "Faut-il une réservation Recreation.gov ?",
      answer: "Non. Quand tu réserves avec nous, tous les permis et frais d'entrée du parc sont inclus. Les visiteurs solo en voiture de location doivent pré-réserver leur créneau sur recreation.gov, mais ça ne s'applique pas aux tours guidés.",
    },
    {
      id: 'ey-cliff-age',
      question: "Y a-t-il un âge minimum pour les sauts de falaise ?",
      answer: "Pas de minimum car les sauts sont toujours optionnels. Les rebords vont de 5 pieds (les enfants peuvent le faire avec leurs parents à côté) jusqu'à 20 pieds (adultes seulement). Tu peux tous les éviter. On a eu des enfants de 5 ans qui ont sauté le plus bas et des grands-parents qui regardaient depuis la rive. Zéro pression dans tous les cas.",
    },
    {
      id: 'ey-rain',
      question: "Qu'est-ce qui se passe s'il pleut ?",
      answer: "Une pluie légère fait partie de l'expérience de la forêt tropicale. Les cascades coulent plus fort et la forêt s'anime. Si une tempête sérieuse ou une alerte de crue éclair est émise, on reprogramme sans frais ou on te rembourse intégralement.",
    },
  ],
  catamaran: [
    {
      id: 'cat-departure',
      question: "D'où part le catamaran ?",
      answer: "Depuis la marina Plaza Mayor, Palmas del Mar à Humacao, environ 1 heure de route de San Juan. Un transport privé depuis San Juan est dispo sur demande au moment de la réservation.",
    },
    {
      id: 'cat-capacity',
      question: "Combien de personnes le catamaran peut-il accueillir ?",
      answer: "Jusqu'à 12 personnes. Le bateau est un catamaran Bali de 40 pieds réservé uniquement à ton groupe, aucun inconnu à bord.",
    },
    {
      id: 'cat-inclusions',
      question: `Qu'est-ce qui est inclus dans le prix de $${priceOf('catamaran')} ?`,
      answer: "Charter privé de journée complète, navigation vers la plage de Punta Arena à Vieques, équipement de natation, snorkel et paddle, retour au coucher du soleil, équipage professionnel avec capitaine.",
    },
    {
      id: 'cat-weather',
      question: "Le catamaran part-il par mauvais temps ?",
      answer: "Le tour part que le ciel soit nuageux ou pluvieux, sauf si les conditions de mer sont dangereuses (alerte tempête, forte houle). Si le capitaine annule pour raison de sécurité, tu es remboursé intégralement ou reprogrammé gratuitement.",
    },
    {
      id: 'cat-seasickness',
      question: "Vais-je avoir le mal de mer ?",
      answer: "La route de Humacao à Vieques est protégée par le Vieques Sound, donc l'eau est plus calme qu'en pleine mer des Caraïbes. Si tu es sujet au mal des transports, prends du Dramamine 30 minutes avant l'embarquement. Les bonbons au gingembre aident aussi, et l'équipage en a souvent à bord.",
    },
    {
      id: 'cat-bathroom',
      question: "Y a-t-il des toilettes à bord ?",
      answer: "Oui. Le catamaran Bali de 40 pieds a une salle de bain privée fermée (toilettes marines) sous le pont.",
    },
    {
      id: 'cat-age-min',
      question: "Quel est l'âge minimum pour le catamaran ?",
      answer: "Les enfants qui marchent sont les bienvenus à tout âge. Pour des raisons de sécurité et d'assurance, les nourrissons de moins de 2 ans ne sont pas autorisés à bord. Des gilets de sauvetage taille enfant sont fournis.",
    },
  ],
  salsa: [
    {
      id: 'sal-experience',
      question: "Faut-il de l'expérience en danse pour le cours de salsa ?",
      answer: "Non. La professeure Zoe est spécialiste des débutants absolus. Le cours t'apprend les premiers pas depuis zéro dans une ambiance conviviale, rien à voir avec un cours formel de studio.",
    },
    {
      id: 'sal-location',
      question: "Où a lieu le cours de salsa ?",
      answer: "Sur le rooftop de Casa Santurce au 1050 Calle Marianna, 00907 San Juan. Vue panoramique sur la ville, brise caribéenne chaude, lumière du coucher de soleil. C'est à 20 minutes en Uber ou taxi du Vieux San Juan.",
    },
    {
      id: 'sal-time',
      question: "À quelle heure commence le cours de salsa ?",
      answer: "Tous les jours à 17h. Le cours dure 2 à 3 heures et inclut une piña colada offerte à la fin pendant que le soleil se couche sur la skyline de San Juan.",
    },
    {
      id: 'sal-wear',
      question: "Quelle tenue pour la salsa ?",
      answer: "Chaussures confortables pour bouger, les baskets c'est très bien, pas besoin de talons. Tenue casual. Arrive 10 minutes en avance.",
    },
    {
      id: 'sal-partner',
      question: "Faut-il venir avec un partenaire de danse ?",
      answer: "Non. La plupart de nos élèves viennent seuls ou entre amis. Zoe fait tourner les partenaires pendant le cours pour que tout le monde danse avec plusieurs personnes. Les couples qui veulent rester ensemble n'ont qu'à le dire à Zoe.",
    },
    {
      id: 'sal-accessibility',
      question: "Le rooftop est-il accessible en fauteuil roulant ?",
      answer: "On accède au rooftop par un ascenseur plus une volée d'escaliers. Si tu as des soucis de mobilité, contacte-nous avant de réserver. On peut organiser un lieu alternatif de plain-pied pour la même soirée.",
    },
    {
      id: 'sal-private',
      question: "Et si je ne peux pas venir au cours quotidien de 17h ?",
      answer: "Des cours privés à horaires flexibles sont dispos sur demande. Même prix, même professeure, et on peut organiser un autre lieu si besoin. Écris-nous pour tout caler.",
    },
  ],
}

/**
 * Lookup plat de toutes les FAQs par id. Utilisé par le matcher d'intents
 * de Cavi pour résoudre un intent keyword-matché vers sa réponse FAQ
 * canonique. Construit au chargement du module.
 */
export const faqById: Record<string, FAQ> = Object.fromEntries(
  [
    ...generalFaqs,
    ...Object.values(tourFaqs).flat(),
  ].map(f => [f.id, f]),
)
