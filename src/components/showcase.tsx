"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  Check,
  ArrowLeft,
  ArrowRight,
  Sun,
  MousePointer2,
  Sparkles,
  Quote,
  House,
  KeyRound,
  Star,
  Building2,
  BedDouble,
  Layers,
} from "lucide-react";
import { Photo, Button } from "./ui";
import { Reveal } from "./motion";
import { testimonials } from "@/lib/config";

export function CleaningJourney() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 60%"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section ref={ref} className="section journey-section">
      <div className="container">
        <Reveal>
          <div className="journey-heading">
            <span className="eyebrow">SIMPLE 3-STEP BOOKING</span>
            <h2>
              Book your cleaning service
              <br />
              <span>in three simple steps.</span>
            </h2>
            <p>Quick, straightforward booking designed around your schedule.</p>
          </div>
        </Reveal>
        <div className="journey-track">
          <div className="journey-line" aria-hidden>
            <motion.div style={{ scaleX }} />
          </div>
          {[
            {
              Icon: MousePointer2,
              title: "Choose your cleaning service",
              text: "Select regular, deep, end-of-lease or commercial cleaning tailored to your space.",
            },
            {
              Icon: CalendarDays,
              title: "Select your preferred schedule",
              text: "Pick a convenient date and time that fits your household or business routine.",
            },
            {
              Icon: Sun,
              title: "Submit your cleaning request",
              text: "Receive a clear, personalised quote and confirmed booking for your clean.",
            },
          ].map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.12} className="journey-step">
              <div className="journey-circle">
                <Icon size={30} />
                <span>0{i + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="journey-caption">
                {
                  ["CHOOSE YOUR SERVICE", "SELECT SCHEDULE", "CONFIRM & RELAX"][
                    i
                  ]
                }
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScrollStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [45, -45]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [0.2, 1, 1, 0.4],
  );
  return (
    <section ref={ref} className="story-section">
      <div className="container story-grid">
        <div className="story-photos">
          <Reveal variant="image">
            <Photo
              src="/images/before.jpg"
              alt="Clean, freshly prepared living space"
              className="story-main"
            />
          </Reveal>
          <motion.div className="story-inset parallax" style={{ y }}>
            <Photo
              src="/images/blog-home.jpg"
              alt="Professional cleaning supplies"
            />
          </motion.div>
          <span className="story-photo-note">FRESH & SPOTLESS.</span>
        </div>
        <div className="story-copy">
          <Reveal variant="right">
            <span className="eyebrow">PROFESSIONAL CLEANING STANDARDS</span>
            <h2>
              From busy spaces
              <br />
              to <motion.span style={{ opacity }}>spotless places.</motion.span>
            </h2>
            <p>
              A thoroughly cleaned home creates a healthier, more comfortable
              environment for your family and guests.
            </p>
            <p>
              Our professional cleaning services take care of routine chores and
              heavy-duty grime so you can spend your time on what matters most.
            </p>
            <Button href="/about" secondary>
              Learn About Our Standards
            </Button>
          </Reveal>
          <div className="story-signature">
            <Sparkles size={23} />
            <span>Professional Cleaning You Can Count On.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const demoStories = [
  {
    label: "REGULAR HOUSE CLEANING",
    quote:
      "A dependable routine that keeps your kitchen, bathrooms and floors pristine every single week.",
    name: "Consistent Home Cleaning",
    type: "Regular residential cleaning",
  },
  {
    label: "END OF LEASE CLEANING",
    quote:
      "Detailed vacate cleaning covering cupboards, appliances, skirtings and fixtures for a smooth move.",
    name: "Comprehensive Move-Out Clean",
    type: "End of lease cleaning",
  },
  {
    label: "COMMERCIAL & OFFICE CLEANING",
    quote:
      "Hygienic workplaces, sanitised meeting rooms and clean shared facilities that support your team.",
    name: "Professional Workplace Care",
    type: "Commercial facility cleaning",
  },
];
export function ExperienceCarousel() {
  const [index, setIndex] = useState(0);
  const touch = useRef(0);
  const verified = testimonials.filter((t) => t.verified);
  const stories = verified.length
    ? verified.map((t) => ({
        label: "VERIFIED CUSTOMER FEEDBACK",
        quote: t.quote,
        name: t.name,
        type: t.service,
      }))
    : demoStories;
  const current = stories[index % stories.length];
  const change = (delta: number) =>
    setIndex((i) => (i + delta + stories.length) % stories.length);
  return (
    <div
      className="experience-carousel"
      aria-roledescription="carousel"
      aria-label="The Thrive4 Cleaning experience"
      onTouchStart={(e) => {
        touch.current = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 45) change(dx < 0 ? 1 : -1);
      }}
    >
      <div className="experience-top">
        <Quote size={40} />
        <span>
          {verified.length
            ? "VERIFIED FEEDBACK"
            : "EXPERIENCE PREVIEW · NOT CUSTOMER TESTIMONIALS"}
        </span>
      </div>
      <div className="experience-slide" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32 }}
          >
            <span className="eyebrow">{current.label}</span>
            <blockquote>{current.quote}</blockquote>
            <div className="experience-person">
              <span>
                <Check size={22} />
              </span>
              <div>
                <strong>{current.name}</strong>
                <small>{current.type}</small>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="carousel-controls">
        <div className="carousel-dots">
          {stories.map((_, i) => (
            <button
              key={i}
              aria-label={`Show experience ${i + 1}`}
              aria-pressed={index % stories.length === i}
              className={index % stories.length === i ? "selected" : ""}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div>
          <button aria-label="Previous experience" onClick={() => change(-1)}>
            <ArrowLeft size={22} />
          </button>
          <button aria-label="Next experience" onClick={() => change(1)}>
            <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PricingPaths() {
  const plans = [
    {
      name: "Regular House Cleaning",
      label: "ROUTINE CLEANING",
      Icon: House,
      description:
        "Consistent weekly, fortnightly or monthly cleaning to keep your home fresh and tidy.",
      features: [
        "Weekly, fortnightly or monthly visits",
        "Kitchen, bathrooms and living areas",
        "Vacuuming carpets and mopping floors",
      ],
      slug: "regular-house-cleaning",
    },
    {
      name: "Deep One-Off Cleaning",
      label: "DEEP & ONE-OFF",
      Icon: Sparkles,
      description:
        "An intensive top-to-bottom clean for seasonal resets, spring cleans or special events.",
      features: [
        "Skirting boards, doors and detailed dusting",
        "Deep scrub of bathrooms, basins and tiles",
        "Optional oven and fridge detailing",
      ],
      slug: "deep-cleaning",
    },
    {
      name: "End of Lease Cleaning",
      label: "VACATE CLEANING",
      Icon: KeyRound,
      description:
        "Detailed move-out cleaning tailored to Australian real estate checklists.",
      features: [
        "Inside empty cupboards, drawers and robes",
        "Comprehensive kitchen and bathroom sanitisation",
        "Optional carpet steam cleaning and windows",
      ],
      slug: "end-of-lease-cleaning",
    },
  ];
  return (
    <div className="pricing-paths">
      {plans.map((p, i) => (
        <Reveal
          key={p.slug}
          variant="scale"
          delay={i * 0.1}
          className={`pricing-path ${i === 1 ? "featured" : ""}`}
        >
          {i === 1 && (
            <span className="path-featured-badge">
              <Star size={14} fill="currentColor" />
              POPULAR SERVICE
            </span>
          )}
          <div className="path-top">
            <span className="path-service-icon">
              <p.Icon size={25} />
            </span>
            <span>0{i + 1}</span>
          </div>
          <span className="mini-label">{p.label}</span>
          <h3>
            {p.name.slice(0, p.name.lastIndexOf(" "))}
            <br />
            {p.name.slice(p.name.lastIndexOf(" ") + 1)}
          </h3>
          <p>{p.description}</p>
          <ul>
            {p.features.map((f) => (
              <li key={f}>
                <Check size={17} />
                {f}
              </li>
            ))}
          </ul>
          <Button href={`/pricing?service=${p.slug}`} secondary={i !== 1}>
            View Cleaning Plan
          </Button>
          <span className="path-corner-art" aria-hidden="true" />
        </Reveal>
      ))}
    </div>
  );
}

export function ServiceTile({
  title,
  description,
  image,
  slug,
  featured = false,
  index = 0,
}: {
  title: string;
  description: string;
  image: string;
  slug: string;
  featured?: boolean;
  index?: number;
}) {
  const badges = [
    { label: "ROUTINE HOUSE CLEANING", Icon: House },
    { label: "DEEP & THOROUGH CLEAN", Icon: Sparkles },
    { label: "MOVE-OUT VACATE CLEAN", Icon: KeyRound },
    { label: "COMMERCIAL & OFFICE", Icon: Building2 },
    { label: "AIRBNB CHANGEOVER", Icon: BedDouble },
    { label: "CARPET STEAM CARE", Icon: Layers },
  ];
  const badge = badges[index] || badges[0];
  return (
    <Reveal
      variant={featured ? "image" : "up"}
      delay={index * 0.08}
      className={`service-tile ${featured ? "service-tile-featured" : ""}`}
    >
      <Link href={`/services/${slug}`}>
        <Photo
          src={image}
          alt={`Illustrative ${title.toLowerCase()} service`}
          sizes="(max-width: 700px) 100vw, 40vw"
        />
        <div className="service-tile-shade" />
        <div className="service-tile-top">
          <span>
            <badge.Icon size={19} />
            {badge.label}
          </span>
        </div>
        <div className="service-tile-copy">
          {featured && (
            <span className="service-tile-category">
              REGULAR HOUSE CLEANING
            </span>
          )}
          <h3>{title}</h3>
          <p>{description}</p>
          {featured && (
            <span className="service-learn-more">
              Learn more <ArrowRight size={22} />
            </span>
          )}
        </div>
        {!featured && (
          <span className="service-card-arrow" aria-hidden="true">
            <ArrowRight size={24} />
          </span>
        )}
      </Link>
    </Reveal>
  );
}
