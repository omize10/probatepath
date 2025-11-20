export type PortalIntakeDraft = {
  welcome: {
    email: string;
    consent: boolean;
  };
  executor: {
    fullName: string;
    phone: string;
    city: string;
    relation: string;
  };
  deceased: {
    fullName: string;
    dateOfDeath: string;
    city: string;
    province: string;
    hadWill: "yes" | "no";
  };
  willSearch: {
    searchAreas: string;
    mailingPreference: string;
    packetPrepared: boolean;
  };
  notices: {
    recipients: string;
    deliveryMethod: string;
    mailed: boolean;
  };
  review: {
    confirmed: boolean;
  };
};

export type PortalDraft = {
  progress: number;
  lastSaved: string | null;
  intake: PortalIntakeDraft;
};

export const defaultPortalDraft: PortalDraft = {
  progress: 0,
  lastSaved: null,
  intake: {
    welcome: {
      email: "",
      consent: false,
    },
    executor: {
      fullName: "",
      phone: "",
      city: "",
      relation: "spouse",
    },
    deceased: {
      fullName: "",
      dateOfDeath: "",
      city: "",
      province: "British Columbia",
      hadWill: "yes",
    },
    willSearch: {
      searchAreas: "",
      mailingPreference: "service-bc",
      packetPrepared: false,
    },
    notices: {
      recipients: "",
      deliveryMethod: "email",
      mailed: false,
    },
    review: {
      confirmed: false,
    },
  },
};

export type PortalChecklistDefinition = {
  id: "will-search" | "notices" | "assemble" | "commission" | "court-tracking";
  title: string;
  description: string;
  learnMoreHref: string;
  route: string;
  media: {
    image: string;
    alt: string;
    caption: string;
    tips: string[];
  };
};

export const portalChecklistItems: PortalChecklistDefinition[] = [
  {
    id: "will-search",
    title: "Will search",
    description: "Confirm the wills registry search is sent or documented if the original will is on hand.",
    learnMoreHref: "https://justice.gov.bc.ca/cso/esearch/willnotice.do",
    route: "/portal/intake",
    media: {
      image: "/portal/willsearch-1.jpg",
      alt: "Wills registry search prep",
      caption: "Wills registry",
      tips: [
        "Use the registry request template in Documents",
        "Include executor ID photocopies",
        "Mail with tracking or drop at Service BC",
      ],
    },
  },
  {
    id: "notices",
    title: "Notices mailed",
    description: "Send section 121 notices and keep proof before filing.",
    learnMoreHref: "https://www2.gov.bc.ca/gov/content/justice/courthouse-services/wills-estates",
    route: "/portal/process",
    media: {
      image: "/portal/notices-1.jpg",
      alt: "Notice envelopes prepared",
      caption: "Mail merge",
      tips: [
        "Send to all beneficiaries and intestate heirs",
        "Record the date and delivery method",
        "Upload scans for your records",
      ],
    },
  },
  {
    id: "assemble",
    title: "Assemble packet",
    description: "Print, tab, and stage every form before meeting the commissioner.",
    learnMoreHref: "https://probatepath.ca/how-it-works",
    route: "/portal/how-to-assemble",
    media: {
      image: "/portal/assemble-1.jpg",
      alt: "Stack of BC probate forms",
      caption: "Print order",
      tips: [
        "Keep P1 and P3 on top",
        "Clip affidavits separately",
        "Double-check exhibit labels",
      ],
    },
  },
  {
    id: "commission",
    title: "Commission & file",
    description: "Meet a commissioner or notary, then courier the package to the registry.",
    learnMoreHref: "https://opendoorlaw.ca",
    route: "/portal/how-to-assemble",
    media: {
      image: "/portal/signing-1.jpg",
      alt: "Executor signing affidavits",
      caption: "Signing tips",
      tips: [
        "Bring two pieces of ID",
        "Only sign in front of the commissioner",
        "Initial every exhibit page",
      ],
    },
  },
  {
    id: "court-tracking",
    title: "Track & respond",
    description: "Monitor courier delivery and log any court correspondence.",
    learnMoreHref: "https://cockpit.vcourts.bc.ca",
    route: "/portal/process",
    media: {
      image: "/portal/registry-1.jpg",
      alt: "Map showing BC registry",
      caption: "Registry status",
      tips: [
        "Call the registry 10 days after filing",
        "Upload defect letters for quick triage",
        "Note grant number once issued",
      ],
    },
  },
];

export type PortalDocumentRequirement = {
  type: "intake" | "checklist";
  id: string;
  label: string;
};

export type PortalDocumentTemplate = {
  id: string;
  title: string;
  description: string;
  html: string;
  requirements?: PortalDocumentRequirement[];
};

const docIntro = `<section style="font-family: 'Inter', Arial, sans-serif; color:#111827; line-height:1.6;">
  <header style="margin-bottom: 24px;">
    <p style="font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:#475569;">ProbatePath</p>
    <h1 style="font-size:28px; color:#0f172a;">Filing-ready package preview</h1>
    <p style="color:#475569;">Generated locally — keep this for your executor records.</p>
  </header>`;

export const portalDocuments: PortalDocumentTemplate[] = [
  {
    id: "cover-letter",
    title: "Cover letter",
    description: "Custom BC registry letter summarising executors, filing fees, and enclosures.",
    html: `${docIntro}
      <article>
        <p>Supreme Court of British Columbia</p>
        <p>Probate Registry</p>
        <p>Re: Estate of ____________________</p>
        <p>We enclose the filing-ready package prepared through ProbatePath's document preparation workflow. The executor remains self-represented and is responsible for court fees.</p>
        <ul>
          <li>Forms P1, P3/P4, P9, P10/P11</li>
          <li>Section 121 notices + proof of service</li>
          <li>Original will and supporting exhibits</li>
        </ul>
        <p>Please contact the executor directly if further information is required.</p>
      </article>
    </section>`,
    requirements: [
      { type: "intake", id: "executor", label: "Enter executor details" },
      { type: "intake", id: "deceased", label: "Enter deceased information" },
    ],
  },
  {
    id: "assemble-checklist",
    title: "Assemble checklist",
    description: "Print checklist showing the exact stacking order and attachment callouts.",
    html: `${docIntro}
      <h2>Print & stack</h2>
      <ol>
        <li>P1 + P3/P4 (clip together)</li>
        <li>P9 + P10/P11 with exhibits</li>
        <li>Notices bundle, proof of service, fee affidavit</li>
      </ol>
      <p>Flag blue tabs for signatures and yellow for exhibits. Use the assembly video inside the portal for reference.</p>
    </section>`,
    requirements: [{ type: "checklist", id: "will-search", label: "Complete will search" }],
  },
  {
    id: "will-search-request",
    title: "Will search request",
    description: "Registry-ready letter plus mailing instructions.",
    html: `${docIntro}
      <p>Re: Wills Registry search request</p>
      <p>Please accept the enclosed Form P18, executor ID copies, and payment receipt. The executor confirms the search covers the entire Province of British Columbia.</p>
      <p>Mail to: Vital Statistics Agency, Attention Wills Registry.</p>
    </section>`,
    requirements: [{ type: "intake", id: "willSearch", label: "Finish will search step" }],
  },
  {
    id: "notices-bundle",
    title: "Notices bundle",
    description: "Combined notices with labels for each interested party.",
    html: `${docIntro}
      <p>This bundle includes templates for all persons entitled to notice under s.121 of the Wills, Estates and Succession Act.</p>
      <p>Each notice contains:</p>
      <ul>
        <li>Executor contact information</li>
        <li>Registry details</li>
        <li>Checklist of enclosures</li>
      </ul>
    </section>`,
    requirements: [{ type: "checklist", id: "notices", label: "Log notice mailing" }],
  },
  {
    id: "filing-checklist",
    title: "Filing checklist",
    description: "Court-ready review list covering signatures, exhibits, and fee payments.",
    html: `${docIntro}
      <ol>
        <li>Original will + codicils attached</li>
        <li>Affidavits commissioned and initialled</li>
        <li>Section 121 notices with proof</li>
        <li>Certified cheque for filing fees</li>
      </ol>
      <p>Bring this checklist to the commissioner and keep a copy for the registry.</p>
    </section>`,
    requirements: [{ type: "checklist", id: "assemble", label: "Mark assemble complete" }],
  },
];

export type AssembleSection = {
  id: string;
  title: string;
  description: string;
  image: string;
  highlights: string[];
};

export const assembleSections: AssembleSection[] = [
  {
    id: "print-order",
    title: "Print in this exact order",
    description: "Use thick paper for affidavits and keep each exhibit clipped separately before stapling.",
    image: "/portal/assemble-2.jpg",
    highlights: ["P1 + P3/P4", "P9 with exhibits", "Notices bundle", "Fee affidavit"],
  },
  {
    id: "signatures",
    title: "Sign here & here",
    description: "Only sign when the commissioner instructs you — tabs show every signature and initial.",
    image: "/portal/signing-1.jpg",
    highlights: ["Affidavit of executor", "Exhibit stamps", "Oaths & jurats"],
  },
  {
    id: "attachments",
    title: "Add these attachments",
    description: "Keep originals in a clear folder; add copies for the registry if they request duplicates.",
    image: "/portal/trust-1.jpg",
    highlights: ["Death certificate", "Executor ID", "Original will", "Any codicils"],
  },
  {
    id: "registry",
    title: "Where to go",
    description: "Couriers can deliver to any Supreme Court registry. Vancouver and Victoria process the majority of BC probate filings.",
    image: "/portal/registry-1.jpg",
    highlights: ["Confirm hours before visiting", "Bring photo ID", "Request stamped copy"],
  },
  {
    id: "courier",
    title: "Mail or courier",
    description: "Use a tracked service. Keep the tracking number with your portal notes to follow up within 10 days.",
    image: "/portal/map-1.jpg",
    highlights: ["Courier label", "Insurance optional", "Signature required"],
  },
];

export const printOrder = [
  { id: "cover-letter", title: "Cover letter", note: "Use plain paper" },
  { id: "assemble-checklist", title: "Assemble checklist", note: "Keep on top" },
  { id: "will-search-request", title: "Will search request", note: "Attach ID copies" },
  { id: "notices-bundle", title: "Notices bundle", note: "Group by recipient" },
  { id: "filing-checklist", title: "Filing checklist", note: "Bring to commissioner" },
];
