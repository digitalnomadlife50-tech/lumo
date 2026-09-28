import type { MetadataRoute } from "next";
import {
  GUIDE_IDS,
  GUIDE_PATHS,
  articleAlternatePaths,
  guidePath,
  localizedUrl,
} from "@/lib/seo";

const lastModified = new Date("2026-09-28");
const pagePairs = [
  { en: "", es: "" },
  { en: "/app", es: "/app" },
  { en: "/app/demo", es: "/app/demo" },
  { en: GUIDE_PATHS.en, es: GUIDE_PATHS.es },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = pagePairs.flatMap(({ en, es }) =>
    (["en", "es"] as const).map((locale) => ({
      url: localizedUrl(locale, locale === "en" ? en : es),
      lastModified,
      alternates: {
        languages: {
          en: localizedUrl("en", en),
          es: localizedUrl("es", es),
          "x-default": localizedUrl("en", en),
        },
      },
    })),
  );

  const guides = GUIDE_IDS.flatMap((id) => {
    const paths = articleAlternatePaths(id);
    return (["en", "es"] as const).map((locale) => ({
      url: localizedUrl(locale, guidePath(locale, id)),
      lastModified,
      alternates: {
        languages: {
          en: localizedUrl("en", paths.en),
          es: localizedUrl("es", paths.es),
          "x-default": localizedUrl("en", paths.en),
        },
      },
    }));
  });

  return [...pages, ...guides];
}

export const dynamic = "force-static";

