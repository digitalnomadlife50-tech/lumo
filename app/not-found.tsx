import type { Metadata } from "next";
import GlobalNotFoundView from "@/components/lumo/global-not-found";
import "./globals.css";
import "./lumo.css";

export const metadata: Metadata = {
  title: "404 | Lumo",
  description: "The requested Lumo page could not be found.",
};

export default function NotFound() {
  return <GlobalNotFoundView />;
}
