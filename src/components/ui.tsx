import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Reveal } from "./motion";
import { services, articles } from "@/lib/data";
export function Button({
  href,
  children,
  secondary = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`button ${secondary ? "secondary" : ""} ${className}`}
    >
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={`section-heading ${center ? "center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
  kind = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  kind?: string;
}) {
  const images: Record<string, { src: string; label: string }> = {
    about: { src: "/images/regular.webp", label: "RELIABLE CLEANING SERVICES" },
    services: {
      src: "/images/lease.webp",
      label: "CLEANING FOR HOMES & WORKPLACES",
    },
    pricing: {
      src: "/images/kitchen.webp",
      label: "TRANSPARENT CLEANING PRICING",
    },
    contact: {
      src: "/images/blog-home.webp",
      label: "SPEAK WITH OUR CLEANING TEAM",
    },
    careers: {
      src: "/images/team.webp",
      label: "JOIN OUR PROFESSIONAL TEAM",
    },
    blog: { src: "/images/airbnb.webp", label: "CLEANING TIPS & GUIDES" },
  };
  const image = images[kind];
  return (
    <section className={`page-hero page-hero--${kind}`}>
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          {eyebrow}
        </div>
        <div className="page-hero-content">
          <Reveal variant="up">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </Reveal>
          {image ? (
            <Reveal variant="image" delay={0.12} className="page-hero-art">
              <Photo src={image.src} alt={image.label.toLowerCase()} priority />
              <span>{image.label}</span>
            </Reveal>
          ) : (
            !["privacy", "terms", "default"].includes(kind) && (
              <Reveal variant="scale" delay={0.15}>
                <div className="page-hero-symbol" aria-hidden>
                  {kind === "faq"
                    ? "?"
                    : kind === "book"
                      ? "01"
                      : kind === "areas"
                        ? "⌖"
                        : "“"}
                </div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 600px",
  unoptimized = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized={unoptimized}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
export function Checks({ items }: { items: string[] }) {
  return (
    <ul className="checks">
      {items.map((x) => (
        <li key={x}>
          <Check size={17} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}
export function ServiceCard({
  service,
  index = 0,
}: {
  service: (typeof services)[number];
  index?: number;
}) {
  return (
    <Reveal delay={(index % 3) * 0.08} className="card service-card">
      <Link href={`/services/${service.slug}`}>
        <Photo src={service.thumbnail} alt={service.name} />
        <div className="card-body">
          <span className="mini-label">{service.category}</span>
          <h3>{service.name}</h3>
          <p>{service.summary}</p>
          <span className="text-link">
            Explore service <ArrowRight size={16} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
export function ArticleCards({
  exclude,
  items = articles,
  className = "",
}: {
  exclude?: string;
  items?: ((typeof articles)[number] & { imageAlt?: string })[];
  className?: string;
} = {}) {
  return (
    <div className={`grid three ${className}`}>
      {items
        .filter((a) => a.slug !== exclude)
        .map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.08} className="card article-card">
            <Link href={`/blog/${a.slug}`}>
              <Photo src={a.image} alt={a.imageAlt || a.title} />
              <div className="card-body">
                <span className="mini-label">
                  {a.category} <span>· {a.read}</span>
                </span>
                <h3>{a.title}</h3>
                <p>{a.intro}</p>
                <span className="text-link">
                  Read cleaning guide <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
    </div>
  );
}
export function CTA() {
  return (
    <section className="container cta-wrap">
      <Reveal variant="scale">
        <div className="cta">
          <Sparkles size={30} />
          <span className="eyebrow">READY FOR A CLEANER SPACE?</span>
          <h2>Ready for a cleaner property, inside and out?</h2>
          <p>
            Tell us what cleaning service you need, and request a personalised
            quote.
          </p>
          <div className="actions">
            <Button href="/book">Book a Clean</Button>
            <Button href="/contact" secondary>
              Get a Free Quote
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
