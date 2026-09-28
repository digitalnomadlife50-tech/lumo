import type { DemoPersona } from "../types"

export const PERSONA_ES: DemoPersona = {
  name: "Jordan Ellis",
  role: "Product Manager sénior",
  company: "Relay",
  companyNote: "una plataforma de agendamiento para empresas de servicios a domicilio. Jordan es dueño de la experiencia de reservas.",
  monthsUsing: 8,
  stakeholders: [
    { name: "Maya Chen", role: "VP de Producto", note: "Quiere el riesgo primero. Cuestionó mis dos últimos compromisos de fecha." },
    { name: "Marco Diaz", role: "Líder de ingeniería", note: "Estimador honesto, pero sus estimaciones se alargan en todo lo que toca pagos." },
    { name: "Dana Brooks", role: "Líder de ventas", note: "Comparte las fechas con los clientes el mismo día que las escucha." },
    { name: "Priya Shah", role: "Líder de soporte", note: "Suele enterarse de los cambios al final. No debería." },
    { name: "Jordan Lee", role: "Líder de diseño", note: "Necesita un aviso antes de los cambios de alcance, no después." },
  ],
  sources: [
    { id: "slack", label: "Slack" },
    { id: "linear", label: "Linear" },
    { id: "docs", label: "Google Docs" },
    { id: "calendar", label: "Google Calendar" },
  ],
}
