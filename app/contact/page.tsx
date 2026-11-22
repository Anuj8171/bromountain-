// app/contact/page.tsx
// PURPOSE: /contact — contact page with the contact form + FAQ accordion.
// Server component. Fetches active sections for the footer links, passes the
// lib/faqs array into getFaqSchema() to generate FAQPage JSON-LD, and renders
// <ContactClient> (client component) which holds the whole UI: navbar, hero,
// contact info cards, the form (react-hook-form), FAQ accordion, and footer.
//
// CONNECTED TO:
//   - lib/data.ts (getActiveSections)
//   - lib/faqs.ts (faqs array — single source of truth for FAQs)
//   - lib/seo.ts (getContactMetadata, getFaqSchema, getBreadcrumbSchema, SITE_URL)
//   - components/ContactClient.tsx (renders the entire contact page UI)
//   - This page sets `export const revalidate = 30` (ISR).
// NOTE: ContactClient renders its own Navbar + Footer and does NOT receive
//   sections from this page for the Navbar — check if that's intentional.
import { getActiveSections } from "@/lib/data";
import { faqs } from "@/lib/faqs";
import {
  SITE_URL,
  getContactMetadata,
  getFaqSchema,
  getBreadcrumbSchema,
} from "@/lib/seo";
import ContactClient from "@/components/ContactClient";

export const metadata = getContactMetadata();
export const revalidate = 30;

export default async function Page() {
  const [sections] = await Promise.all([getActiveSections()]);

  const structuredData = [
    getFaqSchema(faqs.map((faq) => ({ question: faq.q, answer: faq.a }))),
    getBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Contact", url: `${SITE_URL}/contact` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ContactClient sections={sections || []} />
    </>
  );
}
