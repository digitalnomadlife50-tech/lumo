import type { Metadata } from "next"
import DemoHome from "@/components/lumo/demo-home"

export const metadata: Metadata = {
  title: "Lumo, demo mode",
  description: "See Lumo after 40 decisions: the judgment map, the monthly brief, and a real call played out end to end.",
}

export default function DemoPage() {
  return <DemoHome />
}
