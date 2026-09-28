import type { CurrentDecision } from "../types"

export const CURRENT_DECISION_ES: CurrentDecision = {
  number: 41,
  question: "¿Lanzar el nuevo flujo de reservas el 14 de octubre, o esperar tres semanas por Brightline?",
  kind: "timing",
  sources: [
    {
      id: "slack",
      label: "Slack #booking-launch",
      lines: [
        "Dana: Brightline quiere la vista multi-sucursal antes de firmar. Hablan de un contrato de tres años.",
        "Marco: Multi-sucursal son tres semanas, mínimo. No puedo hacerlo junto con la corrección de pagos.",
      ],
    },
    {
      id: "linear",
      label: "Linear REL-412",
      lines: ["Corrección de pagos. Cargos duplicados en reservas reprogramadas. 40 clientes afectados."],
    },
    {
      id: "docs",
      label: 'Doc de Google "Plan Q4"',
      lines: ["El nuevo flujo de reservas se lanza el 14 de octubre."],
    },
    {
      id: "calendar",
      label: "Google Calendar",
      lines: ["Revisión de launch con Maya, viernes 10 a. m."],
    },
  ],
  options: [
    { letter: "A", label: "Lanzar el 14, multi-sucursal después", summary: "Cumplir la fecha de Q4 con la corrección de pagos. Multi-sucursal viene después.", source: "user" },
    { letter: "B", label: "Esperar tres semanas y lanzar todo junto", summary: "Retrasar el launch para que Brightline reciba multi-sucursal al mismo tiempo.", source: "user" },
    { letter: "C", label: "Lanzar el 14 y darle a Brightline una fecha comprometida para multi-sucursal", summary: "Lanzar a tiempo y poner una fecha real por escrito para la función que Brightline quiere.", source: "lumo" },
  ],
  gut: { option: "A", confidence: 4, worry: "Brightline se va" },
  findings: {
    research: "En las notas de la llamada de la semana pasada, el director de operaciones de Brightline dijo que la fecha es flexible si la recibe por escrito.",
    outsideView: "Tus últimas seis decisiones sobre fechas y plazos: cuatro salieron peor de lo esperado. Las estimaciones de pagos de Marco se han alargado tres veces.",
    premortem: "Es noviembre. Brightline firmó con otro. \"Después\" sonó a \"nunca\" porque nadie les dio una fecha.",
    playItForward: [
      { option: "A", beats: ["14 oct: se lanza. Sale la corrección de pagos.", "20 oct: Brightline pregunta cuándo. Dana no tiene respuesta.", "Nov: el trato se estanca."] },
      { option: "B", beats: ["14 oct: no hay launch. El bug de pagos sigue activo para 40 clientes.", "4 nov: todo se lanza junto.", "Nov: soporte sale de tres semanas más de tickets de cargos duplicados."] },
      { option: "C", beats: ["14 oct: se lanza con la corrección de pagos.", "15 oct: Dana envía a Brightline una fecha por escrito para multi-sucursal.", "4 nov: multi-sucursal se lanza en la fecha. Brightline firma."] },
    ],
  },
  gap: "Tu instinto acertó la fecha de launch. No viste que a Brightline le importa más una fecha que la función.",
  resurfaced: {
    decisionNumber: 29,
    title: "Comprometer una fecha para los registros de auditoría de Acme",
    outcome: "La fecha se movió dos veces y Acme escaló.",
    lesson: "Suma el peor caso de Marco antes de darle una fecha a un cliente.",
    ifThen: "Cuando le doy una fecha a un cliente, primero sumo el peor caso del líder de ingeniería.",
  },
  final: {
    option: "C",
    confidence: 3,
    why: "Brightline necesita una fecha más que la función, y la corrección de pagos no puede esperar tres semanas.",
    gaveUp: "Cerrar a Brightline este trimestre",
  },
  tripwire: "Si la estimación de Marco pasa de cuatro semanas, revisar",
  revisitDate: "2026-10-28",
  drafts: [
    {
      audience: "Maya Chen",
      channel: "dm",
      body: "Un aviso rápido antes de la revisión del viernes. Lanzo el flujo de reservas el 14 con la corrección de pagos, no espero a Brightline. Marco no puede hacer multi-sucursal junto con el trabajo de pagos, y el bug de cargos duplicados ya afecta a 40 clientes. Dana le dará a Brightline una fecha por escrito para multi-sucursal el 4 de nov. Riesgo: si la estimación de Marco crece, esa fecha se mueve, así que lo reviso el 28.",
      pushback: { objection: "No podemos mover otra fecha. Es la tercera este trimestre.", response: "Por eso doy un rango internamente y solo comprometo el 4 de nov con Brightline después de que Marco confirme. Si su estimación pasa de cuatro semanas, te enterarás por mí el 28, no después." },
    },
    {
      audience: "Marco Diaz",
      channel: "slack",
      body: "Decidido: lanzar el 14 con la corrección de pagos, multi-sucursal justo después. Necesito un peor caso real de multi-sucursal para el viernes, para que Dana le dé a Brightline una fecha que sí podamos cumplir. Si es más de cuatro semanas, dímelo ahora y fijaré la fecha a partir de eso.",
      pushback: { objection: "No puedo prometer una fecha de multi-sucursal hasta revisar el modelo de sucursales.", response: "Entendido. Dame tu peor caso, no el mejor. Prefiero dar una fecha larga y cumplirla que una ajustada y fallar." },
    },
    {
      audience: "Dana Brooks",
      channel: "slack",
      body: "Plan para Brightline: lanzamos el 14 y tú les das una fecha por escrito para multi-sucursal, el 4 de nov. Su director de operaciones ya dijo que la fecha es flexible si está por escrito. Por favor no envíes la fecha hasta que Marco confirme su estimación el viernes. Te la haré llegar el mismo día.",
      pushback: { objection: "Brightline está listo ahora. Esperar una fecha podría perder el trato.", response: "La fecha es lo que los mantiene. Su propio líder de operaciones lo dijo. Lo que pierde el trato es el silencio en tres semanas, que es lo que pasa si lanzamos y no decimos nada." },
    },
    {
      audience: "Priya Shah",
      channel: "slack",
      body: "El flujo de reservas se lanza el 14 con la corrección de pagos para el bug de cargos duplicados, REL-412, 40 clientes afectados. Probablemente veas un aumento de preguntas sobre el flujo de reservas esa semana. Multi-sucursal llega el 4 de nov. Lo aviso con tiempo para que soporte no sea el último en enterarse.",
      pushback: { objection: "Todavía estamos limpiando tickets del último launch.", response: "Justo. La corrección de pagos debería reducir los tickets de cargos duplicados que ves ahora. Te enviaré la lista de problemas conocidos dos días antes del 14 para que tu equipo tenga respuestas listas." },
    },
    {
      audience: "Brightline",
      channel: "email",
      body: "Gracias por la paciencia con multi-sucursal. Así quedan las cosas. El 14 de octubre lanzamos un flujo de reservas actualizado con una corrección de pagos. Multi-sucursal, la vista que pidió tu equipo, se lanza el 4 de noviembre. Esa fecha está en nuestro roadmap. Te mantendré al tanto conforme se acerque y puedo mostrar el flujo a ti y a tu equipo de operaciones antes de entonces.",
      pushback: { objection: "¿Puedes comprometerte a esa fecha de noviembre?", response: "Sí. Está en nuestro plan y lo avisaré con tiempo si algo cambia. Tendrás la vista multi-sucursal para tu equipo antes del 4 de noviembre." },
    },
  ],
}
