"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock3,
  House,
  X,
} from "lucide-react";
import { ContactDatePicker } from "./contact-date-picker";
import {
  bookingLocalNow,
  pricingBookingSchema,
} from "@/lib/pricing-booking-validation";
import { PRICING_HOURLY_RATE } from "@/lib/pricing";
import styles from "./pricing-booking-modal.module.css";

export function PricingBookingModal({
  service,
  title,
  onClose,
}: {
  service: string;
  title: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const request = useRef({ details: "", id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fields, setFields] = useState<Record<string, string[] | undefined>>(
    {},
  );
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const element = dialog.current!;
    document.body.style.overflow = "hidden";
    element.showModal();
    element.querySelector<HTMLInputElement>("input")?.focus();
    function restoreCheckout(event: PageTransitionEvent) {
      if (!event.persisted) return;
      busy.current = false;
      setSubmitting(false);
    }
    window.addEventListener("pageshow", restoreCheckout);
    return () => {
      window.removeEventListener("pageshow", restoreCheckout);
      element.close();
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => previous?.isConnected && previous.focus());
    };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    setError("");
    setFields({});
    const parsed = pricingBookingSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!parsed.success) {
      setFields(parsed.error.flatten().fieldErrors);
      return;
    }
    busy.current = true;
    setSubmitting(true);
    try {
      const details = JSON.stringify(parsed.data);
      if (request.current.details !== details)
        request.current = { details, id: crypto.randomUUID() };
      const response = await fetch("/api/pricing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          requestId: request.current.id,
          booking: parsed.data,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Could not open checkout. Please retry.",
        );
      if (new URL(result.url).origin !== "https://checkout.stripe.com")
        throw new Error("Invalid checkout link. Please retry.");
      window.location.assign(result.url);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Checkout is unavailable. Please retry.",
      );
      busy.current = false;
      setSubmitting(false);
    }
  }
  const inputs = [
    {
      name: "name",
      label: "Full name",
      type: "text",
      placeholder: "Enter your full name",
      autoComplete: "name",
      maxLength: 150,
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      autoComplete: "email",
      maxLength: 200,
    },
    {
      name: "phone",
      label: "Phone number",
      type: "tel",
      placeholder: "04XX XXX XXX",
      autoComplete: "tel",
      maxLength: 32,
    },
    {
      name: "address",
      label: "Cleaning address",
      type: "text",
      placeholder: "Street address, suburb and postcode",
      autoComplete: "street-address",
      maxLength: 300,
    },
    {
      name: "date",
      label: "Preferred date",
      type: "date",
      autoComplete: "off",
      min: bookingLocalNow().slice(0, 10),
    },
    {
      name: "time",
      label: "Preferred time",
      type: "time",
      autoComplete: "off",
    },
  ];
  const ServiceIcon =
    service === "house-cleaning"
      ? House
      : service === "property-cleaning"
        ? Building2
        : CalendarCheck;
  return createPortal(
    <dialog
      ref={dialog}
      className={styles.dialog}
      data-service={service}
      aria-labelledby="pricing-booking-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Close booking form"
      >
        <X size={20} />
      </button>
      <div className={styles.icon}>
        <ServiceIcon size={27} />
      </div>
      <h2 id="pricing-booking-title">{title}</h2>
      <div className={styles.price}>
        AUD {PRICING_HOURLY_RATE}
        <span>/ person / hour</span>
      </div>
      <div className={styles.summary}>
        <CalendarCheck size={27} aria-hidden="true" />
        <div>
          <strong>Booking charge (Non-refundable)</strong>
          <p>Deducted from your final service payment.</p>
        </div>
      </div>
      <form onSubmit={submit} aria-label={`${title} booking details`}>
        <fieldset disabled={submitting} className={styles.fields}>
          {inputs.map(({ label, ...input }) => (
            <div
              key={input.name}
              className={
                input.name === "name" || input.name === "address"
                  ? `${styles.field} ${styles.full}`
                  : styles.field
              }
            >
              <label htmlFor={`pricing-booking-${input.name}`}>
                {label} <span aria-hidden="true">*</span>
              </label>
              {input.name === "date" ? (
                <div className={styles.dateControl}>
                  <input type="hidden" name="date" value={date} required />
                  <ContactDatePicker
                    id="pricing-booking-date"
                    value={date}
                    min={bookingLocalNow().slice(0, 10)}
                    onChange={(value) => {
                      setDate(value);
                      setFields((previous) => ({
                        ...previous,
                        date: undefined,
                      }));
                    }}
                    onBlur={() => {}}
                    inputRef={(element) =>
                      element?.setAttribute("aria-required", "true")
                    }
                    invalid={Boolean(fields.date)}
                    describedBy={
                      fields.date ? "booking-date-error" : "booking-time-note"
                    }
                  />
                </div>
              ) : input.name === "time" ? (
                <BookingTimePicker
                  value={time}
                  onChange={(value) => {
                    setTime(value);
                    setFields((previous) => ({ ...previous, time: undefined }));
                  }}
                  invalid={Boolean(fields.time)}
                />
              ) : (
                <input
                  {...input}
                  id={`pricing-booking-${input.name}`}
                  required
                  aria-invalid={Boolean(fields[input.name])}
                  aria-describedby={
                    fields[input.name]
                      ? `booking-${input.name}-error`
                      : undefined
                  }
                />
              )}
              {fields[input.name] && (
                <small id={`booking-${input.name}-error`} role="alert">
                  {fields[input.name]![0]}
                </small>
              )}
            </div>
          ))}
        </fieldset>
        <p id="booking-time-note" className={styles.note}>
          Date and time are in Melbourne time. Our team will confirm appointment
          availability.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className={styles.pay} disabled={submitting}>
          {submitting ? "Opening checkout…" : "Pay Now"}
          <ArrowRight size={19} />
        </button>
      </form>
    </dialog>,
    document.body,
  );
}

function BookingTimePicker({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(value.slice(0, 2) || "09");
  const [minute, setMinute] = useState(value.slice(3) || "00");
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !wrapper.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, [open]);
  return (
    <div
      className={styles.timeControl}
      ref={wrapper}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <input type="hidden" name="time" value={value} required />
      <button
        ref={trigger}
        id="pricing-booking-time"
        type="button"
        role="combobox"
        className={styles.timeTrigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="pricing-time-options"
        aria-required="true"
        aria-invalid={invalid}
        aria-describedby={invalid ? "booking-time-error" : "booking-time-note"}
        onClick={() => setOpen(!open)}
      >
        <Clock3 size={18} aria-hidden="true" />
        <span>
          {value
            ? `${Number(value.slice(0, 2)) % 12 || 12}:${value.slice(3)} ${Number(value.slice(0, 2)) >= 12 ? "PM" : "AM"}`
            : "Select time"}
        </span>
      </button>
      {open && (
        <div
          id="pricing-time-options"
          role="dialog"
          aria-label="Choose preferred time"
          className={styles.timePopup}
        >
          <strong>
            <Clock3 size={16} /> Preferred time
          </strong>
          <div className={styles.timeOptions}>
            <label>
              Hour
              <select
                aria-label="Hour"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {i % 12 || 12} {i >= 12 ? "PM" : "AM"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minute
              <select
                aria-label="Minute"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, "0")}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className={styles.timeDone}
            onClick={() => {
              onChange(`${hour}:${minute}`);
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            Set time
          </button>
        </div>
      )}
    </div>
  );
}
