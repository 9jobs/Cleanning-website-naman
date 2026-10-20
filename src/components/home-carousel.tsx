"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button, Photo } from "./ui";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(listener: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const readMotion = () => window.matchMedia(motionQuery).matches;
const serverMotion = () => false;

const slides = [
  {
    image: "/images/thrive-banner-home.png",
    alt: "Male cleaner carefully wiping a kitchen island",
    label: "A fresher home, on your terms.",
    detail: "Regular and one-off home cleaning",
    href: "/services/regular-house-cleaning",
  },
  {
    image: "/images/service-office.png",
    alt: "Freshly cleaned light-filled office with tidy workstations",
    label: "A better start to the working day.",
    detail: "Commercial and workplace cleaning",
    href: "/services/commercial-cleaning",
  },
  {
    image: "/images/service-airbnb.png",
    alt: "Freshly cleaned guest bedroom with neatly folded towels",
    label: "Ready for your next arrival.",
    detail: "Short-stay and changeover cleaning",
    href: "/services/airbnb-cleaning",
  },
];
export function HomeHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    serverMotion,
  );
  const [manualPlay, setManualPlay] = useState(false);
  const autoplay = !paused && (!reducedMotion || manualPlay);
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [autoplay]);
  return (
    <section
      className="carousel-hero"
      aria-labelledby="home-title"
      aria-roledescription="carousel"
    >
      <div className="carousel-media">
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`carousel-photo${active === index ? " is-active" : ""}`}
            aria-hidden={active !== index}
          >
            <Photo
              src={slide.image}
              alt={slide.alt}
              sizes="100vw"
              priority={index === 0}
              unoptimized
            />
          </div>
        ))}
      </div>
      <div className="carousel-wash" aria-hidden="true" />
      <div className="container carousel-content">
        <span className="carousel-eyebrow">
          <span />
          CLEAN SPACES. ROOM TO THRIVE.
        </span>
        <h1 id="home-title">
          A cleaner home.
          <br />
          <span>More time for you.</span>
        </h1>
        <p>
          Professional home and workplace cleaning, with care in every detail.
          Find a cleaning plan that fits your space and your routine.
        </p>
        <div className="actions">
          <Button href="/book">Book a Clean</Button>
          <Button href="/pricing" secondary>
            See our pricing
          </Button>
        </div>
        <div className="carousel-benefits">
          <span>
            <Check size={17} />
            Personalised cleaning plans
          </span>
          <span>
            <Check size={17} />
            Flexible appointments
          </span>
          <span>
            <Check size={17} />
            Simple online requests
          </span>
        </div>
        <button
          type="button"
          className="carousel-accessible-toggle"
          onClick={() => {
            if (!autoplay) {
              setPaused(false);
              setManualPlay(true);
            } else setPaused(true);
          }}
        >
          {autoplay ? "Pause banner autoplay" : "Start banner autoplay"}
        </button>
      </div>
      <div className="container carousel-caption-wrap">
        <Link href={slides[active].href} className="carousel-caption">
          <span className="carousel-caption-icon">
            <Sparkles size={22} />
          </span>
          <span>
            <strong>{slides[active].label}</strong>
            <small>{slides[active].detail}</small>
          </span>
          <ArrowRight size={20} />
        </Link>
      </div>
      <span
        className="sr-only"
        role="status"
        aria-live={autoplay ? "off" : "polite"}
      >
        Banner {active + 1} of {slides.length}: {slides[active].detail}
      </span>
    </section>
  );
}
