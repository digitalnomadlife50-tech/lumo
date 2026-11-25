import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GlobalNotFoundView from "@/components/lumo/global-not-found";
import "./globals.css";
import "./lumo.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "404 | Lumo",
  description: "The requested Lumo page could not be found.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <GlobalNotFoundView />
      </body>
    </html>
  );
}
