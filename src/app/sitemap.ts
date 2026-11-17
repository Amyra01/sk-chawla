import type { MetadataRoute } from "next";
import { FALLBACK_SERVICES } from "@/lib/seed-fallback";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/book",
    "/ask-query",
    "/services",
    "/notice-decoder",
    "/health-check",
    "/tools",
    "/industries",
    "/compliance-calendar",
    "/insights",
    "/trust-centre",
    "/card",
    "/privacy",
    "/terms",
    "/refund-policy",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...FALLBACK_SERVICES.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
