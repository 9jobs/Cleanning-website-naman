import type { Metadata } from "next";
import { ServicesOverview } from "@/components/services/service-page";

export const metadata: Metadata = {
  title: "Cleaning Services",
  description:
    "Explore Thrive4 House, Deep, One-Off, Property, Construction, workplace and specialist cleaning services. Find the right scope for your property.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <ServicesOverview />;
}
