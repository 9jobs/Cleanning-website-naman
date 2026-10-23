"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowUpRight,
  Phone,
  Leaf,
  House,
  Star,
  Sparkles,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { nav, site } from "@/lib/config";
import { services } from "@/lib/data";
import { ScrollProgress } from "./motion";
import styles from "./navigation-menu.module.css";
import footerStyles from "./footer.module.css";
import logoStyles from "./logo.module.css";
import { FirstCleanOffer } from "./first-clean-offer";

const navigationServices = services.filter(
  (service) =>
    ![
      "move-in-cleaning",
      "balcony-patio-cleaning",
      "end-of-lease-cleaning",
      "bedroom-living-area-cleaning",
    ].includes(service.slug),
);

export function Logo() {
  return (
    <Link
      href="/"
      className={`logo ${logoStyles.link}`}
      aria-label="Thrive4 Cleaning home"
    >
      <Image
        src="/brand/thrive4-logo.png"
        alt="Thrive4 Cleaning"
        width={2172}
        height={724}
        sizes="(max-width: 700px) 190px, 260px"
        className={logoStyles.image}
      />
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (servicesRef.current) servicesRef.current.open = false;
  }, [path]);
  useEffect(() => {
    const closeOutside = (event: Event) => {
      const menu = servicesRef.current;
      if (menu && event.target instanceof Node && !menu.contains(event.target))
        menu.open = false;
    };
    const closeOnLink = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("a[href]") &&
        servicesRef.current
      )
        servicesRef.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("click", closeOnLink);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("click", closeOnLink);
    };
  }, []);
  useEffect(() => {
    const update = () =>
      headerRef.current?.classList.toggle("is-scrolled", window.scrollY > 60);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 1150) setOpen(false);
    };
    document.addEventListener("keydown", handler);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handler);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <>
      <ScrollProgress />
      {path === "/" && <FirstCleanOffer />}
      <div className="announcement">
        Cleaning for Homes & Residential Properties ·{" "}
        <Link href="/services">
          Explore Cleaning Services <ArrowUpRight size={13} />
        </Link>
      </div>
      <header ref={headerRef} className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav
            className="desktop-nav"
            aria-label="Main navigation"
            onPointerOver={(event) => {
              const link =
                event.target instanceof Element
                  ? event.target.closest("a")
                  : null;
              if (
                link &&
                servicesRef.current &&
                !servicesRef.current.contains(link)
              )
                servicesRef.current.open = false;
            }}
          >
            {nav.map(([label, href]) =>
              href === "/services" ? (
                <details
                  key={href}
                  ref={servicesRef}
                  className="mega"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.currentTarget.open = false;
                      e.currentTarget.querySelector("summary")?.focus();
                    }
                  }}
                >
                  <summary className={path.startsWith(href) ? "active" : ""}>
                    Services <ChevronDown size={13} />
                  </summary>
                  <div className={`mega-panel ${styles.panel}`}>
                    <div className="mega-links">
                      {navigationServices.map((s) => (
                        <Link
                          href={`/services/${s.slug}`}
                          key={s.slug}
                          onClick={(e) => {
                            e.currentTarget
                              .closest("details")
                              ?.removeAttribute("open");
                          }}
                        >
                          {s.name}
                          <ArrowUpRight size={13} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className={path === href ? "active" : ""}
                >
                  {label}
                </Link>
              ),
            )}
          </nav>
          <div className="header-actions">
            <Link
              href={
                site.phone ? `tel:${site.phone.replace(/\s/g, "")}` : "/contact"
              }
              className="call-link"
              aria-label={
                site.phone
                  ? "Call Thrive4 Cleaning"
                  : "Contact Thrive4 Cleaning"
              }
            >
              <Phone size={19} />
            </Link>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="button small"
            >
              Book A Call <ArrowUpRight size={16} />
            </a>
          </div>
          <button
            ref={toggleRef}
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            <span className={`hamburger ${open ? "is-open" : ""}`} aria-hidden>
              <span />
              <span />
            </span>
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              ref={menuRef}
              id="mobile-nav"
              className="mobile-nav"
            >
              <span className="eyebrow">CLEANING SERVICES</span>
              <nav aria-label="Mobile navigation">
                {nav.map(([name, href]) => (
                  <Link href={href} key={href} onClick={() => setOpen(false)}>
                    {name}
                    <ArrowUpRight size={17} />
                  </Link>
                ))}
                <Link href="/faq" onClick={() => setOpen(false)}>
                  FAQs
                </Link>
                <a
                  className="button"
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  onClick={() => setOpen(false)}
                >
                  Book A Call
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.container}>
        <div className={footerStyles.grid}>
          <div className={footerStyles.brand}>
            <div className={footerStyles.brandHeading}>
              <Logo />
              <span className={footerStyles.tagline}>
                <Sparkles size={15} aria-hidden="true" />
                Clean Spaces. Better Living.
              </span>
            </div>
            <p>
              Residential cleaning for homes, apartments, rentals and short-stay
              properties.
              <br />
              Practical care inside and out, with an agreed scope.
            </p>
            <ul className={footerStyles.values} aria-label="Thrive4 values">
              <li>
                <span className={footerStyles.iconTile}>
                  <Leaf aria-hidden="true" />
                </span>
                <span>
                  Clean
                  <br />
                  Spaces
                </span>
              </li>
              <li>
                <span className={footerStyles.iconTile}>
                  <House aria-hidden="true" />
                </span>
                <span>
                  Better
                  <br />
                  Living
                </span>
              </li>
              <li>
                <span className={footerStyles.iconTile}>
                  <Star aria-hidden="true" />
                </span>
                <span>
                  Trusted
                  <br />
                  Service
                </span>
              </li>
            </ul>
          </div>
          <section
            className={footerStyles.linkColumn}
            aria-labelledby="footer-social-title"
          >
            <h2 id="footer-social-title">Social Links</h2>
            <ul className={footerStyles.socialList}>
              {(["Facebook", "Instagram", "LinkedIn", "YouTube"] as const).map(
                (label) => {
                  const social = site.socials.find(
                    (item) => item.label.toLowerCase() === label.toLowerCase(),
                  );
                  const content = (
                    <>
                      <span className={footerStyles.socialIcon}>
                        <FooterSocialIcon platform={label} />
                      </span>
                      <span>{label}</span>
                    </>
                  );
                  return (
                    <li key={label}>
                      {social ? (
                        <a
                          className={footerStyles.socialItem}
                          href={social.url}
                          rel="noopener noreferrer"
                        >
                          {content}
                        </a>
                      ) : (
                        <span className={footerStyles.socialItem}>
                          {content}
                        </span>
                      )}
                    </li>
                  );
                },
              )}
              {site.socials
                .filter(
                  (item) =>
                    !["facebook", "instagram", "linkedin", "youtube"].includes(
                      item.label.toLowerCase(),
                    ),
                )
                .map((social) => (
                  <li key={social.url}>
                    <a href={social.url} rel="noopener noreferrer">
                      {social.label}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
          <nav className={footerStyles.linkColumn} aria-label="Our services">
            <h2>Our services</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>
                    <ChevronRight size={17} aria-hidden="true" />
                    <span>{s.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav
            className={`${footerStyles.linkColumn} ${footerStyles.helpColumn}`}
            aria-label="Here to help"
          >
            <h2>Here to help</h2>
            <ul>
              {[
                ["Pricing & quotes", "/pricing"],
                ["Service areas", "/areas"],
                ["FAQs", "/faq"],
                ["Contact Our Team", "/contact"],
              ].map(([t, h]) => (
                <li key={h}>
                  <Link href={h}>
                    <ChevronRight size={17} aria-hidden="true" />
                    <span>{t}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <section
            className={footerStyles.contactCard}
            aria-labelledby="footer-contact-title"
          >
            <span className={footerStyles.contactPill}>
              <MessageCircle size={18} aria-hidden="true" />
              Get in touch
            </span>
            <h2 id="footer-contact-title">We’re here to help</h2>
            <p>
              Have a question or need a quote?
              <br />
              Our team is ready to help.
            </p>
            <address className={footerStyles.contactDetails}>
              {site.email && (
                <a href={`mailto:${site.email}`}>
                  <span className={footerStyles.iconTile}>
                    <Mail aria-hidden="true" />
                  </span>
                  <span>{site.email}</span>
                </a>
              )}
              {site.phone && (
                <a href={`tel:${site.phone.replace(/\s/g, "")}`}>
                  <span className={footerStyles.iconTile}>
                    <Phone aria-hidden="true" />
                  </span>
                  <span>{site.phone}</span>
                </a>
              )}
              {site.address && (
                <div>
                  <span className={footerStyles.iconTile}>
                    <MapPin aria-hidden="true" />
                  </span>
                  <span>{site.address}</span>
                </div>
              )}
            </address>
            {site.abn && <p className={footerStyles.abn}>ABN {site.abn}</p>}
          </section>
        </div>
        <div className={footerStyles.bottom}>
          <span className={footerStyles.copyright}>
            © 2026 Thrive4 Cleaning. All Rights Reserved.
          </span>
          <div className={footerStyles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSocialIcon({
  platform,
}: {
  platform: "Facebook" | "Instagram" | "LinkedIn" | "YouTube";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="currentColor"
      aria-hidden="true"
    >
      {platform === "Facebook" && (
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
      )}
      {platform === "Instagram" && (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="17.5" cy="6.5" r="1.3" />
        </>
      )}
      {platform === "LinkedIn" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path
            d="M7 10v7m4-7v7m0-4.3c0-3.4 6-3.4 6 0V17"
            fill="none"
            stroke="#102126"
            strokeWidth="2"
          />
          <circle cx="7" cy="7" r="1.2" fill="#102126" />
        </>
      )}
      {platform === "YouTube" && (
        <>
          <path d="M21.6 6.2a2.8 2.8 0 0 0-2-2C17.8 3.7 12 3.7 12 3.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8 2 12 2 12s0 4 .4 5.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 16 22 12 22 12s0-4-.4-5.8Z" />
          <path d="m10 8 6 4-6 4Z" fill="#102126" />
        </>
      )}
    </svg>
  );
}
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const check = () => setShow(window.scrollY > 650);
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <>
      {show && (
        <button
          className="back-top"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            })
          }
        >
          <ArrowUp size={20} />
        </button>
      )}
      <a className="mobile-book" href={`tel:${site.phone.replace(/\s/g, "")}`}>
        Book A Call <ArrowUpRight size={18} />
      </a>
    </>
  );
}
