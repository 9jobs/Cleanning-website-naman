"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Search,
  Plus,
  Minus,
  SlidersHorizontal,
  MessageCircle,
} from "lucide-react";
import { services, faqs } from "@/lib/data";
import {
  extras,
  frequencies,
  rates,
  estimate,
  site,
  testimonials,
} from "@/lib/config";
import { ServiceCard } from "./ui";
export function QuickQuote() {
  return (
    <form className="quick-quote" action="/contact">
      <label>
        Cleaning service
        <select name="service">
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Property
        <select name="property">
          <option>House</option>
          <option>Apartment</option>
          <option>Townhouse</option>
          <option>Office</option>
        </select>
      </label>
      <label>
        Bedrooms
        <select name="bedrooms">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label>
        Bathrooms
        <select name="bathrooms">
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label>
        Postcode
        <input
          aria-label="Postcode"
          name="postcode"
          placeholder="e.g. 3000"
          inputMode="numeric"
          pattern="[0-9]{4}"
          required
          maxLength={4}
        />
      </label>
      <button className="button" type="submit">
        Get a Quote <ArrowRight size={17} />
      </button>
    </form>
  );
}
export function ServiceFilter() {
  const [category, setCategory] = useState("All services");
  return (
    <>
      <div className="tabs" role="group" aria-label="Filter cleaning services">
        {["All services", "Residential", "Commercial"].map((c) => (
          <button
            aria-pressed={category === c}
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c === "Residential"
              ? "House Cleaning"
              : c === "Property Cleaning"
                ? "Property Cleaning"
                : c === "End of Lease"
                  ? "End of Lease Cleaning"
                  : c === "Commercial"
                    ? "Commercial Cleaning"
                    : c}
          </button>
        ))}
      </div>
      <div className="grid three">
        {services
          .filter((s) => category === "All services" || s.category === category)
          .map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} />
          ))}
      </div>
    </>
  );
}
export function FAQ({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All questions");
  const list = (compact ? faqs.slice(0, 5) : faqs).filter(
    (f) =>
      (category === "All questions" || f.category === category) &&
      `${f.q} ${f.a}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="faq-wrap">
      {!compact && (
        <>
          <label className="search-box">
            <Search size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cleaning questions..."
              aria-label="Search questions"
            />
          </label>
          <div className="tabs" role="group" aria-label="Question category">
            {["All questions", "Booking", "Services", "Pricing", "Areas"].map(
              (c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  className={category === c ? "selected" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ),
            )}
          </div>
        </>
      )}
      <div className="accordion">
        {list.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <Plus size={18} />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
        {list.length === 0 && (
          <p className="empty">
            No matching questions found. Try another search or{" "}
            <Link href="/contact">contact our team</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
export function Comparison() {
  const [value, setValue] = useState(50);
  const [category, setCategory] = useState("Property");
  const image = category.toLowerCase();
  const before = `/images/comparison-${image}-before-v3.webp`;
  const after =
    image === "construction"
      ? "/images/comparison-construction-after-v4.webp"
      : `/images/comparison-${image}-after-v3.webp`;
  return (
    <div className="comparison-wrap">
      <div
        className="comparison-tabs"
        role="group"
        aria-label="Comparison cleaning area"
      >
        {["Property", "Construction"].map((room) => (
          <button
            key={room}
            className={room === category ? "selected" : ""}
            aria-pressed={room === category}
            onClick={() => {
              setCategory(room);
              setValue(50);
            }}
          >
            {room}
          </button>
        ))}
      </div>
      <div className="comparison">
        <div className="comparison-sheet" style={{ width: "100%" }}>
          <Image
            fill
            src={before}
            sizes="(max-width: 700px) 100vw, 1300px"
            alt={`Illustrative ${category.toLowerCase()} before cleaning demo`}
            style={{ objectFit: "cover" }}
          />
        </div>
        <div
          className="comparison-after"
          style={{ clipPath: `inset(0 0 0 ${value}%)` }}
        >
          <div
            className="comparison-sheet comparison-sheet-after"
            style={{ width: "100%", left: 0 }}
          >
            <Image
              fill
              src={after}
              sizes="(max-width: 700px) 100vw, 1300px"
              alt={`Illustrative ${category.toLowerCase()} after cleaning demo`}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <span className="comparison-label before">Before</span>
        <span className="comparison-label after">After</span>
        <div className="comparison-handle" style={{ left: `${value}%` }}>
          <span>↔</span>
        </div>
        <input
          aria-label="Compare before and after cleaning images"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>
      <div className="comparison-demo">
        <span>
          <SparkleMarker /> ILLUSTRATIVE BEFORE & AFTER DEMO
        </span>
        <p className="caption">
          Illustrative comparison. Actual results depend on the condition of the
          property.
        </p>
      </div>
    </div>
  );
}
function SparkleMarker() {
  return <span aria-hidden>✳</span>;
}
function Count({
  label,
  value,
  set,
  max = 8,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="count">
      <span>{label}</span>
      <div>
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= 1}
          onClick={() => set(value - 1)}
        >
          <Minus size={15} />
        </button>
        <output aria-live="polite">{value}</output>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => set(value + 1)}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
export function Pricing({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const initialService = services.find((s) => s.slug === initial.service);
  const [category, setCategory] = useState<keyof typeof rates.base>(
    initialService?.slug === "property-cleaning"
      ? "Property Cleaning"
      : initialService?.slug === "end-of-lease-cleaning"
        ? "End of Lease"
        : initialService?.category === "Commercial"
          ? "Commercial"
          : "Residential",
  );
  const [property, setProperty] = useState(initial.property || "House");
  const [bedrooms, setBedrooms] = useState(
    Math.min(8, Math.max(1, Number(initial.bedrooms) || 2)),
  );
  const [bathrooms, setBathrooms] = useState(
    Math.min(6, Math.max(1, Number(initial.bathrooms) || 1)),
  );
  const [frequency, setFrequency] = useState<keyof typeof rates.discount>(
    frequencies.includes(initial.frequency)
      ? (initial.frequency as keyof typeof rates.discount)
      : "Fortnightly",
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [postcode, setPostcode] = useState(initial.postcode || "");
  const [size, setSize] = useState(100);
  const total = estimate(
    category,
    bedrooms,
    bathrooms,
    frequency,
    selected.length,
    size,
  );
  const query = new URLSearchParams({
    service:
      ((initialService?.category === "Commercial"
        ? "Commercial"
        : initialService?.slug === "property-cleaning"
          ? "Property Cleaning"
          : initialService?.slug === "end-of-lease-cleaning"
            ? "End of Lease"
            : "Residential") === category
        ? initialService?.slug
        : undefined) ||
      (category === "Residential"
        ? "house-cleaning"
        : category === "Property Cleaning"
          ? "property-cleaning"
          : category === "End of Lease"
            ? "end-of-lease-cleaning"
            : "commercial-cleaning"),
    property,
    bedrooms: String(bedrooms),
    bathrooms: String(bathrooms),
    frequency,
    extras: selected.join(","),
    postcode,
    size: String(size),
  });
  return (
    <div id="quote-builder">
      <div className="tabs" role="group" aria-label="Cleaning category">
        {Object.keys(rates.base).map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            className={category === c ? "selected" : ""}
            onClick={() => {
              setCategory(c as keyof typeof rates.base);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="quote-grid">
        <section className="panel">
          <span className="eyebrow">
            <SlidersHorizontal size={14} /> CALCULATE YOUR ESTIMATE
          </span>
          <h2>
            Clear, transparent pricing
            <br />
            for your clean.
          </h2>
          <p>
            Select your property details and frequency for an indicative
            estimate.
          </p>
          <label>
            Property type
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
            >
              {[
                "House",
                "Apartment",
                "Townhouse",
                "Office",
                "Other commercial space",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <div className="grid two">
            <Count label="Bedrooms" value={bedrooms} set={setBedrooms} />
            <Count
              label="Bathrooms"
              value={bathrooms}
              set={setBathrooms}
              max={6}
            />
          </div>
          {category === "Commercial" && (
            <label>
              Approximate floor area (m²)
              <input
                type="number"
                min="1"
                max="100000"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
          )}
          <label>
            Cleaning frequency
            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as keyof typeof rates.discount)
              }
            >
              {frequencies.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Optional cleaning extras</legend>
            <div className="extras-grid">
              {extras.map((x) => (
                <label className="check-option" key={x}>
                  <input
                    type="checkbox"
                    checked={selected.includes(x)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, x]
                          : selected.filter((v) => v !== x),
                      )
                    }
                  />
                  {x}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            Australian postcode
            <input
              value={postcode}
              maxLength={4}
              inputMode="numeric"
              placeholder="e.g. 3000"
              pattern="[0-9]{4}"
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))}
            />
          </label>
        </section>
        <aside className="quote-summary">
          <span className="eyebrow">ESTIMATE SUMMARY</span>
          <h3>Your cleaning plan</h3>
          <dl>
            <div>
              <dt>Clean</dt>
              <dd>{category}</dd>
            </div>
            <div>
              <dt>Property</dt>
              <dd>{property}</dd>
            </div>
            <div>
              <dt>Rooms</dt>
              <dd>
                {bedrooms} bed · {bathrooms} bath
              </dd>
            </div>
            <div>
              <dt>Frequency</dt>
              <dd>{frequency}</dd>
            </div>
            {category === "Commercial" && (
              <div>
                <dt>Floor area</dt>
                <dd>{size} m²</dd>
              </div>
            )}
            <div>
              <dt>Extras</dt>
              <dd>
                {selected.length ? selected.join(", ") : "No extras selected"}
              </dd>
            </div>
            <div>
              <dt>Postcode</dt>
              <dd>{postcode || "Not provided"}</dd>
            </div>
          </dl>
          <div className="quote-total" aria-live="polite">
            <small>
              {total === null ? "PERSONALISED PRICING" : "INDICATIVE ESTIMATE"}
            </small>
            <strong>
              {total === null
                ? "Request a custom quote"
                : new Intl.NumberFormat("en-AU", {
                    style: "currency",
                    currency: "AUD",
                  }).format(total)}
            </strong>
            <p>
              {total === null
                ? "Rates are being finalised. Send your details for a confirmed scope and written quote."
                : "AUD including GST. Subject to property assessment and written confirmation."}
            </p>
          </div>
          <Link className="button" href={`/book?${query}`}>
            Book This Clean <ArrowRight size={17} />
          </Link>
          <p className="caption">
            No payment required. Your preferred date is confirmed by our team.
          </p>
        </aside>
      </div>
    </div>
  );
}
export function Areas() {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(false);
  const matches = site.coverage.filter((a) =>
    `${a.suburb} ${a.postcode} ${a.state}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="area-search panel">
      <MapPin className="large-icon" />
      <h2>Find cleaning services near you.</h2>
      <p>Enter your suburb or four-digit Australian postcode.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
        className="search-box"
      >
        <Search size={20} />
        <input
          aria-label="Suburb or postcode"
          value={query}
          required
          minLength={2}
          maxLength={80}
          onChange={(e) => {
            setQuery(e.target.value);
            setChecked(false);
          }}
          placeholder="Your suburb or postcode"
        />
        <button className="button small">Check availability</button>
      </form>
      {checked && (
        <div role="status" className="notice">
          {matches.length ? (
            matches.map((a) => (
              <p key={a.postcode + a.suburb}>
                {a.suburb}, {a.state} {a.postcode} — service available. Request
                an appointment for confirmed scheduling.
              </p>
            ))
          ) : (
            <>
              Coverage for <strong>{query}</strong> needs to be confirmed.{" "}
              <Link
                href={`/contact?postcode=${/^\d{4}$/.test(query) ? query : ""}`}
              >
                Ask about service in your area <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      )}
      <p className="caption">
        Coverage is confirmed individually. We don’t assume Australia-wide
        availability.
      </p>
    </div>
  );
}
export function Reviews() {
  const [filter, setFilter] = useState("All services");
  const [index, setIndex] = useState(0);
  const visible = testimonials.filter(
    (r) => r.verified && (filter === "All services" || r.service === filter),
  );
  const review = visible.length ? visible[index % visible.length] : null;
  return (
    <>
      <div className="tabs" role="group" aria-label="Filter reviews">
        {["All services", "Residential", "Commercial"].map((c) => (
          <button
            key={c}
            className={filter === c ? "selected" : ""}
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
          >
            {c === "Residential"
              ? "House Cleaning"
              : c === "Property Cleaning"
                ? "Property Cleaning"
                : c === "End of Lease"
                  ? "End of Lease Cleaning"
                  : c === "Commercial"
                    ? "Commercial Cleaning"
                    : c}
          </button>
        ))}
      </div>
      {review ? (
        <div
          className="panel review-carousel"
          aria-roledescription="carousel"
          aria-label="Verified customer reviews"
        >
          <div aria-live="polite">
            <span className="eyebrow">VERIFIED CUSTOMER REVIEWS</span>
            <p aria-label={`${review.rating} out of 5 stars`}>
              {"★".repeat(Math.min(5, Math.max(1, Math.round(review.rating))))}
            </p>
            <blockquote>{review.quote}</blockquote>
            <strong>{review.name}</strong>
            <p>{review.service}</p>
          </div>
          {visible.length > 1 && (
            <div className="actions">
              <button
                className="button secondary"
                onClick={() =>
                  setIndex((i) => (i - 1 + visible.length) % visible.length)
                }
                aria-label="Previous review"
              >
                ←
              </button>
              <span>
                {(index % visible.length) + 1} / {visible.length}
              </span>
              <button
                className="button secondary"
                onClick={() => setIndex((i) => (i + 1) % visible.length)}
                aria-label="Next review"
              >
                →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty panel">
          <MessageCircle size={38} />
          <h2>Verified customer reviews will be published here.</h2>
          <p>
            {filter === "All services"
              ? "Verified customer reviews"
              : `${filter} reviews`}{" "}
            haven’t been published yet. Once genuine customer feedback is
            approved for publication, you’ll find it here.
          </p>
          <Link href="/contact" className="text-link">
            Leave feedback or enquire <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </>
  );
}
