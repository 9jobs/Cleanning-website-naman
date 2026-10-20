import type { Metadata } from "next";
import { Header, Footer, BackToTop } from "@/components/layout";
import { site } from "@/lib/config";
import "./globals.css";
import "./redesign.css";
import "./reference.css";
import "./hero-refresh.css";
import "./intro-refresh.css";
import "./plans-refresh.css";
import "./plans-organic.css";
import "./services-refresh.css";
import "./layout-alignment.css";
import "./inner-pages.css";
import "./header-hero.css";
import "./carousel-hero.css";
import "./pricing-plans.css";
import "./completion.css";
import "./contact-quote.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Thrive4 Cleaning | Professional Cleaning Services Australia",
    template: "%s | Thrive4 Cleaning",
  },
  description:
    "Professional residential, commercial and end of lease cleaning services across Australia. Request a free cleaning quote online today.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: site.name,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: site.name,
              url: site.url,
              logo: `${site.url}/brand/logo-primary.svg`,
            }).replace(/</g, "\\u003c"),
          }}
        />
        <main id="main">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
