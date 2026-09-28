import type { GuideId } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/locales";

export type GuideArticle = {
  title: string;
  description: string;
  summary: string;
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
  exampleLabel: string;
  exampleMessage: string;
  takeaway: string;
  minutes: number;
};

export const GUIDE_CONTENT: Record<GuideId, Record<Locale, GuideArticle>> = {
  launch: {
    en: {
      title: "How to tell stakeholders a launch is slipping",
      description: "A practical guide to a slipping launch: share the evidence and customer impact, reset expectations across teams, and agree on a credible next update.",
      summary: "Explain a slipping launch without creating false certainty: lead with the impact, name what is still unknown, and give people a dependable next update.",
      minutes: 5,
      intro: [
        "A launch date is easy to repeat and hard to unwind. Once sales, support, and leadership have planned around it, a small schedule change can feel like a broken promise. The useful update is not the one that makes the delay sound painless. It is the one that helps each person make a better next decision.",
        "This guide gives you a clear structure for sharing a slipping date, separating evidence from estimates, and setting a follow-up that your team can keep. You do not need a perfect recovery plan before you speak. You do need to say what changed and what you are doing to reduce uncertainty.",
      ],
      sections: [
        { heading: "What changed, and what is the evidence?", paragraphs: [
          "Start with the specific change in the work, not a vague phrase such as “we need more time.” A partner dependency may have missed its test window, a migration may fail under realistic traffic, or an accessibility review may have found a release-blocking issue. Say what the team observed, when it happened, and which part of the launch it affects.",
          "Then distinguish what is confirmed from what is still being investigated. “The integration has failed two of three retry tests” is evidence. “We will be ready Friday” is a forecast. Label forecasts as estimates and name the assumption behind them. Stakeholders can work with uncertainty more easily when they know which facts are solid and which could change.",
        ] },
        { heading: "Who needs to hear about the change first?", paragraphs: [
          "Map the people whose plans depend on the date. A sales lead may need to reset a customer commitment; support may need to change training; finance may be watching a contract milestone. Tell the decision owner and the closest affected teams before sending a broad announcement, so they can flag consequences you might not see from inside the product team.",
          "Do not mistake seniority for impact. The person answering customer questions tomorrow may need the update before an executive who reads the weekly report. Keep the audience specific, and give every group the information it needs to act. A short message with the new risk, a temporary workaround, and a contact for questions is more useful than a long apology sent to everyone.",
        ] },
        { heading: "What date can you responsibly share?", paragraphs: [
          "If the evidence supports a range rather than a date, share the range. If the range is not credible yet, say when you will have enough information to make a better estimate. A checkpoint date is still a commitment: use one only if the team can run the test, get the decision, and report its result by then.",
          "Explain the difference between a target and a promise. A target helps the team coordinate; a promise invites other teams to commit on your behalf. State what would move the estimate earlier or later, such as a successful end-to-end test or a vendor response. This gives stakeholders something concrete to watch instead of encouraging them to treat optimism as certainty.",
        ] },
        { heading: "How do you protect trust while the plan changes?", paragraphs: [
          "Be direct about the cost of waiting and the cost of shipping with the known issue. If one customer segment can safely use the current version, explain that boundary. If launching without the fix risks losing data or breaking a workflow, say so plainly. People may disagree with your trade-off, but they can respond to one they understand.",
          "Own the decision without turning the note into a defense of your team. Acknowledge the commitment people were given, explain the evidence that changed your view, and describe what the team is doing next. Avoid searching for a person to blame. The immediate goal is to coordinate the response; the process review belongs after the release decision is safe.",
        ] },
        { heading: "What belongs in the message itself?", paragraphs: [
          "Put the impact and the current recommendation at the top. Follow with a short account of what changed, the affected audiences, the evidence still being gathered, and the time of the next update. Give people an action if one is required. Avoid mixing an unresolved technical theory into the opening sentence where it can be mistaken for the final cause.",
          "Before sending, ask a colleague outside the project to read it once. Can they say what date is no longer reliable, who needs to change a plan, and when they will hear from you again? If they cannot, edit for those answers rather than adding background. A concise update should reduce the number of private interpretations circulating after the announcement.",
        ] },
        { heading: "How can Lumo help with a difficult update?", paragraphs: [
          "A date change is a decision under pressure: teams balance evidence, customer impact, and the cost of waiting. Lumo helps you lay out the options before you write, record what you expected to happen, and draft a message for the people affected. You remain responsible for checking the facts, choosing the trade-off, and deciding what is appropriate to share.",
          "After the launch, revisit the choice against its original assumptions. Did the new checkpoint reveal the right information? Did the audience hear about the change early enough to respond? Keeping that record turns one uncomfortable announcement into a more reliable way to plan the next launch, rather than a story the team has to reconstruct from chat threads.",
        ] },
      ],
      exampleLabel: "A concise Slack update",
      exampleMessage: "Quick update: we are moving the launch target while we verify a failure in the migration retry test. Two of three runs have not recovered cleanly, so Friday is no longer a date we should promise. I recommend we hold the customer announcement, finish the remaining test cases, and review the result Thursday at 2 p.m. Support and sales: please flag any customer plans that depend on this date in this thread. I will post the evidence and revised estimate after that review.",
      takeaway: "State the change, the evidence, the people affected, and the next dependable checkpoint. If you do not know the new date yet, say so—and make the next update a commitment you can keep.",
    },
    es: {
      title: "Cómo avisar que el launch se retrasa",
      description: "Guía para explicar un launch atrasado: presenta la evidencia y el impacto, actualiza expectativas y acuerda el próximo seguimiento con los equipos.",
      summary: "Explica el retraso de un launch sin crear falsas certezas: empieza por el impacto, nombra lo que falta por saber y fija una próxima actualización confiable.",
      minutes: 6,
      intro: [
        "Es fácil repetir una fecha de lanzamiento y difícil corregirla. Cuando ventas, soporte y dirección ya organizaron su trabajo alrededor de ella, un pequeño cambio puede sentirse como una promesa rota. La actualización útil no es la que hace parecer que el retraso no importa. Es la que ayuda a cada persona a tomar una mejor decisión ahora.",
        "Esta guía propone una estructura clara para compartir el cambio de fecha, separar evidencia de estimaciones y acordar un seguimiento que el equipo pueda cumplir. No necesitas tener un plan de recuperación perfecto antes de hablar. Sí necesitas explicar qué cambió y qué estás haciendo para reducir la incertidumbre.",
      ],
      sections: [
        { heading: "¿Qué cambió y qué evidencia tienes?", paragraphs: [
          "Empieza por el cambio concreto en el trabajo, no por una frase vaga como «necesitamos más tiempo». Una dependencia externa pudo perder su ventana de pruebas, una migración pudo fallar con tráfico realista o una revisión de accesibilidad pudo detectar un problema que impide publicar. Di qué observó el equipo, cuándo ocurrió y qué parte del lanzamiento afecta.",
          "Después distingue lo confirmado de lo que todavía investigas. «La integración falló en dos de tres intentos» es evidencia. «Estaremos listos el viernes» es un pronóstico. Presenta los pronósticos como estimaciones y explica qué suponen. La gente puede trabajar con la incertidumbre cuando sabe cuáles hechos son firmes y cuáles podrían cambiar.",
        ] },
        { heading: "¿Quién debe enterarse primero?", paragraphs: [
          "Identifica a las personas cuyos planes dependen de la fecha. Ventas quizá deba cambiar un compromiso con un cliente; soporte, modificar una capacitación; finanzas, revisar un hito contractual. Avisa a quien decide y a los equipos más afectados antes de enviar un anuncio general: pueden detectar consecuencias que no ves desde el equipo de producto.",
          "La jerarquía no siempre indica quién necesita saberlo antes. La persona que responderá preguntas de clientes mañana quizá necesita esta información antes que una directiva que lee el informe semanal. Elige una audiencia concreta y comparte lo que cada grupo necesita para actuar. Un mensaje breve con el riesgo, una alternativa temporal y un contacto ayuda más que una disculpa extensa para todos.",
        ] },
        { heading: "¿Qué fecha puedes comunicar responsablemente?", paragraphs: [
          "Si la evidencia sostiene un rango y no una fecha exacta, comparte el rango. Si aún no es confiable, di cuándo tendrás información suficiente para estimar mejor. Una fecha para revisar el avance también es un compromiso: úsala solo si el equipo podrá hacer la prueba, decidir y compartir el resultado antes de ese momento.",
          "Explica la diferencia entre un objetivo y una promesa. Un objetivo ayuda al equipo a coordinarse; una promesa invita a otros equipos a comprometerse en tu nombre. Di qué adelantaría o retrasaría la estimación, como una prueba integral exitosa o la respuesta de un proveedor. Así todos pueden observar algo concreto en lugar de confundir optimismo con certeza.",
        ] },
        { heading: "¿Cómo cuidas la confianza mientras cambia el plan?", paragraphs: [
          "Explica el costo de esperar y el de publicar con el problema conocido. Si un grupo de clientes puede usar la versión actual sin riesgo, aclara ese límite. Si lanzar así podría perder datos o interrumpir un flujo de trabajo, dilo directamente. La gente puede no estar de acuerdo con el balance, pero sí responder a uno que entiende.",
          "Hazte cargo de la decisión sin convertir el mensaje en una defensa del equipo. Reconoce el compromiso comunicado, cuenta qué evidencia cambió tu opinión y explica el próximo paso. Evita buscar a quién culpar. El objetivo inmediato es coordinar la respuesta; revisar el proceso puede esperar hasta que la decisión de publicación sea segura.",
        ] },
        { heading: "¿Qué debe decir el mensaje?", paragraphs: [
          "Pon arriba el impacto y la recomendación actual. Después explica brevemente qué cambió, a quién afecta, qué evidencia falta y a qué hora habrá otra actualización. Asigna una acción si alguien debe hacer algo. Evita abrir con una hipótesis técnica sin confirmar, porque puede confundirse con la causa definitiva.",
          "Antes de enviarlo, pide a alguien ajeno al proyecto que lo lea. ¿Puede decir qué fecha ya no es confiable, quién debe cambiar sus planes y cuándo volverá a recibir noticias? Si no puede, edita para responder eso antes de añadir más contexto. Una actualización breve debería reducir las interpretaciones privadas que circulan después del anuncio.",
        ] },
        { heading: "¿Cómo ayuda Lumo con una actualización difícil?", paragraphs: [
          "Cambiar una fecha es decidir bajo presión: el equipo equilibra evidencia, impacto en clientes y costo de esperar. Lumo ayuda a ordenar las opciones antes de redactar, registrar lo que esperabas y preparar un mensaje para cada audiencia. Tú sigues siendo responsable de comprobar los hechos, elegir el balance y decidir qué información corresponde compartir.",
          "Después del lanzamiento, revisa la decisión frente a sus supuestos originales. ¿La siguiente prueba reveló lo necesario? ¿Cada grupo supo del cambio con tiempo para responder? Ese registro convierte un anuncio incómodo en una manera más confiable de planificar el próximo lanzamiento, sin depender de reconstruir la historia entre mensajes dispersos.",
        ] },
      ],
      exampleLabel: "Una actualización breve para Slack",
      exampleMessage: "Actualización: vamos a mover el objetivo del launch mientras verificamos un fallo en los reintentos de la migración. Dos de tres pruebas no se recuperaron correctamente, así que no debemos prometer el viernes. Propongo pausar el anuncio a clientes, terminar los casos pendientes y revisar los resultados el jueves a las 14:00. Equipos de soporte y ventas: indiquen en este hilo si algún plan de clientes depende de la fecha. Compartiré la evidencia y una nueva estimación después de la revisión.",
      takeaway: "Explica el cambio, la evidencia, quién se ve afectado y el próximo punto de revisión confiable. Si todavía no conoces la nueva fecha, dilo y comprométete con una próxima actualización que sí puedas cumplir.",
    },
  },
  scope: {
    en: {
      title: "How to decide whether to cut scope before launch",
      description: "A decision framework for trimming launch scope without weakening the core customer outcome, hiding risk, or leaving teams and customers surprised.",
      summary: "Decide what to cut by protecting the customer outcome, making dependencies visible, and agreeing on evidence for the next release.",
      minutes: 5,
      intro: [
        "A launch is approaching, the remaining list is longer than the remaining time, and every item has an advocate. The tempting response is to debate each feature as if it exists on its own. A better choice starts with the promise the release makes to a user, then asks which work is necessary to keep that promise reliable.",
        "Scope reduction is not automatically a compromise. It can be a responsible decision to ship a smaller, coherent experience instead of a broader one that fails in predictable ways. The guide below helps you compare cuts, name their costs, and tell the team what would earn deferred work a place in a later release.",
      ],
      sections: [
        { heading: "What outcome must this release deliver?", paragraphs: [
          "Write the customer outcome in one sentence before opening the backlog. A useful outcome describes what someone can accomplish, not the list of screens your team plans to build. “A new administrator can invite teammates and give each one the right access” gives you a stronger test than “launch the permissions page.” If the sentence is still vague, make that the first decision.",
          "Separate the outcome from the implementation the team first imagined. A particular animation, bulk action, or configurable setting may be valuable, but it might not be required for the first group to succeed. On the other hand, security, recovery, and accessibility work can be invisible in a feature list while remaining essential to the promise. Name those needs explicitly before comparing cuts.",
        ] },
        { heading: "Which items are dependencies rather than polish?", paragraphs: [
          "Draw a simple path from the user’s starting point to the promised result. Mark the steps where a missing item blocks progress, creates an unsafe state, or forces people into support. These are different from improvements that make the experience smoother. A dependency can be small in engineering effort yet critical to completion, while a polished edge case may be safe to postpone.",
          "Ask engineering, design, research, and support to challenge the map with evidence. Look at test failures, usability sessions, accessibility checks, instrumentation, and known customer workflows. Do not let the loudest stakeholder define necessity on their own. A short shared review often exposes an overlooked fallback or an assumption that changes the apparent cost of a proposed cut.",
        ] },
        { heading: "What is the cost of each cut?", paragraphs: [
          "Describe each candidate cut with both its benefit and its consequence. “Remove CSV export” may reduce testing time, but it could leave a key customer unable to move data. “Keep export, postpone custom column order” might protect the outcome at a smaller cost. Compare development time, ongoing maintenance, launch risk, customer impact, and the effort needed to restore the work later.",
          "Make reversibility part of the comparison. A decision to hide a feature behind a flag may be easier to revisit than deleting the underlying capability, but the flag itself can add operational complexity. Include the cost of explaining the omission to people who expected it. The best cut is not necessarily the cheapest ticket; it is the change with the most acceptable total consequence.",
        ] },
        { heading: "Who should make the trade-off?", paragraphs: [
          "Find the person accountable for the customer promise and include the people responsible for its safety and delivery. Product should frame the choice, engineering should make technical consequences legible, and design and support should describe user impact. Leadership can set a business constraint, but a title alone does not provide the evidence needed to judge what a cut will break.",
          "Bring a recommendation and at least one credible alternative. Explain which outcome each option protects, what it leaves out, and which assumption would change your view. If teams disagree, identify whether the disagreement is about facts, risk tolerance, or the goal itself. Naming the disagreement helps the decision owner address its real cause rather than ending a meeting with a vague request to “align.”",
        ] },
        { heading: "How do you tell customers and internal teams?", paragraphs: [
          "Describe the capability available at launch, who can use it, and any workaround for a postponed task. Be precise about limitations: “bulk invitation is not in this release” is easier to plan around than “we are continuing to improve the experience.” If the change affects a commitment, name the new expectation and give the affected team a direct path for questions.",
          "Do not present deferred scope as a guaranteed future feature unless it has an owner and a decision date. Tell internal teams what signal will determine whether it returns: repeated support requests, a blocked activation step, or a measurable increase in manual work. That signal turns an omitted item into an open, testable question instead of a promise that quietly disappears.",
        ] },
        { heading: "How do you know when to revisit the decision?", paragraphs: [
          "Record the assumption behind the cut and a time or signal for checking it. For example, if a manual workaround is expected to serve the first twenty accounts, review it after those accounts have onboarded. If the risk is uncertain, instrument the workflow before release so the team can see whether users reach the promised outcome without the deferred capability.",
          "After launch, compare the observed impact with the forecast, including costs the team did not expect. Did support effort rise? Did the smaller release reach the intended outcome? Did the postponed work become less important once customers used the core workflow? Lumo can help capture the original alternatives and confidence so the follow-up is based on what the team knew at decision time, not hindsight alone.",
        ] },
      ],
      exampleLabel: "A product team update",
      exampleMessage: "For the first release, we recommend protecting the invite-and-access outcome and postponing custom column order. Export and account recovery remain in scope because they affect data portability and safe completion. Admins can use the default order for now; we will review the workaround after the first twenty accounts onboard. Design and support, please flag any customer workflow this removes. If the evidence changes that assessment, we will reopen the scope before the release candidate.",
      takeaway: "Protect the outcome, not the original feature list. Make each cut’s user impact and reversibility explicit, then set evidence and an owner for any work you defer.",
    },
    es: {
      title: "Cómo decidir qué recortar del scope antes del launch",
      description: "Un marco para reducir el scope de una versión sin debilitar el resultado central para clientes, ocultar riesgos ni sorprender a los equipos afectados.",
      summary: "Decide qué recortar protegiendo el resultado para el cliente, mostrando dependencias y acordando qué evidencia revisar en la siguiente versión.",
      minutes: 6,
      intro: [
        "Se acerca el lanzamiento, la lista pendiente supera el tiempo disponible y cada tarea tiene quien la defienda. La respuesta tentadora es debatir cada función como si existiera por separado. Es mejor empezar por la promesa que la versión hace a quienes la usarán y preguntar qué trabajo hace falta para cumplirla de manera confiable.",
        "Reducir el scope no siempre es ceder. Puede ser una decisión responsable publicar una experiencia más pequeña y coherente, en vez de una más amplia que falla de maneras previsibles. Esta guía ayuda a comparar recortes, nombrar su costo y explicar qué evidencia podría devolver el trabajo aplazado a una versión futura.",
      ],
      sections: [
        { heading: "¿Qué resultado debe entregar esta versión?", paragraphs: [
          "Escribe el resultado para el cliente en una frase antes de abrir el backlog. Un buen resultado describe lo que alguien podrá hacer, no la lista de pantallas que el equipo quiere construir. «Una persona administradora puede invitar a su equipo y asignar los permisos correctos» sirve mejor que «publicar la página de permisos». Si la frase es ambigua, esa es la primera decisión pendiente.",
          "Separa el resultado de la implementación que imaginó primero el equipo. Una animación, una acción masiva o una preferencia configurable pueden aportar valor sin ser necesarias para que el primer grupo tenga éxito. En cambio, seguridad, recuperación y accesibilidad quizá no se vean en la lista de funciones, aunque sean esenciales. Nombra esos requisitos antes de comparar recortes.",
        ] },
        { heading: "¿Qué tareas son dependencias y no mejoras?", paragraphs: [
          "Dibuja el camino desde que empieza la persona hasta que alcanza el resultado prometido. Marca los pasos donde algo ausente bloquea el avance, crea un estado inseguro o genera consultas a soporte. Son distintos de las mejoras que hacen todo más fluido. Una dependencia puede requerir poco desarrollo y ser esencial, mientras que un caso límite puede esperar sin poner el resultado en riesgo.",
          "Pide a ingeniería, diseño, investigación y soporte que cuestionen el mapa con evidencia: pruebas, entrevistas de usabilidad, accesibilidad, instrumentación y flujos reales de clientes. No dejes que una sola persona defina qué es indispensable. Una revisión breve entre disciplinas suele descubrir una alternativa olvidada o un supuesto que cambia el costo real de recortar algo.",
        ] },
        { heading: "¿Cuál es el costo de cada recorte?", paragraphs: [
          "Describe el beneficio y la consecuencia de cada opción. «Quitar la exportación a CSV» puede reducir pruebas, pero dejar a un cliente importante sin forma de mover sus datos. «Mantener la exportación y aplazar el orden de columnas» quizá proteja el resultado con un costo menor. Compara el tiempo, el mantenimiento futuro, el riesgo de lanzamiento y el efecto para los clientes.",
          "Incluye la reversibilidad en la comparación. Ocultar una función con una bandera puede facilitar revisarla, pero la bandera también añade trabajo operativo. Considera cuánto costará explicar la omisión a quienes la esperaban. El mejor recorte no es necesariamente la tarea más barata, sino la opción cuyas consecuencias totales puede aceptar el equipo.",
        ] },
        { heading: "¿Quién debe elegir el balance?", paragraphs: [
          "Busca a quien responde por la promesa al cliente e incluye a quienes cuidan la seguridad y la entrega. Producto estructura la elección; ingeniería hace visibles las consecuencias técnicas; diseño y soporte explican el efecto para las personas. Dirección puede fijar un límite de negocio, pero el cargo no sustituye la evidencia que muestra lo que un recorte podría romper.",
          "Lleva una recomendación y por lo menos una alternativa creíble. Explica qué resultado protege cada opción, qué deja fuera y qué supuesto cambiaría tu recomendación. Si hay desacuerdo, identifica si es sobre hechos, tolerancia al riesgo o el objetivo mismo. Así quien decide puede responder a la causa real en vez de terminar con una petición vaga de «ponernos de acuerdo».",
        ] },
        { heading: "¿Cómo se lo explicas a clientes y equipos?", paragraphs: [
          "Describe qué estará disponible, quién podrá usarlo y qué alternativa hay para la tarea aplazada. Sé preciso sobre los límites: «la invitación masiva no llega en esta versión» permite planificar mejor que «seguimos mejorando la experiencia». Si cambia un compromiso, explica la nueva expectativa y ofrece a cada equipo afectado una vía clara para consultar.",
          "No presentes el scope aplazado como una función futura garantizada si no tiene responsable y fecha de decisión. Explica qué señal hará que el equipo la considere: consultas repetidas, una activación bloqueada o más trabajo manual. Así lo omitido se convierte en una pregunta comprobable, no en una promesa que desaparece en silencio.",
        ] },
        { heading: "¿Cuándo deben revisar la decisión?", paragraphs: [
          "Registra el supuesto detrás del recorte y una fecha o señal para comprobarlo. Si crees que un proceso manual bastará para las primeras veinte cuentas, revísalo cuando esas cuentas terminen la incorporación. Si no conoces el riesgo, mide el flujo antes del lanzamiento para comprobar si las personas completan la tarea sin la función aplazada.",
          "Después, compara el efecto observado con la predicción, incluidos los costos inesperados. ¿Aumentó el trabajo de soporte? ¿La versión pequeña entregó el resultado esperado? ¿El trabajo aplazado perdió importancia cuando los clientes usaron el flujo principal? Lumo ayuda a guardar las alternativas y la confianza iniciales, para revisar lo ocurrido con el contexto disponible cuando se decidió.",
        ] },
      ],
      exampleLabel: "Una actualización para el equipo de producto",
      exampleMessage: "Para la primera versión, recomendamos proteger la invitación y asignación de permisos, y aplazar el orden de columnas. Exportación y recuperación de cuenta siguen incluidas porque afectan el traslado de datos y la finalización segura. Por ahora, la persona administradora puede usar el orden predeterminado; revisaremos la alternativa después de las primeras veinte cuentas. Diseño y soporte: avisen si esto elimina algún flujo necesario para clientes. Si aparece evidencia nueva, revisaremos el scope antes de publicar la candidata.",
      takeaway: "Protege el resultado para el cliente, no la lista original de funciones. Explica el impacto y la reversibilidad de cada recorte, y asigna evidencia y responsable para lo que aplaces.",
    },
  },
  vpUpdate: {
    en: {
      title: "How to write a decision update for your VP",
      description: "A concise structure for explaining the decision, recommendation, evidence, trade-off, and specific action you need from your product leadership.",
      summary: "Make an executive update useful in one read: say what decision is needed, show the trade-off, and make the requested action unmistakable.",
      minutes: 5,
      intro: [
        "A senior leader rarely needs every discussion that led to a product decision. They do need enough context to understand what is being recommended, what could go wrong, and whether the choice fits the goals they own. A good update makes that judgment possible without asking the reader to excavate a long thread or a crowded slide deck.",
        "This structure works for an approval request, a decision already made, or an escalation where your team is blocked. It keeps the reasoning visible while leaving implementation detail available for follow-up. The central discipline is to state the decision and the action you need before explaining the history.",
      ],
      sections: [
        { heading: "What decision does the VP need to make?", paragraphs: [
          "Write the decision as a direct question with a boundary. “Can we proceed with the enterprise launch if audit export ships in the next release?” is easier to answer than “We have been discussing the launch.” Include the decision owner and the date it is needed. If no approval is required, say whether you are informing the VP or asking them to resolve a conflict.",
          "Do not bundle several unrelated approvals into one request. If the VP needs to choose a launch date and a staffing plan, present the questions separately and explain how they depend on one another. An executive can make a faster, more accountable choice when it is clear which options are open and which constraints the team is not proposing to revisit.",
        ] },
        { heading: "What is your recommendation?", paragraphs: [
          "State your preferred option near the beginning and give the reason in a sentence. A recommendation is not a promise that every risk has disappeared; it is the best-supported next step given the goal, evidence, and constraints. If you are not ready to recommend one, say what evidence or authority is missing and when you expect to have it.",
          "Put the strongest alternative beside your recommendation. Explain why it remains plausible and what the team gives up by not choosing it. This shows that you considered the real trade-off rather than arranging the options so your preferred one looks inevitable. It also gives the VP a useful route to disagree: they can challenge the assumption or the value you prioritized.",
        ] },
        { heading: "Which evidence changes the choice?", paragraphs: [
          "Choose evidence that helps distinguish the alternatives. A customer interview may reveal whether a workaround is acceptable; a reliability test may show whether an incremental release is safe; a delivery estimate may expose a dependency hidden by the original plan. Name the source and date, and be honest about sample size or confidence when the evidence is thin.",
          "Separate evidence from interpretation. “Three of five pilot teams could not complete the setup unaided” is an observation; “all enterprise customers will be blocked” is a broader conclusion. Tell the VP what you infer from the evidence and what could change that interpretation. A short explanation of uncertainty is more credible than decorating an estimate with precise-looking numbers.",
        ] },
        { heading: "What risk and impact matter most?", paragraphs: [
          "Describe the downside in business and customer terms. Translate a technical dependency into its likely effect on adoption, support workload, revenue timing, or trust. Include the cost of waiting where it changes the choice. If the risk is limited to a particular segment, say so rather than implying every customer has the same exposure.",
          "Show the mitigation and what it does not solve. A staged rollout may limit the number of affected accounts but will not remove an underlying data issue. A manual fallback may help a small pilot while increasing support effort. Leaders can set an appropriate risk boundary when they see both the failure mode and the limits of the proposed safeguard.",
        ] },
        { heading: "What action should the VP take next?", paragraphs: [
          "End with one observable request: approve an option, choose between two dates, connect you with an owner, or confirm that the team should proceed within a stated boundary. Add the deadline and the consequence of no decision only when they are real. If the VP needs a pre-read or another participant, make that explicit so the next step does not become another round of clarification.",
          "If you are sharing a decision rather than requesting one, say what has already been decided, who owns delivery, and when you will report the next signal. This prevents an FYI from quietly becoming an approval request after the fact. It also gives a leader a clean way to raise a concern before teams have made further commitments.",
        ] },
        { heading: "How can you keep the update concise?", paragraphs: [
          "Use a short opening, a small comparison of options, and a final action line. Move technical detail, alternative scenarios, and raw research into an appendix or link, but leave enough evidence in the update to support the recommendation. If the reader must open five links to discover your point of view, the summary has not done its job.",
          "Ask someone outside the project to read the note in under a minute and repeat the decision, recommendation, risk, and request. Revise whatever they miss. Save the final version with the evidence and assumptions that were available at the time. Lumo can help you preserve that reasoning and draft audience-specific updates without transferring responsibility for the judgment itself.",
        ] },
      ],
      exampleLabel: "A concise executive update",
      exampleMessage: "Decision needed by Thursday: approve a staged enterprise launch without custom audit export, or hold the launch until export is ready. I recommend the staged option for the five pilot accounts; all can complete setup, while two need a manual export from our team. This protects the target date but adds about one support hour per account. We have not validated the workflow at higher volume. Please confirm the pilot boundary by 3 p.m. Thursday; if you prefer the hold, I will reset the customer plan and bring a revised date.",
      takeaway: "Lead with the decision, your recommendation, the evidence that matters, and one clear request. Make the trade-off and the boundary of your confidence easy to find.",
    },
    es: {
      title: "Cómo actualizar a tu VP sobre una decisión",
      description: "Una estructura breve para presentar a tu VP la decisión pendiente, la recomendación, la evidencia y el balance, junto con la acción concreta que necesitas.",
      summary: "Haz que la actualización ejecutiva se entienda en una lectura: explica qué decisión hace falta, cuál es el balance y qué acción solicitas.",
      minutes: 6,
      intro: [
        "Una persona directiva rara vez necesita todas las conversaciones que llevaron a una decisión de producto. Sí necesita contexto suficiente para entender qué recomiendas, qué puede salir mal y si la elección encaja con los objetivos que tiene a su cargo. Una buena actualización permite evaluar eso sin escarbar en un hilo largo o en una presentación saturada.",
        "Esta estructura sirve para pedir aprobación, comunicar una decisión tomada o escalar un bloqueo del equipo. Mantiene visible el razonamiento sin llenar el mensaje de detalles de implementación. La disciplina principal es decir primero qué decisión hace falta y qué acción necesitas; después, explicar los antecedentes.",
      ],
      sections: [
        { heading: "¿Qué decisión debe tomar tu VP?", paragraphs: [
          "Formula la decisión como una pregunta directa y acotada. «¿Podemos lanzar la versión enterprise si la exportación de auditoría llega en la próxima versión?» se entiende mejor que «Hemos estado hablando del lanzamiento». Indica quién decide y para cuándo. Si no necesitas aprobación, aclara si estás informando o pidiendo resolver un conflicto.",
          "No agrupes varias aprobaciones sin relación en una sola petición. Si tu VP debe elegir fecha y plan de personal, presenta las preguntas por separado y explica cómo se conectan. La decisión será más rápida y responsable cuando se vea qué opciones siguen abiertas y qué límites no propones volver a debatir.",
        ] },
        { heading: "¿Cuál es tu recomendación?", paragraphs: [
          "Di pronto qué opción prefieres y explica el motivo en una frase. Recomendar no significa prometer que desaparecieron todos los riesgos; significa proponer el siguiente paso con mejor respaldo según el objetivo, la evidencia y las restricciones. Si aún no puedes recomendar, explica qué evidencia o autoridad te falta y cuándo la tendrás.",
          "Presenta junto a tu recomendación la alternativa más sólida. Explica por qué sigue siendo razonable y qué se renuncia al no elegirla. Así demuestras que consideraste el balance real y no acomodaste las opciones para que tu favorita pareciera inevitable. También ayudas a tu VP a disentir de forma útil: puede cuestionar el supuesto o la prioridad elegida.",
        ] },
        { heading: "¿Qué evidencia podría cambiar la decisión?", paragraphs: [
          "Elige evidencia que permita distinguir las alternativas. Una entrevista puede aclarar si una solución temporal es aceptable; una prueba de confiabilidad, si una publicación gradual es segura; una estimación, si hay una dependencia oculta. Indica la fuente y la fecha, y sé transparente sobre el tamaño de la muestra o la confianza cuando los datos sean limitados.",
          "Separa la observación de tu interpretación. «Tres de cinco equipos piloto no completaron la configuración sin ayuda» es un hecho; «todos los clientes enterprise tendrán el mismo bloqueo» es una conclusión más amplia. Explica qué deduces y qué cambiaría esa lectura. Nombrar la incertidumbre resulta más creíble que disimularla con cifras de apariencia precisa.",
        ] },
        { heading: "¿Qué riesgo e impacto son importantes?", paragraphs: [
          "Explica la consecuencia en términos de negocio y clientes. Traduce una dependencia técnica en su posible efecto en adopción, carga de soporte, ingresos o confianza. Incluye el costo de esperar si cambia la elección. Si el riesgo afecta a un segmento concreto, dilo en vez de insinuar que todos los clientes tienen la misma exposición.",
          "Describe la mitigación y también lo que no resuelve. Una publicación gradual puede limitar las cuentas afectadas, pero no elimina un problema de datos. Una alternativa manual puede servir en un piloto pequeño y aumentar el trabajo de soporte. La dirección podrá fijar un límite de riesgo razonable si entiende tanto el fallo posible como el alcance de la protección.",
        ] },
        { heading: "¿Qué acción necesitas de tu VP?", paragraphs: [
          "Termina con una petición observable: aprobar una opción, elegir entre fechas, conectar con una persona responsable o confirmar que el equipo puede avanzar dentro de un límite claro. Incluye la fecha límite y el efecto de no decidir solo si son reales. Si hace falta una lectura previa o sumar a alguien, dilo para no abrir otra ronda de aclaraciones.",
          "Si comunicas una decisión en vez de pedirla, aclara qué se decidió, quién responde por la entrega y cuándo compartirás el siguiente resultado. Así, un mensaje informativo no se convierte silenciosamente en una solicitud de aprobación. También le das a dirección una oportunidad concreta de señalar un riesgo antes de que el equipo adquiera más compromisos.",
        ] },
        { heading: "¿Cómo mantienes el mensaje breve?", paragraphs: [
          "Usa una apertura corta, una comparación pequeña y una línea de acción final. Mueve los detalles técnicos, escenarios alternativos y datos de investigación a un anexo, pero conserva evidencia suficiente para sostener la recomendación. Si quien lee debe abrir cinco enlaces para descubrir tu postura, el resumen no está cumpliendo su función.",
          "Pide a alguien ajeno al proyecto que lea la nota en menos de un minuto y repita la decisión, la recomendación, el riesgo y la petición. Revisa lo que no haya entendido. Guarda la versión final con los supuestos y datos disponibles en ese momento. Lumo puede conservar ese razonamiento y ayudarte a adaptar el mensaje sin sustituir el criterio de quien decide.",
        ] },
      ],
      exampleLabel: "Una actualización ejecutiva breve",
      exampleMessage: "Necesitamos decidir antes del jueves: aprobar un launch enterprise gradual sin la exportación de auditoría o esperar hasta que esté lista. Recomiendo avanzar con las cinco cuentas piloto: todas pueden configurar el producto y dos necesitarán una exportación manual del equipo. Así protegemos la fecha, con una hora adicional de soporte por cuenta. Aún no validamos el flujo a mayor escala. Confirma el límite del piloto antes de las 15:00 del jueves. Si prefieres esperar, actualizaré el plan de clientes y propondré otra fecha.",
      takeaway: "Empieza por la decisión, la recomendación, la evidencia relevante y una petición concreta. Haz visible el balance y el límite de lo que sabes.",
    },
  },
  hiring: {
    en: {
      title: "Should you hire now or wait? A team guide",
      description: "Decide whether to hire now or wait by weighing lasting team needs, the cost of delay, and alternatives—with a review signal to keep the choice grounded.",
      summary: "Separate a durable capacity problem from a temporary crunch, compare the cost of waiting, and set a clear signal for revisiting the hire.",
      minutes: 5,
      intro: [
        "An overloaded team can make every open role feel urgent. But hiring takes time, changes how work is coordinated, and creates a commitment that lasts beyond the current sprint. Waiting has a cost too: missed opportunities, burnout, and a growing queue of work. The right answer depends on which constraint you actually have and how long you expect it to last.",
        "Instead of treating the choice as “hire” or “do nothing,” compare hiring with a smaller experiment, a scope reduction, or a temporary shift in ownership. This guide helps a product leader make the need visible, challenge assumptions about the role, and choose a review point that keeps a decision from drifting.",
      ],
      sections: [
        { heading: "Is the capacity gap temporary or durable?", paragraphs: [
          "Look at the work that is not getting done and how long it has been waiting. A launch spike, a parental leave, or a one-time compliance review may justify temporary coverage rather than a permanent role. A recurring stream of customer needs, critical maintenance, or research that never fits into the plan points to a more durable gap. Separate a visible deadline from the underlying pattern.",
          "Use evidence from more than a single busy week: planned versus completed work, incidents, customer commitments, support volume, and time spent on manual tasks. Ask the team what they stopped doing to absorb the load. If quality or learning has quietly fallen, the backlog may understate the real cost. A hiring request is stronger when it names that cost rather than saying only that everyone is busy.",
        ] },
        { heading: "What problem would the role actually own?", paragraphs: [
          "Describe the outcome the new person would be accountable for after their first few months. “Help with product” is not a role boundary. “Own the mobile activation flow and its weekly experiment plan” gives candidates and teammates a clearer picture. If no one can define the decisions or interfaces this role owns, hiring may add coordination before it adds capacity.",
          "Check whether the work is blocked by headcount or by another constraint. A team may lack authority to change a process, agreement on priorities, reliable data, or an available engineering partner. A new hire will not automatically remove those limits. Write down what changes when the person starts and which bottlenecks remain, so the job description does not promise a result the organization cannot support.",
        ] },
        { heading: "What alternatives should you compare?", paragraphs: [
          "Compare the role with redistributing work, stopping a lower-value commitment, bringing in time-limited expertise, and improving a repeated manual process. Each option has costs: context switching can slow existing owners, a contractor may not retain knowledge, and automation still needs maintenance. Put the options beside each other on time to impact, total cost, risk, and reversibility.",
          "Do not use “contractor versus employee” as a shortcut for avoiding the underlying question. If the need is a stable part of the product, continuity and ownership may matter. If it is a short migration or a well-defined audit, a bounded engagement may fit better. The decision should follow the shape and duration of the work, not a general preference for one type of resource.",
        ] },
        { heading: "What does waiting cost the team?", paragraphs: [
          "Estimate the consequence of leaving the gap open for another planning cycle. Customers may wait longer, the team may accept more operational risk, or senior people may keep doing work that prevents them from setting direction. Make the estimate explicit and include its confidence. This gives finance and leadership a way to compare the cost of hiring with the real cost of delay.",
          "Check for less visible human costs. Repeated overtime, interrupted focus, and work that only one person understands can become delivery risks even if dates have not slipped yet. Avoid claiming that hiring will fix burnout by itself; staffing and workload boundaries are both required. A hire can be part of the remedy, but the team should also name what commitments it will stop accepting.",
        ] },
        { heading: "What would make you change your mind?", paragraphs: [
          "Before opening a role, write down the assumption that supports the hire. It might be that demand will continue through two more quarters, that the work needs a dedicated owner, or that an existing team cannot absorb it without dropping a critical outcome. Give each assumption a source and a date for review instead of turning a forecast into a fact.",
          "Choose an observable signal and assign someone to check it. For example, review the customer queue and missed research milestones at the end of the next planning cycle. If demand falls, the organization may pause the role; if the same outcomes remain blocked, the case gets stronger. A checkpoint is not a way to postpone accountability—it is a decision rule that explains what new information should do.",
        ] },
        { heading: "How do you explain the decision to the team?", paragraphs: [
          "Share the need, the options considered, the reason for your choice, and what it does not solve. If you are hiring, explain the ownership boundary and how priorities may change while the person joins. If you are waiting, name which work will stop or remain delayed and when the team will review the gap. Both decisions deserve an honest account of their trade-offs.",
          "Record the expected result and revisit it after onboarding or at the agreed checkpoint. Did the new role reduce the constraint? Did coordination become harder? Did the work itself change? Lumo helps capture the first expectation alongside later evidence, so the next staffing choice can learn from this one instead of relying on a memory shaped only by how busy the team feels today.",
        ] },
      ],
      exampleLabel: "A team decision note",
      exampleMessage: "Recommendation: open a product research role, but review the business case after the next planning cycle before expanding the team further. For two cycles, three discovery projects have been delayed and product leads have absorbed interview work alongside launch commitments. A contractor could clear the current interview backlog, but would not own ongoing customer research. We will track completed studies and the time leads spend on interviews; if the demand falls, we will pause the search rather than preserve the role by inventing work.",
      takeaway: "Hire when the gap is durable, the ownership is clear, and the organization can support the role. Compare alternatives and decide in advance what evidence would change your mind.",
    },
    es: {
      title: "¿Contratar ahora o esperar? Guía para producto",
      description: "Evalúa si conviene contratar, redistribuir tareas o esperar: compara la necesidad de capacidad, el costo del retraso y la evidencia que podría cambiar el plan.",
      summary: "Distingue un problema permanente de capacidad de una urgencia temporal, compara el costo de esperar y fija una señal para revisar la contratación.",
      minutes: 6,
      intro: [
        "Cuando un equipo está saturado, cada puesto parece urgente. Pero contratar lleva tiempo, cambia la coordinación y crea un compromiso que dura más que el sprint actual. Esperar también cuesta: oportunidades perdidas, agotamiento y una fila de tareas cada vez mayor. La respuesta depende de qué limitación existe realmente y cuánto tiempo durará.",
        "En lugar de reducir la decisión a «contratar» o «no hacer nada», compara la contratación con un experimento pequeño, reducir scope o cambiar temporalmente la responsabilidad. Esta guía ayuda a hacer visible la necesidad, cuestionar los supuestos sobre el puesto y fijar una fecha de revisión para que la decisión no se quede en pausa indefinidamente.",
      ],
      sections: [
        { heading: "¿La falta de capacidad es temporal o duradera?", paragraphs: [
          "Observa qué trabajo no se está haciendo y desde cuándo espera. Un pico de lanzamiento, una licencia o una revisión de cumplimiento puntual quizá necesite una cobertura temporal, no un puesto permanente. Una demanda recurrente de clientes, mantenimiento crítico o investigación que nunca encuentra espacio sugieren una brecha duradera. Distingue una fecha límite visible del patrón que la causa.",
          "Revisa evidencia de más de una semana ocupada: planes frente a trabajo terminado, incidentes, compromisos, consultas de soporte y tareas manuales. Pregunta al equipo qué dejó de hacer para absorber la carga. Si la calidad o el aprendizaje disminuyen sin aparecer en el backlog, la lista pendiente subestima el costo. Una solicitud de contratación es más sólida si explica esa consecuencia y no solo que todos tienen mucho trabajo.",
        ] },
        { heading: "¿Qué problema tendría a su cargo la persona?", paragraphs: [
          "Describe el resultado del que la nueva persona sería responsable después de sus primeros meses. «Ayudar con producto» no define los límites del puesto. «Liderar la activación móvil y su plan semanal de experimentos» da más claridad a candidatos y al equipo. Si nadie puede explicar qué decisiones o interfaces serían responsabilidad del puesto, contratar podría añadir coordinación antes de aumentar la capacidad.",
          "Comprueba si el bloqueo realmente depende de sumar a alguien. Quizá el equipo no tenga autoridad para cambiar un proceso, acuerdo sobre prioridades, datos confiables o apoyo de ingeniería. La contratación no elimina automáticamente esas restricciones. Anota qué cambiará cuando llegue la persona y qué límites seguirán ahí, para que la descripción no prometa un resultado que la organización no puede sostener.",
        ] },
        { heading: "¿Qué alternativas conviene comparar?", paragraphs: [
          "Compara el puesto con redistribuir trabajo, detener un compromiso de menor valor, contratar experiencia por tiempo limitado y mejorar un proceso manual recurrente. Cada opción tiene costos: cambiar de contexto ralentiza al equipo, un contrato corto quizá pierda conocimiento y automatizar también requiere mantenimiento. Compara tiempo hasta obtener resultados, costo total, riesgo y reversibilidad.",
          "No uses «contratista o empleado» para evitar la pregunta principal. Si la necesidad es estable, pueden importar la continuidad y la responsabilidad a largo plazo. Para una migración breve o una auditoría bien delimitada, un proyecto temporal puede encajar mejor. La forma y duración del trabajo deberían determinar la alternativa, no una preferencia general por cierto tipo de recurso.",
        ] },
        { heading: "¿Cuánto le cuesta esperar al equipo?", paragraphs: [
          "Estima qué ocurrirá si la brecha sigue abierta otro ciclo de planificación. Los clientes podrían esperar, el equipo aceptar más riesgo operativo o las personas responsables pasar más tiempo ejecutando que definiendo prioridades. Haz explícita la estimación e indica cuánta confianza tienes. Así, finanzas y dirección pueden comparar la contratación con el costo real de retrasarla.",
          "Busca los costos humanos menos visibles. Las horas extra repetidas, la falta de concentración y el trabajo que solo una persona entiende pueden convertirse en riesgos aunque las fechas aún no se retrasen. No afirmes que contratar resolverá el agotamiento por sí solo; también hacen falta límites de carga. Sumar a alguien puede ayudar, pero el equipo debe decidir qué compromisos dejará de aceptar.",
        ] },
        { heading: "¿Qué evidencia te haría cambiar de opinión?", paragraphs: [
          "Antes de publicar la vacante, escribe el supuesto que justifica contratar. Puede ser que la demanda siga durante dos trimestres, que el trabajo necesite una persona responsable o que el equipo actual no pueda absorberlo sin abandonar un resultado crítico. Anota la fuente y cuándo la revisarás, en vez de presentar un pronóstico como si ya fuera un hecho.",
          "Elige una señal observable y asigna a alguien para comprobarla. Por ejemplo, revisen la fila de clientes y los hitos de investigación al final del siguiente ciclo. Si la demanda baja, quizá puedan pausar el puesto; si se repiten los bloqueos, la necesidad gana respaldo. La fecha de revisión no evita decidir: define cómo deberá influir la información nueva.",
        ] },
        { heading: "¿Cómo explicas la decisión al equipo?", paragraphs: [
          "Comparte la necesidad, las alternativas, el motivo de la elección y lo que no resolverá. Si vas a contratar, aclara los límites de responsabilidad y qué prioridades podrían cambiar durante la incorporación. Si vas a esperar, especifica qué trabajo se detendrá o seguirá atrasado y cuándo revisarán la brecha. Ambas opciones merecen una explicación honesta de sus costos.",
          "Registra el resultado esperado y revísalo después de la incorporación o en la fecha acordada. ¿El puesto redujo la limitación? ¿Hizo más difícil coordinarse? ¿Cambió el trabajo? Lumo ayuda a conservar la expectativa inicial junto a la evidencia posterior, para que la siguiente decisión de personal aprenda de esta y no dependa solo de lo ocupada que se sienta la gente hoy.",
        ] },
      ],
      exampleLabel: "Una nota de decisión para el equipo",
      exampleMessage: "Recomendación: abrir un puesto de investigación de producto y revisar el caso al terminar el siguiente ciclo antes de ampliar más el equipo. Durante dos ciclos se retrasaron tres proyectos de descubrimiento y las personas de producto sumaron entrevistas a sus compromisos de lanzamiento. Un contrato temporal resolvería la fila actual, pero no asumiría la investigación continua. Mediremos estudios completados y horas de entrevistas de producto; si la demanda baja, pausaremos la búsqueda en vez de inventar trabajo para justificar el puesto.",
      takeaway: "Contrata cuando la brecha sea duradera, la responsabilidad esté clara y la organización pueda apoyar el puesto. Compara alternativas y define qué evidencia cambiaría tu decisión.",
    },
  },
};

export function getGuideArticle(id: GuideId, locale: Locale) {
  return GUIDE_CONTENT[id][locale];
}

export function allGuideArticles(locale: Locale) {
  return (Object.keys(GUIDE_CONTENT) as GuideId[]).map((id) => ({ id, ...GUIDE_CONTENT[id][locale] }));
}


