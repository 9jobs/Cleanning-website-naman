"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ServiceArea } from "@/lib/service-pages";
import styles from "./services.module.css";

export function RoomTabs({ areas }: { areas: ServiceArea[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className={styles.tabs}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Property cleaning by area"
      >
        {areas.map((area, i) => (
          <button
            key={area.title}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel-${i}`}
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(event) => {
              let next = active;
              if (event.key === "ArrowRight")
                next = (active + 1) % areas.length;
              else if (event.key === "ArrowLeft")
                next = (active + areas.length - 1) % areas.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = areas.length - 1;
              else return;
              event.preventDefault();
              setActive(next);
              buttons.current[next]?.focus();
            }}
          >
            {area.title}
          </button>
        ))}
      </div>
      {areas.map((area, i) => (
        <div
          key={area.title}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
          tabIndex={0}
        >
          {active === i && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={styles.tabContent}
            >
              <span className={styles.number}>0{i + 1}</span>
              <h3>{area.title}: the details matter.</h3>
              <ul className={styles.checks}>
                {area.items.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                Accessible areas and the final tasks are confirmed in your
                agreed scope.
              </p>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ServiceFAQs({ questions }: { questions: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <div className={styles.faqList}>
      {questions.map(([question, answer], i) => (
        <div className={styles.faqItem} key={question}>
          <h3>
            <button
              type="button"
              id={`${id}-question-${i}`}
              aria-expanded={open === i}
              aria-controls={`${id}-answer-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {question}
              <Plus
                size={18}
                aria-hidden="true"
                className={open === i ? styles.rotated : ""}
              />
            </button>
          </h3>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                key="answer"
                id={`${id}-answer-${i}`}
                role="region"
                aria-labelledby={`${id}-question-${i}`}
                initial={{ height: reduced ? "auto" : 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: reduced ? "auto" : 0, opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.22 }}
                className={styles.faqAnswer}
              >
                <p>{answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {open !== i && <div id={`${id}-answer-${i}`} hidden />}
        </div>
      ))}
    </div>
  );
}

type DirectoryItem = {
  slug: string;
  name: string;
  image: string;
  alt: string;
  lead: string;
  category: string;
};
export function ServiceDirectory({ items }: { items: DirectoryItem[] }) {
  const [category, setCategory] = useState("All services");
  const filtered = items.filter(
    (item) => category === "All services" || item.category === category,
  );
  return (
    <div>
      <div
        className={styles.filters}
        role="group"
        aria-label="Filter cleaning services"
      >
        {["All services", "Residential"].map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={category === label}
            onClick={() => setCategory(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className={styles.filterCount} role="status">
        {filtered.length} cleaning services
      </p>
      <div className={styles.directory}>
        {filtered.map((item) => (
          <Link
            href={`/services/${item.slug}`}
            key={item.slug}
            className={styles.directoryCard}
          >
            <div className={styles.directoryImage}>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 650px) 92vw, (max-width: 1000px) 45vw, 400px"
              />
            </div>
            <div>
              <span className={styles.kicker}>{item.category}</span>
              <h2>{item.name}</h2>
              <p>{item.lead}</p>
              <span className={styles.textLink}>
                Explore this clean <ArrowRight size={18} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
