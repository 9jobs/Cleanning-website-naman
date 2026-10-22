import { HomeHero } from "@/components/home-carousel";
import { HeroEnquiry } from "@/components/hero-enquiry";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Heart,
  House,
  ListChecks,
  MessageCircle,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import {
  Button,
  Heading,
  Photo,
  Checks,
  ArticleCards,
  CTA,
} from "@/components/ui";
import { FAQ, Comparison } from "@/components/interactive";
import { Reveal } from "@/components/motion";
import {
  CleaningJourney,
  ScrollStory,
  ExperienceCarousel,
  PricingPaths,
  HomeServiceMosaic,
} from "@/components/showcase";
import guideStyles from "@/components/home-guides.module.css";
import { homeGuideCards } from "@/lib/home-guide-cards";

export const metadata = {
  title: {
    absolute:
      "Property, House & Construction Cleaning | Thrive4 Cleaning",
  },
  description:
    "Thrive4 Cleaning provides professional house, one-off, property, construction and commercial cleaning services.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HomeHero />
      <section className="container reference-lead">
        <Reveal variant="up" delay={0.25}>
          <HeroEnquiry />
        </Reveal>
      </section>
      <section
        className="container trust-strip"
        aria-label="Our cleaning commitment"
      >
        {[
          { Icon: ShieldCheck, label: "Professional Cleaners" },
          { Icon: CalendarDays, label: "Flexible Scheduling" },
          { Icon: MousePointer2, label: "Easy Online Booking" },
          { Icon: Heart, label: "Tailored Cleaning Plans" },
        ].map(({ Icon, label }, i) => (
          <Reveal key={label} delay={i * 0.08}>
            <Icon size={25} />
            <span>{label}</span>
          </Reveal>
        ))}
      </section>
      <section className="section reference-intro">
        <div className="container split">
          <Reveal variant="left">
            <span className="eyebrow">RELIABLE CLEANING SERVICES</span>
            <h2>
              Professional cleaning
              <br />
              <span>you can count on.</span>
            </h2>
            <p>
              From family homes and rental properties to workplaces and
              construction sites, Thrive4 provides cleaning shaped around your
              property and requirements.
            </p>
            <p>
              Our services cover routine upkeep, detailed property cleaning,
              property cleaning, one-off visits and post-build cleans, with clear
              communication from enquiry through to completion.
            </p>
            <div className="actions">
              <Button href="/pricing">View Cleaning Plans</Button>
              <Button href="/about" secondary>
                Who We Are
              </Button>
            </div>
            <div className="intro-promises">
              <span>
                <Check size={21} />
                <span>
                  Experienced and
                  <br />
                  thorough cleaners
                </span>
              </span>
              <span>
                <ShieldCheck size={21} />
                <span>
                  Customised
                  <br />
                  cleaning checklists
                </span>
              </span>
              <span>
                <House size={21} />
                <span>
                  A cleaner, healthier
                  <br />
                  environment
                </span>
              </span>
            </div>
          </Reveal>
          <Reveal variant="up" className="intro-visual">
            <div className="intro-photo-frame">
              <Photo
                src="/images/thrive-australian-team.webp"
                alt="Professional Australian cleaning team in uniform ready to clean"
                className="reference-team-photo"
                sizes="(max-width: 800px) 100vw, 55vw"
              />
            </div>
            <div className="intro-image-message">
              <span className="intro-message-icon">
                <Sparkles size={18} />
              </span>
              <p>
                Spaces that feel
                <br />
                fresh and welcoming
              </p>
              <i />
            </div>
            <div className="intro-image-care">
              <span className="intro-care-symbols" aria-hidden="true">
                <span>
                  <House size={18} />
                </span>
                <span>
                  <ShieldCheck size={18} />
                </span>
                <span>
                  <Heart size={18} />
                </span>
              </span>
              <span>
                Tailored to you
                <small>PROFESSIONAL CLEANING</small>
              </span>
            </div>
            <span className="team-photo-caption">
              CARE FOR HOMES, PROPERTIES, WORKPLACES & SITES.
            </span>
          </Reveal>
        </div>
      </section>
      <section className="section reference-packages">
        <div className="container">
          <Reveal>
            <div className="plans-heading">
              <span className="eyebrow">FIND THE RIGHT SERVICE</span>
              <h2>
                Find the right cleaning
                <br />
                <span>service for your needs.</span>
              </h2>
              <p>
                Choose residential or commercial cleaning to find the right
                service for your space.
              </p>
            </div>
          </Reveal>
          <PricingPaths />
          <div className="plans-reassurance">
            <div>
              <ShieldCheck size={25} />
              <span>
                Professional Cleaning Standards
                <small>Consistent, high-quality cleaning for every space</small>
              </span>
            </div>
            <div>
              <CalendarDays size={25} />
              <span>
                Flexible Scheduling Options
                <small>Weekly, fortnightly, monthly or one-off visits</small>
              </span>
            </div>
            <div>
              <House size={25} />
              <span>
                A Cleaner, Ready Property
                <small>
                  Care inside and out, shaped around your priorities
                </small>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section service-showcase">
        <div className="container">
          <div className="heading-row">
            <Reveal>
              <div className="section-heading">
                <span className="eyebrow">OUR CLEANING SERVICES</span>
                <h2>
                  Professional cleaning
                  <br />
                  for every space.
                </h2>
                <p>
                  Explore cleaning for homes, properties, construction sites and
                  workplaces.
                </p>
              </div>
            </Reveal>
            <div className="services-heading-action">
              <Button href="/services">Explore All Services</Button>
            </div>
          </div>
          <HomeServiceMosaic />
          <div className="services-reassurance">
            <div>
              <House size={25} />
              <span>
                Tailored Cleaning Plans
                <small>Customised checklists for your property layout.</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={25} />
              <span>
                Clear Service Scope
                <small>Know exactly what is included before booking.</small>
              </span>
            </div>
            <div>
              <Heart size={25} />
              <span>
                High Cleaning Standards
                <small>
                  Care for surfaces, living areas and property details.
                </small>
              </span>
            </div>
            <div>
              <CalendarDays size={25} />
              <span>
                Flexible Scheduling
                <small>Weekly, fortnightly or one-off appointments.</small>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="section moving-section">
        <div className="container split editorial">
          <Reveal variant="image" className="editorial-image">
            <Photo
              src="/images/end-of-lease-detail.webp"
              alt="Professional cleaner wiping an empty wardrobe during a property clean"
              className="tall-photo"
            />
            <div className="editorial-accent" aria-hidden />
            <span className="image-editorial-label">
              <Sun size={22} /> PROPERTY CARE. MADE SIMPLE.
            </span>
          </Reveal>
          <div>
            <Reveal variant="right">
              <Heading
                eyebrow="PROPERTY CLEANING"
                title="A fresh start for your property."
                description="Property Cleaning for rentals, vacant and managed properties, with agreed tasks across kitchens, bathrooms, floors, cupboards and living areas."
              />
            </Reveal>
            <Reveal delay={0.12}>
              <Checks
                items={[
                  "Room-by-room property cleaning",
                  "Kitchen and bathroom detailing",
                  "Cupboards, floors and accessible surfaces",
                  "Priority rooms and tasks agreed in advance",
                ]}
              />
            </Reveal>
            <Reveal delay={0.22}>
              <Button href="/services/property-cleaning">
                Explore Property Cleaning
              </Button>
            </Reveal>
            <p className="editorial-footnote">
              Professional cleaning tailored to your property.
            </p>
          </div>
        </div>
      </section>
      <section className="section benefits-section">
        <div className="container">
          <Reveal>
            <Heading
              eyebrow="WHY CHOOSE THRIVE4 CLEANING"
              title="Reliable cleaning for every type of property."
              center
              description="Practical cleaning for homes, properties, workplaces and sites, with clear requirements and an agreed scope."
            />
          </Reveal>
          <div className="benefits-grid">
            <Reveal variant="image" className="benefit-photo">
              <Photo
                src="/images/home-benefit.webp"
                alt="Professional male cleaner wiping a shared workplace table"
              />
              <div>
                <span>PROFESSIONAL CLEANERS</span>
                <h3>
                  Experienced cleaners.
                  <br />
                  Dependable results.
                </h3>
                <p>
                  Care for homes, managed properties, offices and workplaces.
                </p>
              </div>
            </Reveal>
            <Reveal className="benefit-card benefit-navy" variant="down">
              <CalendarDays size={33} />
              <h3>
                Flexible cleaning
                <br />
                schedules.
              </h3>
              <p>
                Request routine, one-off or post-build cleaning to suit
                your property.
              </p>
              <Link href="/book">
                Book a clean <ArrowUpRight size={19} />
              </Link>
            </Reveal>
            <Reveal className="benefit-card" variant="right">
              <ListChecks size={32} />
              <h3>
                Detailed checklists.
                <br />
                Thorough results.
              </h3>
              <p>
                Understand the areas, tasks and exclusions agreed before the
                service begins.
              </p>
            </Reveal>
            <Reveal className="benefit-card benefit-aqua" variant="left">
              <MousePointer2 size={31} />
              <h3>
                Simple online
                <br />
                booking.
              </h3>
              <p>
                Select your cleaning service and submit your request online in
                minutes.
              </p>
            </Reveal>
            <Reveal className="benefit-card benefit-personal" variant="scale">
              <Heart size={31} />
              <h3>
                Tailored to your
                <br />
                property.
              </h3>
              <p>
                Cleaning plans customised to your property size, surface
                materials and specific priorities.
              </p>
            </Reveal>
            <Reveal className="benefit-card benefit-wide" variant="up">
              <MessageCircle size={32} />
              <div>
                <h3>Clear communication from start to finish.</h3>
                <p>
                  Have questions or need to adjust your cleaning schedule? Our
                  team is always here to help.
                </p>
              </div>
              <Button href="/contact" secondary>
                Contact Our Team
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
      <CleaningJourney />
      <section className="section comparison-section">
        <div className="container">
          <div className="heading-row">
            <Reveal>
              <Heading
                eyebrow="BEFORE & AFTER CLEANING"
                title="A closer look at cleaning, inside and out."
                description="Explore illustrative comparisons for property and post-construction cleaning."
              />
            </Reveal>
            <span className="comparison-kicker">
              <Sparkles size={26} /> DRAG SLIDER TO COMPARE
            </span>
          </div>
          <Reveal variant="image" threshold={0.12}>
            <Comparison />
          </Reveal>
        </div>
      </section>
      <ScrollStory />

      <section className="section experience-section">
        <div className="container experience-grid">
          <Reveal variant="left">
            <span className="eyebrow">THE CLEANING EXPERIENCE</span>
            <h2>
              Professional cleaning.
              <br />
              <span>Consistent care.</span>
            </h2>
            <p>
              From homes and rentals to commercial premises and construction
              sites, cleaning helps prepare spaces for everyday use,
              presentation or handover.
            </p>
            <Button href="/reviews" secondary>
              View Customer Reviews
            </Button>
            <div className="experience-illustration">
              <Sun size={40} />
              <span>
                FRESH, CLEAN SPACES
                <br />
                INSIDE & OUTSIDE.
              </span>
            </div>
          </Reveal>
          <Reveal variant="right">
            <ExperienceCarousel />
          </Reveal>
        </div>
      </section>
      <section
        className={`section container journal-section ${guideStyles.section}`}
      >
        <div className="heading-row">
          <Reveal>
            <Heading
              eyebrow="CLEANING ADVICE & TIPS"
              title="Practical Cleaning Advice & Guides."
            />
          </Reveal>
          <Button href="/blog" secondary>
            Browse All Articles
          </Button>
        </div>
        <ArticleCards items={homeGuideCards} className={guideStyles.grid} />
      </section>
      <section className="section faq-section">
        <div className="container split faq-split">
          <Reveal variant="left">
            <Heading
              eyebrow="FREQUENTLY ASKED QUESTIONS"
              title="Clear Answers About Our Cleaning Services."
              description="Learn how our cleaning plans work, what is included, and how to request a quote."
            />
            <Button href="/faq" secondary>
              View All FAQs
            </Button>
          </Reveal>
          <Reveal variant="right">
            <FAQ compact />
          </Reveal>
        </div>
      </section>
      <CTA />
    </>
  );
}
