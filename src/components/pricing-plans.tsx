"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  House,
  KeyRound,
  Leaf,
  UsersRound,
} from "lucide-react";
import { services } from "@/lib/data";
import { PRICING_HOURLY_RATE } from "@/lib/pricing";

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
    price: PRICING_HOURLY_RATE,
    features: service.includes,
  };
}

const residentialPlans: PricingPlan[] = [
  {
    slug: "house-cleaning",
    title: "Regular House Cleaning",
    icon: House,
    description:
      "Stay on top of everyday upkeep with visits that fit your household routine.",
    price: PRICING_HOURLY_RATE,
    features: [
      "Scheduled weekly or fortnightly visits",
      "Day-to-day kitchen and bathroom upkeep",
      "Bedroom and lounge maintenance",
      "Dusting, vacuuming and floor mopping",
      "Optional add-ons by arrangement",
    ],
  },
  {
    slug: "one-off-cleaning",
    title: "One-Off Cleaning",
    icon: House,
    description:
      "Plan a focused reset after a busy period or ahead of a special occasion.",
    price: PRICING_HOURLY_RATE,
    features: [
      "One appointment, no ongoing plan",
      "Focus on the areas you choose",
      "Extra attention for built-up dirt",
      "Benches, fixtures and reachable surfaces",
      "Scope confirmed before the visit",
    ],
    oneOff: true,
  },
  {
    ...servicePlan("property-cleaning", KeyRound),
    description:
      "Prepare a rental or vacant home for its next use with a property-specific checklist.",
    features: [
      "Suitable for occupied or vacant rentals",
      "Empty cupboards by prior agreement",
      "Room-by-room presentation checklist",
      "Access planned with the owner or agent",
    ],
  },
];

export function PricingPlans({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const [checkoutService, setCheckoutService] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<{
    service: string;
    message: string;
  } | null>(null);
  const checkoutBusy = useRef(false);
  const requestIds = useRef<Record<string, string>>({});
  useEffect(() => {
    function restoreCheckout(event: PageTransitionEvent) {
      if (!event.persisted) return;
      checkoutBusy.current = false;
      requestIds.current = {};
      setCheckoutService(null);
      setCheckoutError(null);
    }
    window.addEventListener("pageshow", restoreCheckout);
    return () => window.removeEventListener("pageshow", restoreCheckout);
  }, []);
  async function openCheckout(slug: string) {
    if (checkoutBusy.current) return;
    checkoutBusy.current = true;
    setCheckoutService(slug);
    setCheckoutError(null);
    try {
      requestIds.current[slug] ||= crypto.randomUUID();
      const response = await fetch("/api/pricing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: slug,
          requestId: requestIds.current[slug],
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not open checkout. Please retry.");
      if (new URL(data.url).origin !== "https://checkout.stripe.com")
        throw new Error("Invalid checkout link. Please retry.");
      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError({
        service: slug,
        message:
          error instanceof Error
            ? error.message
            : "Checkout is unavailable. Please retry.",
      });
      setCheckoutService(null);
      checkoutBusy.current = false;
    }
  }
  const visiblePlans = residentialPlans;
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
              Cleaning plans for homes and residential rentals.
              <br className="pricing-title-break" /> Select a plan or get a
              personalised quote based on your space.
            </p>
          </div>
        </div>
        <div
          id="pricing-plan-results"
          role="region"
          aria-label="Residential cleaning plans"
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
                  <span>/ person / hour</span>
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
                  <Link
                    href={destination("/book", plan.slug, plan.oneOff)}
                    prefetch={false}
                    aria-disabled={checkoutService !== null}
                    onClick={(event) => {
                      event.preventDefault();
                      void openCheckout(plan.slug);
                    }}
                  >
                    {checkoutService === plan.slug
                      ? "Opening checkout…"
                      : "Pay Now"}{" "}
                    <ArrowRight size={19} />
                  </Link>
                  {checkoutError?.service === plan.slug && (
                    <p role="alert">{checkoutError.message}</p>
                  )}
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
          <Link href="/contact">
            Need a personalised home cleaning plan? Get in touch{" "}
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </section>
  );
}
