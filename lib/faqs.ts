// lib/faqs.ts
// PURPOSE: The canonical FAQ list for the contact page.
//   - The array `faqs` is imported by BOTH the UI (ContactClient.tsx) AND
//     the server page (app/contact/page.tsx → getFaqSchema from lib/seo.ts).
//   - Keeping it here means the visible FAQs and the FAQPage JSON-LD always
//     match without duplicating content.
// CONNECTED TO: components/ContactClient.tsx (renders the FAQ accordion),
//   app/contact/page.tsx (passes faqs to getFaqSchema for JSON-LD),
//   lib/seo.ts getFaqSchema() (generates the FAQPage structured data).
// NOTE: Edit this file to change the contact-page FAQs.
export const faqs = [
  {
    q: "What's included in the trek price?",
    a: "All meals during the trek, certified guide, camping equipment, transport from base camp, and first aid kit. Check each adventure for specifics.",
  },
  {
    q: "How do I confirm my booking?",
    a: "Submit the booking form on the adventure page. We'll contact you on WhatsApp within 24 hours to confirm your slot and share payment details.",
  },
  {
    q: "What fitness level do I need?",
    a: "It depends on the adventure. Easy treks are suitable for beginners. We recommend being able to walk 5–8km daily for moderate treks.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. Contact us at least 7 days before your departure for a full refund. Rescheduling is free if done 5+ days before.",
  },
  {
    q: "Do you provide trekking gear?",
    a: "We provide camping tents, sleeping bags and mattresses. Personal gear like trekking shoes, poles and warm clothing is your responsibility.",
  },
];
