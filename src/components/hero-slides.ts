/** All image, copy and destinations for the homepage hero live together. */
import { site } from "@/lib/config";

const teamWhatsAppHref = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi Thrive4 Cleaning, I'd like to discuss my cleaning needs.")}`;

export const heroSlides = [
  {
    id: "house-cleaning",
    service: "Regular House Cleaning",
    titleLine1: "A cleaner residential space.",
    titleLine2: "Made for everyday living.",
    description:
      "Professional cleaning for houses, apartments, rental properties and everyday living spaces.",
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
    id: "apartment-cleaning",
    service: "Apartment Cleaning",
    titleLine1: "A fresh apartment.",
    titleLine2: "Ready to enjoy.",
    description:
      "Thoughtful cleaning for apartments and units, with attention to kitchens, bathrooms, bedrooms and living areas.",
    image: "/images/hero-property-v2.webp",
    alt: "Presentation-ready vacant apartment with pale timber floors and a bright open-plan kitchen",
    position: "center center",
    tabletPosition: "60% center",
    mobilePosition: "60% center",
    trustItems: [
      "Apartment-focused cleaning",
      "Flexible scheduling",
      "Clear service requests",
    ],
    primaryCta: "Request a Clean",
    secondaryCta: "Talk to Our Team",
    primaryHref: "/contact",
    secondaryHref: teamWhatsAppHref,
  },
  {
    id: "move-in-cleaning",
    service: "Move-In Cleaning",
    titleLine1: "Move in.",
    titleLine2: "Feel at home sooner.",
    description:
      "Residential cleaning before you settle in, helping prepare kitchens, bathrooms, floors and living spaces for your arrival.",
    image: "/images/end-of-lease-cleaning.webp",
    alt: "Bright empty residential living room with timber floors, ready for moving in",
    position: "center 42%",
    tabletPosition: "65% 42%",
    mobilePosition: "85% center",
    trustItems: [
      "Rooms ready for your move",
      "Home-focused scope",
      "Flexible service requests",
    ],
    primaryCta: "Request a Clean",
    secondaryCta: "Talk to Our Team",
    primaryHref: "/contact",
    secondaryHref: teamWhatsAppHref,
  },
] as const;
