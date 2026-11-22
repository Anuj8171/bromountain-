// app/layout.tsx
// PURPOSE: Root layout — wraps every page in the app (public + admin).
// Responsible for:
//   - Site-wide Metadata + Viewport (title template, icons, OG defaults,
//     theme-color).
//   - Google Fonts: Playfair_Display (display/headlines), Syne (brand/nav),
//     DM_Sans (body) — loaded with display: "swap".
//   - Injects a small inline script that reads "bm-theme" from localStorage
//     and sets data-theme="dark|light" on <html> BEFORE first paint, so there
//     is no flash of wrong theme.
//   - Renders the site-wide mountain backdrop (MountainSilhouette) in a
//     fixed .site-backdrop div behind everything, plus .site-shell for
//     the actual page content.
// CONNECTED TO:
//   - All app/**/page.tsx files (they are rendered as `children` inside this
//     layout).
//   - components/MountainSilhouette.tsx (the SVG mountain range behind every
//     page).
//   - lib/seo.ts (baseMetadata, SITE_NAME, SITE_DESCRIPTION).
//   - app/globals.css (the .site-backdrop / .site-shell classes + BM tokens).
//   - app/**/admin/* pages share this layout too (admin uses its own layout
//     inside app/admin/layout.tsx which wraps around this root layout).
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import MountainSilhouette from "@/components/MountainSilhouette";
import { SITE_NAME, SITE_DESCRIPTION, baseMetadata } from "@/lib/seo";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne-google",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...baseMetadata,
  title: {
    default: "BroMountain Adventures | Treks & Camping in Uttarkashi",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "96x96" }],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0b" },
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
  ],
};

// Applies the saved theme before first paint so there is no light/dark flash.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("bm-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      data-theme="dark"
      suppressHydrationWarning
      className={`${playfair.variable} ${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Site-wide background layer: the mountain range sits behind every page */}
        <div className="site-backdrop" aria-hidden="true">
          <MountainSilhouette />
        </div>

        <div className="site-shell">{children}</div>
      </body>
    </html>
  );
}
