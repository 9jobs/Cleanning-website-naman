"use client";
import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  LoaderCircle,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { services } from "@/lib/data";
import { extras, frequencies } from "@/lib/config";
import {
  bookingSchema,
  enquirySchema,
  australianDate,
  type Booking,
} from "@/lib/validation";
const defaults: Booking = {
  service: "house-cleaning",
  property: "House",
  bedrooms: 2,
  bathrooms: 1,
  frequency: "Fortnightly",
  size: 100,
  extras: [],
  date: "",
  time: "Flexible",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  suburb: "",
  postcode: "",
  instructions: "",
  consent: true,
  website: "",
};
const stepNames = [
  "Service",
  "Property",
  "Extras",
  "Schedule",
  "Details",
  "Review",
];
const stepFields: (keyof Booking)[][] = [
  ["service"],
  ["property", "bedrooms", "bathrooms", "frequency", "size"],
  ["extras"],
  ["date", "time"],
  ["firstName", "lastName", "email", "phone", "address", "suburb", "postcode"],
  ["consent", "instructions"],
];
export function BookingForm({
  initial = {},
}: {
  initial?: Record<string, string>;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setErrorMessage] = useState("");
  const [draft, setDraft] = useState(false);
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const {
    register,
    control,
    subscribe,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Booking>({
    defaultValues: {
      ...defaults,
      ...Object.fromEntries(
        Object.entries(initial).filter(([k]) =>
          ["service", "property", "postcode", "frequency"].includes(k),
        ),
      ),
      bedrooms: Math.min(8, Math.max(1, Number(initial.bedrooms) || 2)),
      bathrooms: Math.min(6, Math.max(1, Number(initial.bathrooms) || 1)),
      size: Math.max(1, Number(initial.size) || 100),
      extras: initial.extras
        ? initial.extras.split(",").filter((x) => extras.includes(x))
        : [],
      consent: false as unknown as true,
    },
  });
  const values = useWatch({ control }) as Booking;
  useEffect(() => {
    let frame = 0;
    try {
      const saved = JSON.parse(
        localStorage.getItem("clearora-booking-v1") || "null",
      );
      if (saved?.version === 1 && Date.now() - saved.savedAt < 7 * 86400000)
        frame = requestAnimationFrame(() => setDraft(true));
      else localStorage.removeItem("clearora-booking-v1");
    } catch {}
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const subscription = subscribe({
      formState: { values: true },
      callback: ({ values: data }) => {
        try {
          const {
            service,
            property,
            bedrooms,
            bathrooms,
            frequency,
            size,
            extras,
            date,
            time,
          } = data;
          localStorage.setItem(
            "clearora-booking-v1",
            JSON.stringify({
              version: 1,
              savedAt: Date.now(),
              data: {
                service,
                property,
                bedrooms,
                bathrooms,
                frequency,
                size,
                extras,
                date,
                time,
              },
            }),
          );
        } catch {}
      },
    });
    return subscription;
  }, [subscribe]);
  function restore() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("clearora-booking-v1") || "null",
      );
      if (saved?.version === 1 && Date.now() - saved.savedAt < 7 * 86400000) {
        const candidate = { ...getValues(), ...saved.data };
        const result = bookingSchema.safeParse({
          ...candidate,
          date: candidate.date || australianDate(),
          firstName: "Draft",
          lastName: "Draft",
          email: "draft@example.com",
          phone: "0400000000",
          address: "Draft address",
          suburb: "Draft",
          postcode: "3000",
          consent: true,
        });
        if (result.success) reset(candidate);
      }
      setDraft(false);
    } catch {
      setDraft(false);
    }
  }
  function validate(fields: (keyof Booking)[]) {
    clearErrors();
    const result = bookingSchema.safeParse(getValues());
    if (result.success) return true;
    const relevant = result.error.issues.filter((issue) =>
      fields.includes(issue.path[0] as keyof Booking),
    );
    relevant.forEach((issue) =>
      setError(
        issue.path[0] as keyof Booking,
        { message: issue.message },
        { shouldFocus: true },
      ),
    );
    return relevant.length === 0;
  }
  function next() {
    if (validate(stepFields[step])) {
      setStep((s) => s + 1);
      heading.current?.focus();
    }
  }
  async function submit() {
    if (!validate(Object.keys(defaults) as (keyof Booking)[])) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "booking", ...getValues() }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your request could not be sent. Please try again.",
        );
      localStorage.removeItem("clearora-booking-v1");
      router.push(
        `/book/confirmation?reference=${encodeURIComponent(result.reference)}`,
      );
    } catch (e) {
      setErrorMessage(
        e instanceof Error
          ? e.message
          : "Connection failed. Your request was not received.",
      );
    } finally {
      setBusy(false);
    }
  }
  const err = (key: keyof Booking) =>
    errors[key] && <span className="field-error">{errors[key]?.message}</span>;
  return (
    <>
      {draft && (
        <div className="notice">
          You have a saved cleaning plan.{" "}
          <button type="button" className="text-link" onClick={restore}>
            Restore plan
          </button>{" "}
          <button
            type="button"
            className="text-link"
            onClick={() => {
              localStorage.removeItem("clearora-booking-v1");
              setDraft(false);
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="booking-progress" aria-label="Booking progress">
        {stepNames.map((name, i) => (
          <div
            key={name}
            className={step === i ? "current" : i < step ? "complete" : ""}
            aria-current={step === i ? "step" : undefined}
          >
            <b>{i < step ? <Check size={12} /> : i + 1}</b>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="booking-grid">
        <form
          className="panel booking-panel"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 5) next();
            else void submit();
          }}
        >
          <span className="eyebrow">STEP {step + 1} OF 6</span>
          <h2 ref={heading} tabIndex={-1}>
            {
              [
                "Choose your cleaning service.",
                "Tell us about your property.",
                "Select optional cleaning extras.",
                "Choose your preferred schedule.",
                "Enter your contact details.",
                "Review your cleaning request.",
              ][step]
            }
          </h2>
          <p>
            {
              [
                "Select the cleaning service that best fits your property and cleaning requirements.",
                "Provide your property type, number of bedrooms and bathrooms to estimate cleaning scope.",
                "Choose optional extras such as fridge detailing or additional cleaning time.",
                "Select your preferred date and time. Our team will verify local availability.",
                "Enter your contact details so we can deliver your personalised cleaning quote.",
                "Review your cleaning details and property specifications before submitting.",
              ][step]
            }
          </p>
          <div key={step} className="form-step">
            {step === 0 && (
              <>
                <div className="service-options">
                  {services.map((s) => (
                    <label key={s.slug} className="service-option">
                      <input
                        type="radio"
                        value={s.slug}
                        {...register("service")}
                      />
                      <h3>{s.name}</h3>
                      <p>{s.description}</p>
                    </label>
                  ))}
                </div>
                {err("service")}
              </>
            )}
            {step === 1 && (
              <>
                <label>
                  Property type
                  <select {...register("property")}>
                    {["House", "Apartment", "Townhouse"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  {err("property")}
                </label>
                <div className="grid two">
                  <label>
                    Bedrooms
                    <select {...register("bedrooms", { valueAsNumber: true })}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                    {err("bedrooms")}
                  </label>
                  <label>
                    Bathrooms
                    <select {...register("bathrooms", { valueAsNumber: true })}>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                    {err("bathrooms")}
                  </label>
                </div>
                <label>
                  Frequency
                  <select {...register("frequency")}>
                    {frequencies.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                  {err("frequency")}
                </label>
                {["Office", "Other commercial space"].includes(
                  values.property,
                ) && (
                  <label>
                    Approximate floor area (m²)
                    <input
                      type="number"
                      min={1}
                      max={100000}
                      {...register("size", { valueAsNumber: true })}
                    />
                    {err("size")}
                  </label>
                )}
              </>
            )}
            {step === 2 && (
              <fieldset>
                <legend>Optional cleaning extras</legend>
                <div className="extras-grid">
                  {extras.map((x) => (
                    <label key={x} className="check-option">
                      <input
                        type="checkbox"
                        value={x}
                        {...register("extras")}
                      />
                      {x}
                    </label>
                  ))}
                </div>
                {err("extras")}
                <p className="caption">
                  You can continue without extras. Specialist work is subject to
                  assessment.
                </p>
              </fieldset>
            )}
            {step === 3 && (
              <>
                <label>
                  Preferred date
                  <input
                    type="date"
                    min={australianDate()}
                    {...register("date")}
                  />
                  {err("date")}
                </label>
                <label>
                  Preferred time
                  <select {...register("time")}>
                    <option>Flexible</option>
                    <option>Morning (8am–12pm)</option>
                    <option>Afternoon (12pm–5pm)</option>
                  </select>
                  {err("time")}
                </label>
                <div className="notice">
                  This is a preferred appointment request. No time slot is
                  reserved until the team confirms.
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <div className="grid two">
                  <label>
                    First name
                    <input
                      autoComplete="given-name"
                      {...register("firstName")}
                    />
                    {err("firstName")}
                  </label>
                  <label>
                    Last name
                    <input
                      autoComplete="family-name"
                      {...register("lastName")}
                    />
                    {err("lastName")}
                  </label>
                </div>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                  />
                  {err("email")}
                </label>
                <label>
                  Australian phone number
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="04xx xxx xxx"
                    {...register("phone")}
                  />
                  {err("phone")}
                </label>
                <label>
                  Street address
                  <input
                    autoComplete="street-address"
                    {...register("address")}
                  />
                  {err("address")}
                </label>
                <div className="grid two">
                  <label>
                    Suburb
                    <input
                      autoComplete="address-level2"
                      {...register("suburb")}
                    />
                    {err("suburb")}
                  </label>
                  <label>
                    Postcode
                    <input
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={4}
                      {...register("postcode")}
                    />
                    {err("postcode")}
                  </label>
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <dl className="review-details">
                  {[
                    ["Name", `${values.firstName} ${values.lastName}`],
                    ["Email", values.email],
                    ["Phone", values.phone],
                    [
                      "Address",
                      `${values.address}, ${values.suburb} ${values.postcode}`,
                    ],
                    ["Preferred date", values.date],
                    ["Time", values.time],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <label>
                  Special instructions (optional)
                  <textarea
                    {...register("instructions")}
                    placeholder="Pets, access instructions, delicate surfaces or priorities"
                  />
                  {err("instructions")}
                </label>
                <label className="check-option">
                  <input type="checkbox" {...register("consent")} />
                  <span>
                    I have read the <Link href="/privacy">privacy notice</Link>{" "}
                    and <Link href="/terms">draft terms</Link>, and understand
                    this is a request subject to a confirmed quote and
                    availability.
                  </span>
                </label>
                {err("consent")}
              </>
            )}
          </div>
          <div className="honeypot" aria-hidden>
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </label>
          </div>
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          <div className="form-actions">
            {step > 0 && (
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep((s) => s - 1);
                  clearErrors();
                  setErrorMessage("");
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button className="button" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle size={16} /> Sending…
                </>
              ) : step === 5 ? (
                <>
                  Submit Cleaning Request <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
          <p className="caption">
            Plan choices are saved on this device for seven days. Contact and
            address details are not saved locally.
          </p>
        </form>
        <aside className="quote-summary">
          <span className="eyebrow">YOUR CLEANING PLAN</span>
          <h3>Professional Cleaning Summary</h3>
          <dl>
            {[
              [
                "Service",
                services.find((s) => s.slug === values.service)?.name ||
                  "Choose a service",
              ],
              ["Property", values.property],
              ["Rooms", `${values.bedrooms} bed · ${values.bathrooms} bath`],
              ["Frequency", values.frequency],
              [
                "Extras",
                values.extras?.length
                  ? values.extras.join(", ")
                  : "None selected",
              ],
              ["Preferred date", values.date || "Choose a date"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="quote-total">
            <small>PERSONALISED QUOTE</small>
            <strong>Tailored to your space.</strong>
            <p>
              Our team confirms your written quote and appointment details
              before any work begins.
            </p>
          </div>
          <p className="caption">
            <ShieldCheck size={16} /> No payment details required. No upfront
            charge.
          </p>
        </aside>
      </div>
    </>
  );
}
type EnquiryFields = {
  kind: "contact" | "quote" | "careers";
  name: string;
  email: string;
  phone: string;
  service: string;
  postcode: string;
  message: string;
  consent: boolean;
  website: string;
};
export function EnquiryForm({
  kind = "contact",
  postcode = "",
  initial = {},
}: {
  kind?: EnquiryFields["kind"];
  postcode?: string;
  initial?: Partial<
    Pick<EnquiryFields, "name" | "email" | "phone" | "service">
  >;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EnquiryFields>({
    defaultValues: {
      kind,
      name: initial.name || "",
      email: initial.email || "",
      phone: initial.phone || "",
      service: services.some((service) => service.slug === initial.service)
        ? initial.service
        : "house-cleaning",
      postcode,
      message: "",
      consent: false,
      website: "",
    },
  });
  const [busy, setBusy] = useState(false);
  const [error, setErrorMessage] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  async function send(data: EnquiryFields) {
    const valid = enquirySchema.safeParse(data);
    if (!valid.success) {
      valid.error.issues.forEach((issue) =>
        setError(
          issue.path[0] as keyof EnquiryFields,
          { message: issue.message },
          { shouldFocus: true },
        ),
      );
      return;
    }
    if (
      file &&
      (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024)
    ) {
      setErrorMessage("Please choose a PDF résumé under 5 MB.");
      return;
    }
    setBusy(true);
    setErrorMessage("");
    try {
      const body = new FormData();
      body.set("data", JSON.stringify(data));
      if (file) body.set("resume", file);
      const response = await fetch("/api/submissions", {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Your message was not received.");
      if (kind === "quote") {
        router.push(
          `/quote/confirmation?reference=${encodeURIComponent(result.reference)}`,
        );
      } else {
        setReference(result.reference);
      }
    } catch (e) {
      setErrorMessage(
        e instanceof Error
          ? e.message
          : "Connection failed. Your message was not received.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="panel" role="status">
        <Check size={35} />
        <h2>
          {kind === "careers"
            ? "Application received."
            : kind === "quote"
              ? "Quote request received."
              : "Cleaning enquiry received."}
        </h2>
        <p>
          Your reference is <strong>{reference}</strong>. Our team will review
          your {kind === "careers" ? "application" : "cleaning enquiry"} and
          contact you promptly.
        </p>
      </div>
    );
  const err = (key: keyof EnquiryFields) =>
    errors[key] && <span className="field-error">{errors[key]?.message}</span>;
  return (
    <form className="panel" onSubmit={handleSubmit(send)} noValidate>
      <span className="eyebrow">
        {kind === "careers"
          ? "WORK WITH THRIVE4 CLEANING"
          : kind === "quote"
            ? "REQUEST A CLEANING QUOTE"
            : "SPEAK WITH OUR TEAM"}
      </span>
      <h2>
        {kind === "careers"
          ? "Bring your eye for detail."
          : "Tell us about your cleaning needs."}
      </h2>
      <input type="hidden" {...register("kind")} />
      <label>
        Full name
        <input autoComplete="name" {...register("name")} />
        {err("name")}
      </label>
      <div className="grid two">
        <label>
          Email
          <input type="email" autoComplete="email" {...register("email")} />
          {err("email")}
        </label>
        <label>
          Australian phone
          <input type="tel" autoComplete="tel" {...register("phone")} />
          {err("phone")}
        </label>
      </div>
      <div className="grid two">
        <label>
          {kind === "careers"
            ? "Cleaning role of interest"
            : "Cleaning service"}
          <select {...register("service")}>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          {err("service")}
        </label>
        <label>
          Postcode
          <input
            inputMode="numeric"
            maxLength={4}
            autoComplete="postal-code"
            {...register("postcode")}
          />
          {err("postcode")}
        </label>
      </div>
      <label>
        {kind === "careers"
          ? "Tell us about your cleaning experience and availability"
          : "Describe your cleaning requirements"}
        <textarea rows={5} {...register("message")} />
        {err("message")}
      </label>
      {kind === "careers" && (
        <label className="upload-box">
          <Upload size={24} /> Résumé (optional PDF, up to 5 MB)
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setErrorMessage("");
            }}
          />
          <span className="caption">
            Uploaded résumés are stored privately for the hiring team.
          </span>
        </label>
      )}
      <label className="check-option">
        <input type="checkbox" {...register("consent")} />
        <span>
          I have read the <Link href="/privacy">privacy notice</Link> and agree
          to be contacted about this cleaning enquiry.
        </span>
      </label>
      {err("consent")}
      <div className="honeypot" aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      {error && (
        <div role="alert" className="notice error">
          {error}
        </div>
      )}
      <button
        className="button"
        disabled={busy}
        type="submit"
        style={{ marginTop: 24 }}
      >
        {busy ? (
          <>
            <LoaderCircle size={17} /> Sending…
          </>
        ) : (
          <>
            {kind === "careers"
              ? "Submit Application"
              : kind === "quote"
                ? "Request Free Quote"
                : "Submit Cleaning Enquiry"}{" "}
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
