// app/page.tsx
// PURPOSE: Homepage (/) — the main marketing entry point.
// Server component. Fetches sections, featured adventures, approved reviews,
// and active special offer from lib/data.ts, then renders:
//   <Navbar> <HeroSection> <SectionsGrid> <FeaturedAdventures>
//   <WhyChooseUs> <AboutSection> <ReviewsSection> <Footer>
//   + optional <SpecialOfferPopup> if an active offer exists.
//
// Also injects JSON-LD (Organization + WebSite schema) for SEO.
//
// CONNECTED TO:
//   - lib/data.ts (getSections, getFeaturedAdventures, getApprovedReviews,
//     getActiveOffer)
//   - lib/seo.ts (getHomeMetadata as `export const metadata`, plus
//     getOrganizationSchema + getWebSiteSchema for JSON-LD)
//   - components/Navbar.tsx, HeroSection.tsx, SectionsGrid.tsx,
//     FeaturedAdventures.tsx, WhyChooseUs.tsx, AboutSection.tsx,
//     ReviewsSection.tsx, SpecialOfferPopup.tsx, Footer.tsx
//   - app/layout.tsx (wraps this page with the site shell + mountain backdrop)
import {
  getSections,
  getFeaturedAdventures,
  getApprovedReviews,
  getActiveOffer,
} from "@/lib/data";
import {
  getHomeMetadata,
  getOrganizationSchema,
  getWebSiteSchema,
} from "@/lib/seo";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SectionsGrid from "@/components/SectionsGrid";
import FeaturedAdventures from "@/components/FeaturedAdventures";
import WhyChooseUs from "@/components/WhyChooseUs";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import SpecialOfferPopup from "@/components/SpecialOfferPopup";
import Footer from "@/components/Footer";

export const metadata = getHomeMetadata();

export default async function Home() {
  const [sections, adventures, reviews, offer] = await Promise.all([
    getSections(),
    getFeaturedAdventures(),
    getApprovedReviews(),
    getActiveOffer(),
  ]);

  const structuredData = [getOrganizationSchema(), getWebSiteSchema()];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <Navbar />
        <HeroSection />
        <SectionsGrid sections={sections} />
        <FeaturedAdventures adventures={adventures} />
        <WhyChooseUs />
        <AboutSection />
        <ReviewsSection reviews={reviews.slice(0, 4)} />
        <Footer sections={sections} />
        {offer && <SpecialOfferPopup offer={offer} />}
      </main>
    </>
  );
}