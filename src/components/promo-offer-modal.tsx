"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  Copy,
  Gift,
  House,
  Info,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { promoFieldsSchema, promoServices } from "@/lib/promo-validation";
import styles from "./promo-offer.module.css";

export function PromoOfferModal({
  onClose,
  initialView = "claim",
  initialDetails = {},
  onCodeClaimed,
}: {
  onClose: () => void;
  initialView?: "claim" | "code" | "success";
  onCodeClaimed?: (code: string) => void;
  initialDetails?: Partial<Record<"name" | "email" | "phone", string>>;
}) {
  const [showCode, setShowCode] = useState(initialView === "code");
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState("");
  const [recognised, setRecognised] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [success, setSuccess] = useState(initialView === "success");
  const codeVersion = useRef(0);
  async function copyCode() {
    try {
      await navigator.clipboard.writeText("CLEAN10");
      setCopied(true);
    } catch {
      setError("Please select and copy CLEAN10 manually.");
    }
  }
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
      requestAnimationFrame(() => {
        if (previous?.isConnected) previous.focus();
      });
    };
  }, []);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function applyCode() {
    if (checking) return;
    const version = codeVersion.current;
    setChecking(true);
    setCodeStatus("");
    setRecognised(false);
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code }),
      });
      const result = await response.json();
      if (version !== codeVersion.current) return;
      if (!response.ok || !result.recognised)
        throw new Error(
          result.error || "Please enter a promo code and try again.",
        );
      setRecognised(true);
      setCodeStatus(
        "Promo code recognised! Your 10% welcome offer will be reviewed with your cleaning request.",
      );
      if (showCode) {
        setShowCode(false);
        requestAnimationFrame(() => {
          if (dialog.current) dialog.current.scrollTop = 0;
          dialog.current
            ?.querySelector<HTMLInputElement>("#promo-name")
            ?.focus();
        });
      }
    } catch (reason) {
      if (version === codeVersion.current)
        setCodeStatus(
          reason instanceof Error
            ? reason.message
            : "Unable to check your code. Please try again.",
        );
    } finally {
      setChecking(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = promoFieldsSchema.safeParse(values);
    setFields({});
    setError("");
    if (!parsed.success) {
      setFields(parsed.error.flatten().fieldErrors);
      setError("Please check the highlighted fields.");
      return;
    }
    busy.current = true;
    setSubmitting(true);
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok || !result.accepted) {
        setFields(result.fields || {});
        throw new Error(
          result.error || "Unable to send your enquiry. Please try again.",
        );
      }
      setSuccess(true);
      requestAnimationFrame(() =>
        dialog.current?.querySelector<HTMLElement>("[data-success]")?.focus(),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to send your enquiry. Please try again.",
      );
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  return createPortal(
    <dialog
      ref={dialog}
      className={`${styles.dialog} ${success ? styles.successDialog : ""} ${showCode ? styles.codeDialog : ""}`}
      aria-labelledby="promo-title"
      aria-describedby="promo-description"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 && element.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Close promotional offer"
      >
        <X size={20} />
      </button>
      <div className={styles.content}>
        {success ? (
          <div className={styles.successLayout}>
            <div className={styles.successVisual} aria-hidden="true">
              <Image
                src="/images/promo-success-house-v1.webp"
                alt=""
                width={750}
                height={938}
                className={styles.successImage}
              />
              <div className={styles.steps}>
                <div>
                  <span>
                    <Sparkles size={21} />
                  </span>
                  <p>
                    Request
                    <br />
                    Received
                  </p>
                </div>
                <div>
                  <span>
                    <Mail size={21} />
                  </span>
                  <p>
                    Our Team
                    <br />
                    Will Contact You
                  </p>
                </div>
                <div>
                  <span>
                    <CalendarDays size={21} />
                  </span>
                  <p>
                    Confirm Your
                    <br />
                    First Clean Offer
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.successCopy}>
              <p className={styles.received}>
                <Check size={16} aria-hidden="true" /> REQUEST RECEIVED
              </p>
              <h2 id="promo-title" data-success tabIndex={-1}>
                Your <em>10% Offer</em>
                <br /> Request Is In!
              </h2>
              <p id="promo-description">
                We&apos;ve received your enquiry. Our team will contact you to
                confirm your clean and first-booking offer eligibility.
              </p>
              <div className={styles.codeCard}>
                <span className={styles.codeIcon} aria-hidden="true">
                  <Gift size={26} />
                </span>
                <div>
                  <span>YOUR PROMO CODE</span>
                  <strong>CLEAN10</strong>
                </div>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={copyCode}
                >
                  <Copy size={17} /> Copy Code
                </button>
              </div>
              {copied && (
                <p role="status" className={styles.valid}>
                  Promo code copied!
                </p>
              )}
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              <p className={styles.confirmation}>
                <Info size={17} aria-hidden="true" />
                <span>
                  Your 10% discount will be confirmed with your eligible
                  cleaning booking.
                </span>
              </p>
              <div className={styles.successActions}>
                <button
                  className={styles.primary}
                  type="button"
                  onClick={onClose}
                >
                  <House size={20} aria-hidden="true" /> Back to Home
                </button>
                <button
                  className={styles.secondary}
                  type="button"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : showCode ? (
          <div className={styles.codeLayout}>
            <div className={styles.giftVisual} aria-hidden="true">
              <Sparkles size={28} />
              <Gift size={90} />
              <span>10% OFF</span>
            </div>
            <div className={styles.codeCopy}>
              <p className={styles.eyebrow}>EXCLUSIVE WELCOME OFFER</p>
              <h2 id="promo-title">
                Here is your <em>10% OFF</em> Promo Code!
              </h2>
              <p id="promo-description">
                Use this code for your first eligible residential cleaning
                booking with Thrive4 Cleaning.
              </p>
              <div className={styles.codeCard}>
                <div>
                  <span>YOUR PROMO CODE</span>
                  <strong>CLEAN10</strong>
                </div>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={copyCode}
                >
                  <Copy size={15} /> Copy Code
                </button>
              </div>
              {copied && (
                <p className={styles.valid} role="status">
                  Promo code copied!
                </p>
              )}
              {!onCodeClaimed && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void applyCode();
                  }}
                >
                  <label htmlFor="promo-code">Paste your promo code</label>
                  <div className={styles.applyRow}>
                    <span className={styles.inputWrap}>
                      <Tag size={17} aria-hidden="true" />
                      <input
                        id="promo-code"
                        placeholder="Enter promo code"
                        value={code}
                        maxLength={40}
                        aria-describedby="promo-code-status"
                        onChange={(event) => {
                          codeVersion.current++;
                          setCode(event.target.value);
                          setCodeStatus("");
                        }}
                      />
                    </span>
                    <button
                      className={styles.secondary}
                      type="submit"
                      disabled={checking}
                    >
                      {checking ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  <p
                    id="promo-code-status"
                    className={styles.error}
                    role="status"
                  >
                    {codeStatus || error}
                  </p>
                </form>
              )}
              <p className={styles.codeHint}>
                {onCodeClaimed
                  ? "Copy the code, then apply it in the quick quote form below. "
                  : "Copy and apply your code to continue to the enquiry form. "}
                Offer eligibility will be confirmed by our team.
              </p>
              <div className={styles.codeActions}>
                {onCodeClaimed && (
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => {
                      onCodeClaimed("CLEAN10");
                      onClose();
                    }}
                  >
                    Got It
                  </button>
                )}
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.intro}>
              <div className={styles.headerArt} aria-hidden="true" />
              <div className={styles.offerTop}>
                <span className={styles.reward} aria-hidden="true">
                  <Sparkles size={25} />
                </span>
                <p className={styles.eyebrow}>EXCLUSIVE WELCOME OFFER</p>
              </div>
              <h2 id="promo-title">
                You&apos;ve Unlocked <em>10% OFF!</em>
              </h2>
              <p className={styles.subheading}>
                Your first residential clean just got better.
              </p>
              <p id="promo-description">
                Claim 10% off your first eligible residential clean. Enter
                CLEAN10 and send your details below.
              </p>
            </div>
            <div className={styles.codeCard}>
              <span className={styles.codeIcon} aria-hidden="true">
                <Tag size={23} />
              </span>
              <div>
                <span>YOUR PROMO CODE</span>
                <strong>CLEAN10</strong>
              </div>
              <button
                type="button"
                className={styles.secondary}
                onClick={copyCode}
              >
                <Copy size={15} /> Copy Code
              </button>
            </div>
            <p role="status" className={styles.copyStatus}>
              {copied
                ? "Promo code copied!"
                : "Available for eligible first-time residential cleaning customers."}
            </p>
            <form onSubmit={submit} noValidate className={styles.form}>
              <div className={styles.grid}>
                {(
                  [
                    {
                      name: "name",
                      label: "Full Name",
                      placeholder: "Enter your full name",
                      type: "text",
                      autoComplete: "name",
                    },
                    {
                      name: "email",
                      label: "Email Address",
                      placeholder: "you@example.com",
                      type: "email",
                      autoComplete: "email",
                    },
                    {
                      name: "phone",
                      label: "Phone Number",
                      placeholder: "04XX XXX XXX",
                      type: "tel",
                      autoComplete: "tel",
                    },
                  ] as const
                ).map((field) => (
                  <label
                    key={field.name}
                    className={field.name === "name" ? styles.full : undefined}
                    htmlFor={`promo-${field.name}`}
                  >
                    {field.label} <span aria-hidden="true">*</span>
                    <span className={styles.inputWrap}>
                      {field.name === "name" ? (
                        <UserRound size={17} aria-hidden="true" />
                      ) : field.name === "email" ? (
                        <Mail size={17} aria-hidden="true" />
                      ) : (
                        <Phone size={17} aria-hidden="true" />
                      )}
                      <input
                        id={`promo-${field.name}`}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete}
                        defaultValue={initialDetails[field.name] || ""}
                        required
                        maxLength={
                          field.name === "name"
                            ? 150
                            : field.name === "email"
                              ? 200
                              : 32
                        }
                        aria-invalid={Boolean(fields[field.name])}
                        aria-describedby={
                          fields[field.name]
                            ? `promo-${field.name}-error`
                            : undefined
                        }
                      />
                    </span>
                    {fields[field.name] && (
                      <small
                        id={`promo-${field.name}-error`}
                        className={styles.error}
                      >
                        {fields[field.name]?.[0]}
                      </small>
                    )}
                  </label>
                ))}
                <div className={styles.full}>
                  <label htmlFor="promo-code">
                    Promo Code <span aria-hidden="true">*</span>
                  </label>
                  <div className={styles.applyRow}>
                    <span className={styles.inputWrap}>
                      <Tag size={17} aria-hidden="true" />
                      <input
                        id="promo-code"
                        name="code"
                        placeholder="Enter promo code"
                        value={code}
                        maxLength={40}
                        required
                        aria-invalid={
                          Boolean(fields.code) ||
                          Boolean(codeStatus && !recognised)
                        }
                        aria-describedby="promo-code-status"
                        onChange={(event) => {
                          codeVersion.current++;
                          setCode(event.target.value);
                          setRecognised(false);
                          setCodeStatus("");
                        }}
                      />
                    </span>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={applyCode}
                      disabled={checking}
                    >
                      {checking ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  <p
                    id="promo-code-status"
                    role="status"
                    className={recognised ? styles.valid : styles.error}
                  >
                    {codeStatus || fields.code?.[0]}
                  </p>
                </div>
                <label htmlFor="promo-service">
                  Cleaning Service{" "}
                  <span className={styles.optional}>(optional)</span>
                  <span className={styles.inputWrap}>
                    <Sparkles size={17} aria-hidden="true" />
                    <select id="promo-service" name="service">
                      <option value="">Select a service</option>
                      {promoServices.map((service) => (
                        <option value={service.slug} key={service.slug}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </span>
                  {fields.service && (
                    <small className={styles.error}>{fields.service[0]}</small>
                  )}
                </label>
                <label htmlFor="promo-postcode">
                  Postcode <span className={styles.optional}>(optional)</span>
                  <span className={styles.inputWrap}>
                    <MapPin size={17} aria-hidden="true" />
                    <input
                      id="promo-postcode"
                      name="postcode"
                      placeholder="e.g. 2000"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={4}
                      aria-invalid={Boolean(fields.postcode)}
                      aria-describedby={
                        fields.postcode ? "promo-postcode-error" : undefined
                      }
                    />
                  </span>
                  {fields.postcode && (
                    <small id="promo-postcode-error" className={styles.error}>
                      {fields.postcode[0]}
                    </small>
                  )}
                </label>
              </div>
              <div className={styles.trap} aria-hidden="true">
                <label>
                  Leave this blank
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                className={styles.primary}
                disabled={submitting}
              >
                {submitting ? "Sending your request…" : "Claim My 10% OFF →"}
              </button>
              <p className={styles.privacy}>
                Your details will only be used to respond to your cleaning
                enquiry. <Link href="/privacy">Privacy Policy.</Link>
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
