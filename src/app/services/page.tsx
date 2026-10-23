import type { Metadata } from "next";
import { ServicesOverview } from "@/components/services/service-page";

export const metadata: Metadata = {
  title: "Residential Cleaning Services",
  description:
    "Explore Regular House Cleaning, Apartment Cleaning, moving-related cleaning, residential property care and short-stay cleaning from Thrive4.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <ServicesOverview />;
}
