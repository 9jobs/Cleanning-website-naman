"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
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
} from "lucide-react";
import { Photo, Button } from "./ui";
import { Reveal } from "./motion";
import { testimonials } from "@/lib/config";
import { services } from "@/lib/data";
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
              text: "Select residential or commercial cleaning for your space.",
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
              src="/images/property-detail.webp"
              alt="Clean kitchen ready for everyday use"
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
              Our cleaning services support homes, managed properties, living
              areas, workplaces and post-construction spaces.
            </p>
            <p>
              Whether you need routine cleaning, a property refresh, a deep
              clean or a final post-build clean, we tailor the service to your
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
    label: "DEEP CLEANING",
    quote:
      "Detailed kitchen, bathroom and surface care for built-up dirt and grime.",
    name: "Deep Cleaning",
    type: "A detailed reset for your home",
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

type HomeServiceCategory = "Residential" | "Commercial";
const homeServiceSlugs = {
  Residential: [
    "house-cleaning",
    "deep-cleaning",
    "one-off-cleaning",
    "property-cleaning",
  ],
  Commercial: [
    "commercial-cleaning",
    "office-cleaning",
    "construction-cleaning",
    "airbnb-cleaning",
  ],
};
const serviceIcons: Record<string, typeof House> = {
  "house-cleaning": House,
  "property-cleaning": Sparkles,
  "deep-cleaning": Sparkles,
  "one-off-cleaning": House,
  "commercial-cleaning": Building2,
  "office-cleaning": Building2,
  "construction-cleaning": KeyRound,
  "airbnb-cleaning": BedDouble,
};
function homeServices(category: HomeServiceCategory) {
  return homeServiceSlugs[category].map((slug) =>
    services.find((service) => service.slug === slug)!,
  );
}
function ServiceCategorySwitch({
  category,
  onChange,
  controls,
}: {
  category: HomeServiceCategory;
  onChange: (category: HomeServiceCategory) => void;
  controls: string;
}) {
  return (
    <div
      className={tileStyles.categorySwitch}
      role="group"
      aria-label="Cleaning service category"
    >
      {(["Residential", "Commercial"] as const).map((name) => {
        const Icon = name === "Residential" ? House : Building2;
        return (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            aria-controls={controls}
            onClick={() => onChange(name)}
          >
            <Icon size={20} />
            {name}
          </button>
        );
      })}
    </div>
  );
}
export function HomeServiceMosaic() {
  const visible = [
    "house-cleaning",
    "property-cleaning",
    "construction-cleaning",
    "airbnb-cleaning",
    "commercial-cleaning",
  ].map((slug) => services.find((service) => service.slug === slug)!);
  return (
    <div
      className={`service-mosaic ${tileStyles.mosaic} ${tileStyles.restoredMosaic}`}
    >
      {visible.map((service, index) => (
        <ServiceTile
          key={service.slug}
          title={service.name}
          description={service.summary}
          slug={service.slug}
          image={
            service.slug === "airbnb-cleaning"
              ? service.thumbnail
              : `/images/service-preview-${service.slug}-v3.webp`
          }
          index={index}
          featured={index === 0}
        />
      ))}
    </div>
  );
}
export function PricingPaths() {
  const [category, setCategory] = useState<HomeServiceCategory>("Residential");
  const id = useId();
  const plans = homeServices(category).map((service) => ({
    name: service.name,
    label: `${category.toUpperCase()} CLEANING`,
    Icon: serviceIcons[service.slug],
    description: service.summary,
    features: service.includes.slice(0, 3),
    slug: service.slug,
  }));
  return (
    <>
      <ServiceCategorySwitch
        category={category}
        onChange={setCategory}
        controls={id}
      />
      <div
        id={id}
        role="region"
        aria-label={`${category} service options`}
        className={`pricing-paths ${tileStyles.filteredPlans} ${plans.length === 4 ? tileStyles.fourPlans : ""}`}
      >
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
                {category === "Residential" ? "DEEP CLEAN" : "WORKPLACE CARE"}
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
    </>
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
  const badge = {
    label: title.toUpperCase(),
    Icon: serviceIcons[slug] || House,
  };
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
            <span className="service-tile-category">{badge.label}</span>
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
