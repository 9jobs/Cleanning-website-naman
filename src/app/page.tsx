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
  ServiceTile,
} from "@/components/showcase";
import { services } from "@/lib/data";

export const metadata = {
  title: "Professional Cleaning Services Australia | Thrive4 Cleaning",
  description:
    "Professional home, commercial and end of lease cleaning services tailored to your space, schedule and cleaning needs across Australia.",
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
              From regular house cleaning to detailed commercial cleaning, we
              make it easier to keep your spaces clean, fresh and well
              maintained.
            </p>
            <p>
              Whether you need routine home upkeep, a seasonal deep clean or a
              complete end of lease service, we deliver consistent quality with
              clear communication from start to finish.
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
                src="/images/thrive-australian-team.png"
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
              DEDICATED TO CLEANER HOMES AND WORKPLACES.
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
                Compare regular maintenance, deep one-off cleans and specialised
                end of lease cleaning to match your property.
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
                A Healthier, Cleaner Home
                <small>More time for what matters most to you</small>
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
                  Explore flexible cleaning services for homes, offices, rental
                  properties and short-stay accommodation.
                </p>
              </div>
            </Reveal>
            <div className="services-heading-action">
              <Button href="/services">Explore All Services</Button>
            </div>
          </div>
          <div className="service-mosaic">
            {[
              services[0],
              services[1],
              services[2],
              services[3],
              services[4],
              services[5],
            ].map((s, i) => (
              <ServiceTile
                key={s.slug}
                title={s.name}
                description={s.description}
                slug={s.slug}
                image={
                  [
                    "/images/comparison-living-demo.png",
                    "/images/deep.jpg",
                    "/images/after.jpg",
                    "/images/service-office.png",
                    "/images/service-airbnb.png",
                    "/images/service-carpet.png",
                  ][i]
                }
                index={i}
                featured={i === 0}
              />
            ))}
          </div>
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
                  Thorough attention to kitchens, bathrooms and floors.
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
              src="/images/lease.jpg"
              alt="Immaculate, empty rental apartment ready for final lease inspection"
              className="tall-photo"
            />
            <div className="editorial-accent" aria-hidden />
            <span className="image-editorial-label">
              <Sun size={22} /> MOVE-OUT READY. STRESS-FREE.
            </span>
          </Reveal>
          <div>
            <Reveal variant="right">
              <Heading
                eyebrow="END OF LEASE CLEANING"
                title="Moving out? Leave the cleaning to us."
                description="Take the stress out of moving day with our comprehensive end of lease cleaning, tailored to real estate checklists and property requirements."
              />
            </Reveal>
            <Reveal delay={0.12}>
              <Checks
                items={[
                  "Detailed, room-by-room move-out cleaning checklist",
                  "Inside cupboards, ovens, rangehoods and bathrooms",
                  "Flexible appointments scheduled around your move date",
                  "Clear written scope with optional carpet steam cleaning",
                ]}
              />
            </Reveal>
            <Reveal delay={0.22}>
              <Button href="/services/end-of-lease-cleaning">
                Explore End of Lease Cleaning
              </Button>
            </Reveal>
            <p className="editorial-footnote">
              Professional vacate cleaning tailored to your rental property.
            </p>
          </div>
        </div>
      </section>
      <section className="section benefits-section">
        <div className="container">
          <Reveal>
            <Heading
              eyebrow="WHY CHOOSE THRIVE4 CLEANING"
              title="A More Reliable Way to Keep Your Space Clean."
              center
              description="We combine experienced cleaners, structured checklists and prompt communication to deliver dependable results every visit."
            />
          </Reveal>
          <div className="benefits-grid">
            <Reveal variant="image" className="benefit-photo">
              <Photo
                src="/images/thrive-australian-office.png"
                alt="Professional cleaners ready with supplies"
              />
              <div>
                <span>PROFESSIONAL CLEANERS</span>
                <h3>
                  Experienced cleaners.
                  <br />
                  Dependable results.
                </h3>
                <p>
                  Respect for your home, your belongings and your workplace.
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
                Weekly, fortnightly, monthly or one-off cleaning arranged around
                your busy routine.
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
                Every clean follows a structured checklist to ensure no corner
                or surface is overlooked.
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
                title="See What a Thorough Clean Can Do."
                description="Explore the difference professional cleaning can make to kitchens, bathrooms and living spaces."
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
            <span className="eyebrow">CUSTOMER SATISFACTION</span>
            <h2>
              Professional cleaning.
              <br />
              <span>Consistent results.</span>
            </h2>
            <p>
              From routine home maintenance to busy office facilities, our
              cleaning services create spaces that feel fresh, hygienic and
              inviting.
            </p>
            <Button href="/reviews" secondary>
              View Customer Reviews
            </Button>
            <div className="experience-illustration">
              <Sun size={40} />
              <span>
                FRESH, CLEAN SPACES
                <br />
                FOR WORK & HOME.
              </span>
            </div>
          </Reveal>
          <Reveal variant="right">
            <ExperienceCarousel />
          </Reveal>
        </div>
      </section>
      <section className="section container journal-section">
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
        <ArticleCards />
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
