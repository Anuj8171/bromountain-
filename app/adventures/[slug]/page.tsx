import { notFound } from "next/navigation";
import AdventureDetailClient from "@/components/AdventureDetailClient";
import { getAdventureBySlug, getAdventures, getSections } from "@/lib/data";
import {
  SITE_URL,
  getAdventureMetadata,
  getAdventureSchema,
  getBreadcrumbSchema,
} from "@/lib/seo";

export const revalidate = 60;

// ✅ Metadata (SEO)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const adventure = await getAdventureBySlug(slug);

  if (!adventure) return {};

  return getAdventureMetadata(adventure);
}

// ✅ Static params (SSG)
export async function generateStaticParams() {
  const adventures = await getAdventures();

  return adventures.map((a) => ({
    slug: a.slug,
  }));
}

// ✅ Page Component
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const adventure = await getAdventureBySlug(slug);
  const sections = await getSections();
  if (!adventure) {
    notFound();
  }

  const structuredData = [
    getAdventureSchema(adventure),
    getBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Adventures", url: `${SITE_URL}/adventures` },
      {
        name: adventure.title,
        url: `${SITE_URL}/adventures/${adventure.slug}`,
      },
    ]),
  ];

  return (
    <>
      {/* ✅ Structured Data (SEO Schema) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <AdventureDetailClient adventure={adventure} sections={sections} />
    </>
  );
}
