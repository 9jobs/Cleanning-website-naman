"use client";
import {
  animate,
  stagger as staggerDelay,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
type RevealProps = {
  children: React.ReactNode;
  variant?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
};
export function Reveal({
  children,
  variant = "up",
  direction,
  distance = 60,
  duration = 0.8,
  delay = 0,
  stagger = 0,
  threshold = 0.18,
  once = true,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const targets =
      stagger > 0 ? (Array.from(node.children) as HTMLElement[]) : [node];
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let controls: ReturnType<typeof animate> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let completed = false;
    const restore = () => {
      for (const target of targets) {
        target.style.opacity = "";
        target.style.transform = "";
        target.style.filter = "";
        target.style.clipPath = "";
      }
      node.dataset.revealState = "visible";
    };
    if (preference.matches || !("IntersectionObserver" in window)) {
      restore();
      return;
    }
    const kind = direction || variant;
    const x = kind === "left" ? -distance : kind === "right" ? distance : 0;
    const y = ["up", "slideUp"].includes(kind)
      ? distance
      : ["down", "slideDown"].includes(kind)
        ? -distance
        : 0;
    const from = `translate3d(${x}px,${y}px,0) scale(${kind === "scale" ? 0.94 : 1})`;
    const prepare = () => {
      for (const target of targets) {
        target.style.opacity = "0";
        target.style.transform = from;
        if (kind === "blur") target.style.filter = "blur(8px)";
        if (kind === "image")
          target.style.clipPath = "inset(10% 0 0 0 round 24px)";
      }
      node.dataset.revealState = "pending";
    };
    const enter = () => {
      if (completed && once) return;
      completed = true;
      node.dataset.revealState = "animating";
      const frames: Record<string, string[] | number[]> = {
        opacity: [0, 1],
        transform: [from, "translate3d(0,0,0) scale(1)"],
      };
      if (kind === "blur") frames.filter = ["blur(8px)", "blur(0px)"];
      if (kind === "image")
        frames.clipPath = [
          "inset(10% 0 0 0 round 24px)",
          "inset(0% 0 0 0 round 24px)",
        ];
      try {
        controls = animate(targets, frames, {
          duration,
          delay:
            stagger > 0 ? staggerDelay(stagger, { startDelay: delay }) : delay,
          ease: [0.22, 1, 0.36, 1],
        });
        controls.then(restore).catch(restore);
      } catch {
        restore();
      }
      watchdog = setTimeout(
        restore,
        (duration + delay + targets.length * stagger) * 1000 + 1200,
      );
    };
    prepare();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            enter();
            if (once) observer.disconnect();
          } else if (!once) {
            controls?.stop();
            prepare();
            completed = false;
          }
        }
      },
      {
        threshold: Math.min(0.5, Math.max(0.01, threshold)),
        rootMargin: "0px 0px -24px 0px",
      },
    );
    observer.observe(node);
    const bounds = node.getBoundingClientRect();
    if (bounds.top < innerHeight * 0.9 && bounds.bottom > 0) {
      enter();
      if (once) observer.disconnect();
    }
    const change = () => {
      if (preference.matches) {
        controls?.stop();
        observer.disconnect();
        restore();
      }
    };
    preference.addEventListener("change", change);
    return () => {
      observer.disconnect();
      controls?.stop();
      clearTimeout(watchdog);
      preference.removeEventListener("change", change);
      restore();
    };
  }, [
    variant,
    direction,
    distance,
    duration,
    delay,
    threshold,
    once,
    stagger,
    pathname,
  ]);
  return (
    <div
      ref={ref}
      className={`motion-reveal ${className}`}
      data-reveal={direction || variant}
      style={
        stagger
          ? ({ "--stagger": `${stagger}s` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div aria-hidden className="scroll-progress" style={{ scaleX }} />
  );
}
export function Parallax({
  children,
  amount = 25,
}: {
  children: React.ReactNode;
  amount?: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  return (
    <motion.div ref={ref} className="parallax" style={{ y }}>
      {children}
    </motion.div>
  );
}
export function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 850);
          node.textContent = Math.round(
            value * (1 - Math.pow(1 - p, 3)),
          ).toLocaleString("en-AU");
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref} aria-label={String(value)}>
      {value.toLocaleString("en-AU")}
    </span>
  );
}
