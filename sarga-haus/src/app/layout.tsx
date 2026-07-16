import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import Script from "next/script";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion-provider";
import { Cursor } from "@/components/cursor";
import { Blueprint } from "@/components/blueprint";
import { Spine } from "@/components/spine";
import "./globals.css";

// next/font/google self-hosts at build time — same zero-runtime-request
// performance as local fonts, no binary files to carry in the repo.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sargahaus.com"),
  title: {
    default: "Sarga Haus — Build the product. Automate the workflow. Fill the pipeline.",
    template: "%s — Sarga Haus",
  },
  description:
    "Sarga Haus is a founder-led product studio. We turn real ideas and broken operations into products, systems, and customer pipelines built to move.",
  openGraph: {
    title: "Sarga Haus",
    description:
      "Build the product. Automate the workflow. Fill the pipeline. A founder-led product studio.",
    url: "https://sargahaus.com",
    siteName: "Sarga Haus",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <Nav />
          <main id="main">{children}</main>
          <Blueprint />
        </MotionProvider>
        <Footer />
        <Spine />
        <Cursor />
        <div className="grain" aria-hidden="true" />
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="lazyOnload"
          />
        ) : null}
      </body>
    </html>
  );
}
