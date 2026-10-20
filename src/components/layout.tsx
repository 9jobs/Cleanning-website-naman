"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowUp, ArrowUpRight, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { nav, site } from "@/lib/config";
import { services } from "@/lib/data";
import { ScrollProgress } from "./motion";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Thrive4 Cleaning home">
      <span className="logo-mark">
        <svg
          width="40"
          height="40"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 17h32M31 17v34"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="m45 16 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor" />
        </svg>
      </span>
      <span>
        Thrive4<span className="logo-sub">CLEANING</span>
      </span>
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
      <div className="announcement">
        Professional Cleaning Services Across Australia ·{" "}
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
                  <div className="mega-panel">
                    <div>
                      <span className="eyebrow">OUR CLEANING SERVICES</span>
                      <h3>Professional cleaning for every space.</h3>
                      <Link href="/services" className="text-link">
                        Explore all services <ArrowUpRight size={15} />
                      </Link>
                    </div>
                    <div className="mega-links">
                      {services.map((s) => (
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
            <Link href="/pricing" className="quote-link">
              Get a Quote
            </Link>
            <Link href="/book" className="button small">
              Book a Clean <ArrowUpRight size={16} />
            </Link>
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
                <Link
                  className="button"
                  href="/book"
                  onClick={() => setOpen(false)}
                >
                  Book a Clean
                </Link>
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
    <footer>
      <div className="container footer-grid">
        <div>
          <Logo />
          <p>
            Professional cleaning for homes and workplaces.
            <br />
            Reliable residential and commercial cleaning across Australia.
          </p>
          <span className="footer-tag">Clean Spaces. Better Living.</span>
        </div>
        <div>
          <h4>Discover</h4>
          {[
            ["Who We Are", "/about"],
            ["Customer Reviews", "/reviews"],
            ["Careers", "/careers"],
            ["Cleaning Guides & Blog", "/blog"],
          ].map(([t, h]) => (
            <Link key={h} href={h}>
              {t}
            </Link>
          ))}
        </div>
        <div>
          <h4>Our services</h4>
          {services.slice(0, 6).map((s) => (
            <Link href={`/services/${s.slug}`} key={s.slug}>
              {s.name}
            </Link>
          ))}
        </div>
        <div>
          <h4>Here to help</h4>
          {[
            ["Pricing & quotes", "/pricing"],
            ["Service areas", "/areas"],
            ["FAQs", "/faq"],
            ["Contact Our Team", "/contact"],
          ].map(([t, h]) => (
            <Link key={h} href={h}>
              {t}
            </Link>
          ))}
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
          {site.phone && (
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          )}
          {site.address && <p>{site.address}</p>}
          {site.abn && <p>ABN {site.abn}</p>}
          {site.socials.map((s) => (
            <a key={s.url} href={s.url} rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Thrive4 Cleaning All Rights Reserved.</span>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
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
      <Link className="mobile-book" href="/book">
        Book a Clean <ArrowUpRight size={18} />
      </Link>
    </>
  );
}
