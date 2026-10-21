"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  House,
  KeyRound,
  Building2,
  BedDouble,
  Layers,
  Leaf,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { services } from "@/lib/data";

type PricingPlan = {
  slug: string;
  title: string;
  icon: typeof House;
  description: string;
  price: number;
  features: string[];
  featured?: boolean;
  oneOff?: boolean;
};

function servicePlan(slug: string, icon: typeof House): PricingPlan {
  const service = services.find((item) => item.slug === slug)!;
  return {
    slug,
    title: service.name,
    icon,
    description: service.summary,
    price: 60,
    features: service.includes,
  };
}

const residentialPlans: PricingPlan[] = [
  {
    slug: "house-cleaning",
    title: "House Cleaning",
    icon: House,
    description:
      "Keep your home clean, fresh and comfortable with ongoing care.",
    price: 60,
    features: [
      "Kitchen & bathroom cleaning",
      "Dusting, vacuuming & mopping",
      "Bedrooms & living areas",
      "Weekly, fortnightly or monthly visits",
      "Optional extras available",
    ],
  },
  {
    slug: "property-cleaning",
    title: "Deep Cleaning",
    icon: Sparkles,
    description: "A detailed clean for built-up dirt and grime in your home.",
    price: 60,
    features: [
      "Detailed kitchen & bathroom clean",
      "Accessible skirting boards & door frames",
      "Attention to built-up dirt and grime",
      "Surfaces, switches & handles",
      "Ideal for seasonal or one-off cleans",
    ],
    featured: true,
    oneOff: true,
  },
  {
    slug: "house-cleaning",
    title: "One-Off Cleaning",
    icon: House,
    description: "A single-visit House Cleaning request for priority rooms.",
    price: 60,
    features: [
      "Choose your priority rooms",
      "Kitchen & bathroom refresh",
      "Dusting and surface cleaning",
      "Vacuuming & mopping",
      "No recurring commitment",
    ],
    oneOff: true,
  },
  servicePlan("property-cleaning", KeyRound),
  servicePlan("garden-cleaning", Leaf),
  servicePlan("carpet-cleaning", Layers),
];
const commercialPlans: PricingPlan[] = [
  servicePlan("commercial-cleaning", Building2),
  servicePlan("office-cleaning", Building2),
  servicePlan("construction-cleaning", Layers),
  servicePlan("airbnb-cleaning", BedDouble),
];

export function PricingPlans({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const [category, setCategory] = useState(
    commercialPlans.some((plan) => plan.slug === initial.service)
      ? "commercial"
      : "residential",
  );
  const visiblePlans =
    category === "commercial" ? commercialPlans : residentialPlans;
  function destination(path: string, slug: string, oneOff = false) {
    const query = new URLSearchParams(initial);
    query.set("service", slug);
    if (oneOff || slug !== "house-cleaning") query.set("frequency", "One-off");
    return `${path}?${query.toString()}`;
  }
  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-title">
      <div className="container pricing-plans-inner">
        <div className="pricing-plans-heading">
          <div>
            <span className="pricing-plans-eyebrow">OUR CLEANING PLANS</span>
            <h1 id="pricing-plans-title">
              Choose a cleaning plan
              <br className="pricing-title-break" /> that fits your needs.
            </h1>
            <p>
              Cleaning plans for homes, rentals and workplaces.
              <br className="pricing-title-break" /> Select a plan or get a
              personalised quote based on your space.
            </p>
          </div>
          <div
            className="pricing-plan-switch"
            role="group"
            aria-label="Cleaning plan category"
          >
            <button
              type="button"
              aria-pressed={category === "residential"}
              onClick={() => setCategory("residential")}
            >
              <House size={23} />
              Residential
            </button>
            <button
              type="button"
              aria-pressed={category === "commercial"}
              onClick={() => setCategory("commercial")}
            >
              <Sparkles size={23} />
              Commercial
            </button>
          </div>
        </div>
        <div
          className={`pricing-plan-grid${visiblePlans.length === 2 ? " pricing-plan-grid--two" : ""}`}
        >
          {visiblePlans.map((plan) => {
            const Icon = plan.icon;
            const featured = "featured" in plan && plan.featured === true;
            return (
              <article
                className={`pricing-plan-card${featured ? " pricing-plan-card--featured" : ""}`}
                key={plan.title}
              >
                <div className="pricing-plan-top">
                  <span className="pricing-plan-icon">
                    <Icon size={33} strokeWidth={1.7} />
                  </span>
                  {featured && (
                    <span className="pricing-plan-badge">
                      <Crown size={16} />
                      Recommended
                    </span>
                  )}
                </div>
                <h2>{plan.title}</h2>
                <p className="pricing-plan-description">{plan.description}</p>
                <div className="pricing-plan-price">
                  <strong>AUD ${plan.price}</strong>
                  <span>/ hour</span>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pricing-plan-actions">
                  <Link href={destination("/book", plan.slug, plan.oneOff)}>
                    Pay Now <ArrowRight size={19} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="pricing-plan-trust">
          {[
            {
              icon: House,
              title: "Transparent pricing",
              detail: "Your scope and quote confirmed upfront.",
            },
            {
              icon: Leaf,
              title: "Flexible scheduling",
              detail: "Choose a visit that fits your routine.",
            },
            {
              icon: UsersRound,
              title: "Professional cleaning",
              detail: "Thoughtful care for your property and requirements.",
            },
          ].map((item) => (
            <div key={item.title}>
              <span>
                <item.icon size={29} strokeWidth={1.6} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="pricing-plan-note">
          Every space is different. Your final quote depends on property size,
          condition and any selected extras.{" "}
          <Link href="/contact?service=commercial-cleaning">
            Need a workplace cleaning plan? Get in touch{" "}
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </section>
  );
}
