"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  MapPin,
  MessageCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { services, articles, faqs } from "@/lib/data";
import { site, testimonials } from "@/lib/config";
import { Photo } from "./ui";
import { Reveal } from "./motion";

export function ServiceDiscovery({ preview = false }: { preview?: boolean }) {
  const [category, setCategory] = useState("All services");
  const [search, setSearch] = useState("");
  const listed = (preview ? services.slice(0, 6) : services).filter(
    (service) =>
      (category === "All services" || service.category === category) &&
      `${service.name} ${service.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <div className="completion finish-container">
      <div className="finish-heading-row">
        <div className="finish-heading">
          <span className="finish-kicker">CLEANING FOR THE WAY YOU LIVE</span>
          <h2>
            Find the right care
            <br />
            for your space.
          </h2>
          <p>
            Every property has different priorities. Explore a routine clean, a
            detailed reset or specialist care.
          </p>
        </div>
        {preview ? (
          <Link
            className="finish-button finish-button--outline"
            href="/services"
          >
            Explore all services <ArrowRight size={18} />
          </Link>
        ) : (
          <span className="finish-label">
            <SlidersHorizontal size={18} /> Choose a service below
          </span>
        )}
      </div>
      {!preview && (
        <div className="finish-discovery-tools">
          <div
            className="finish-tabs"
            role="group"
            aria-label="Filter cleaning services"
          >
            {["All services", "Residential"].map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="finish-search">
            <Search size={19} />
            <span className="sr-only">Search services</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a service or task"
            />
          </label>
        </div>
      )}
      {!preview && (
        <p className="finish-result" role="status">
          {listed.length} {listed.length === 1 ? "service" : "services"} to
          explore
        </p>
      )}
      <div className="finish-service-grid">
        {listed.map((service, index) => (
          <Reveal
            key={service.slug}
            distance={28}
            duration={0.55}
            delay={(index % 3) * 0.08}
            className="finish-service-card"
          >
            <Link href={`/services/${service.slug}`}>
              <Photo
                src={service.thumbnail}
                alt={`${service.name.toLowerCase()} — illustrative service photograph`}
                sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 420px"
              />
              <div className="finish-service-copy">
                <span className="finish-kicker">{service.category}</span>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <span className="finish-text-link">
                  Explore this clean <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      {listed.length === 0 && (
        <div className="finish-empty" role="status">
          <Search size={28} />
          <h3>No matching service yet.</h3>
          <p>
            Try another task, clear the filters or tell us what needs attention.
          </p>
          <button
            type="button"
            className="finish-button"
            onClick={() => {
              setCategory("All services");
              setSearch("");
            }}
          >
            Show all services
          </button>
        </div>
      )}
      {!preview && (
        <div className="finish-selection-guide">
          <div>
            <span className="finish-kicker">NOT SURE WHERE TO START?</span>
            <h3>Start with what your space needs.</h3>
          </div>
          <p>
            Routine upkeep? Choose regular house cleaning. Built-up grime?
            Explore a one-off clean. For rentals, start with property cleaning.
            Specialist surfaces can be assessed separately.
          </p>
          <Link href="/contact" className="finish-text-link">
            Ask about your clean <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}

export function CoverageDirectory({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const id = useId();
  const term = query.trim();
  const matches = site.coverage.filter((area) =>
    `${area.suburb} ${area.postcode} ${area.state}`
      .toLowerCase()
      .includes(term.toLowerCase()),
  );
  const groups = [...new Set(matches.map((area) => area.state))];
  const enquiry = new URLSearchParams(
    /^\d{4}$/.test(submitted)
      ? { postcode: submitted }
      : submitted
        ? { location: submitted }
        : {},
  );
  return (
    <div
      className={`completion finish-coverage${compact ? " finish-coverage--compact" : ""}`}
    >
      <div>
        <span className="finish-icon">
          <MapPin size={25} />
        </span>
        <span className="finish-kicker">LOCAL AVAILABILITY</span>
        <h2>
          A cleaner space starts
          <br />
          with your postcode.
        </h2>
        <p>
          Tell us your suburb or Australian postcode. We’ll help you check the
          next step for your location.
        </p>
      </div>
      <div className="finish-coverage-panel">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (
              term.length < 2 ||
              (/^\d+$/.test(term) && !/^\d{4}$/.test(term))
            ) {
              setError(
                "Enter a suburb name or a four-digit Australian postcode.",
              );
              setSubmitted("");
              return;
            }
            setError("");
            setSubmitted(term);
          }}
          noValidate
        >
          <label htmlFor={id}>Your suburb or postcode</label>
          <div className="finish-location-field">
            <Search size={20} />
            <input
              id={id}
              value={query}
              maxLength={80}
              autoComplete="postal-code"
              aria-invalid={!!error}
              aria-describedby={`${id}-status`}
              placeholder="e.g. your suburb or 3000"
              onChange={(event) => {
                setQuery(event.target.value);
                setSubmitted("");
                setError("");
              }}
            />
          </div>
          <button type="submit" className="finish-button">
            Check availability <ArrowRight size={18} />
          </button>
        </form>
        <div id={`${id}-status`} aria-live="polite">
          {error && (
            <p className="finish-field-error" role="alert">
              {error}
            </p>
          )}
          {submitted &&
            (site.coverage.length === 0 || matches.length === 0) && (
              <div className="finish-location-status">
                <strong>Let’s confirm coverage for {submitted}.</strong>
                <p>
                  {site.coverage.length === 0
                    ? "Our confirmed service directory has not been published yet. This search does not confirm availability."
                    : "This location is not in the current directory. Ask the team whether a visit can be arranged."}
                </p>
                <Link className="finish-text-link" href={`/contact?${enquiry}`}>
                  Enquire about this location <ArrowRight size={17} />
                </Link>
              </div>
            )}
          {submitted && matches.length > 0 && (
            <p className="finish-location-status">
              <Check size={18} /> {matches.length} listed{" "}
              {matches.length === 1 ? "location" : "locations"} found.
              Appointment availability is confirmed after enquiry.
            </p>
          )}
        </div>
        {!submitted && (
          <p className="finish-small">
            Coverage and appointment times are confirmed individually.
          </p>
        )}
        {!compact && (
          <div className="finish-location-directory">
            {site.coverage.length === 0 ? (
              <>
                <span className="finish-kicker">CONFIRMED LOCATIONS</span>
                <h3>A considered local service.</h3>
                <p>
                  A location directory will appear here once coverage is
                  confirmed. Share your postcode and service needs through the
                  enquiry form.
                </p>
              </>
            ) : (
              groups.map((state) => (
                <section key={state}>
                  <h3>{state}</h3>
                  <ul>
                    {matches
                      .filter((area) => area.state === state)
                      .map((area) => (
                        <li key={`${area.suburb}-${area.postcode}`}>
                          <span>{area.suburb}</span>
                          <span>{area.postcode}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const appointmentQuestions = [
  {
    category: "Services",
    q: "Which cleaning service should I choose?",
    a: "Regular house cleaning suits routine upkeep. Property cleaning follows your agreed property checklist. One-Off Cleaning is available for a single visit.",
  },
  {
    category: "Services",
    q: "What is included in a regular clean?",
    a: "Routine cleaning covers accessible dusting, kitchen surfaces, bathroom fixtures, vacuuming and mopping. The written checklist confirms the rooms and tasks included for your property. Appliance interiors and other extras are agreed separately.",
  },
  {
    category: "Booking",
    q: "How does the booking process work?",
    a: "Choose a service, tell us about your property and extras, then share your preferred appointment and contact details. Review the summary before submitting. A request is not a confirmed appointment; the team confirms coverage, scope, price and timing in writing.",
  },
  {
    category: "Quotes",
    q: "What information helps with a cleaning quote?",
    a: "Include your suburb and postcode, property type, bedrooms and bathrooms, the service you need and any priority tasks. Let us know about parking, stairs, pets, surface-care requirements and your preferred date.",
  },
  {
    category: "Appointments",
    q: "Can I choose a preferred date and time?",
    a: "Yes. The booking form lets you request a date and preferred time window. These are preferences for the team to review, not a live availability calendar or a reserved appointment.",
  },
  {
    category: "Services",
    q: "Can I request fridge detailing or extra cleaning time?",
    a: "Optional extras can be selected in the request form or discussed in your enquiry. Equipment, access and surface condition may affect what can be included. Check the final written scope before the visit.",
  },
  {
    category: "Appointments",
    q: "What should I prepare before the visit?",
    a: "Share access instructions and tell us about pets, delicate surfaces and any areas that should be left untouched. Clear loose personal items from agreed surfaces. For a vacate clean, confirm when the property will be empty.",
  },
  {
    category: "Quotes",
    q: "Are any payment details required online?",
    a: "No payment details are required to submit an enquiry. Published pricing plans have a separate secure payment option; personalised quotes and appointments are confirmed with the team.",
  },
  {
    category: "Areas",
    q: "Do you clean in my suburb?",
    a: "Use the service-area search to look for configured coverage, or enquire with your suburb and four-digit postcode. Availability is confirmed individually; a search alone does not reserve a cleaner.",
  },
  {
    category: "Appointments",
    q: "How do I request a change to my appointment?",
    a: "Contact the team with your request reference, original preferred date and the change you need. Timing, availability and any applicable terms are confirmed directly. Do not assume an appointment has changed until you receive confirmation.",
  },
];

const questions = [
  ...faqs.map((item) => ({
    ...item,
    category: item.category === "Pricing" ? "Quotes" : item.category,
  })),
  ...appointmentQuestions.filter((item) => item.category === "Appointments"),
];

export function HelpCentre({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All questions");
  const list = (compact ? questions.slice(0, 5) : questions).filter(
    (item) =>
      (category === "All questions" || item.category === category) &&
      `${item.q} ${item.a}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <div className="completion finish-help">
      {!compact && (
        <div className="finish-help-tools">
          <label className="finish-search">
            <Search size={20} />
            <span className="sr-only">Search questions</span>
            <input
              placeholder="Search cleaning questions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div
            className="finish-tabs"
            role="group"
            aria-label="Question category"
          >
            {[
              "All questions",
              "Services",
              "Booking",
              "Quotes",
              "Appointments",
              "Areas",
            ].map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="finish-result" role="status">
            {list.length} {list.length === 1 ? "answer" : "answers"}
          </p>
        </div>
      )}
      <div className="finish-accordion">
        {list.map((item) => (
          <details key={item.q}>
            <summary>
              {item.q}
              <span aria-hidden="true">+</span>
            </summary>
            <div className="finish-answer">
              <p>{item.a}</p>
            </div>
          </details>
        ))}
      </div>
      {list.length === 0 && (
        <div className="finish-empty" role="status">
          <h3>No answers match that search.</h3>
          <p>Try a different word or ask us about your cleaning needs.</p>
          <button
            className="finish-button finish-button--outline"
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All questions");
            }}
          >
            Reset search
          </button>
        </div>
      )}
    </div>
  );
}

export function FeedbackPanel({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState("All services");
  const verified = testimonials.filter((item) => item.verified);
  const reviews = verified.filter(
    (item) => filter === "All services" || item.service === filter,
  );
  return (
    <div className="completion finish-feedback">
      {verified.length > 0 ? (
        <>
          {verified.length >= 4 && (
            <div
              className="finish-tabs"
              role="group"
              aria-label="Filter reviews"
            >
              {[
                "All services",
                ...new Set(verified.map((item) => item.service)),
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          <div className="finish-feedback-grid">
            {reviews
              .slice(0, compact ? 2 : reviews.length)
              .map((review, index) => (
                <figure key={`${review.name}-${index}`}>
                  <span className="finish-kicker">{review.service}</span>
                  <blockquote>{review.quote}</blockquote>
                  <figcaption>{review.name} · Verified customer</figcaption>
                </figure>
              ))}
          </div>
        </>
      ) : (
        <div className="finish-feedback-invitation">
          <span className="finish-icon">
            <MessageCircle size={29} />
          </span>
          <span className="finish-kicker">YOUR EXPERIENCE MATTERS</span>
          <h2>
            A little feedback.
            <br />A better next clean.
          </h2>
          <p>
            Genuine customer feedback hasn’t been published here yet. If you’ve
            used our service, tell us what worked well and what could be better.
          </p>
          <Link href="/contact" className="finish-button">
            Share your experience <ArrowRight size={18} />
          </Link>
          <span className="finish-small">
            No sample ratings or customer testimonials are shown.
          </span>
        </div>
      )}
      {!compact && (
        <div className="finish-feedback-prompts">
          {[
            "Tell us which service you used",
            "Share the details that mattered",
            "Include your request reference privately",
          ].map((item, index) => (
            <div key={item}>
              <span>0{index + 1}</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JournalLibrary({ preview = false }: { preview?: boolean }) {
  const [category, setCategory] = useState("All guides");
  const featured = articles[0];
  const listed = articles.filter(
    (article) =>
      (preview ||
        category !== "All guides" ||
        article.slug !== featured.slug) &&
      (category === "All guides" || article.category === category),
  );
  return (
    <div className="completion">
      {!preview && (
        <Reveal
          distance={28}
          duration={0.55}
          className="finish-journal-feature"
        >
          <Photo
            src={featured.image}
            alt="Cleaning products and cloths ready for a weekly routine"
          />
          <div>
            <span className="finish-kicker">
              FEATURED GUIDE · {featured.read}
            </span>
            <h2>{featured.title}</h2>
            <p>{featured.intro}</p>
            <Link href={`/blog/${featured.slug}`} className="finish-button">
              Read the guide <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      )}
      {!preview && (
        <div
          className="finish-tabs"
          role="group"
          aria-label="Filter cleaning articles"
        >
          {["All guides", "Home care", "Moving", "Cleaning tips"].map(
            (item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
      )}
      <div className="finish-journal-grid">
        {listed.map((article, index) => (
          <Reveal
            key={article.slug}
            distance={28}
            duration={0.55}
            delay={index * 0.08}
            className="finish-journal-card"
          >
            <Link href={`/blog/${article.slug}`}>
              <Photo src={article.image} alt={article.imageAlt} />
              <div>
                <span className="finish-kicker">
                  {article.category} · {article.read}
                </span>
                <h3>{article.title}</h3>
                <p>{article.intro}</p>
                <span className="finish-text-link">
                  Read the guide <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
