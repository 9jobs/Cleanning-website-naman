"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LoaderCircle,
  UserRound,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { quickQuoteFieldsSchema } from "@/lib/quick-quote-validation";
import styles from "./hero-enquiry.module.css";

type FieldName = "name" | "email" | "phone";
export function HeroEnquiry() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Partial<Record<FieldName, string>>>({});
  const [reference, setReference] = useState("");
  const pending = useRef(false);
  const request = useRef<{ id: string; snapshot: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = quickQuoteFieldsSchema.safeParse({
      ...values,
      consent: true,
    });
    setFields({});
    setError("");
    if (!parsed.success) {
      const errors: Partial<Record<FieldName, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const name = issue.path[0] as FieldName;
        if (["name", "email", "phone"].includes(name))
          errors[name] = issue.message;
      });
      setFields(errors);
      const first = Object.keys(errors)[0];
      if (first)
        (
          formRef.current?.elements.namedItem(first) as HTMLInputElement
        )?.focus();
      else setError("Please check your details and try again.");
      return;
    }
    const snapshot = JSON.stringify(parsed.data);
    if (!request.current || request.current.snapshot !== snapshot)
      request.current = { id: crypto.randomUUID(), snapshot };
    pending.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/quick-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          submissionId: request.current.id,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.fields)
          setFields(
            Object.fromEntries(
              Object.entries(result.fields as Record<string, string[]>).map(
                ([key, messages]) => [key, messages[0]],
              ),
            ),
          );
        throw new Error(
          result.error || "We couldn’t send your request. Please try again.",
        );
      }
      if (typeof result.reference !== "string" || !result.reference)
        throw new Error(
          "We couldn’t confirm your request. Please retry with the same details.",
        );
      setReference(result.reference);
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "We couldn’t send your request. Please try again or email us directly.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function inputAccessibility(name: FieldName) {
    return {
      "aria-invalid": !!fields[name],
      "aria-describedby": fields[name]
        ? `quick-quote-${name}-error`
        : undefined,
    };
  }
  function fieldError(name: FieldName) {
    return fields[name] ? (
      <small className={styles.fieldError} id={`quick-quote-${name}-error`}>
        {fields[name]}
      </small>
    ) : null;
  }
  return (
    <div className={`hero-enquiry ${styles.card}`}>
      <div className="lead-form-heading">
        <div>
          <div className={styles.offerLine}>
            <span className="eyebrow">REQUEST A CLEANING QUOTE</span>
            <span className={styles.offerBadge}>
              <Sparkles size={15} aria-hidden="true" />
              10% OFF FIRST CLEAN
            </span>
          </div>
          <h2>Get a quick cleaning quote.</h2>
          <p className={styles.offerCopy}>
            Book your first residential clean and receive 10% off.
          </p>
        </div>
      </div>
      {reference ? (
        <div
          className={styles.success}
          ref={successRef}
          role="status"
          tabIndex={-1}
        >
          <CheckCircle2 size={25} aria-hidden="true" />
          <div>
            <h3>Your quote request has been received.</h3>
            <p>Thank you. We’ll contact you to discuss your cleaning needs.</p>
            <small>
              Reference: <span>{reference}</span>
            </small>
          </div>
          <button
            type="button"
            className={styles.again}
            onClick={() => {
              setReference("");
              request.current = null;
              requestAnimationFrame(() =>
                (
                  formRef.current?.elements.namedItem(
                    "name",
                  ) as HTMLInputElement
                )?.focus(),
              );
            }}
          >
            Send another request <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <form
            ref={formRef}
            onSubmit={submit}
            className="lead-form-fields"
            noValidate
            aria-busy={busy}
            aria-label="Quick cleaning quote"
          >
            <div className={styles.field}>
              <label>
                First name
                <span className="lead-input-wrap">
                  <UserRound size={20} aria-hidden="true" />
                  <input
                    name="name"
                    autoComplete="given-name"
                    placeholder="Your first name"
                    minLength={2}
                    maxLength={80}
                    required
                    readOnly={busy}
                    {...inputAccessibility("name")}
                  />
                </span>
              </label>
              {fieldError("name")}
            </div>
            <div className={styles.field}>
              <label>
                Email address
                <span className="lead-input-wrap">
                  <Mail size={20} aria-hidden="true" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={200}
                    required
                    readOnly={busy}
                    {...inputAccessibility("email")}
                  />
                </span>
              </label>
              {fieldError("email")}
            </div>
            <div className={styles.field}>
              <label>
                Phone number
                <span className="lead-input-wrap">
                  <Phone size={20} aria-hidden="true" />
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="04xx xxx xxx"
                    maxLength={20}
                    required
                    readOnly={busy}
                    {...inputAccessibility("phone")}
                  />
                </span>
              </label>
              {fieldError("phone")}
            </div>
            <label className={styles.honeypot} aria-hidden="true">
              Leave this field empty
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
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
                  Get My 10% Off Quote{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
          <p className={`lead-form-note ${styles.note}`}>
            <Check size={15} aria-hidden="true" />
            <span>
              By requesting a quote, you agree we may contact you about this
              enquiry. <Link href="/privacy">Privacy notice</Link>.
            </span>
          </p>
          <p className={styles.offerTerms}>
            Offer applies to first-time residential cleaning bookings.
          </p>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
