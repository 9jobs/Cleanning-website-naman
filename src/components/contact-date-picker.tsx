"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./contact-date.module.css";

function fromISO(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function monthStart(value: string) {
  const date = fromISO(value);
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

export function ContactDatePicker({
  id,
  value,
  min,
  onChange,
  onBlur,
  inputRef,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: (element: HTMLButtonElement | null) => void;
  invalid: boolean;
  describedBy: string;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => monthStart(value || min));
  const [focused, setFocused] = useState(value || min);
  const [above, setAbove] = useState(false);
  const [availableHeight, setAvailableHeight] = useState(420);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const title = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(month);
  const start = new Date(month);
  start.setDate(1 - ((month.getDay() + 6) % 7));
  const numberOfWeeks = Math.ceil(
    (((month.getDay() + 6) % 7) +
      new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
      7,
  );
  const weeks = Array.from({ length: numberOfWeeks }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      return date;
    }),
  );

  useEffect(() => {
    if (open)
      popup.current
        ?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)
        ?.focus();
  }, [open, focused, month]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !wrapper.current?.contains(event.target)
      ) {
        setOpen(false);
        onBlur();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, [open, onBlur]);

  function close() {
    setOpen(false);
    onBlur();
    trigger.current?.focus();
  }
  function choose(date: string) {
    onChange(date);
    close();
  }
  function moveMonth(amount: number) {
    const next = new Date(
      month.getFullYear(),
      month.getMonth() + amount,
      1,
      12,
    );
    if (next < monthStart(min)) return;
    setMonth(next);
    setFocused(iso(next) < min ? min : iso(next));
  }
  function calendarKeys(event: KeyboardEvent<HTMLTableElement>) {
    if (
      !(event.target instanceof HTMLButtonElement) ||
      !event.target.dataset.date
    )
      return;
    const date = fromISO(event.target.dataset.date);
    const movement: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (event.key in movement)
      date.setDate(date.getDate() + movement[event.key]);
    else if (event.key === "Home")
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    else if (event.key === "End")
      date.setDate(date.getDate() + 6 - ((date.getDay() + 6) % 7));
    else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      moveMonth(event.key === "PageUp" ? -1 : 1);
      return;
    } else return;
    event.preventDefault();
    const next = iso(date) < min ? min : iso(date);
    setFocused(next);
    setMonth(monthStart(next));
  }
  return (
    <div
      className={styles.wrapper}
      ref={wrapper}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={(element) => {
          trigger.current = element;
          inputRef(element);
        }}
        id={id}
        type="button"
        role="combobox"
        className={`contact-field ${styles.trigger}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            trigger.current?.click();
          }
        }}
        onClick={() => {
          if (open) {
            close();
            return;
          }
          const first = value && value >= min ? value : min;
          setFocused(first);
          setMonth(monthStart(first));
          const rect = trigger.current?.getBoundingClientRect();
          if (rect) {
            const below = window.innerHeight - rect.bottom - 12;
            const aboveSpace = rect.top - 90;
            const useAbove = below < 410 && aboveSpace > below;
            setAbove(useAbove);
            setAvailableHeight(Math.max(160, useAbove ? aboveSpace : below));
          }
          setOpen(true);
        }}
      >
        <CalendarDays size={18} aria-hidden="true" />
        <span className={value ? styles.value : styles.placeholder}>
          {value
            ? new Intl.DateTimeFormat("en-AU").format(fromISO(value))
            : "dd/mm/yyyy"}
        </span>
      </button>
      {open && (
        <div
          ref={popup}
          id={`${id}-calendar`}
          role="dialog"
          aria-label="Choose your preferred cleaning date"
          className={`${styles.popup} ${above ? styles.above : ""}`}
          style={{ maxHeight: availableHeight }}
        >
          <div className={styles.heading}>
            <span>
              <CalendarDays size={16} aria-hidden="true" /> Preferred date
            </span>
            <small>Choose a day</small>
          </div>
          <div className={styles.month}>
            <button
              type="button"
              aria-label="Previous month"
              disabled={month <= monthStart(min)}
              onClick={() => moveMonth(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <strong aria-live="polite">{title}</strong>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => moveMonth(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <table
            className={styles.grid}
            aria-label={title}
            onKeyDown={calendarKeys}
          >
            <thead>
              <tr>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <th key={day} scope="col">
                      {day}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, index) => (
                <tr key={index}>
                  {week.map((date) => {
                    const day = iso(date);
                    return (
                      <td key={day}>
                        {date.getMonth() === month.getMonth() && (
                          <button
                            type="button"
                            data-date={day}
                            tabIndex={day === focused ? 0 : -1}
                            disabled={day < min}
                            aria-label={new Intl.DateTimeFormat("en-AU", {
                              dateStyle: "full",
                            }).format(date)}
                            aria-pressed={day === value}
                            aria-current={day === min ? "date" : undefined}
                            onClick={() => choose(day)}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.footer}>
            <button type="button" onClick={() => choose("")}>
              Clear
            </button>
            <button type="button" onClick={() => choose(min)}>
              Today
            </button>
            <button type="button" onClick={close}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
