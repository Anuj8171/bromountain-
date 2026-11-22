import {
  SITE_URL,
  getReviewsMetadata,
  getReviewsSchema,
  getBreadcrumbSchema,
} from "@/lib/seo";
import { getApprovedReviews, getAdventures, getSections } from "@/lib/data";
import ReviewsClient from "@/components/ReviewsClient";

export const metadata = getReviewsMetadata();
export const revalidate = 30;

export default async function ReviewsPage() {
  const [reviews, adventures, sections] = await Promise.all([
    getApprovedReviews(),
    getAdventures(),
    getSections(),
  ]);

  const structuredData = [
    getReviewsSchema(reviews),
    getBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Reviews", url: `${SITE_URL}/reviews` },
    ]),
  ].filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ReviewsClient
        reviews={reviews}
        adventures={adventures}
        sections={sections}
      />
    </>
  );
}
