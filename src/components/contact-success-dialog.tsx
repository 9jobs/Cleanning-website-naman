"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, X } from "lucide-react";
import styles from "./contact-success-dialog.module.css";

export function ContactSuccessDialog({
  reference,
  onDismiss,
}: {
  reference: string;
  onDismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.card}
      aria-labelledby="contact-success-title"
      aria-describedby="contact-success-description"
      onClose={() => {
        // Ignore a queued cleanup event if development Strict Mode reopened it.
        if (!dialog.current?.open) onDismiss();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = dialog.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]",
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <button
        type="button"
        className={styles.close}
        aria-label="Close confirmation"
        onClick={() => dialog.current?.close()}
      >
        <X size={19} aria-hidden="true" />
      </button>
      <span className={styles.icon}>
        <CircleCheck size={34} aria-hidden="true" />
      </span>
      <span className={styles.eyebrow}>THRIVE4 CLEANING · ENQUIRY SENT</span>
      <h2 id="contact-success-title">
        Thank you.
        <br />
        We’ve received your enquiry.
      </h2>
      <p id="contact-success-description">
        Our team will review your cleaning needs and get back to you using the
        details you provided.
      </p>
      <div className={styles.reference}>
        <span>Your reference</span>
        <strong>{reference}</strong>
      </div>
      <Link href="/" className={styles.home}>
        Back to Home <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <small className={styles.note}>
        Your enquiry is received. Appointment details will be confirmed with
        you.
      </small>
    </dialog>
  );
}
