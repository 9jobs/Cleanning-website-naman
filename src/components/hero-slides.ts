/** All image, copy and destinations for the homepage hero live together. */
import { site } from "@/lib/config";

const teamWhatsAppHref = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi Thrive4 Cleaning, I'd like to discuss my cleaning needs.")}`;

export const heroSlides = [
  {
    id: "house-cleaning",
    service: "House",
    titleLine1: "A cleaner home.",
    titleLine2: "More time for you.",
    description:
      "Professional house cleaning tailored to your home, schedule and everyday routine.",
    image: "/images/hero-house-cleaning.webp",
    alt: "Professional cleaner wiping a kitchen island in a bright Australian home",
    position: "center center",
    tabletPosition: "70% center",
    mobilePosition: "right center",
    trustItems: [
      "Personalised cleaning plans",
      "Flexible appointments",
      "Simple online requests",
    ],
    primaryCta: "Request a Clean",
    secondaryCta: "Talk to Our Team",
    primaryHref: "/contact",
    secondaryHref: teamWhatsAppHref,
  },
  {
    id: "property-cleaning",
    service: "Property",
    titleLine1: "Clean properties.",
    titleLine2: "Ready for what’s next.",
    description:
      "Professional cleaning for rental, vacant and managed properties, prepared around your property requirements.",
    image: "/images/hero-property-v2.webp",
    alt: "Presentation-ready vacant apartment with pale timber floors and a bright open-plan kitchen",
    position: "center center",
    tabletPosition: "60% center",
    mobilePosition: "60% center",
    trustItems: [
      "Property-specific cleaning",
      "Flexible scheduling",
      "Clear service requests",
    ],
    primaryCta: "Request a Clean",
    secondaryCta: "Talk to Our Team",
    primaryHref: "/contact",
    secondaryHref: teamWhatsAppHref,
  },
  {
    id: "garden-cleaning",
    service: "Garden",
    titleLine1: "Outdoor spaces,",
    titleLine2: "refreshed.",
    description:
      "Garden and outdoor cleaning for patios, balconies and surrounding property areas.",
    image: "/images/hero-garden-cleaning.webp",
    alt: "Professional cleaner sweeping fallen leaves from a garden path into a dustpan",
    position: "center 42%",
    tabletPosition: "65% 42%",
    mobilePosition: "85% center",
    trustItems: [
      "Outdoor-area cleaning",
      "Flexible service options",
      "Property-focused support",
    ],
    primaryCta: "Request a Clean",
    secondaryCta: "Talk to Our Team",
    primaryHref: "/contact",
    secondaryHref: teamWhatsAppHref,
  },
  {
    id: "construction-cleaning",
    service: "Construction",
    titleLine1: "Post-build cleaning.",
    titleLine2: "Ready for handover.",
    description:
      "Detailed cleaning after construction or renovation work to help prepare the property for presentation and use.",
    image: "/images/hero-construction-cleaning.webp",
    alt: "Professional cleaner vacuuming fine build dust from the floor of a newly renovated empty property",
    position: "center 42%",
    tabletPosition: "65% 42%",
    mobilePosition: "85% center",
    trustItems: [
      "Dust and surface cleaning",
      "Property-focused scope",
      "Flexible service requests",
    ],
    primaryCta: "Request a Clean",
    secondaryCta: "Talk to Our Team",
    primaryHref: "/contact",
    secondaryHref: teamWhatsAppHref,
  },
] as const;
