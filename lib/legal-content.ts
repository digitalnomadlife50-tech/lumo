import type { Locale } from "@/lib/i18n/locales";

export type LegalDocumentKind = "privacy" | "terms";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export const legalDocuments: Record<Locale, Record<LegalDocumentKind, LegalDocument>> = {
  en: {
    privacy: {
      title: "Privacy policy",
      description: "How Lumo handles the decision content you enter, the browser storage it uses, and the service providers that help it run.",
      effectiveDate: "November 24, 2026",
      sections: [
        {
          heading: "The short version",
          paragraphs: [
            "Lumo is a free, no-account decision-structuring demo operated by Terrance Range. You can use the public site without creating a profile. The decision workspace is designed to keep saved decisions in your browser, not in a Lumo account database.",
            "Do not enter passwords, API keys, government identifiers, health information, or confidential employer or customer information. The demo sends the text you submit to an AI provider so it can generate the analysis or draft you requested.",
          ],
        },
        {
          heading: "Information you choose to provide",
          paragraphs: ["You decide what to put into Lumo. The information may include:"],
          bullets: [
            "Decision context, urgency, options, reasoning, confidence, and notes about what is making a decision hard.",
            "Audience names and the content of messages you ask Lumo to draft or rewrite.",
            "Technical request data, such as your IP address, browser, and timestamps, which may be processed by hosting and security providers.",
          ],
        },
        {
          heading: "How information is used",
          paragraphs: [
            "Lumo uses submitted information to provide the requested analysis, comparisons, drafts, and rewrites; to maintain the demo, prevent abuse, diagnose errors, and understand aggregate site usage.",
            "Saved decisions and in-progress work are stored locally in your browser. They are not synced between devices. Clear the workspace or your browser's site data to remove them.",
          ],
        },
        {
          heading: "Service providers",
          paragraphs: [
            "Lumo uses Anthropic to generate AI responses, Vercel to host the application and provide analytics, and Upstash Redis to enforce demo rate limits. These providers process information under their own terms and privacy policies.",
            "An AI request contains the decision content needed to answer that request. Rate limiting uses a network identifier such as an IP address. Do not submit information you are not authorized to share with these services.",
          ],
        },
        {
          heading: "Retention and your choices",
          paragraphs: [
            "Lumo does not provide an account dashboard or a server-side decision archive. Browser storage remains on your device until you delete it. Infrastructure and provider logs may be retained for security, debugging, and abuse prevention according to each provider's policies.",
            "You can use the site without saving a decision, discard saved work, or clear site data through your browser. You can also avoid the AI features and read the public guides and case study.",
          ],
        },
        {
          heading: "Security and international processing",
          paragraphs: [
            "Lumo uses reasonable technical and organizational safeguards, but no method of transmission or storage is completely secure. You are responsible for removing sensitive information before submitting text.",
            "The service providers that support Lumo may process information in countries other than yours. Their applicable safeguards and transfer commitments are described in their own policies.",
          ],
        },
        {
          heading: "Changes and contact",
          paragraphs: [
            "This policy may change as the demo evolves. The effective date above will be updated when material changes are made.",
            "For privacy questions or requests, contact Terrance Range through terrance.company.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of use",
      description: "The ground rules for using Lumo's public decision-structuring demo, AI features, and educational content.",
      effectiveDate: "November 24, 2026",
      sections: [
        {
          heading: "About this demo",
          paragraphs: [
            "Lumo is a working prototype operated by Terrance Range. It helps product managers structure decisions, compare options, and prepare audience-specific messages. The public demo does not require an account.",
            "By using Lumo, you agree to these terms. If you do not agree, do not use the demo or its AI features.",
          ],
        },
        {
          heading: "Using Lumo responsibly",
          paragraphs: ["You may use Lumo only for lawful purposes and with information you are authorized to share. In particular, do not:"],
          bullets: [
            "Submit passwords, credentials, government identifiers, health information, or confidential employer or customer information.",
            "Use the service to violate another person's rights, distribute harmful content, or attempt to gain unauthorized access to systems or data.",
            "Interfere with the service, bypass rate limits, scrape it abusively, or use automated requests that impose an unreasonable load.",
          ],
        },
        {
          heading: "AI output and your judgment",
          paragraphs: [
            "AI-generated analysis and drafts may be inaccurate, incomplete, or unsuitable for your situation. They are suggestions to review, not facts or instructions. Lumo is not a source of legal, financial, medical, employment, or other professional advice.",
            "Verify important claims, names, dates, commitments, and consequences before acting or sending a draft. You remain responsible for your decisions and communications.",
          ],
        },
        {
          heading: "Your content",
          paragraphs: [
            "You retain the rights you have in the text and other content you submit. You give Lumo and its service providers a limited license to process that content only to provide, secure, and improve the requested service.",
            "You are responsible for having the necessary permission to submit content and for the output you choose to use. Do not submit third-party confidential information without authorization.",
          ],
        },
        {
          heading: "Availability and changes",
          paragraphs: [
            "Lumo is provided as a demo and may be changed, suspended, rate-limited, or discontinued at any time. Features, providers, and output formats may change without notice. Saved browser data can also be lost if you clear site data or change devices or browsers.",
            "You may stop using Lumo at any time. Lumo may restrict access when necessary to protect the service, other users, or third parties.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "The Lumo name, product design, software, and original site content are owned by Terrance Range or the respective rights holders. These terms give you a limited, non-exclusive right to use the public demo; they do not transfer ownership of the service.",
          ],
        },
        {
          heading: "Disclaimers and limitation of liability",
          paragraphs: [
            "Lumo is provided on an as-is and as-available basis, without warranties of accuracy, availability, fitness for a particular purpose, or non-infringement to the maximum extent permitted by law.",
            "To the maximum extent permitted by law, Terrance Range and Lumo's service providers will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or business opportunities arising from your use of the demo. Some jurisdictions do not allow certain exclusions, so parts of this section may not apply to you.",
          ],
        },
        {
          heading: "Changes and contact",
          paragraphs: [
            "These terms may be updated as the demo evolves. Continued use after an updated effective date means you accept the revised terms.",
            "Questions about these terms can be sent to Terrance Range through terrance.company.",
          ],
        },
      ],
    },
  },
  es: {
    privacy: {
      title: "Política de privacidad",
      description: "Cómo gestiona Lumo el contenido de las decisiones que introduces, el almacenamiento del navegador y los proveedores que hacen posible el servicio.",
      effectiveDate: "24 de noviembre de 2026",
      sections: [
        {
          heading: "En pocas palabras",
          paragraphs: [
            "Lumo es una demo gratuita para estructurar decisiones, sin necesidad de crear una cuenta, operada por Terrance Range. Puedes utilizar el sitio público sin crear un perfil. El espacio de trabajo está diseñado para conservar las decisiones guardadas en tu navegador, no en una base de datos de cuentas de Lumo.",
            "No introduzcas contraseñas, claves de API, identificadores oficiales, información de salud ni información confidencial de tu empresa o de clientes. La demo envía el texto que envías a un proveedor de IA para generar el análisis o el borrador que solicitaste.",
          ],
        },
        {
          heading: "Información que decides proporcionar",
          paragraphs: ["Tú decides qué introduces en Lumo. Esta información puede incluir:"],
          bullets: [
            "El contexto de la decisión, la urgencia, las opciones, el razonamiento, la confianza y las notas sobre lo que dificulta decidir.",
            "Los nombres de las audiencias y el contenido de los mensajes que pides a Lumo redactar o reescribir.",
            "Datos técnicos de la solicitud, como la dirección IP, el navegador y las marcas de tiempo, que pueden procesar los proveedores de alojamiento y seguridad.",
          ],
        },
        {
          heading: "Cómo se utiliza la información",
          paragraphs: [
            "Lumo utiliza la información enviada para proporcionar los análisis, comparaciones, borradores y reescrituras solicitados; mantener la demo, prevenir abusos, diagnosticar errores y comprender el uso agregado del sitio.",
            "Las decisiones guardadas y el trabajo en curso se almacenan localmente en tu navegador. No se sincronizan entre dispositivos. Borra el espacio de trabajo o los datos del sitio en tu navegador para eliminarlos.",
          ],
        },
        {
          heading: "Proveedores de servicios",
          paragraphs: [
            "Lumo utiliza Anthropic para generar respuestas de IA, Vercel para alojar la aplicación y proporcionar analíticas, y Upstash Redis para aplicar los límites de uso de la demo. Estos proveedores procesan la información conforme a sus propios términos y políticas de privacidad.",
            "Una solicitud de IA contiene el contenido de la decisión necesario para responderla. El control de límites utiliza un identificador de red, como una dirección IP. No envíes información que no tengas autorización para compartir con estos servicios.",
          ],
        },
        {
          heading: "Conservación y tus opciones",
          paragraphs: [
            "Lumo no ofrece un panel de cuenta ni un archivo de decisiones en el servidor. El almacenamiento del navegador permanece en tu dispositivo hasta que lo eliminas. Los registros de infraestructura y de los proveedores pueden conservarse por seguridad, depuración y prevención de abusos según las políticas de cada proveedor.",
            "Puedes utilizar el sitio sin guardar una decisión, descartar el trabajo guardado o borrar los datos del sitio desde tu navegador. También puedes no utilizar las funciones de IA y leer las guías públicas y el caso de estudio.",
          ],
        },
        {
          heading: "Seguridad y tratamiento internacional",
          paragraphs: [
            "Lumo aplica medidas técnicas y organizativas razonables, pero ningún método de transmisión o almacenamiento es completamente seguro. Debes eliminar la información sensible antes de enviar texto.",
            "Los proveedores que apoyan a Lumo pueden procesar información en países distintos al tuyo. Sus garantías y compromisos de transferencia aplicables se describen en sus propias políticas.",
          ],
        },
        {
          heading: "Cambios y contacto",
          paragraphs: [
            "Esta política puede cambiar a medida que evolucione la demo. La fecha de entrada en vigor se actualizará cuando se realicen cambios importantes.",
            "Para preguntas o solicitudes sobre privacidad, contacta con Terrance Range a través de terrance.company.",
          ],
        },
      ],
    },
    terms: {
      title: "Términos de uso",
      description: "Las reglas básicas para utilizar la demo pública de Lumo, sus funciones de IA y su contenido educativo.",
      effectiveDate: "24 de noviembre de 2026",
      sections: [
        {
          heading: "Sobre esta demo",
          paragraphs: [
            "Lumo es un prototipo funcional operado por Terrance Range. Ayuda a product managers a estructurar decisiones, comparar opciones y preparar mensajes para distintas audiencias. La demo pública no requiere una cuenta.",
            "Al utilizar Lumo, aceptas estos términos. Si no estás de acuerdo, no utilices la demo ni sus funciones de IA.",
          ],
        },
        {
          heading: "Uso responsable de Lumo",
          paragraphs: ["Solo puedes utilizar Lumo con fines legales y con información que tengas autorización para compartir. En particular, no debes:"],
          bullets: [
            "Enviar contraseñas, credenciales, identificadores oficiales, información de salud ni información confidencial de tu empresa o de clientes.",
            "Utilizar el servicio para vulnerar derechos de otras personas, distribuir contenido dañino o intentar acceder sin autorización a sistemas o datos.",
            "Interferir con el servicio, eludir los límites de uso, extraer datos de forma abusiva o realizar solicitudes automatizadas que generen una carga excesiva.",
          ],
        },
        {
          heading: "Resultados de IA y tu criterio",
          paragraphs: [
            "Los análisis y borradores generados por IA pueden ser inexactos, incompletos o inadecuados para tu situación. Son sugerencias que debes revisar, no hechos ni instrucciones. Lumo no ofrece asesoramiento legal, financiero, médico, laboral ni de otro tipo profesional.",
            "Verifica las afirmaciones, los nombres, las fechas, los compromisos y las consecuencias importantes antes de actuar o enviar un borrador. Sigues siendo responsable de tus decisiones y comunicaciones.",
          ],
        },
        {
          heading: "Tu contenido",
          paragraphs: [
            "Conservas los derechos que tengas sobre el texto y demás contenido que envíes. Concedes a Lumo y a sus proveedores una licencia limitada para procesar ese contenido únicamente con el fin de proporcionar, proteger y mejorar el servicio solicitado.",
            "Eres responsable de contar con los permisos necesarios para enviar contenido y de los resultados que decidas utilizar. No envíes información confidencial de terceros sin autorización.",
          ],
        },
        {
          heading: "Disponibilidad y cambios",
          paragraphs: [
            "Lumo se ofrece como una demo y puede modificarse, suspenderse, limitarse o dejar de estar disponible en cualquier momento. Las funciones, los proveedores y los formatos de salida pueden cambiar sin previo aviso. Los datos guardados en el navegador también pueden perderse si borras los datos del sitio o cambias de dispositivo o navegador.",
            "Puedes dejar de utilizar Lumo en cualquier momento. Lumo puede restringir el acceso cuando sea necesario para proteger el servicio, a otros usuarios o a terceros.",
          ],
        },
        {
          heading: "Propiedad intelectual",
          paragraphs: [
            "El nombre de Lumo, el diseño del producto, el software y el contenido original del sitio pertenecen a Terrance Range o a sus respectivos titulares. Estos términos te conceden un derecho limitado y no exclusivo para utilizar la demo pública; no transfieren la propiedad del servicio.",
          ],
        },
        {
          heading: "Exenciones y limitación de responsabilidad",
          paragraphs: [
            "Lumo se proporciona tal cual y según disponibilidad, sin garantías de exactitud, disponibilidad, idoneidad para un fin concreto o no infracción, en la medida máxima permitida por la ley.",
            "En la medida máxima permitida por la ley, Terrance Range y los proveedores de Lumo no serán responsables de daños indirectos, incidentales, especiales, consecuentes o punitivos, ni de la pérdida de beneficios, datos u oportunidades de negocio derivados del uso de la demo. Algunas jurisdicciones no permiten ciertas exclusiones, por lo que partes de esta sección pueden no aplicarse en tu caso.",
          ],
        },
        {
          heading: "Cambios y contacto",
          paragraphs: [
            "Estos términos pueden actualizarse a medida que evolucione la demo. El uso continuado después de una nueva fecha de entrada en vigor implica la aceptación de los términos revisados.",
            "Puedes enviar preguntas sobre estos términos a Terrance Range a través de terrance.company.",
          ],
        },
      ],
    },
  },
};

export function getLegalDocument(locale: Locale, kind: LegalDocumentKind): LegalDocument {
  return legalDocuments[locale][kind];
}
