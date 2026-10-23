"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  CircleDollarSign,
  CreditCard,
  Crown,
  Headphones,
  House,
  ShieldCheck,
} from "lucide-react";
import { publicServices as services } from "@/lib/data";
import { PRICING_HOURLY_RATE } from "@/lib/pricing";
import styles from "./pricing-plans.module.css";

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
      "Keep your home fresh, clean and comfortable with our regular cleaning service.",
    price: PRICING_HOURLY_RATE,
    features: [
      "Fortnightly or monthly visits",
      "Bedroom and living room cleaning",
      "Kitchen cleaning",
      "Dusting, vacuuming and floor mopping",
    ],
  },
  {
    slug: "one-off-cleaning",
    title: "One-Off Cleaning",
    icon: CalendarCheck,
    description: "Perfect for a deep clean or a special occasion.",
    price: PRICING_HOURLY_RATE,
    features: [
      "One appointment, no ongoing plan",
      "Bedroom and living room cleaning",
      "Kitchen cleaning",
      "Dusting, vacuuming and floor mopping",
    ],
    oneOff: true,
  },
  {
    ...servicePlan("property-cleaning", Building2),
    description: "Prepare a rental or vacant property with a detailed clean.",
    features: [
      "Fortnightly or monthly visits",
      "Bedroom and living room cleaning",
      "Kitchen cleaning",
      "Dusting, vacuuming and floor mopping",
      "Bathroom cleaning",
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
    <section
      className={`pricing-plans ${styles.plans}`}
      aria-labelledby="pricing-plans-title"
    >
      <div className={styles.sparkles} aria-hidden="true">
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
      </div>
      <div className="container pricing-plans-inner">
        <div className="pricing-plans-heading">
          <div>
            <h1 id="pricing-plans-title">
              Find the right{" "}
              <span className={styles.headingAccent}>cleaning plan</span> for
              your space.
            </h1>
            <p>
              Choose a plan for your home or rental. Pay a small booking charge
              to confirm your booking,
              <br className="pricing-title-break" /> This amount is{" "}
              <strong>non-refundable</strong> and will be{" "}
              <strong>deducted from your final service payment.</strong>
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
                <div className="pricing-plan-price">
                  <strong>AUD {plan.price}</strong>
                  <span>/ person / hour</span>
                </div>
                <div className={styles.bookingCharge}>
                  <CalendarCheck
                    size={34}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <div>
                    <strong>Booking charge (Non-refundable)</strong>
                    <p>
                      This amount will be deducted from your final service
                      payment.
                    </p>
                  </div>
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
              icon: CircleDollarSign,
              title: `AUD ${PRICING_HOURLY_RATE} / person / hour`,
              detail: "Transparent pricing",
            },
            {
              icon: ShieldCheck,
              title: "Non-refundable booking charge",
              detail: "Deducted from your final payment",
            },
            {
              icon: CreditCard,
              title: "Secure online booking",
              detail: "Safe and easy payments",
            },
            {
              icon: Headphones,
              title: "Flexible scheduling",
              detail: "Book at your convenience",
            },
          ].map((item) => (
            <div key={item.title}>
              <span>
                <item.icon size={35} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
