"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PromoOfferModal } from "./promo-offer-modal";
import styles from "./first-clean-offer.module.css";

export function FirstCleanOffer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className={styles.banner} aria-label="First clean offer">
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen(true)}
          aria-label="Claim your 10% off first residential clean offer"
          aria-haspopup="dialog"
        >
          <span className={styles.viewport}>
            <span className={styles.track}>
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className={styles.group}
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  <span>
                    <Sparkles size={17} aria-hidden="true" />
                    <strong>10% OFF YOUR FIRST RESIDENTIAL CLEAN</strong>
                  </span>
                  <span>
                    Booking your first clean? Enjoy <strong>10% OFF</strong>{" "}
                    with Thrive4.
                  </span>
                  <span>
                    Your fresher home starts here. Tap to claim your 10% welcome
                    offer.
                  </span>
                </span>
              ))}
            </span>
          </span>
          <span className={styles.cta}>
            Claim Offer <span aria-hidden="true">→</span>
          </span>
        </button>
      </aside>
      {open && <PromoOfferModal onClose={() => setOpen(false)} />}
    </>
  );
}
