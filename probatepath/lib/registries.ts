/**
 * BC Supreme Court Registry Locations
 * Used for courthouse selection in probate filing
 */

export interface Registry {
  id: string;
  name: string;
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  hours: string;
  // List of cities that should default to this registry
  servicesCities: string[];
}

export const BC_REGISTRIES: Registry[] = [
  {
    id: "vancouver",
    name: "Vancouver",
    fullName: "Vancouver Law Courts",
    address: "800 Smithe Street",
    city: "Vancouver",
    postalCode: "V6Z 2E1",
    phone: "604-660-2847",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "vancouver",
      "burnaby",
      "richmond",
      "new westminster",
      "north vancouver",
      "west vancouver",
      "coquitlam",
      "port coquitlam",
      "port moody",
      "delta",
      "surrey", // partially
      "white rock",
      "langley",
      "maple ridge",
      "pitt meadows",
    ],
  },
  {
    id: "victoria",
    name: "Victoria",
    fullName: "Victoria Law Courts",
    address: "850 Burdett Avenue",
    city: "Victoria",
    postalCode: "V8W 1B4",
    phone: "250-356-1478",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "victoria",
      "saanich",
      "oak bay",
      "esquimalt",
      "sidney",
      "sooke",
      "langford",
      "colwood",
      "metchosin",
      "central saanich",
      "north saanich",
    ],
  },
  {
    id: "kelowna",
    name: "Kelowna",
    fullName: "Kelowna Law Courts",
    address: "1355 Water Street",
    city: "Kelowna",
    postalCode: "V1Y 9R3",
    phone: "250-470-6900",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "kelowna",
      "west kelowna",
      "peachland",
      "penticton",
      "vernon",
      "summerland",
      "lake country",
    ],
  },
  {
    id: "kamloops",
    name: "Kamloops",
    fullName: "Kamloops Law Courts",
    address: "455 Columbia Street",
    city: "Kamloops",
    postalCode: "V2C 6K4",
    phone: "250-828-4344",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: ["kamloops", "merritt", "chase", "clearwater", "barriere"],
  },
  {
    id: "nanaimo",
    name: "Nanaimo",
    fullName: "Nanaimo Law Courts",
    address: "35 Front Street",
    city: "Nanaimo",
    postalCode: "V9R 5J1",
    phone: "250-741-5860",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "nanaimo",
      "parksville",
      "qualicum beach",
      "ladysmith",
      "port alberni",
      "duncan",
      "courtenay",
      "comox",
      "campbell river",
    ],
  },
  {
    id: "prince-george",
    name: "Prince George",
    fullName: "Prince George Law Courts",
    address: "250 George Street",
    city: "Prince George",
    postalCode: "V2L 5S2",
    phone: "250-614-2700",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "prince george",
      "quesnel",
      "fort st. james",
      "vanderhoof",
      "mackenzie",
    ],
  },
  {
    id: "chilliwack",
    name: "Chilliwack",
    fullName: "Chilliwack Law Courts",
    address: "46085 Yale Road",
    city: "Chilliwack",
    postalCode: "V2P 2L8",
    phone: "604-795-8350",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "chilliwack",
      "abbotsford",
      "mission",
      "agassiz",
      "harrison hot springs",
      "hope",
    ],
  },
  {
    id: "new-westminster",
    name: "New Westminster",
    fullName: "New Westminster Law Courts",
    address: "651 Carnarvon Street",
    city: "New Westminster",
    postalCode: "V3M 1C9",
    phone: "604-660-8551",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      // Some cases may prefer New West over Vancouver
      // Generally overlaps with Vancouver registry
    ],
  },
  {
    id: "cranbrook",
    name: "Cranbrook",
    fullName: "Cranbrook Law Courts",
    address: "102 11th Avenue South",
    city: "Cranbrook",
    postalCode: "V1C 2P3",
    phone: "250-426-1234",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "cranbrook",
      "kimberley",
      "invermere",
      "fernie",
      "sparwood",
      "golden",
    ],
  },
  {
    id: "nelson",
    name: "Nelson",
    fullName: "Nelson Law Courts",
    address: "320 Ward Street",
    city: "Nelson",
    postalCode: "V1L 1S6",
    phone: "250-354-6165",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "nelson",
      "castlegar",
      "trail",
      "rossland",
      "salmo",
      "creston",
    ],
  },
  {
    id: "terrace",
    name: "Terrace",
    fullName: "Terrace Law Courts",
    address: "3408 Kalum Street",
    city: "Terrace",
    postalCode: "V8G 2N6",
    phone: "250-638-2111",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: ["terrace", "kitimat", "prince rupert", "smithers"],
  },
  {
    id: "dawson-creek",
    name: "Dawson Creek",
    fullName: "Dawson Creek Law Courts",
    address: "1201 103rd Avenue",
    city: "Dawson Creek",
    postalCode: "V1G 4J2",
    phone: "250-784-2278",
    hours: "Mon-Fri 8:30am - 4:00pm",
    servicesCities: [
      "dawson creek",
      "fort st. john",
      "chetwynd",
      "tumbler ridge",
      "fort nelson",
    ],
  },
];

/**
 * Find the suggested registry based on a city name
 * Returns the registry that lists the city in its servicesCities array
 * Defaults to Vancouver if no match found
 */
export function suggestRegistry(city: string | undefined | null): Registry {
  if (!city) {
    return BC_REGISTRIES[0]; // Vancouver as default
  }

  const normalizedCity = city.toLowerCase().trim();

  // Find registry that services this city
  const match = BC_REGISTRIES.find((registry) =>
    registry.servicesCities.some(
      (servicedCity) =>
        servicedCity.toLowerCase() === normalizedCity ||
        normalizedCity.includes(servicedCity.toLowerCase()) ||
        servicedCity.toLowerCase().includes(normalizedCity)
    )
  );

  return match || BC_REGISTRIES[0]; // Default to Vancouver
}

/**
 * Get a registry by its ID
 */
export function getRegistryById(id: string): Registry | undefined {
  return BC_REGISTRIES.find((r) => r.id === id);
}

/**
 * Format a registry for display
 */
export function formatRegistryDisplay(registry: Registry): string {
  return `${registry.fullName}, ${registry.address}, ${registry.city} ${registry.postalCode}`;
}
