// app/adventures/page.tsx
// PURPOSE: /adventures — listing page for all active adventures.
// Server component. Fetches adventures + active sections from lib/data.ts,
// computes an ItemList JSON-LD, a breadcrumb JSON-LD, and renders
// <AdventuresPage> (client component) inside <Suspense>.
//
// CONNECTED TO:
//   - lib/data.ts (getAdventures, getActiveSections)
//   - lib/seo.ts (getAdventuresMetadata as `export const metadata`,
//     getBreadcrumbSchema, SITE_URL)
//   - components/AdventuresPage.tsx (renders the filter UI + adventure grid)
//   - components/AdventuresPage.tsx internal imports:
//     AdventuresFilters, AdventureCard, Navbar, Footer, HeroSection,
//     MountainSilhouette, SpecialOfferPopup, LiveRefresh, useLiveRefresh
//   - This page sets `export const revalidate = 30` (ISR: revalidate every 30s).
import { Suspense } from "react";
import { getAdventures, getActiveSections } from "@/lib/data";
import {
  SITE_URL,
  getAdventuresMetadata,
  getBreadcrumbSchema,
} from "@/lib/seo";
import AdventuresPage from "@/components/AdventuresPage";

export const metadata = getAdventuresMetadata();
export const revalidate = 30;

export default async function Page() {
  const [adventures, sections] = await Promise.all([
    getAdventures(),
    getActiveSections(),
  ]);

  const active = (adventures || []).filter((adventure) => adventure.is_active);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Trekking & adventure packages in Uttarakhand",
      numberOfItems: active.length,
      itemListElement: active.map((adventure, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: adventure.title,
        url: `${SITE_URL}/adventures/${adventure.slug}`,
      })),
    },
    getBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Adventures", url: `${SITE_URL}/adventures` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={null}>
        <AdventuresPage
          adventures={adventures || []}
          sections={sections || []}
        />
      </Suspense>
    </>
  );
}
