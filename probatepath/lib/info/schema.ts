export function articleSchema({
  title, description, datePublished, dateModified, url
}: {
  title: string; description: string; datePublished: string; dateModified: string; url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified,
    url,
    author: { "@type": "Organization", name: "ProbatePath", url: "https://probatepath.ca" },
    publisher: {
      "@type": "Organization",
      name: "ProbatePath",
      logo: { "@type": "ImageObject", url: "https://probatepath.ca/logo.png" }
    }
  };
}

export function localBusinessSchema({
  name, street, city, postalCode, phone, hours, lat, lng
}: {
  name: string; street: string; city: string; postalCode: string;
  phone: string; hours: string; lat: number; lng: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentOffice",
    name,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: city,
      addressRegion: "BC",
      postalCode,
      addressCountry: "CA"
    },
    telephone: phone,
    openingHours: hours,
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng }
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}
