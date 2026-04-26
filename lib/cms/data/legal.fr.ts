import type { LegalPage } from '@/lib/types/cms'

const email = 'micasaventuras@gmail.com'
const phone = '+1 929 372 4529'
const siteUrl = 'https://casaventuras.com'

/**
 * Pages légales en français (confidentialité, CGV, cookies).
 * Parité structurelle avec legal.en.ts : mêmes numéros de section,
 * même nombre de blocks par section, mêmes URLs et constantes.
 *
 * Application du contrat docs/i18n-translation-contract.md :
 *  - Zéro em-dash.
 *  - Vouvoiement (contexte légal formel, pas tutoiement ici).
 *  - Noms officiels de lois conservés (Act 39, CalOPPA, GDPR,
 *    COPPA, CCPA / CPRA, PECR, Ley 111-2005).
 *  - Articles juridiques conservés (Art. 6(1)(b), Art. 20, Art. 33).
 *  - Noms propres d'entreprises conservés (Bókun, Anthropic, Resend,
 *    Cloudflare, TripAdvisor, Viator, GetYourGuide, Airbnb).
 */

export const privacy: LegalPage = {
  lastUpdated: '2026-04-18',
  metaDescription:
    'Comment Casa Venturas collecte, utilise et protège vos données personnelles. Conforme aux Act 39 et Act 111-2005 de Porto Rico, CalOPPA et RGPD.',
  introHtml: `Casa Venturas (« nous ») exploite ${siteUrl} et propose des tours en petit groupe à Porto Rico. Cette politique explique quelles données personnelles nous collectons, pourquoi, comment nous les protégeons et quels sont vos droits. Elle est conçue pour respecter le Puerto Rico Act 39 (notification de politique de confidentialité) et le Act 111-2005 (sécurité des banques de données des citoyens), le California Online Privacy Protection Act (CalOPPA) et le Règlement Général sur la Protection des Données (RGPD) de l'UE pour les visiteurs de l'Espace économique européen.`,
  sections: [
    {
      n: '1',
      title: 'Qui nous sommes',
      blocks: [
        { kind: 'p', html: `Casa Venturas, San Juan, Porto Rico. ${email}, ${phone}. Nous sommes le responsable du traitement des données collectées via ce site.` },
      ],
    },
    {
      n: '2',
      title: 'Données que nous collectons',
      blocks: [
        {
          kind: 'ul',
          items: [
            "<strong>Données de réservation</strong> : nom, email, téléphone, date du tour, nombre de personnes. Transmises via notre formulaire de réservation et traitées par Bókun (notre moteur de réservation).",
            "<strong>Formulaire de contact</strong> : nom, email, message.",
            "<strong>Chat avec Cavi (guide AI)</strong> : le contenu de votre conversation, traité par Anthropic (Claude API) pour générer les réponses. Les transcriptions sont conservées jusqu'à 90 jours pour contrôle qualité, puis supprimées.",
            "<strong>Données techniques</strong> : adresse IP, type de navigateur, pages visitées. Collectées automatiquement par notre hébergeur (Cloudflare) pour la sécurité et la performance.",
          ],
        },
        { kind: 'p', html: "Nous ne vendons <strong>jamais</strong> vos données personnelles. Nous n'utilisons ni cookies publicitaires ni traceurs inter-sites." },
      ],
    },
    {
      n: '3',
      title: 'Pourquoi nous les collectons (base légale)',
      blocks: [
        {
          kind: 'ul',
          items: [
            "Pour confirmer et opérer votre tour (exécution du contrat, art. 6(1)(b) RGPD).",
            "Pour répondre aux questions envoyées via notre formulaire de contact ou le chat (intérêt légitime).",
            "Pour respecter les obligations fiscales et touristiques de Porto Rico (obligation légale).",
            "Pour protéger le site contre la fraude et les abus (intérêt légitime).",
          ],
        },
      ],
    },
    {
      n: '4',
      title: 'Avec qui nous les partageons (sous-traitants)',
      blocks: [
        { kind: 'p', html: "Nous nous appuyons sur un petit nombre de prestataires de confiance qui traitent les données strictement selon nos instructions :" },
        {
          kind: 'ul',
          items: [
            "<strong>Bókun</strong> (filiale TripAdvisor), moteur de réservation et traitement des paiements (conforme PCI-DSS). Bókun agit en tant que sous-traitant dans le cadre d'un Data Processing Agreement signé.",
            "<strong>Anthropic, PBC</strong>, API Claude qui alimente notre assistant de chat Cavi. Anthropic n'entraîne pas ses modèles sur les données clients.",
            "<strong>Resend</strong>, envoi d'emails transactionnels (confirmations de réservation, réponses aux messages de contact).",
            "<strong>Cloudflare</strong>, hébergement du site, CDN et protection DDoS.",
          ],
        },
        { kind: 'p', html: "Si vous réservez un de nos tours via une plateforme tierce (Viator, TripAdvisor Experiences, GetYourGuide, Airbnb Experiences), cette plateforme est le responsable du traitement pour vos données de réservation. Leurs propres politiques de confidentialité s'appliquent à ces transactions, nous recevons uniquement les informations nécessaires à l'exécution du tour." },
      ],
    },
    {
      n: '5',
      title: 'Durée de conservation',
      blocks: [
        {
          kind: 'ul',
          items: [
            "Dossiers de réservation : 7 ans (obligation fiscale US).",
            "Messages du formulaire de contact : jusqu'à 2 ans.",
            "Transcriptions de chat : jusqu'à 90 jours.",
            "Logs serveur : jusqu'à 30 jours.",
          ],
        },
      ],
    },
    {
      n: '6',
      title: 'Vos droits',
      blocks: [
        { kind: 'p', html: "Vous disposez des droits suivants :" },
        {
          kind: 'ul',
          items: [
            "Accéder aux données personnelles que nous détenons à votre sujet.",
            "Nous demander de les corriger ou de les supprimer.",
            "Vous opposer à tout envoi marketing futur (nous n'en envoyons pas actuellement).",
            "Recevoir vos données dans un format portable (art. 20 RGPD).",
            "Déposer une plainte auprès d'une autorité de protection des données (par exemple DACO à Porto Rico, ou votre autorité locale en UE).",
          ],
        },
        { kind: 'p', html: `Pour exercer l'un de ces droits, écrivez à <a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>. Nous répondons sous 30 jours. Les résidents de Californie peuvent demander un opt-out « Do Not Sell or Share » ; à noter que nous ne vendons ni ne partageons de données personnelles à des fins publicitaires.` },
        { kind: 'p', html: "Nous respectons les signaux « Do Not Track » du navigateur : nous n'utilisons pas de cookies de suivi inter-sites, aucune action supplémentaire n'est donc nécessaire au-delà de notre collecte minimale de base." },
      ],
    },
    {
      n: '7',
      title: 'Sécurité des données et notification des violations',
      blocks: [
        { kind: 'p', html: "Toutes les données sont transmises en HTTPS et stockées sous forme chiffrée par nos sous-traitants. En cas de violation de sécurité affectant les données personnelles de résidents de Porto Rico, nous notifierons les personnes concernées et le Puerto Rico Department of Consumer Affairs (DACO) dans les dix (10) jours suivant la détection, conformément au Act 111-2005. Pour les résidents UE, nous notifierons également l'autorité de contrôle compétente dans les 72 heures, conformément à l'article 33 du RGPD." },
      ],
    },
    {
      n: '8',
      title: 'Transferts internationaux',
      blocks: [
        { kind: 'p', html: "Certains de nos sous-traitants (Bókun, Anthropic, Resend, Cloudflare) sont basés aux États-Unis. Si vous résidez dans l'Espace économique européen, au Royaume-Uni ou en Suisse, vos données peuvent être transférées et traitées aux États-Unis dans le cadre des Clauses Contractuelles Types (CCT) approuvées par la Commission européenne." },
      ],
    },
    {
      n: '9',
      title: 'Enfants',
      blocks: [
        { kind: 'p', html: "Nos services ne sont pas destinés aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données personnelles auprès d'enfants de moins de 13 ans (COPPA, 15 U.S.C. 6501-6506). Les tours qui accueillent des enfants (El Yunque, Catamaran) exigent qu'un parent ou tuteur légal effectue la réservation et accompagne le mineur." },
      ],
    },
    {
      n: '10',
      title: 'Modifications de cette politique',
      blocks: [
        { kind: 'p', html: "Nous pouvons mettre à jour cette politique de temps en temps. La date « Dernière mise à jour » en haut de la page reflète la révision la plus récente. Pour toute modification substantielle, nous publierons un avis sur cette page au moins 30 jours avant la prise d'effet." },
      ],
    },
    {
      n: '11',
      title: 'Contact',
      blocks: [
        { kind: 'p', html: `Questions sur cette politique ou vos données personnelles :<br />Casa Venturas, San Juan, Porto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}

export const terms: LegalPage = {
  lastUpdated: '2026-04-18',
  metaDescription:
    "Conditions générales pour réserver des tours directement sur casaventuras.com. Politique d'annulation, responsabilité, conduite et loi applicable (Commonwealth de Porto Rico).",
  introHtml: `Les présentes conditions de service (« Conditions ») régissent votre utilisation de ${siteUrl} et tout tour réservé directement via ce site. En réservant un tour ou en soumettant une demande via notre site, vous acceptez d'être lié par ces Conditions. Si vous n'êtes pas d'accord, merci de ne pas réserver.`,
  sections: [
    {
      n: '1',
      title: 'Portée et canaux de réservation',
      blocks: [
        { kind: 'p', html: `Ces Conditions s'appliquent exclusivement aux réservations effectuées directement sur ${siteUrl}. Les réservations passées via des plateformes tierces comme Viator, TripAdvisor Experiences, GetYourGuide ou Airbnb Experiences sont régies par les conditions générales de ces plateformes respectives. Toutefois, les règles sur site concernant la sécurité, la conduite, la responsabilité et l'exécution du tour (sections 5, 7 et 8 ci-dessous) s'appliquent à <strong>tous les participants</strong>, quel que soit le canal de réservation.` },
      ],
    },
    {
      n: '2',
      title: 'Opérateur',
      blocks: [
        { kind: 'p', html: `Les tours sont opérés par Casa Venturas, basée à San Juan, Porto Rico. Contact : <a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}.` },
      ],
    },
    {
      n: '3',
      title: 'Réservation et paiement',
      blocks: [
        { kind: 'p', html: "Les réservations directes sur ce site sont traitées par Bókun, notre moteur de réservation et prestataire de paiement conforme PCI-DSS (filiale TripAdvisor). Le paiement est requis pour confirmer une réservation. Les prix sont affichés en dollars américains et incluent toutes les taxes applicables selon la loi de Porto Rico sauf mention contraire. Les descriptions de tour, photos et points forts sont illustratifs ; les conditions réelles (météo, niveau d'eau, observations de faune) varient et ne constituent pas un motif de remboursement sauf annulation du tour lui-même." },
      ],
    },
    {
      n: '4',
      title: 'Annulation et modifications',
      blocks: [
        {
          kind: 'ul',
          items: [
            "<strong>Annulation gratuite</strong> jusqu'à 24 heures avant l'heure de départ prévue, remboursement intégral.",
            "<strong>Moins de 24 heures</strong> avant le départ : pas de remboursement, mais une reprogrammation peut être possible selon disponibilité.",
            "<strong>Absence (no-show)</strong> : pas de remboursement.",
            "<strong>Annulation de notre part</strong> : si nous annulons le tour (météo dangereuse, conditions de mer, force majeure), vous recevez un remboursement intégral ou une reprogrammation gratuite à votre choix.",
          ],
        },
        { kind: 'p', html: "Les remboursements sont effectués sur le mode de paiement d'origine sous 10 jours ouvrés." },
      ],
    },
    {
      n: '5',
      title: 'Acceptation des risques et responsabilité',
      blocks: [
        { kind: 'p', html: "Nos tours impliquent une activité physique en environnement naturel extérieur et comportent des risques inhérents, notamment :" },
        {
          kind: 'ul',
          items: [
            "<strong>El Yunque</strong> : sentiers glissants, courants de rivière, sauts de falaise de 5 à 20 pieds, rencontres avec la faune, météo variable.",
            "<strong>Catamaran vers Vieques</strong> : navigation en eau libre, baignade, snorkel, exposition au soleil, mal de mer.",
            "<strong>Salsa Rooftop</strong> : effort physique, conditions de la piste de danse.",
          ],
        },
        { kind: 'p', html: "En participant, vous reconnaissez et acceptez volontairement ces risques. Vous confirmez que vous et chaque participant de votre groupe êtes en condition physique adéquate pour participer. Dans la mesure maximale permise par les lois du Commonwealth de Porto Rico, Casa Venturas, ses guides, prestataires et partenaires ne seront pas responsables des blessures, maladies, pertes ou dommages résultant de la participation, sauf en cas de faute lourde ou de comportement volontairement préjudiciable de notre part. Des décharges spécifiques à l'activité peuvent être exigées sur site avant le début du tour." },
      ],
    },
    {
      n: '6',
      title: 'Mineurs',
      blocks: [
        { kind: 'p', html: "Les participants de moins de 18 ans doivent être accompagnés d'un parent ou tuteur légal, qui est responsable du mineur pendant toute la durée du tour. Les tours El Yunque et Catamaran accueillent les enfants dès 5 ans ; Salsa Rooftop est réservé aux 18 ans et plus (de l'alcool est servi). Le responsable qui réserve donne son consentement exprès au nom de tout mineur du groupe sur ces Conditions, y compris l'acceptation des risques de la section 5." },
      ],
    },
    {
      n: '7',
      title: 'Météo et force majeure',
      blocks: [
        { kind: 'p', html: "Les tours partent par beau temps comme sous la pluie. Le capitaine (catamaran) ou guide principal (El Yunque, Salsa) a seul pouvoir d'annuler, raccourcir ou modifier tout tour pour raisons de sécurité, notamment : tempêtes tropicales, ouragans, forte houle, crues éclair, incendies, restrictions pandémiques et actes d'autorité. Ces cas ouvrent droit, selon la section 4, à un remboursement intégral ou une reprogrammation." },
      ],
    },
    {
      n: '8',
      title: 'Conduite',
      blocks: [
        { kind: 'p', html: "Nous nous réservons le droit de refuser le service à, ou d'exclure du tour sans remboursement, tout participant qui :" },
        {
          kind: 'ul',
          items: [
            "Se présente manifestement en état d'ébriété ou sous l'influence de drogues au début du tour.",
            "Se comporte de façon à mettre en danger lui-même, les autres participants, les guides ou l'environnement.",
            "Harcèle ou menace un guide, un participant ou un tiers.",
            "Refuse de suivre les consignes de sécurité du guide ou du capitaine.",
          ],
        },
      ],
    },
    {
      n: '9',
      title: 'Photos et vidéos',
      blocks: [
        { kind: 'p', html: "Nos guides peuvent prendre des photos et vidéos pendant les tours pour usage marketing et réseaux sociaux. Si vous préférez ne pas y apparaître, dites-le à votre guide avant le début du tour, nous respecterons votre demande. Vous conservez tous les droits sur les photos et vidéos que vous prenez vous-même ; nous vous demandons de taguer <strong>@casaventuras</strong> si vous partagez publiquement." },
      ],
    },
    {
      n: '10',
      title: 'Assurance',
      blocks: [
        { kind: 'p', html: "Une assurance voyage est fortement recommandée. Casa Venturas dispose de la couverture de responsabilité civile requise par la loi de Porto Rico mais n'est pas responsable des objets personnels perdus ou endommagés pendant le tour, ni des frais médicaux résultant de la participation." },
      ],
    },
    {
      n: '11',
      title: 'Propriété intellectuelle',
      blocks: [
        { kind: 'p', html: `Tout le contenu de ${siteUrl} (texte, images, vidéos, logo, descriptions de tour) est la propriété de Casa Venturas ou utilisé avec autorisation. Vous ne pouvez ni le reproduire, ni le republier, ni l'utiliser commercialement sans notre accord écrit préalable.` },
      ],
    },
    {
      n: '12',
      title: 'Loi applicable et juridiction',
      blocks: [
        { kind: 'p', html: "Ces Conditions sont régies par les lois du Commonwealth de Porto Rico, sans tenir compte des principes de conflits de lois. Tout litige découlant de ou lié à ces Conditions ou à une réservation de tour sera porté exclusivement devant les tribunaux de San Juan, Porto Rico. Pour les consommateurs résidant dans l'Union européenne, ce choix de juridiction ne vous prive pas de la protection du droit impératif de la consommation de votre pays de résidence." },
      ],
    },
    {
      n: '13',
      title: 'Modifications de ces Conditions',
      blocks: [
        { kind: 'p', html: "Nous pouvons mettre à jour ces Conditions de temps en temps. La date « Dernière mise à jour » en haut de la page reflète la révision la plus récente. Les réservations sont soumises aux Conditions en vigueur au moment de la réservation." },
      ],
    },
    {
      n: '14',
      title: 'Contact',
      blocks: [
        { kind: 'p', html: `Questions sur ces Conditions :<br />Casa Venturas, San Juan, Porto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}

export const cookies: LegalPage = {
  lastUpdated: '2026-04-26',
  metaDescription:
    "Comment Casa Venturas utilise les cookies et technologies similaires. Cookies strictement nécessaires pour la sécurité, cookies Google Analytics optionnels après consentement explicite, et cookies du widget Bókun activés à l'interaction.",
  introHtml: `Cette politique cookies explique comment Casa Venturas et ses prestataires tiers utilisent les cookies et technologies similaires lorsque vous visitez ${siteUrl}. Elle complète notre <a href="/privacy" class="text-[#248D6C] hover:underline">politique de confidentialité</a>.`,
  sections: [
    {
      n: '1',
      title: 'Ce que sont les cookies',
      blocks: [
        { kind: 'p', html: "Les cookies sont de petits fichiers texte stockés sur votre appareil par votre navigateur quand vous visitez un site web. Ils permettent à un site de mémoriser des informations entre les pages ou sessions : un jeton de connexion, un choix de langue, une étape de réservation. Les technologies similaires incluent localStorage, sessionStorage et les pixels ; nous les traitons toutes de la même façon dans cette politique." },
      ],
    },
    {
      n: '2',
      title: 'Cookies que nous déposons directement',
      blocks: [
        {
          kind: 'ul',
          items: [
            "<strong>Analyse, uniquement après consentement</strong> : lorsque vous cliquez sur <em>Accepter</em> dans la bannière cookies, nous activons Google Analytics 4 (ID de mesure <code class=\"bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]\">G-02DN83KF2B</code>) qui dépose des cookies nommés <code class=\"bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]\">_ga</code> et <code class=\"bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]\">_ga_*</code> dans votre navigateur pour compter les visites et comprendre comment les visiteurs trouvent le site. Les IP sont anonymisées. Conservation : 14 mois. Si vous cliquez sur <em>Refuser</em> ou n'interagissez pas avec la bannière, aucun cookie GA n'est déposé et seuls des pings cookieless agrégés (sans identifiant) sont envoyés. Vous pouvez changer d'avis à tout moment en effaçant le stockage du navigateur pour ce site afin de réafficher la bannière.",
            "<strong>État du consentement</strong> : une seule entrée <em>localStorage</em> <code class=\"bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]\">cv-analytics-consent</code> mémorise votre décision pour que la bannière ne réapparaisse pas à chaque page. Ce n'est pas un cookie et il n'est envoyé à aucun serveur.",
            "<strong>Chat avec Cavi (en session)</strong> : le <em>localStorage</em> du navigateur conserve votre conversation avec Cavi (notre guide AI) le temps d'un onglet, supprimé automatiquement à la fermeture.",
          ],
        },
      ],
    },
    {
      n: '3',
      title: "Cookies strictement nécessaires (déposés par notre hébergeur)",
      blocks: [
        { kind: 'p', html: `Cloudflare, qui héberge et protège ${siteUrl}, peut déposer un petit nombre de cookies strictement nécessaires tels que <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">__cf_bm</code> (atténuation des bots) et <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">cf_clearance</code> (anti-abus). Ils existent uniquement pour la sécurité et l'intégrité du site. Ils ne vous identifient pas personnellement, ne vous suivent pas sur d'autres sites, et ne peuvent pas être désactivés sans casser le site.` },
      ],
    },
    {
      n: '4',
      title: 'Cookies tiers (partenaire de réservation)',
      blocks: [
        { kind: 'p', html: "Lorsque vous interagissez avec un widget de réservation, une fenêtre de paiement ou un calendrier de disponibilités sur nos pages de tour, le widget est servi par Bókun (filiale TripAdvisor) depuis <code class=\"bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]\">widgets.bokun.io</code>. Bókun peut déposer des cookies sur son propre domaine pour mémoriser votre date sélectionnée, le nombre de personnes et la session de paiement. Ces cookies sont régis par les politiques de confidentialité et de cookies de Bókun, pas les nôtres. Nous ne recevons aucun identifiant persistant de Bókun au-delà de la référence de réservation elle-même." },
      ],
    },
    {
      n: '5',
      title: "Ce que nous n'utilisons pas",
      blocks: [
        {
          kind: 'ul',
          items: [
            "Pas de Google Ads, pas d'audiences de remarketing, pas de DoubleClick.",
            "Pas de Meta Pixel, pas de suivi Facebook.",
            "Pas de réseaux publicitaires, pas de cookies de reciblage.",
            "Pas d'enregistrement de session (Hotjar, FullStory, etc.).",
            "Aucun suivi inter-sites, aucun fingerprinting.",
          ],
        },
      ],
    },
    {
      n: '6',
      title: 'Vos choix',
      blocks: [
        {
          kind: 'ul',
          items: [
            "<strong>Paramètres du navigateur</strong> : tout navigateur moderne permet de bloquer ou supprimer les cookies par site. Comme nous ne comptons pas sur les cookies propriétaires pour les fonctionnalités essentielles, les bloquer ne casse pas le site.",
            "<strong>Do Not Track (DNT)</strong> : nous respectons le signal DNT. Puisque nous n'exécutons déjà aucun suivi inter-sites, DNT est effectivement toujours actif pour nos données propriétaires.",
            "<strong>Global Privacy Control (GPC)</strong> : nous respectons les signaux GPC et les traitons comme un opt-out valide pour les résidents de Californie au titre du CCPA / CPRA.",
            "<strong>Cookies tiers Bókun</strong> : pour les bloquer, vous pouvez soit éviter d'interagir avec les widgets de réservation, soit configurer votre navigateur pour bloquer les cookies tiers globalement.",
          ],
        },
      ],
    },
    {
      n: '7',
      title: 'Résidents UE / EEE / Royaume-Uni',
      blocks: [
        { kind: 'p', html: "Pour les visiteurs de l'Espace économique européen, du Royaume-Uni ou de Suisse : seuls les cookies <em>strictement nécessaires</em> (sécurité Cloudflare) sont déposés sans consentement. Google Analytics est chargé avec le <strong>Consent Mode v2</strong> de Google en état <em>refusé</em> par défaut. Aucun cookie analytique n'est écrit tant que vous n'avez pas cliqué sur <em>Accepter</em> dans la bannière. Les cookies tiers Bókun ne sont déposés que lorsque vous interagissez activement avec un widget de réservation, ce qui est considéré comme un consentement par action au sens de la directive ePrivacy. Vous pouvez retirer votre consentement à tout moment en effaçant le stockage du navigateur pour ce site ou via les paramètres du navigateur." },
      ],
    },
    {
      n: '8',
      title: 'Loi applicable',
      blocks: [
        { kind: 'p', html: "Cette politique est conçue pour respecter :" },
        {
          kind: 'ul',
          items: [
            "Puerto Rico Act 39 (notification de politique de confidentialité) et Act 111-2005 (sécurité des données).",
            "California Online Privacy Protection Act (CalOPPA) et CCPA / CPRA.",
            "Directive ePrivacy de l'UE (article 5.3) et RGPD pour les résidents EEE.",
            "UK Privacy and Electronic Communications Regulations (PECR).",
          ],
        },
      ],
    },
    {
      n: '9',
      title: 'Modifications de cette politique',
      blocks: [
        { kind: 'p', html: "Nous pouvons mettre à jour cette politique de temps en temps, généralement quand nous ajoutons ou retirons un service qui dépose des cookies. La date « Dernière mise à jour » en haut de la page reflète la révision la plus récente. La révision du 2026-04-26 a introduit Google Analytics 4 avec le Consent Mode v2 de Google en état refusé par défaut, ainsi que la bannière cookies que vous voyez à la première visite. Pour les modifications substantielles ajoutant de nouvelles catégories de cookies, nous publierons un avis et, le cas échéant, demanderons votre consentement avant activation." },
      ],
    },
    {
      n: '10',
      title: 'Contact',
      blocks: [
        { kind: 'p', html: `Questions sur les cookies ou cette politique :<br />Casa Venturas, San Juan, Porto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}
