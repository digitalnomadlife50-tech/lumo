import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

// Locale-aware navigation primitives. Components should import Link / useRouter
// from here (not next/navigation) so the active locale prefix is preserved.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
