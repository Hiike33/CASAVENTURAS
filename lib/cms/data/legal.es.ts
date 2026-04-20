import type { LegalPage } from '@/lib/types/cms'

const email = 'micasaventuras@gmail.com'
const phone = '+1 929 372 4529'
const siteUrl = 'https://casaventuras.com'

export const privacy: LegalPage = {
  lastUpdated: '2026-04-18',
  metaDescription:
    'Cómo Casa Venturas recopila, usa y protege tu información personal. Cumple con la Ley 39 y Ley 111-2005 de Puerto Rico, CalOPPA y GDPR.',
  introHtml: `Casa Venturas ("nosotros") opera ${siteUrl} y ofrece tours de grupo pequeño en Puerto Rico. Esta política explica qué datos personales recopilamos, por qué, cómo los protegemos y qué derechos tienes. Está diseñada para cumplir con la Ley 39 de Puerto Rico (Notificación de Política de Privacidad) y la Ley 111-2005 (Seguridad de Bancos de Datos de Información Ciudadana), la California Online Privacy Protection Act (CalOPPA), y el Reglamento General de Protección de Datos (GDPR) de la UE para visitantes del Espacio Económico Europeo.`,
  sections: [
    {
      n: '1',
      title: 'Quiénes somos',
      blocks: [
        { kind: 'p', html: `Casa Venturas, San Juan, Puerto Rico. ${email}, ${phone}. Somos el responsable del tratamiento de los datos recogidos en este sitio.` },
      ],
    },
    {
      n: '2',
      title: 'Qué datos recopilamos',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Datos de reserva</strong>: nombre, correo, teléfono, fecha del tour, número de personas. Enviados por el formulario de reserva y procesados por Bókun (nuestro motor de reservas).',
            '<strong>Formulario de contacto</strong>: nombre, correo, mensaje.',
            '<strong>Chat con Cavi (guía AI)</strong>: el contenido de tu conversación, procesado por Anthropic (Claude API) para generar respuestas. Las transcripciones se guardan hasta 90 días para control de calidad, luego se eliminan.',
            '<strong>Datos técnicos</strong>: dirección IP, tipo de navegador, páginas visitadas. Recopilados automáticamente por nuestro proveedor de hosting (Cloudflare) para seguridad y rendimiento.',
          ],
        },
        { kind: 'p', html: '<strong>No</strong> vendemos tus datos personales. No usamos cookies publicitarias ni rastreadores entre sitios.' },
      ],
    },
    {
      n: '3',
      title: 'Por qué los recopilamos (base legal)',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Para confirmar y operar tu tour (ejecución del contrato, GDPR art. 6(1)(b)).',
            'Para responder preguntas del formulario o del chat (interés legítimo).',
            'Para cumplir con la normativa fiscal y turística de Puerto Rico (obligación legal).',
            'Para proteger el sitio contra fraude y abusos (interés legítimo).',
          ],
        },
      ],
    },
    {
      n: '4',
      title: 'Con quién los compartimos (encargados)',
      blocks: [
        { kind: 'p', html: 'Nos apoyamos en un número reducido de proveedores de confianza que tratan los datos solo según nuestras instrucciones:' },
        {
          kind: 'ul',
          items: [
            '<strong>Bókun</strong> (empresa de TripAdvisor), motor de reservas y pagos (cumple PCI-DSS). Bókun actúa como encargado de tratamiento bajo un Acuerdo de Tratamiento de Datos firmado.',
            '<strong>Anthropic, PBC</strong>, la Claude API que alimenta nuestro asistente Cavi. Anthropic no entrena sus modelos con datos de clientes.',
            '<strong>Resend</strong>, envío de correos transaccionales (confirmaciones de reserva, respuestas al formulario).',
            '<strong>Cloudflare</strong>, hosting del sitio, CDN y protección DDoS.',
          ],
        },
        { kind: 'p', html: 'Si reservas uno de nuestros tours a través de plataformas como Viator, TripAdvisor Experiences, GetYourGuide o Airbnb Experiences, esa plataforma es el responsable del tratamiento de tus datos. Sus propias políticas de privacidad aplican a esas transacciones. Nosotros solo recibimos la información necesaria para operar el tour.' },
      ],
    },
    {
      n: '5',
      title: 'Cuánto tiempo los conservamos',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Registros de reserva: 7 años (obligación fiscal en EE. UU.).',
            'Mensajes del formulario: hasta 2 años.',
            'Transcripciones de chat: hasta 90 días.',
            'Registros del servidor: hasta 30 días.',
          ],
        },
      ],
    },
    {
      n: '6',
      title: 'Tus derechos',
      blocks: [
        { kind: 'p', html: 'Tienes derecho a:' },
        {
          kind: 'ul',
          items: [
            'Acceder a los datos personales que tenemos sobre ti.',
            'Pedirnos que los corrijamos o eliminemos.',
            'Oponerte a mensajes de marketing futuros (actualmente no enviamos).',
            'Recibir tus datos en formato portable (GDPR art. 20).',
            'Presentar una queja ante la autoridad de protección de datos (por ejemplo DACO en Puerto Rico, o tu autoridad local en la UE).',
          ],
        },
        { kind: 'p', html: `Para ejercer cualquiera de estos derechos, escribe a <a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>. Respondemos en 30 días. Los residentes en California pueden solicitar la opción "Do Not Sell or Share". Ten en cuenta que no vendemos ni compartimos datos personales con fines publicitarios.` },
        { kind: 'p', html: 'Respetamos las señales "Do Not Track" del navegador: como no usamos cookies de seguimiento entre sitios, no se requiere ninguna acción adicional más allá de nuestra recolección mínima.' },
      ],
    },
    {
      n: '7',
      title: 'Seguridad y notificación de brechas',
      blocks: [
        { kind: 'p', html: 'Todos los datos viajan por HTTPS y se almacenan cifrados por nuestros proveedores. En caso de una brecha de seguridad que afecte a datos personales de residentes en Puerto Rico, notificaremos a los afectados y al Departamento de Asuntos del Consumidor (DACO) en un plazo de diez (10) días desde la detección, según la Ley 111-2005. Para residentes en la UE, también notificaremos a la autoridad de control en 72 horas según el GDPR art. 33.' },
      ],
    },
    {
      n: '8',
      title: 'Transferencias internacionales',
      blocks: [
        { kind: 'p', html: 'Algunos de nuestros proveedores (Bókun, Anthropic, Resend, Cloudflare) están ubicados en Estados Unidos. Si te encuentras en el Espacio Económico Europeo, Reino Unido o Suiza, tus datos pueden transferirse y tratarse en EE. UU. bajo Cláusulas Contractuales Tipo (SCC) aprobadas por la Comisión Europea.' },
      ],
    },
    {
      n: '9',
      title: 'Menores',
      blocks: [
        { kind: 'p', html: 'Nuestros servicios no se dirigen a menores de 13 años. No recopilamos datos personales de menores de 13 años de forma consciente (COPPA, 15 U.S.C. 6501-6506). Los tours que admiten niños (El Yunque, Catamarán) requieren que un padre o tutor reserve y acompañe al menor.' },
      ],
    },
    {
      n: '10',
      title: 'Cambios en esta política',
      blocks: [
        { kind: 'p', html: 'Podemos actualizar esta política de vez en cuando. La fecha "Última actualización" arriba refleja la última revisión. En caso de cambios materiales, publicaremos un aviso en esta página al menos 30 días antes de que el cambio entre en vigor.' },
      ],
    },
    {
      n: '11',
      title: 'Contacto',
      blocks: [
        { kind: 'p', html: `Preguntas sobre esta política o sobre tus datos personales:<br />Casa Venturas, San Juan, Puerto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}

export const terms: LegalPage = {
  lastUpdated: '2026-04-18',
  metaDescription:
    'Términos y condiciones para reservar tours directamente en casaventuras.com. Política de cancelación, responsabilidad, conducta y ley aplicable (Puerto Rico).',
  introHtml: `Estos Términos del Servicio ("Términos") regulan el uso de ${siteUrl} y cualquier tour que reserves directamente a través de este sitio. Al reservar o enviar una solicitud por nuestro sitio, aceptas estos Términos. Si no estás de acuerdo, por favor no reserves.`,
  sections: [
    {
      n: '1',
      title: 'Alcance y canales de reserva',
      blocks: [
        { kind: 'p', html: `Estos Términos aplican exclusivamente a las reservas hechas directamente en ${siteUrl}. Las reservas hechas a través de plataformas como Viator, TripAdvisor Experiences, GetYourGuide o Airbnb Experiences se rigen por los términos de esas plataformas. Sin embargo, las reglas de seguridad, conducta, responsabilidad y ejecución del tour (secciones 5, 7 y 8) aplican a <strong>todos los participantes</strong>, sin importar el canal de reserva.` },
      ],
    },
    {
      n: '2',
      title: 'El operador',
      blocks: [
        { kind: 'p', html: `Los tours son operados por Casa Venturas, con base en San Juan, Puerto Rico. Contacto: <a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}.` },
      ],
    },
    {
      n: '3',
      title: 'Reserva y pago',
      blocks: [
        { kind: 'p', html: 'Las reservas directas en este sitio se procesan con Bókun, nuestro motor de reservas y procesador de pagos con cumplimiento PCI-DSS (empresa de TripAdvisor). El pago es requisito para confirmar la reserva. Los precios se muestran en dólares estadounidenses e incluyen todos los impuestos aplicables en Puerto Rico, salvo indicación contraria. Las descripciones, fotos y highlights son ilustrativos; las condiciones reales (clima, caudal de río, avistamiento de fauna) varían y no son motivo de reembolso salvo que se cancele el tour mismo.' },
      ],
    },
    {
      n: '4',
      title: 'Cancelación y cambios',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Cancelación gratuita</strong> hasta 24 horas antes de la hora de inicio del tour, reembolso total.',
            '<strong>Dentro de las 24 horas</strong> previas al inicio: sin reembolso, pero podemos reprogramar según disponibilidad.',
            '<strong>No presentarse</strong>: sin reembolso.',
            '<strong>Si cancelamos nosotros</strong>: si el tour se cancela por mal clima, condiciones marítimas o fuerza mayor, recibes un reembolso total o una reprogramación gratuita a tu elección.',
          ],
        },
        { kind: 'p', html: 'Los reembolsos se emiten al método de pago original en 10 días hábiles.' },
      ],
    },
    {
      n: '5',
      title: 'Asunción de riesgos y responsabilidad',
      blocks: [
        { kind: 'p', html: 'Nuestros tours implican actividad física en entornos naturales al aire libre y conllevan riesgos inherentes, entre otros:' },
        {
          kind: 'ul',
          items: [
            '<strong>El Yunque</strong>: senderos resbaladizos, corrientes de río, saltos desde acantilados de 5 a 20 pies, encuentros con fauna, clima variable.',
            '<strong>Catamarán a Vieques</strong>: navegación en mar abierto, nado, snorkel, exposición al sol, mareo.',
            '<strong>Salsa Rooftop</strong>: esfuerzo físico, condiciones de la pista de baile.',
          ],
        },
        { kind: 'p', html: 'Al participar, reconoces y asumes voluntariamente estos riesgos. Confirmas que tú y cada persona de tu grupo tienen la condición física adecuada para participar. En la medida máxima permitida por las leyes del Estado Libre Asociado de Puerto Rico, Casa Venturas, sus guías, contratistas y socios no serán responsables por ninguna lesión, enfermedad, pérdida o daño que surja de la participación, salvo casos de negligencia grave o mala conducta intencional de nuestra parte. Es posible que se requiera firmar un consentimiento específico de la actividad en el lugar antes del inicio del tour.' },
      ],
    },
    {
      n: '6',
      title: 'Menores',
      blocks: [
        { kind: 'p', html: 'Los menores de 18 años deben ir acompañados por un padre o tutor legal, que es responsable del menor durante todo el tour. El Yunque y Catamarán aceptan niños a partir de 5 años; Salsa Rooftop es 18+ (se sirve alcohol). El tutor que reserva da consentimiento expreso en nombre de cualquier menor del grupo a estos Términos, incluida la asunción de riesgos de la sección 5.' },
      ],
    },
    {
      n: '7',
      title: 'Clima y fuerza mayor',
      blocks: [
        { kind: 'p', html: 'Los tours salen llueva o haga sol. El capitán (catamarán) o el guía líder (El Yunque, Salsa) tiene total discreción para cancelar, acortar o modificar el tour por razones de seguridad, entre otras: tormentas tropicales, huracanes, marejada fuerte, crecidas, incendios, restricciones por pandemia y actos gubernamentales. Estos casos califican bajo la sección 4 para reembolso total o reprogramación.' },
      ],
    },
    {
      n: '8',
      title: 'Conducta',
      blocks: [
        { kind: 'p', html: 'Nos reservamos el derecho a negar el servicio, o a retirar del tour sin reembolso, a cualquier participante que:' },
        {
          kind: 'ul',
          items: [
            'Se presente visiblemente embriagado o bajo los efectos de drogas al inicio del tour.',
            'Actúe de forma que ponga en peligro a sí mismo, a otros participantes, a los guías o al entorno.',
            'Acose o amenace a cualquier guía, participante o tercero.',
            'Se niegue a seguir las instrucciones de seguridad del guía o el capitán.',
          ],
        },
      ],
    },
    {
      n: '9',
      title: 'Fotos y video',
      blocks: [
        { kind: 'p', html: 'Nuestros guías pueden tomar fotos y video durante el tour para marketing y redes sociales. Si prefieres no aparecer, dile al guía antes de empezar, respetaremos tu petición. Mantienes todos los derechos sobre tus fotos y videos propios; te pedimos etiquetar <strong>@casaventuras</strong> si los compartes públicamente.' },
      ],
    },
    {
      n: '10',
      title: 'Seguros',
      blocks: [
        { kind: 'p', html: 'Recomendamos encarecidamente contratar un seguro de viaje. Casa Venturas mantiene la cobertura de responsabilidad requerida por la ley de Puerto Rico pero no se hace responsable de objetos personales perdidos o dañados durante el tour, ni de gastos médicos derivados de la participación.' },
      ],
    },
    {
      n: '11',
      title: 'Propiedad intelectual',
      blocks: [
        { kind: 'p', html: `Todo el contenido de ${siteUrl} (texto, imágenes, video, logo, descripciones de tours) es propiedad de Casa Venturas o se usa con permiso. No puedes reproducirlo, republicarlo ni usarlo comercialmente sin nuestro consentimiento previo por escrito.` },
      ],
    },
    {
      n: '12',
      title: 'Ley aplicable y jurisdicción',
      blocks: [
        { kind: 'p', html: 'Estos Términos se rigen por las leyes del Estado Libre Asociado de Puerto Rico, sin atención a principios de conflicto de leyes. Cualquier disputa que surja de estos Términos o de una reserva se somete exclusivamente a los tribunales de San Juan, Puerto Rico. Para consumidores con residencia en la Unión Europea, esta elección de foro no te priva de la protección de las normas imperativas de consumo de tu país de residencia.' },
      ],
    },
    {
      n: '13',
      title: 'Cambios en estos Términos',
      blocks: [
        { kind: 'p', html: 'Podemos actualizar estos Términos de vez en cuando. La fecha "Última actualización" refleja la revisión más reciente. Las reservas se rigen por los Términos vigentes al momento de la reserva.' },
      ],
    },
    {
      n: '14',
      title: 'Contacto',
      blocks: [
        { kind: 'p', html: `Preguntas sobre estos Términos:<br />Casa Venturas, San Juan, Puerto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}

export const cookies: LegalPage = {
  lastUpdated: '2026-04-20',
  metaDescription:
    'Cómo usa cookies Casa Venturas. No usamos analítica ni rastreadores publicitarios, solo cookies estrictamente necesarias y el widget de Bókun.',
  introHtml: `Esta Política de Cookies explica cómo Casa Venturas y sus proveedores usan cookies y tecnologías similares cuando visitas ${siteUrl}. Complementa nuestra <a href="/privacy" class="text-[#248D6C] hover:underline">Política de Privacidad</a>.`,
  sections: [
    {
      n: '1',
      title: 'Qué son las cookies',
      blocks: [
        { kind: 'p', html: 'Las cookies son pequeños archivos de texto que tu navegador guarda en tu dispositivo cuando visitas un sitio. Permiten al sitio recordar información entre páginas o sesiones: un token de sesión, un idioma elegido, un paso de reserva. Tecnologías similares incluyen localStorage, sessionStorage y píxeles; las tratamos todas igual en esta política.' },
      ],
    },
    {
      n: '2',
      title: 'Cookies que ponemos nosotros',
      blocks: [
        { kind: 'p', html: '<strong>Ninguna para marketing ni analítica.</strong> No usamos Google Analytics, Google Ads, Meta Pixel ni ninguna tecnología de rastreo entre sitios. El único almacenamiento propio que usamos es el <em>localStorage</em> del navegador para recordar tu sesión de chat con Cavi (nuestro guía AI) y no perder el contexto al hacer scroll, borrado automáticamente al cerrar la pestaña.' },
      ],
    },
    {
      n: '3',
      title: 'Cookies estrictamente necesarias (proveedor de hosting)',
      blocks: [
        { kind: 'p', html: `Cloudflare, que aloja y protege ${siteUrl}, puede poner algunas cookies estrictamente necesarias como <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">__cf_bm</code> (mitigación de bots) y <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">cf_clearance</code> (anti-abuso). Existen solo por seguridad e integridad del sitio. No te identifican personalmente, no te rastrean entre sitios, y no se pueden desactivar sin romper el sitio.` },
      ],
    },
    {
      n: '4',
      title: 'Cookies de terceros (socio de reservas)',
      blocks: [
        { kind: 'p', html: 'Cuando interactúas con un widget de reserva, una ventana de checkout o un calendario de disponibilidad en las páginas de tour, el widget es servido por Bókun (empresa de TripAdvisor) desde <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">widgets.bokun.io</code>. Bókun puede poner cookies en su propio dominio para recordar la fecha elegida, el número de personas y la sesión de checkout. Estas cookies se rigen por las políticas de Bókun, no por la nuestra. No recibimos de Bókun ningún identificador persistente más allá del número de reserva.' },
      ],
    },
    {
      n: '5',
      title: 'Lo que no usamos',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Sin Google Analytics, sin Google Tag Manager, sin Google Ads.',
            'Sin Meta Pixel, sin rastreo de Facebook.',
            'Sin redes publicitarias, sin cookies de retargeting.',
            'Sin grabación de sesión (Hotjar, FullStory, etc.).',
            'Sin rastreo entre sitios de ningún tipo.',
          ],
        },
      ],
    },
    {
      n: '6',
      title: 'Tus opciones',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Ajustes del navegador</strong>: cualquier navegador moderno permite bloquear o borrar cookies por sitio. Como no dependemos de cookies propias para el funcionamiento, bloquearlas no rompe el sitio.',
            '<strong>Do Not Track (DNT)</strong>: respetamos la señal DNT. Como ya no hacemos rastreo entre sitios, DNT está efectivamente siempre activo para nuestros datos propios.',
            '<strong>Global Privacy Control (GPC)</strong>: respetamos las señales GPC y las tratamos como una opción de exclusión válida para residentes de California bajo CCPA / CPRA.',
            '<strong>Cookies de terceros de Bókun</strong>: para bloquearlas, evita interactuar con los widgets de reserva, o configura tu navegador para bloquear cookies de terceros globalmente.',
          ],
        },
      ],
    },
    {
      n: '7',
      title: 'Residentes UE / EEE / Reino Unido',
      blocks: [
        { kind: 'p', html: 'Para visitantes del Espacio Económico Europeo, el Reino Unido o Suiza: solo las cookies <em>estrictamente necesarias</em> (seguridad de Cloudflare) se ponen sin consentimiento. Las cookies de terceros de Bókun solo se ponen cuando interactúas activamente con un widget de reserva, lo que se considera consentimiento por acción bajo la Directiva ePrivacy. Puedes retirar tu consentimiento en cualquier momento desde los ajustes del navegador.' },
      ],
    },
    {
      n: '8',
      title: 'Ley aplicable',
      blocks: [
        { kind: 'p', html: 'Esta política está diseñada para cumplir con:' },
        {
          kind: 'ul',
          items: [
            'Ley 39 de Puerto Rico (Notificación de Política de Privacidad) y Ley 111-2005 (seguridad de datos).',
            'California Online Privacy Protection Act (CalOPPA) y CCPA / CPRA.',
            'Directiva ePrivacy UE (art. 5.3) y GDPR para residentes del EEE.',
            'Privacy and Electronic Communications Regulations (PECR) del Reino Unido.',
          ],
        },
      ],
    },
    {
      n: '9',
      title: 'Cambios en esta política',
      blocks: [
        { kind: 'p', html: 'Podemos actualizar esta política de vez en cuando, generalmente cuando añadimos o retiramos un servicio que pone cookies. La fecha "Última actualización" refleja la revisión más reciente. Para cambios materiales que introduzcan nuevas categorías de cookies (por ejemplo si activamos analítica), publicaremos un aviso y, si la ley lo exige, pediremos tu consentimiento antes de activarlas.' },
      ],
    },
    {
      n: '10',
      title: 'Contacto',
      blocks: [
        { kind: 'p', html: `Preguntas sobre cookies o sobre esta política:<br />Casa Venturas, San Juan, Puerto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}
