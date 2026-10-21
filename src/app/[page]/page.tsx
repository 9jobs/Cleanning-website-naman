import { ContactQuotePage } from "@/components/contact-quote";
import { contactMailReady } from "@/lib/contact-mail";
import { contactDatabaseReady } from "@/lib/contact-database";
import {
  ServiceDiscovery,
  CoverageDirectory,
  FeedbackPanel,
  JournalLibrary,
} from "@/components/completion-interactive";
import {
  HelpPageBody,
  CareerCompletion,
} from "@/components/completion-sections";
import { PricingPlans } from "@/components/pricing-plans";
import { AboutPage, InnerHero } from "@/components/inner-pages";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CTA } from "@/components/ui";
import { submissionsReady } from "@/lib/server";

const pages: Record<
  string,
  { title: string; eyebrow: string; description: string }
> = {
  about: {
    title: "Care for your space. Room to thrive.",
    eyebrow: "Who We Are",
    description:
      "Learn more about Thrive4 Cleaning, our commitment to high cleaning standards, and our house, property, garden, construction and commercial cleaning services.",
  },
  services: {
    title: "Professional Cleaning for Every Space.",
    eyebrow: "Our Services",
    description:
      "Explore House, Property, Garden, Construction and specialist cleaning services.",
  },
  pricing: {
    title: "Clear Pricing for Professional Cleaning Services.",
    eyebrow: "Pricing & Quotes",
    description:
      "Compare cleaning plans, explore inclusions and request a personalised quote for your property.",
  },
  areas: {
    title: "Find Professional Cleaning Services Near You.",
    eyebrow: "Service Areas",
    description:
      "Check whether our cleaning services are available in your suburb or postcode.",
  },
  reviews: {
    title: "What Customers Say About Our Cleaning Services.",
    eyebrow: "Customer Reviews",
    description:
      "Explore our approach to customer feedback and share your experience with Thrive4 Cleaning.",
  },
  faq: {
    title: "Frequently Asked Questions About Our Cleaning.",
    eyebrow: "FAQs",
    description:
      "Find clear answers to common questions about our cleaning checklists, booking process, pricing and service inclusions.",
  },
  contact: {
    title: "Let’s Talk About Your Cleaning Needs.",
    eyebrow: "Contact Us",
    description:
      "Have a question or need a cleaning quote? Get in touch and tell us how we can help.",
  },
  book: {
    title: "Book Your Professional Cleaning Service.",
    eyebrow: "Book a Clean",
    description:
      "Select your cleaning service, tell us about your property and choose your preferred date to request a booking.",
  },
  careers: {
    title: "Join Our Professional Cleaning Team.",
    eyebrow: "Careers",
    description:
      "We are always looking for detail-oriented, reliable cleaners who take pride in delivering spotless spaces. Register your interest today.",
  },
  blog: {
    title: "Practical Cleaning Guides & Expert Advice.",
    eyebrow: "Cleaning Guides & Tips",
    description:
      "Explore cleaning guides for homes, rentals, gardens, post-build properties and workplaces.",
  },
  privacy: {
    title: "Privacy Policy.",
    eyebrow: "Privacy Policy",
    description:
      "Our privacy policy explains how we collect, store and protect your personal and property information.",
  },
  terms: {
    title: "Terms & Conditions.",
    eyebrow: "Terms & Conditions",
    description:
      "Review our service terms, booking conditions and cleaning service policies.",
  },
  quote: {
    title: "Request a Free Cleaning Quote.",
    eyebrow: "Request a Quote",
    description:
      "Tell us what cleaning service you need and share your property details to request a personalised quote.",
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const p = pages[page];
  return p
    ? {
        title: p.eyebrow,
        description: p.description,
        alternates: { canonical: `/${page}` },
        ...(["privacy", "terms"].includes(page)
          ? { robots: { index: false, follow: true } }
          : {}),
      }
    : {};
}

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page } = await params;
  const p = pages[page];
  if (!p) notFound();
  const raw = await searchParams;
  const initial = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v : ""]),
  );
  if (page === "book" || page === "quote") {
    const query = new URLSearchParams(initial).toString();
    redirect(`/contact${query ? `?${query}` : ""}`);
  }
  const live = submissionsReady();

  return (
    <div className={`inner-site inner-site--${page}`}>
      {!["about", "pricing", "contact"].includes(page) && (
        <InnerHero {...p} kind={page} />
      )}
      {page === "about" && <AboutPage />}
      {page === "services" && (
        <section id="service-directory" className="completion finish-section">
          <ServiceDiscovery />
        </section>
      )}
      {page === "pricing" && <PricingPlans initial={initial} />}
      {page === "areas" && (
        <section className="completion finish-section">
          <div className="finish-container">
            <CoverageDirectory />
          </div>
        </section>
      )}
      {page === "reviews" && (
        <section className="completion finish-section">
          <div className="finish-container">
            <FeedbackPanel />
          </div>
        </section>
      )}
      {page === "faq" && <HelpPageBody />}
      {page === "contact" && (
        <ContactQuotePage
          initial={initial}
          ready={contactMailReady() && contactDatabaseReady()}
        />
      )}
      {page === "careers" && <CareerCompletion live={live} />}
      {page === "blog" && (
        <section className="completion finish-section">
          <div className="finish-container">
            <JournalLibrary />
          </div>
        </section>
      )}
      {["privacy", "terms"].includes(page) && (
        <section className="section container legal prose">
          <div className="notice">
            DRAFT — business details and final policy wording require review
            before launch. This page does not represent a legally approved
            policy.
          </div>
          {page === "privacy" ? (
            <>
              <h2>Information you choose to provide</h2>
              <p>
                Contact, quote and booking forms request your contact
                information, property details, cleaning preferences and any
                instructions you choose to share. Careers applications may
                include a résumé. Do not include sensitive information that is
                unnecessary for your cleaning enquiry.
              </p>
              <h2>How this website handles enquiries</h2>
              <p>
                When live submissions are enabled, form data is stored in a
                private Supabase database for authorised staff to review.
                Optional résumés use a private storage bucket. Resend may
                deliver a reference-only notification to the business. The team
                must confirm vendor locations and any overseas processing before
                publication.
              </p>
              <h2>Local draft storage</h2>
              <p>
                The booking interface can save service, room, extra and schedule
                choices in this browser for seven days. Contact and address
                details are not saved in that draft. You can dismiss the saved
                plan or clear your browser storage.
              </p>
              <h2>Security and retention</h2>
              <p>
                Public visitors cannot read customer submission records. The
                business must set an approved retention period, staff access
                procedures and deletion process before enabling submissions.
                Hashed request metadata may be used to limit abusive
                submissions.
              </p>
              <h2>Access, correction and questions</h2>
              <p>
                The business must add its privacy contact, identity and address
                here before launch. These details are managed centrally in the
                site configuration. No advertising analytics or marketing
                subscription is enabled in this build.
              </p>
            </>
          ) : (
            <>
              <h2>Requests and confirmed appointments</h2>
              <p>
                Submitting a form is a request for contact or an appointment
                preference. A booking is accepted only after the team confirms
                coverage, scope, price and availability in writing. No payment
                details are collected by this website.
              </p>
              <h2>Scope and pricing</h2>
              <p>
                Services are based on an agreed cleaning checklist. Optional
                extras, property condition, access and specialist work may
                affect a quote. Any displayed estimate is indicative AUD pricing
                including GST and requires written confirmation.
              </p>
              <h2>Access and safe working conditions</h2>
              <p>
                Tell the team about pets, parking, delicate surfaces, product
                preferences and access requirements. Work requiring specialist
                access or equipment must be assessed separately.
              </p>
              <h2>Changes, cancellations and feedback</h2>
              <p>
                The business must finalise notice periods, rescheduling rules,
                cancellations, fees and any rectification process before
                accepting bookings. These details will be provided with your
                booking terms.
              </p>
              <h2>Results and responsibilities</h2>
              <p>
                Outcomes depend on surface condition, materials and the agreed
                scope. Stain removal and bond-return outcomes cannot be
                guaranteed. Final terms must be reviewed for applicable consumer
                obligations before use.
              </p>
              <h2>Business information</h2>
              <p>
                Legal business identity, ABN, contact details, jurisdiction and
                final terms remain to be confirmed by the business before
                launch.
              </p>
            </>
          )}
        </section>
      )}
      {!["book", "privacy", "terms", "contact"].includes(page) && <CTA />}
    </div>
  );
}
