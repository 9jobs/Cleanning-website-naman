"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui";
import { heroSlides } from "./hero-slides";
import styles from "./home-carousel.module.css";

const SLIDE_DURATION = 6500;
function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}
const readVisibility = () => document.hidden;
const serverVisibility = () => false;

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    readVisibility,
    serverVisibility,
  );
  const autoplay = !paused && !hovered && !focused && !hidden;
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    if (!autoplay) return;
    // A single timeout restarts after interaction; no stacked timers.
    const timer = window.setTimeout(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [activeSlide, autoplay]);

  return (
    <section
      className={`carousel-hero ${styles.hero}`}
      aria-labelledby="home-title"
      aria-roledescription="carousel"
      data-active-service={slide.id}
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(hover: hover)").matches
        )
          setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="carousel-media">
        {heroSlides.map((item, index) => (
          <div
            key={item.id}
            className={`carousel-photo ${styles.imageLayer}${activeSlide === index ? " is-active" : ""}`}
            aria-hidden={activeSlide !== index}
            data-active={activeSlide === index}
            style={
              {
                "--hero-position": item.position,
                "--hero-tablet-position": item.tabletPosition,
                "--hero-mobile-position": item.mobilePosition,
              } as CSSProperties
            }
          >
            <div className="photo">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="100vw"
                preload={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                unoptimized
              />
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-wash" aria-hidden="true" />
      <div className="container carousel-content">
        <h1
          key={`title-${slide.id}`}
          id="home-title"
          className={`${styles.title} ${styles.reveal}`}
        >
          {slide.titleLine1}
          <br />
          <span>{slide.titleLine2}</span>
        </h1>
        <p
          key={`description-${slide.id}`}
          className={`${styles.description} ${styles.reveal}`}
        >
          {slide.description}
        </p>
        <div
          key={`actions-${slide.id}`}
          className={`actions ${styles.actions} ${styles.reveal}`}
        >
          <Button href={slide.primaryHref} className={styles.primary}>
            {slide.primaryCta}
          </Button>
          <a
            href={slide.secondaryHref}
            className="button secondary"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${slide.secondaryCta} on WhatsApp`}
          >
            {slide.secondaryCta}
            <ArrowRight size={17} />
          </a>
        </div>
        <div className={`carousel-benefits ${styles.benefits}`}>
          {slide.trustItems.map((item, index) => (
            <span
              key={`${slide.id}-${item}`}
              className={styles.reveal}
              style={
                { "--hero-delay": `${300 + index * 70}ms` } as CSSProperties
              }
            >
              <Check size={17} aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={styles.pauseControl}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? "Start banner autoplay" : "Pause banner autoplay"}
      </button>
    </section>
  );
}
