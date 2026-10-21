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
import tileStyles from "./service-tiles.module.css";
import journeyStyles from "./cleaning-journey.module.css";

export function CleaningJourney() {
  return (
    <section className={`section journey-section ${journeyStyles.section}`}>
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
            <div />
          </div>
          {[
            {
              Icon: MousePointer2,
              title: "Choose your cleaning service",
              text: "Select house, property, garden, construction or specialist cleaning.",
            },
            {
              Icon: CalendarDays,
              title: "Tell us about your space",
              text: "Share your property type, location, condition and cleaning requirements.",
            },
            {
              Icon: Sun,
              title: "Submit your cleaning request",
              text: "Our team reviews your request and confirms the service scope and availability.",
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
              src="/images/story-property-male.webp"
              alt="Male cleaner mopping light oak floors in a townhouse"
              className="story-main"
            />
          </Reveal>
          <motion.div className="story-inset parallax" style={{ y }}>
            <Photo
              src="/images/story-garden-male.webp"
              alt="Male cleaner sweeping a timber balcony beside potted plants"
            />
          </motion.div>
          <span className="story-photo-note">FRESH & SPOTLESS.</span>
        </div>
        <div className="story-copy">
          <Reveal variant="right">
            <span className="eyebrow">PROFESSIONAL CLEANING STANDARDS</span>
            <h2>
              From busy properties
              <br />
              to{" "}
              <motion.span style={{ opacity }}>
                clean, ready spaces.
              </motion.span>
            </h2>
            <p>
              Our cleaning services support homes, managed properties, outdoor
              areas, workplaces and post-construction spaces.
            </p>
            <p>
              Whether you need routine cleaning, a property refresh, garden
              tidy-up or a final post-build clean, we tailor the service to your
              space and priorities.
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
    label: "HOUSE & PROPERTY CARE",
    quote:
      "Cleaning support for family homes, rental properties and vacant spaces, based on an agreed property checklist.",
    name: "House & Property Cleaning",
    type: "Routine or one-off property care",
  },
  {
    label: "GARDEN & OUTDOOR CLEANING",
    quote:
      "Outdoor cleaning and tidy-up requests for patios, balconies, paths and garden areas.",
    name: "Garden Cleaning",
    type: "Outdoor areas and light debris",
  },
  {
    label: "CONSTRUCTION CLEANING",
    quote:
      "Final cleaning of agreed finished surfaces after building, renovation or maintenance work.",
    name: "Construction Cleaning",
    type: "Post-build and renovation cleaning",
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
      name: "House & Property Cleaning",
      label: "HOUSE & PROPERTY CLEANING",
      Icon: House,
      description:
        "Routine and detailed cleaning for homes, rentals and managed properties.",
      features: [
        "Kitchens, bathrooms and living areas",
        "Routine or one-off cleaning",
        "Property-specific cleaning checklist",
      ],
      slug: "property-cleaning",
    },
    {
      name: "Garden & Outdoor Cleaning",
      label: "GARDEN & OUTDOOR CLEANING",
      Icon: Sparkles,
      description:
        "Cleaning and tidy-up requests for outdoor spaces around your property.",
      features: [
        "Patios, balconies and outdoor surfaces",
        "Garden tidy-up and light debris",
        "Outdoor-area preparation",
      ],
      slug: "garden-cleaning",
    },
    {
      name: "Construction Cleaning",
      label: "CONSTRUCTION & POST-BUILD",
      Icon: KeyRound,
      description:
        "Detailed cleaning after building, renovation or maintenance work.",
      features: [
        "Dust and light debris removal",
        "Surface and floor cleaning",
        "Final presentation cleaning",
      ],
      slug: "construction-cleaning",
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
              OUTDOOR CARE
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
          <Button href={`/services/${p.slug}`} secondary={i !== 1}>
            View Service
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
    { label: "HOUSE & PROPERTY CARE", Icon: House },
    { label: "PROPERTY CARE", Icon: Sparkles },
    { label: "GARDEN & OUTDOOR CARE", Icon: KeyRound },
    { label: "POST-BUILD CLEANING", Icon: Building2 },
    { label: "SHORT-STAY CLEANING", Icon: BedDouble },
    { label: "BUSINESS PREMISES", Icon: Layers },
  ];
  const badge = badges[index] || badges[0];
  return (
    <Reveal
      variant={featured ? "image" : "up"}
      delay={index * 0.08}
      className={`service-tile ${tileStyles.tile} ${featured ? "service-tile-featured" : ""}`}
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
            <span className="service-tile-category">HOUSE & PROPERTY CARE</span>
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
