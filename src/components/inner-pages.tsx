import {
  Building2,
  House,
  Sparkles,
  Heart,
  Leaf,
  ClipboardCheck,
  ArrowRight,
  CalendarDays,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button, Photo } from "./ui";
import { Reveal } from "./motion";

const highlights = [
  {
    Icon: House,
    title: "House & property cleaning",
    text: "Care for homes, rentals and managed properties.",
  },
  {
    Icon: Building2,
    title: "Commercial cleaning",
    text: "A fresh start for your working day.",
  },
  {
    Icon: CalendarDays,
    title: "Garden & outdoor care",
    text: "Patios, balconies and garden-area tidy-ups.",
  },
  {
    Icon: Heart,
    title: "Construction cleaning",
    text: "A final clean after building or renovation work.",
  },
];

export function AboutPage() {
  return (
    <>
      <section className="about-masthead">
        <Photo
          src="/images/about-cover.webp"
          alt="Two male cleaning professionals preparing equipment at a home entry"
          priority
          sizes="100vw"
          className="about-cover"
        />
        <div className="about-wash" />
        <div className="container about-hero-grid">
          <Reveal className="about-hero-copy">
            <span className="eyebrow">ABOUT THRIVE4 CLEANING</span>
            <h1>
              Care for your space.
              <br />
              <em>Room to thrive.</em>
            </h1>
            <p>
              We support homes, properties, gardens, workplaces and completed
              construction sites with practical cleaning scopes and clear
              communication.
            </p>
            <div className="actions">
              <Button href="/services">Our cleaning services</Button>
              <Button href="/contact" secondary>
                Get a free quote
              </Button>
            </div>
            <div className="about-hero-note">
              <ClipboardCheck size={24} />
              <span>
                Every space is different.
                <br />
                <strong>Your cleaning plan should be too.</strong>
              </span>
            </div>
          </Reveal>
          <div className="about-float-group">
            <div className="about-float about-float--workplace">
              <Building2 />
              <span>
                <strong>Fresher workplaces</strong>
                <small>Care for the space you work in.</small>
              </span>
            </div>
            <div className="about-float about-float--care">
              <Leaf />
              <span>
                <strong>Considered cleaning</strong>
                <small>The right care for each surface.</small>
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="container about-highlights" aria-label="Our approach">
        {highlights.map(({ Icon, title, text }) => (
          <div key={title}>
            <span className="about-icon">
              <Icon />
            </span>
            <span>
              <h3>{title}</h3>
              <p>{text}</p>
            </span>
          </div>
        ))}
      </section>
      <section className="section container about-story">
        <Reveal className="about-collage">
          <Photo
            src="/images/about-window-male.webp"
            alt="Male cleaner polishing an interior glass panel and frame"
            className="collage-main"
          />
          <Photo
            src="/images/about-garden.webp"
            alt="Swept brick courtyard with native plants and a timber gate"
          />
          <Photo
            src="/images/about-office-male.webp"
            alt="Male cleaner wiping a table in an office lounge"
          />
          <span className="collage-caption">
            <Sparkles size={20} />
            Care in every detail.
          </span>
        </Reveal>
        <Reveal className="about-story-copy">
          <span className="eyebrow">OUR APPROACH</span>
          <h2>
            Professional cleaning.
            <br />
            <em>A personal approach.</em>
          </h2>
          <p>
            Family homes, rental properties, gardens, workplaces and completed
            building sites all need different care. Thrive4 starts by
            understanding the property and the work required.
          </p>
          <p>
            Our services cover routine upkeep, detailed property cleaning,
            outdoor areas, move-out cleaning and post-build cleans. An agreed
            checklist sets out the work before a visit is confirmed.
          </p>
          <Button href="/contact">Talk to our team</Button>
        </Reveal>
      </section>
      <section className="about-values">
        <div className="container about-values-grid">
          <Reveal>
            <span className="eyebrow">WHAT MATTERS TO US</span>
            <h2>
              A little more care.
              <br />
              <em>In every clean.</em>
            </h2>
            <p>
              Simple principles that shape the way we look after your space.
            </p>
          </Reveal>
          {[
            {
              Icon: ClipboardCheck,
              title: "A clear plan",
              text: "Agreed rooms, priorities and inclusions, so you know what your visit covers.",
            },
            {
              Icon: Leaf,
              title: "Respect for your space",
              text: "Careful methods selected for the surfaces and materials in your property.",
            },
            {
              Icon: Heart,
              title: "Open communication",
              text: "Practical answers, clear expectations and room to tell us what matters.",
            },
          ].map(({ Icon, title, text }) => (
            <Reveal key={title} className="about-value">
              <span className="about-icon">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section container about-next">
        <div>
          <span className="eyebrow">LET’S START WITH YOUR SPACE</span>
          <h2>
            Good cleaning starts
            <br />
            with a conversation.
          </h2>
        </div>
        <div>
          <p>
            Tell us about your home, property, garden, workplace or completed
            building site. Share the cleaning requirements and preferred timing.
          </p>
          <Button href="/contact">Build your cleaning plan</Button>
        </div>
      </section>
    </>
  );
}

const heroImages: Record<string, { src: string; label: string }> = {
  services: {
    src: "/images/cleaning-plans-room.webp",
    label: "HOMES · PROPERTIES · GARDENS · SITES",
  },
  pricing: {
    src: "/images/kitchen.webp",
    label: "YOUR SPACE. YOUR SCOPE. YOUR QUOTE.",
  },
  areas: {
    src: "/images/hero.webp",
    label: "LOCAL AVAILABILITY, CONFIRMED WITH YOU",
  },
  contact: {
    src: "/images/blog-home.webp",
    label: "A CONVERSATION IS A GOOD START",
  },
  quote: { src: "/images/after.webp", label: "LET’S PLAN YOUR CLEAN" },
  careers: {
    src: "/images/careers-cover.webp",
    label: "TAKE PRIDE IN THE DETAILS",
  },
  blog: {
    src: "/images/blog-kitchen.webp",
    label: "PRACTICAL CARE FOR EVERYDAY SPACES",
  },
};
export function InnerHero({
  eyebrow,
  title,
  description,
  kind,
}: {
  eyebrow: string;
  title: string;
  description: string;
  kind: string;
}) {
  const art = heroImages[kind];
  const focused = ["book", "faq", "reviews", "privacy", "terms"].includes(kind);
  return (
    <section
      className={`inner-hero inner-hero--${kind}${focused ? " inner-hero--focused" : ""}`}
    >
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </nav>
        <div className="inner-hero-grid">
          <Reveal>
            <span className="eyebrow">
              THRIVE4 CLEANING / {eyebrow.toUpperCase()}
            </span>
            <h1>{title}</h1>
            <p>{description}</p>
            {kind === "services" && (
              <div className="actions">
                <Button href="#service-directory">Find your service</Button>
                <Link href="/contact" className="text-link">
                  Need a hand choosing? <ArrowRight size={17} />
                </Link>
              </div>
            )}
            {kind === "areas" && (
              <span className="inner-hero-note">
                <MapPin size={19} />
                Enter your postcode below to check availability.
              </span>
            )}
            {kind === "book" && (
              <div className="booking-intro-steps">
                <span>01 Choose a service</span>
                <span>02 Tell us about your space</span>
                <span>03 Request your visit</span>
              </div>
            )}
            {kind === "reviews" && (
              <Button href="/contact" secondary>
                Share your experience
              </Button>
            )}
          </Reveal>
          {art && (
            <Reveal className="inner-hero-visual">
              <Photo src={art.src} alt={art.label.toLowerCase()} priority />
              <span>{art.label}</span>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
