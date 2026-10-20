"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
} from "lucide-react";
import { EnquiryForm } from "./forms";
export function HeroEnquiry() {
  const [details, setDetails] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  return (
    <div className="hero-enquiry">
      {!details ? (
        <>
          <div className="lead-form-heading">
            <div>
              <span className="eyebrow">REQUEST A CLEANING QUOTE</span>
              <h2>Get a quick cleaning quote.</h2>
            </div>
            <span>
              <ShieldCheck size={21} />
              <span>
                No payment details required
                <small>Free, obligation-free quote in seconds.</small>
              </span>
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setDetails({
                name: String(form.get("name")),
                email: String(form.get("email")),
                phone: String(form.get("phone")),
              });
            }}
            className="lead-form-fields"
          >
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
                />
              </span>
            </label>
            <label>
              Email address
              <span className="lead-input-wrap">
                <Mail size={20} aria-hidden="true" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>
            <label>
              Phone number
              <span className="lead-input-wrap">
                <Phone size={20} aria-hidden="true" />
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="04xx xxx xxx"
                  pattern="(?:\+61|0)[0-9 ]{8,15}"
                  required
                />
              </span>
            </label>
            <button className="button" type="submit">
              Get My Free Quote
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="lead-form-note">
            <Check size={15} />
            Next: service & property details. Nothing submitted yet.
          </div>
        </>
      ) : (
        <div className="lead-form-expanded">
          <button
            className="text-link"
            type="button"
            onClick={() => setDetails(null)}
          >
            ← Back to your details
          </button>
          <EnquiryForm kind="quote" initial={details} />
        </div>
      )}
    </div>
  );
}
