import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/data";
import { Button, Photo } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { ServiceCompletion } from "@/components/completion-sections";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  return s
    ? {
        title: `${s.name} | Professional Cleaning Services`,
        description: `${s.description} ${s.benefit}`,
        alternates: { canonical: `/services/${slug}` },
      }
    : {};
}

export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  if (!s) notFound();

  return (
    <div
      className={`inner-site inner-site--detail inner-site--${s.category.toLowerCase()}`}
    >
      <section className="service-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services">Services</Link>
            <span>/</span>
            {s.name}
          </div>
          <div className="split">
            <Reveal variant="right">
              <span className="eyebrow">PROFESSIONAL CLEANING SERVICE</span>
              <h1>{s.name}</h1>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--color-navy, #1e293b)",
                  marginBottom: "0.75rem",
                }}
              >
                {s.intro}
              </p>
              <p>{s.description}</p>
              <div className="actions">
                <Button href={`/book?service=${s.slug}`}>Book a Clean</Button>
                <Button href={`/pricing?service=${s.slug}`} secondary>
                  Get a Free Quote
                </Button>
              </div>
            </Reveal>
            <Reveal variant="image">
              <Photo src={s.image} alt={s.name} priority />
            </Reveal>
          </div>
        </div>
      </section>

      <ServiceCompletion service={s} />
    </div>
  );
}
