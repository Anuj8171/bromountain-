// lib/seo.ts
// PURPOSE: Generates Metadata objects and JSON-LD structured data for every
//   public page. Each page calls the appropriate get*Metadata() function and
//   the appropriate get*Schema() function for its JSON-LD script tag.
//   Also holds shared constants (SITE_URL, SITE_NAME, etc.) used by pages
//   and components for canonical URLs, OG images, breadcrumbs, etc.
// CONNECTED TO: Every app/*/page.tsx imports metadata functions from here.
//   app/contact/page.tsx also uses faqs via getFaqSchema.
//   app/adventures/[slug]/page.tsx uses getAdventureMetadata + getAdventureSchema.
//   app/reviews/page.tsx uses getReviewsMetadata + getReviewsSchema.
//   app/page.tsx uses getHomeMetadata + getOrganizationSchema + getWebSiteSchema.
//   Components use SITE_URL for links/breadcrumbs.
import type { Metadata } from "next";
import type { Adventure, Review } from "@/types";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bromountain.in"
).replace(/\/$/, "");
export const SITE_NAME = "BroMountain Adventures";
export const SITE_DESCRIPTION =
  "Uttarkashi-based trekking and adventure company. Himalayan treks, camping and expedition experiences across Uttarakhand. Go where roads don't.";
export const DEFAULT_IMAGE = `${SITE_URL}/og`;
export const BUSINESS_PHONE = "+91 8171299264";
export const BUSINESS_EMAIL = "hello@bromountain.in";
export const BUSINESS_CITY = "Uttarkashi";
export const BUSINESS_STATE = "Uttarakhand";

// ── Base metadata — shared across all pages ──────────────────
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "travel",
  formatDetection: { telephone: true, email: true, address: true },
  // NOTE: no canonical here — every page declares its own in `alternates`.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// ── Homepage SEO ─────────────────────────────────────────────
export function getHomeMetadata(): Metadata {
  const title =
    "BroMountain Adventures | Trekking & Adventure in Uttarkashi, Uttarakhand";
  const description =
    "Trek in Uttarkashi with local Himalayan guides. Kedarkantha, Har Ki Dun, Dayara Bugyal, Brahmatal and custom Uttarakhand adventures. Based in Uttarkashi.";

  return {
    ...baseMetadata,
    title: { absolute: title },
    description,
    keywords: [
      "trekking in uttarkashi",
      "uttarkashi treks",
      "uttarkashi trekking company",
      "trekking in uttarakhand",
      "himalayan trekking",
      "kedarkantha trek",
      "har ki dun trek",
      "brahmatal trek",
      "dayara bugyal trek",
      "camping uttarkashi",
      "adventure sports uttarakhand",
      "bromountain adventures",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: DEFAULT_IMAGE,
          width: 1200,
          height: 630,
          alt: "BroMountain Adventures — trekking in Uttarkashi, Uttarakhand",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_IMAGE],
    },
  };
}

// ── Adventures listing page SEO ──────────────────────────────
export function getAdventuresMetadata(): Metadata {
  const title = "Trekking & Adventure Packages in Uttarakhand";
  const description =
    "Explore all trekking, camping and adventure experiences in Uttarakhand. Filter by difficulty, duration and price. Locally operated from Uttarkashi.";

  return {
    ...baseMetadata,
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    keywords: [
      "uttarakhand treks list",
      "trekking packages uttarakhand",
      "uttarkashi trek packages",
      "camping packages uttarkashi",
      "himalayan adventure tours",
      "bromountain adventures",
    ],
    alternates: { canonical: "/adventures" },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/adventures`,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_IMAGE],
    },
  };
}

// ── Single adventure page SEO ────────────────────────────────
export function getAdventureMetadata(adventure: Adventure): Metadata {
  const title = `${adventure.title} | ${SITE_NAME}`;
  const location = adventure.location || BUSINESS_CITY;
  const tagline = adventure.tagline || `Trek in ${location}, Uttarakhand`;
  const description = `${tagline}. ${adventure.duration_days} days / ${adventure.duration_nights} nights from ₹${adventure.discounted_price.toLocaleString(
    "en-IN"
  )}. Locally operated from Uttarkashi, Uttarakhand.`;
  const image = adventure.cover_image_url || DEFAULT_IMAGE;

  return {
    ...baseMetadata,
    title: { absolute: title },
    description,
    keywords: [
      adventure.title.toLowerCase(),
      `${adventure.title.toLowerCase()} trek`,
      `${adventure.title.toLowerCase()} uttarakhand`,
      `${location.toLowerCase()} trek`,
      `${adventure.difficulty.toLowerCase()} trek uttarakhand`,
      "uttarkashi trek",
      "bromountain adventures",
    ],
    alternates: { canonical: `/adventures/${adventure.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/adventures/${adventure.slug}`,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: adventure.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ── Reviews page SEO ─────────────────────────────────────────
export function getReviewsMetadata(): Metadata {
  const title = `Trekker Reviews & Experiences | ${SITE_NAME}`;
  const description =
    "Real reviews from BroMountain trekkers. Read what guests say about our Uttarkashi-based Himalayan treks, camping and adventure experiences.";

  return {
    ...baseMetadata,
    title: { absolute: title },
    description,
    keywords: [
      "bromountain reviews",
      "uttarakhand trek reviews",
      "uttarkashi trekking reviews",
      "trekking experience uttarakhand",
      "bromountain adventures feedback",
    ],
    alternates: { canonical: "/reviews" },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/reviews`,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_IMAGE],
    },
  };
}

// ── Contact page SEO ─────────────────────────────────────────
export function getContactMetadata(): Metadata {
  const title = `Contact Us | ${SITE_NAME}, Uttarkashi`;
  const description =
    "Plan your Himalayan trek with BroMountain Adventures. Based in Uttarkashi, Uttarakhand. Ask questions, check departures or book a custom adventure.";

  return {
    ...baseMetadata,
    title: { absolute: title },
    description,
    keywords: [
      "contact bromountain",
      "uttarkashi trekking company",
      "book trek uttarakhand",
      "uttarkashi tour operator",
      "himalayan trek booking",
    ],
    alternates: { canonical: "/contact" },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/contact`,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_IMAGE],
    },
  };
}

// ── JSON-LD Structured Data ───────────────────────────────────
// For Google rich results and local search

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: DEFAULT_IMAGE,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS_CITY,
      addressRegion: BUSINESS_STATE,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.7268,
      longitude: 78.4354,
    },
    areaServed: [
      { "@type": "City", name: "Uttarkashi" },
      { "@type": "City", name: "Dehradun" },
      { "@type": "City", name: "Rishikesh" },
      { "@type": "AdministrativeArea", name: "Uttarakhand" },
    ],
    sameAs: [
      "https://www.instagram.com/bromountains/",
      "https://whatsapp.com/channel/0029Vb6ljRcBPzjRrHFtEP2Z",
    ],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getReviewsSchema(reviews: Review[]) {
  if (!reviews.length) return null;

  const ratingValue =
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.reviewer_name },
      datePublished: review.created_at.slice(0, 10),
      name: review.title,
      reviewBody: review.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

export function getAdventureSchema(adventure: Adventure) {
  const itinerary =
    adventure.itinerary && adventure.itinerary.length > 0
      ? {
          "@type": "ItemList",
          numberOfItems: adventure.itinerary.length,
          itemListElement: adventure.itinerary.map((day) => ({
            "@type": "ListItem",
            position: day.day_number,
            name: day.title,
          })),
        }
      : {
          "@type": "ItemList",
          numberOfItems: adventure.duration_days,
        };

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: adventure.title,
    description: adventure.description || adventure.tagline,
    url: `${SITE_URL}/adventures/${adventure.slug}`,
    image: adventure.cover_image_url || DEFAULT_IMAGE,
    touristType: "Adventure",
    itinerary,
    offers: {
      "@type": "Offer",
      price: adventure.discounted_price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/adventures/${adventure.slug}`,
    },
    provider: {
      "@type": "TravelAgency",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      telephone: BUSINESS_PHONE,
      address: {
        "@type": "PostalAddress",
        addressLocality: BUSINESS_CITY,
        addressRegion: BUSINESS_STATE,
        addressCountry: "IN",
      },
    },
  };
}
