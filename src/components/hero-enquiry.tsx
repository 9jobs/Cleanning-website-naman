"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  House,
  LoaderCircle,
  UserRound,
  Mail,
  Phone,
  Sparkles,
  Tag,
} from "lucide-react";
import { promoFieldsSchema, promoServices } from "@/lib/promo-validation";
import styles from "./hero-enquiry.module.css";
import { PromoOfferModal } from "./promo-offer-modal";

const quoteSchema = promoFieldsSchema.extend({
  service: promoFieldsSchema.shape.service.refine(
    Boolean,
    "Choose a cleaning service",
  ),
});
type FieldName = "name" | "email" | "phone" | "service" | "code";

export function HeroEnquiry() {
  const [promoOpen, setPromoOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [checking, setChecking] = useState(false);
  const [codeMessage, setCodeMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Partial<Record<FieldName, string>>>({});
  const pending = useRef(false);
  const checkingRef = useRef(false);
  const codeVersion = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  async function applyCode() {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    setCodeMessage("");
    setApplied("");
    const version = codeVersion.current;
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code }),
      });
      const result = await response.json();
      if (version !== codeVersion.current) return;
      if (!response.ok || !result.recognised)
        throw new Error(result.error || "Please check your promo code.");
      setApplied(code.trim().toUpperCase());
      setFields((current) => ({ ...current, code: undefined }));
      setCodeMessage(
        "Promo code recognised. Your first-booking offer eligibility will be confirmed by our team.",
      );
    } catch (reason) {
      if (version === codeVersion.current)
        setCodeMessage(
          reason instanceof Error
            ? reason.message
            : "Unable to verify the code. Please retry.",
        );
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    setFields({});
    const parsed = quoteSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!parsed.success) {
      const errors = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(
          ([key, messages]) => [key, messages?.[0]],
        ),
      );
      setFields(errors);
      const first = Object.keys(errors)[0];
      (
        formRef.current?.elements.namedItem(first) as HTMLElement | null
      )?.focus();
      return;
    }
    if (applied !== parsed.data.code) {
      setCodeMessage(
        "Please click Apply to verify your promo code before submitting.",
      );
      formRef.current
        ?.querySelector<HTMLInputElement>('[name="code"]')
        ?.focus();
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok || !result.accepted) {
        if (result.fields)
          setFields(
            Object.fromEntries(
              Object.entries(result.fields as Record<string, string[]>).map(
                ([key, messages]) => [key, messages[0]],
              ),
            ),
          );
        throw new Error(
          result.error || "We couldn't confirm your enquiry. Please retry.",
        );
      }
      setSuccessOpen(true);
      formRef.current?.reset();
      setCode("");
      setApplied("");
      setCodeMessage("");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "We couldn't send your request. Please try again.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function fieldError(name: FieldName) {
    return fields[name] ? (
      <small className={styles.fieldError} id={`quick-quote-${name}-error`}>
        {fields[name]}
      </small>
    ) : null;
  }
  function accessibility(name: FieldName) {
    return {
      "aria-invalid": Boolean(fields[name]),
      "aria-describedby": fields[name]
        ? `quick-quote-${name}-error`
        : undefined,
    };
  }

  return (
    <div className={`hero-enquiry ${styles.card}`}>
      <div className="lead-form-heading">
        <div>
          <div className={styles.offerLine}>
            <span className="eyebrow">REQUEST A CLEANING QUOTE</span>
            <button
              type="button"
              className={styles.offerBadge}
              aria-label="Get your 10% promo code"
              aria-haspopup="dialog"
              onClick={() => setPromoOpen(true)}
            >
              <Sparkles size={15} aria-hidden="true" />
              10% OFF FIRST CLEAN
            </button>
          </div>
          <h2>Get a quick cleaning quote.</h2>
          <p className={styles.offerCopy}>
            Book your first residential clean and receive 10% off.
          </p>
        </div>
      </div>
      {promoOpen && (
        <PromoOfferModal
          initialView="code"
          onCodeClaimed={(value) => {
            codeVersion.current++;
            setCode(value);
            setApplied("");
            setCodeMessage("");
          }}
          onClose={() => setPromoOpen(false)}
        />
      )}
      {successOpen && (
        <PromoOfferModal
          initialView="success"
          onClose={() => setSuccessOpen(false)}
        />
      )}
      <form
        ref={formRef}
        onSubmit={submit}
        className={styles.quoteForm}
        noValidate
        aria-busy={busy}
        aria-label="Quick cleaning quote"
      >
        <div className={styles.contactRow}>
          {(
            [
              {
                name: "name",
                label: "Full name",
                placeholder: "Enter your full name",
                type: "text",
                autoComplete: "name",
                Icon: UserRound,
              },
              {
                name: "email",
                label: "Email address",
                placeholder: "you@example.com",
                type: "email",
                autoComplete: "email",
                Icon: Mail,
              },
              {
                name: "phone",
                label: "Phone number",
                placeholder: "04xx xxx xxx",
                type: "tel",
                autoComplete: "tel",
                Icon: Phone,
              },
            ] as const
          ).map(({ Icon, ...field }) => (
            <div className={styles.field} key={field.name}>
              <label htmlFor={`quick-${field.name}`}>
                {field.label} *
                <span className="lead-input-wrap">
                  <Icon size={20} aria-hidden="true" />
                  <input
                    id={`quick-${field.name}`}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    maxLength={
                      field.name === "name"
                        ? 150
                        : field.name === "email"
                          ? 200
                          : 32
                    }
                    required
                    readOnly={busy}
                    {...accessibility(field.name)}
                  />
                </span>
              </label>
              {fieldError(field.name)}
            </div>
          ))}
          <div className={styles.field}>
            <label htmlFor="quick-service">
              Cleaning service *
              <span className="lead-input-wrap">
                <House size={20} aria-hidden="true" />
                <select
                  id="quick-service"
                  name="service"
                  required
                  disabled={busy}
                  defaultValue=""
                  {...accessibility("service")}
                >
                  <option value="">Select a cleaning service</option>
                  {promoServices.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            {fieldError("service")}
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="quick-code">Promo code *</label>
          <div className={styles.codeRow}>
            <span className="lead-input-wrap">
              <Tag size={20} aria-hidden="true" />
              <input
                id="quick-code"
                name="code"
                value={code}
                onChange={(event) => {
                  codeVersion.current++;
                  setCode(event.target.value);
                  setApplied("");
                  setCodeMessage("");
                }}
                placeholder="Enter promo code"
                maxLength={40}
                readOnly={busy}
                required
                {...accessibility("code")}
              />
            </span>
            <button
              type="button"
              className={styles.promoAction}
              onClick={() => setPromoOpen(true)}
              aria-haspopup="dialog"
            >
              Reveal Promo Code <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.promoAction}
              onClick={applyCode}
              disabled={checking || busy}
            >
              {checking ? "Checking…" : "Apply Now"}
            </button>
          </div>
          {fieldError("code")}
        </div>
        {applied && (
          <p className={styles.appliedNote} role="status">
            <Check size={15} aria-hidden="true" />
            <strong>Promo code applied!</strong> Eligibility will be confirmed
            by our team.
          </p>
        )}
        {codeMessage && !applied && (
          <p className={styles.fieldError} role="status">
            {codeMessage}
          </p>
        )}
        <label className={styles.honeypot} aria-hidden="true">
          Leave this field empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <div className={styles.submitRow}>
          <p className={`lead-form-note ${styles.note}`}>
            <Check size={15} aria-hidden="true" />
            <span>
              By requesting a quote, you agree we may contact you about this
              enquiry. <Link href="/privacy">Privacy notice</Link>.
            </span>
          </p>
          <button className="button" type="submit" disabled={busy}>
            {busy ? (
              <>
                Sending your request…{" "}
                <LoaderCircle
                  className={styles.spinner}
                  size={18}
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                Get My 10% Off Quote <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
        <p className={styles.offerTerms}>
          Offer applies to first-time residential cleaning bookings.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
