import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://probatedesk.com";
  const now = new Date().toISOString();

  return [
    // Core pages
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/faqs`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/testimonials`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },

    // Info Center
    { url: `${baseUrl}/info`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // Tools / Calculators
    { url: `${baseUrl}/info/calculators/probate-fees`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },

    // Guides
    { url: `${baseUrl}/info/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/bc-probate-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${baseUrl}/info/guides/what-is-probate`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/when-do-you-need-probate`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/probate-timeline`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/probate-fees-costs`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/info/guides/bc-probate-forms`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/executor-duties`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/grant-types`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/info/guides/probate-without-will`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/guides/after-the-grant`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Quick Answers
    { url: `${baseUrl}/info/answers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/info/answers/how-long-does-probate-take`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/info/answers/do-i-need-probate-for-house`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/info/answers/bank-accounts-before-probate`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/info/answers/what-if-no-original-will`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/info/answers/first-30-days-executor`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/info/answers/probate-vs-lawyer-costs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Registry Locations
    { url: `${baseUrl}/info/registries`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/info/registries/vancouver`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/info/registries/victoria`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/info/registries/surrey`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/info/registries/kelowna`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
