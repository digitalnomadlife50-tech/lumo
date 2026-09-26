import type { DemoPersona } from "./types"

export const PERSONA: DemoPersona = {
  name: "Jordan Ellis",
  role: "Senior Product Manager",
  company: "Relay",
  companyNote: "a scheduling platform for home-service companies. Jordan owns the booking experience.",
  monthsUsing: 8,
  stakeholders: [
    { name: "Maya Chen", role: "VP of Product", note: "Wants the risk first. Pushed back on my last two date commitments." },
    { name: "Marco Diaz", role: "Engineering lead", note: "Honest estimator, but his estimates run long on anything touching payments." },
    { name: "Dana Brooks", role: "Sales lead", note: "Shares dates with customers the same day she hears them." },
    { name: "Priya Shah", role: "Support lead", note: "Usually hears about changes last. She shouldn't." },
    { name: "Jordan Lee", role: "Design lead", note: "Needs a heads-up before scope changes, not after." },
  ],
  sources: [
    { id: "slack", label: "Slack" },
    { id: "linear", label: "Linear" },
    { id: "docs", label: "Google Docs" },
    { id: "calendar", label: "Google Calendar" },
  ],
}
