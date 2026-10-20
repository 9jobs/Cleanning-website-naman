"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  House,
  KeyRound,
  Leaf,
  Sparkles,
  UsersRound,
} from "lucide-react";

const plans = [
  {
    slug: "regular-house-cleaning",
    title: "Regular House Cleaning",
    icon: House,
    description:
      "Keep your home clean, fresh and comfortable with ongoing care.",
    price: 120,
    features: [
      "Kitchen & bathroom cleaning",
      "Dusting, vacuuming & mopping",
      "Bedrooms & living areas",
      "Weekly, fortnightly or monthly visits",
      "Optional extras available",
    ],
  },
  {
    slug: "deep-cleaning",
    title: "Deep Cleaning",
    icon: Sparkles,
    description: "A more detailed clean for a fresher, healthier home.",
    price: 220,
    features: [
      "Detailed kitchen & bathroom clean",
      "Accessible skirting boards & door frames",
      "Attention to built-up dirt and grime",
      "Surfaces, switches & handles",
      "Ideal for seasonal or one-off cleans",
    ],
    featured: true,
  },
  {
    slug: "end-of-lease-cleaning",
    title: "End of Lease Cleaning",
    icon: KeyRound,
    description:
      "A thorough move-out clean to prepare your property for its next chapter.",
    price: 300,
    features: [
      "Property-specific cleaning checklist",
      "Kitchen, bathrooms & laundry",
      "Vacuuming, mopping & surface care",
      "Empty cupboards & wardrobes",
      "Carpet and oven extras by arrangement",
    ],
  },
];
const refreshPlan = {
  slug: "one-off-cleaning",
  title: "One-off Cleaning",
  icon: House,
  description:
    "A flexible refresh when your home needs a little extra attention.",
  price: 120,
  features: [
    "Choose your priority rooms",
    "Kitchen & bathroom refresh",
    "Dusting and surface cleaning",
    "Vacuuming & mopping",
    "No recurring commitment",
  ],
};

export function PricingPlans({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const [category, setCategory] = useState(
    initial.service === "deep-cleaning" ||
      initial.service === "one-off-cleaning"
      ? "deep"
      : "residential",
  );
  const visiblePlans = category === "deep" ? [plans[1], refreshPlan] : plans;
  function destination(path: string, slug: string) {
    const query = new URLSearchParams(initial);
    query.set("service", slug);
    if (slug !== "regular-house-cleaning") query.set("frequency", "One-off");
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
              Flexible cleaning options for homes, rentals and workplaces.
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
              aria-pressed={category === "deep"}
              onClick={() => setCategory("deep")}
            >
              <Sparkles size={23} />
              Deep Cleaning
            </button>
          </div>
        </div>
        <div
          className={`pricing-plan-grid${category === "deep" ? " pricing-plan-grid--two" : ""}`}
        >
          {visiblePlans.map((plan) => {
            const Icon = plan.icon;
            const featured = "featured" in plan && plan.featured === true;
            return (
              <article
                className={`pricing-plan-card${featured ? " pricing-plan-card--featured" : ""}`}
                key={plan.slug}
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
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={20} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pricing-plan-actions">
                  <Link href={destination("/book", plan.slug)}>
                    Book This Plan <ArrowRight size={19} />
                  </Link>
                  <Link href={destination("/quote", plan.slug)}>
                    Get a Quote <ArrowRight size={19} />
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
              detail: "Thoughtful care for your home or workplace.",
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
          <Link href="/quote?service=commercial-cleaning">
            Need a workplace cleaning plan? Get in touch{" "}
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </section>
  );
}
