import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { services } from "@/lib/data";
import { ServicePage } from "@/components/services/service-page";
import { servicePages } from "@/lib/service-pages";

const aliases: Record<string, string> = {
  "regular-house-cleaning": "house-cleaning",
  "deep-cleaning": "property-cleaning",
  "one-off-cleaning": "garden-cleaning",
  "residential-cleaning": "construction-cleaning",
};

export function generateStaticParams() {
  return [
    ...services.map((s) => ({ slug: s.slug })),
    ...Object.keys(aliases).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (aliases[slug]) permanentRedirect(`/services/${aliases[slug]}`);
  const s = services.find((s) => s.slug === slug);
  return s
    ? {
        title: `${s.name} | Professional Cleaning Services`,
        description: servicePages[slug].description,
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
  if (aliases[slug]) permanentRedirect(`/services/${aliases[slug]}`);
  const s = services.find((s) => s.slug === slug);
  if (!s) notFound();

  return <ServicePage service={s} />;
}
