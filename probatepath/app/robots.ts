import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/portal/", "/ops/", "/intake/", "/login", "/create-account"],
      },
    ],
    sitemap: "https://probatedesk.ca/sitemap.xml",
  };
}
