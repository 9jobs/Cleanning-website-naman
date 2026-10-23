"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Headphones,
  House,
  LoaderCircle,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { publicServices as services } from "@/lib/data";
import { frequencies, site } from "@/lib/config";
import { australianDate } from "@/lib/validation";
import {
  contactFieldsSchema,
  type ContactFields,
} from "@/lib/contact-validation";
import { ContactDatePicker } from "./contact-date-picker";
import { ContactSuccessDialog } from "./contact-success-dialog";

const businessEmail = "Thrive4cleaning@gmail.com";
const contactServices = services.filter((service) =>
  [
    "house-cleaning",
    "one-off-cleaning",
    "apartment-cleaning",
    "property-cleaning",
    "airbnb-cleaning",
  ].includes(service.slug),
);
export function ContactQuotePage({
  initial = {},
  ready,
}: {
  initial?: Record<string, string>;
  ready: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ContactFields>({
    defaultValues: {
      name: initial.name || "",
      email: initial.email || "",
      phone: initial.phone || "",
      service: contactServices.some(
        (service) => service.slug === initial.service,
      )
        ? initial.service
        : "",
      property: "" as ContactFields["property"],
      location: initial.location || initial.postcode || "",
      bedrooms: 2,
      bathrooms: 1,
      frequency: frequencies.includes(initial.frequency)
        ? initial.frequency
        : "Fortnightly",
      size: 100,
      date: "",
      message: "",
      consent: false as unknown as true,
      website: "",
    },
  });
  const commercial = false;
  const [busy, setBusy] = useState(false);
  const [error, setErrorMessage] = useState("");
  const [reference, setReference] = useState("");
  const requestId = useRef("");
  function fieldError(name: keyof ContactFields) {
    const message = errors[name]?.message;
    return message ? (
      <span id={`contact-${name}-error`} className="contact-field-error">
        {String(message)}
      </span>
    ) : null;
  }
  function accessibility(name: keyof ContactFields) {
    return {
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    };
  }
  function counter(
    name: "bedrooms" | "bathrooms",
    title: string,
    maximum: number,
  ) {
    return (
      <div className="contact-room-field">
        <label htmlFor={`contact-${name}`}>
          {title} <span>*</span>
        </label>
        <div className="contact-counter">
          <button
            type="button"
            aria-label={`Fewer ${title.toLowerCase()}`}
            onClick={() =>
              setValue(name, Math.max(1, Number(getValues(name)) - 1))
            }
          >
            <Minus size={17} />
          </button>
          <input
            id={`contact-${name}`}
            type="number"
            min={1}
            max={maximum}
            {...register(name, { valueAsNumber: true })}
            {...accessibility(name)}
          />
          <button
            type="button"
            aria-label={`More ${title.toLowerCase()}`}
            onClick={() =>
              setValue(name, Math.min(maximum, Number(getValues(name)) + 1))
            }
          >
            <Plus size={17} />
          </button>
        </div>
        {fieldError(name)}
      </div>
    );
  }
  async function submit(fields: ContactFields) {
    clearErrors();
    setErrorMessage("");
    const parsed = contactFieldsSchema.safeParse(fields);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue, index) =>
        setError(
          issue.path[0] as keyof ContactFields,
          { message: issue.message },
          { shouldFocus: index === 0 },
        ),
      );
      return;
    }
    if (busy) return;
    setBusy(true);
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          submissionId: requestId.current,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.fields)
          Object.entries(result.fields as Record<string, string[]>).forEach(
            ([name, messages]) => {
              if (messages[0])
                setError(name as keyof ContactFields, { message: messages[0] });
            },
          );
        throw new Error(
          result.error || "Your enquiry could not be sent. Please try again.",
        );
      }
      if (!result.reference)
        throw new Error(
          "The enquiry response was incomplete. Please try again.",
        );
      setReference(result.reference);
    } catch (failure) {
      setErrorMessage(
        failure instanceof Error
          ? failure.message
          : "We couldn’t send your enquiry. Please try again or email us directly.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="contact-quote-page"
      aria-labelledby="contact-quote-title"
    >
      <div className="contact-quote-shell">
        <aside
          className="contact-info-rail"
          aria-labelledby="contact-info-title"
        >
          <div className="contact-info-card">
            <span className="contact-info-eyebrow">
              THRIVE4 CLEANING · CONTACT
            </span>
            <h2 id="contact-info-title">
              A fresher space
              <br />
              starts here.
            </h2>
            <p>
              Speak with our team about cleaning your home or residential rental
              property.
            </p>
            <div className="contact-info-links">
              <a href={`mailto:${site.email}`}>
                <Mail size={21} />
                <span>{site.email}</span>
              </a>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`}>
                <Phone size={21} />
                <span>{site.phone}</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin size={22} />
                <span>{site.address}</span>
              </a>
            </div>
            <div className="contact-info-note">
              <Sparkles size={24} />
              <span>
                Thoughtful cleaning.
                <br />A team ready to help.
              </span>
            </div>
          </div>
        </aside>
        <div className="contact-quote-card">
          <>
            <div className="contact-quote-heading">
              <span className="contact-quote-eyebrow">GET A FREE QUOTE</span>
              <h1 id="contact-quote-title">
                Request a <span>Cleaning Quote</span>
              </h1>
              <p>
                Fill in a few details and our team can prepare a personalised
                quote.
              </p>
            </div>
            {!ready && (
              <p className="contact-quote-alert" role="note">
                Email enquiries are temporarily unavailable. Please email{" "}
                <a href={`mailto:${businessEmail}`}>{businessEmail}</a>{" "}
                directly.
              </p>
            )}
            <form
              onSubmit={(event) => void handleSubmit(submit)(event)}
              noValidate
              aria-busy={busy}
            >
              <fieldset disabled={busy} className="contact-quote-fields">
                <div className="contact-quote-grid">
                  <div>
                    <label htmlFor="contact-name">
                      Full Name <span>*</span>
                    </label>
                    <div className="contact-field">
                      <UserRound size={19} />
                      <input
                        id="contact-name"
                        autoComplete="name"
                        placeholder="Your full name"
                        {...register("name")}
                        {...accessibility("name")}
                      />
                    </div>
                    {fieldError("name")}
                  </div>
                  <div>
                    <label htmlFor="contact-email">
                      Email Address <span>*</span>
                    </label>
                    <div className="contact-field">
                      <Mail size={19} />
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        {...accessibility("email")}
                      />
                    </div>
                    {fieldError("email")}
                  </div>
                  <div>
                    <label htmlFor="contact-phone">
                      Phone Number <span>*</span>
                    </label>
                    <div className="contact-field">
                      <Phone size={19} />
                      <input
                        id="contact-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="04XX XXX XXX"
                        {...register("phone")}
                        {...accessibility("phone")}
                      />
                    </div>
                    {fieldError("phone")}
                  </div>
                  <div>
                    <label htmlFor="contact-service">
                      Cleaning Service <span>*</span>
                    </label>
                    <div className="contact-field">
                      <Sparkles size={19} />
                      <select
                        id="contact-service"
                        {...register("service")}
                        {...accessibility("service")}
                      >
                        <option value="">Select a service</option>
                        {contactServices.map((item) => (
                          <option key={item.slug} value={item.slug}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldError("service")}
                  </div>
                  <div>
                    <label htmlFor="contact-property">
                      Property Type <span>*</span>
                    </label>
                    <div className="contact-field">
                      <House size={19} />
                      <select
                        id="contact-property"
                        {...register("property")}
                        {...accessibility("property")}
                      >
                        <option value="">Select property type</option>
                        {["House", "Apartment", "Townhouse"].map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    {fieldError("property")}
                  </div>
                  <div>
                    <label htmlFor="contact-location">
                      Suburb / Postcode <span>*</span>
                    </label>
                    <div className="contact-field">
                      <MapPin size={19} />
                      <input
                        id="contact-location"
                        autoComplete="postal-code"
                        placeholder="e.g. Melbourne VIC 3000"
                        {...register("location")}
                        {...accessibility("location")}
                      />
                    </div>
                    {fieldError("location")}
                  </div>
                </div>
                <div className="contact-property-details">
                  <div className="contact-property-heading">
                    <span>
                      <House size={26} />
                    </span>
                    <div>
                      <strong>
                        {commercial
                          ? "Workplace Details"
                          : "Residential Details"}
                      </strong>
                      <p>
                        {commercial
                          ? "Tell us a little more about your workspace."
                          : "Tell us about the property and its cleaning requirements."}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`contact-details-grid${commercial ? " is-commercial" : ""}`}
                  >
                    {commercial ? (
                      <div>
                        <label htmlFor="contact-size">
                          Approximate floor area (m²)
                        </label>
                        <div className="contact-field">
                          <House size={18} />
                          <input
                            id="contact-size"
                            type="number"
                            min={1}
                            max={100000}
                            {...register("size", { valueAsNumber: true })}
                            {...accessibility("size")}
                          />
                        </div>
                        {fieldError("size")}
                      </div>
                    ) : (
                      <>
                        {counter("bedrooms", "Bedrooms", 8)}
                        {counter("bathrooms", "Bathrooms", 6)}
                      </>
                    )}
                    <div>
                      <label htmlFor="contact-frequency">
                        Cleaning Frequency <span>*</span>
                      </label>
                      <div className="contact-field">
                        <CalendarDays size={18} />
                        <select
                          id="contact-frequency"
                          {...register("frequency")}
                          {...accessibility("frequency")}
                        >
                          {frequencies.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                      {fieldError("frequency")}
                    </div>
                  </div>
                </div>
                <div className="contact-quote-grid contact-quote-extra">
                  <div>
                    <label htmlFor="contact-date">
                      Preferred Cleaning Date <small>(optional)</small>
                    </label>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => (
                        <ContactDatePicker
                          id="contact-date"
                          value={field.value || ""}
                          min={australianDate()}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          invalid={!!errors.date}
                          describedBy={
                            errors.date
                              ? "contact-date-hint contact-date-error"
                              : "contact-date-hint"
                          }
                        />
                      )}
                    />
                    {fieldError("date")}
                    <p className="contact-field-hint" id="contact-date-hint">
                      Your preferred date is subject to confirmation.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="contact-message">
                      Additional Requirements <small>(optional)</small>
                    </label>
                    <textarea
                      id="contact-message"
                      placeholder="Specific areas, stains, pets or access details…"
                      rows={3}
                      {...register("message")}
                      {...accessibility("message")}
                    />
                    {fieldError("message")}
                  </div>
                </div>
                <label className="contact-quote-consent">
                  <input
                    type="checkbox"
                    {...register("consent")}
                    {...accessibility("consent")}
                  />
                  <span>
                    I agree to be contacted about this enquiry and have read the{" "}
                    <Link href="/privacy">privacy notice</Link>.
                  </span>
                </label>
                {fieldError("consent")}
                <div className="contact-quote-honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      {...register("website")}
                    />
                  </label>
                </div>
              </fieldset>
              {error && (
                <div className="contact-quote-alert" role="alert">
                  {error}{" "}
                  <a href={`mailto:${businessEmail}`}>Email us directly</a>
                </div>
              )}
              <button
                type="submit"
                className="contact-quote-submit"
                disabled={busy || !ready}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={18} className="contact-sending-icon" />
                    Sending your enquiry…
                  </>
                ) : (
                  <>
                    Get My Free Quote <ArrowRight size={20} />
                  </>
                )}
              </button>
              <p className="contact-submit-note">
                Submit your enquiry. Our team will confirm the cleaning details,
                price and availability.
              </p>
            </form>
          </>
          <div className="contact-quote-trust">
            {[
              {
                Icon: Clock3,
                title: "No obligation quote",
                text: "Free and easy to request.",
              },
              {
                Icon: ShieldCheck,
                title: "Your information is safe",
                text: "We respect your privacy.",
              },
              {
                Icon: Headphones,
                title: "Friendly support",
                text: "Here to help with your clean.",
              },
            ].map(({ Icon, title, text }) => (
              <div key={title}>
                <span>
                  <Icon size={23} strokeWidth={1.6} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              </div>
            ))}
          </div>
          <a className="contact-direct-email" href={`mailto:${businessEmail}`}>
            <Mail size={15} />
            {businessEmail}
          </a>
        </div>
      </div>
      {reference && (
        <ContactSuccessDialog
          reference={reference}
          onDismiss={() => {
            setReference("");
            requestId.current = "";
            reset();
          }}
        />
      )}
    </section>
  );
}
