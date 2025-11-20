export type JourneyStepId =
  | "review-info"
  | "will-search"
  | "executors-beneficiaries"
  | "assets-debts"
  | "review-forms"
  | "sign-notarize"
  | "file-court";

export type JourneyStatus = "not_started" | "in_progress" | "done";

export type JourneyEntry = {
  status: JourneyStatus;
  updatedAt: string | null;
};

export type JourneyState = Record<JourneyStepId, JourneyEntry>;

export function createDefaultJourneyState(): JourneyState {
  return journeySteps.reduce((acc, step) => {
    acc[step.id] = { status: "not_started", updatedAt: null };
    return acc;
  }, {} as JourneyState);
}

type StoredJourneyEntry =
  | JourneyStatus
  | {
      status?: JourneyStatus | null;
      updatedAt?: string | null;
    };

export function normalizeJourneyState(value?: unknown): JourneyState {
  const base = createDefaultJourneyState();
  if (!value || typeof value !== "object") {
    return base;
  }

  const record = value as Record<string, StoredJourneyEntry>;
  for (const step of journeySteps) {
    const stored = record[step.id];
    if (!stored) continue;
    if (typeof stored === "string") {
      base[step.id] = { status: stored, updatedAt: null };
      continue;
    }
    const status = stored.status ?? null;
    if (status && (status === "not_started" || status === "in_progress" || status === "done")) {
      base[step.id] = {
        status,
        updatedAt: stored.updatedAt ?? null,
      };
    }
  }
  return base;
}

export function journeyProgressPercent(state: JourneyState) {
  const total = journeySteps.length;
  if (total === 0) return 0;
  const completed = journeySteps.reduce(
    (count, step) => (state[step.id]?.status === "done" ? count + 1 : count),
    0,
  );
  return Math.round((completed / total) * 100);
}

export function setJourneyStateValue(state: JourneyState, id: JourneyStepId, status: JourneyStatus): JourneyState {
  return {
    ...state,
    [id]: {
      status,
      updatedAt: new Date().toISOString(),
    },
  };
}

export type JourneyStepAction = {
  label: string;
  href?: string;
  buildHref?: (context: { matterId?: string | null }) => string | undefined;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
};

export type JourneyStepDefinition = {
  id: JourneyStepId;
  title: string;
  subtitle: string;
  description: string;
  whatYouDo: string[];
  whatWeDo: string[];
  actions: JourneyStepAction[];
  learnMoreHref?: string;
};

export const journeySteps: JourneyStepDefinition[] = [
  {
    id: "review-info",
    title: "Review your basic info",
    subtitle: "Confirm the key facts before any paperwork goes out.",
    description:
      "Start by double-checking the deceased’s details and your own executor contact information. This prevents small typos from turning into court delays later on.",
    whatYouDo: [
      "Confirm the deceased’s legal name, address, and date of death.",
      "Review your mailing address, phone number, and preferred email.",
      "Fill in any missing intake questions so every form stays in sync.",
    ],
    whatWeDo: [
      "Keep the intake answers synced to every PDF and schedule.",
      "Highlight incomplete sections before you move on.",
      "Store the data locally unless you choose to export it.",
    ],
    actions: [
      { label: "Go to Your Info", href: "/portal/info", variant: "primary" },
      { label: "Edit intake", href: "/portal/intake", variant: "secondary" },
    ],
  },
  {
    id: "will-search",
    title: "Will search",
    subtitle: "Order the BC wills notice search and upload proof.",
    description:
      "BC requires a wills notice search before the court reviews the estate. We generate the VSA 532 form for you so you can submit it to Vital Statistics and save the receipt here.",
    whatYouDo: [
      "Download the will-search PDF packet and print it.",
      "Bring the packet (plus ID photocopies) to Service BC or mail it with the fee.",
      "Upload the receipt or confirmation letter once you have it.",
    ],
    whatWeDo: [
      "Pre-fill the VSA 532 request with your intake answers.",
      "Store your uploaded receipt alongside the matter.",
      "Keep the packet ready if you need to resubmit.",
    ],
    actions: [
      { label: "Download packet", href: "/portal/documents", variant: "primary" },
      { label: "Upload receipt", href: "/portal/will-search", variant: "secondary" },
      { label: "Visit BC Vital Statistics", href: "https://justice.gov.bc.ca/cso/esearch/willnotice.do", external: true, variant: "ghost" },
    ],
  },
  {
    id: "executors-beneficiaries",
    title: "Executors and beneficiaries",
    subtitle: "List everyone the court expects to see on the schedules.",
    description:
      "Courts expect a full list of executors and beneficiaries. Use this step to confirm who is acting, who stepped down, and who must receive notice letters.",
    whatYouDo: [
      "Confirm each executor’s name and mailing address.",
      "Add every beneficiary (even if they receive nothing) with an address for notices.",
      "Note minors or alternate payees so we can create the right schedules.",
    ],
    whatWeDo: [
      "Mirror the executor and beneficiary lists into the attachments automatically.",
      "Flag missing addresses or relationships that slow down the court.",
      "Keep all of the notice schedules consistent with your entries.",
    ],
    actions: [
      { label: "Edit executors", href: "/portal/executors", variant: "primary" },
      { label: "Edit beneficiaries", href: "/portal/beneficiaries", variant: "secondary" },
      { label: "View summary", href: "/portal/info", variant: "ghost" },
    ],
  },
  {
    id: "assets-debts",
    title: "Assets and debts",
    subtitle: "Summarize property, accounts, and outstanding debts.",
    description:
      "The court wants a snapshot of estate assets and liabilities. Gather the info now so the affidavits are accurate on the first try.",
    whatYouDo: [
      "List real property, bank accounts, investments, and business interests.",
      "Record mortgages, credit cards, and other outstanding debts.",
      "Add quick notes about foreign assets or special handling.",
    ],
    whatWeDo: [
      "Keep the inventory synced to the asset/liability affidavits.",
      "Provide a single place to track special notes and follow-ups.",
      "Highlight any blanks that could confuse the registrar.",
    ],
    actions: [
      { label: "Update assets & debts", href: "/portal/intake", variant: "primary" },
      { label: "Review summary", href: "/portal/info", variant: "secondary" },
    ],
  },
  {
    id: "review-forms",
    title: "Review and download court forms",
    subtitle: "Preview every form before you sign anything.",
    description:
      "When the data looks right, open each PDF to confirm spelling, dates, registry info, and attachments. Catching issues here saves a second trip to the notary.",
    whatYouDo: [
      "Download each form: P1, P3/P4, P9, P10/P11, and the schedules.",
      "Confirm names, dates, registry location, and addresses.",
      "Leave signature and payment sections blank until signing day.",
    ],
    whatWeDo: [
      "Regenerate every PDF on demand with your latest info.",
      "Offer a one-click Phase 1 packet for quick printing.",
      "Keep the files organized so you can re-download anytime.",
    ],
    actions: [
      { label: "Open Documents", href: "/portal/documents", variant: "primary" },
      {
        label: "Download Phase 1 packet",
        buildHref: ({ matterId }) => (matterId ? `/api/matter/${matterId}/package/phase1/pdf` : undefined),
        variant: "secondary",
      },
    ],
  },
  {
    id: "sign-notarize",
    title: "Sign and notarize",
    subtitle: "Meet a commissioner or notary to swear the affidavits.",
    description:
      "BC probate affidavits must be sworn or affirmed in front of a commissioner. Bring two pieces of ID and only sign when instructed.",
    whatYouDo: [
      "Book a commissioner/notary appointment and bring government ID.",
      "Print the packet, add exhibit tabs, and leave signatures blank.",
      "Sign and initial every spot in front of the commissioner, then scan or upload the signed copies.",
    ],
    whatWeDo: [
      "Provide a ready-to-print packet and exhibit labels.",
      "Remind you which sections stay blank until you are in front of the commissioner.",
      "Store uploaded signed copies alongside your matter.",
    ],
    actions: [
      {
        label: "Download signing packet",
        buildHref: ({ matterId }) => (matterId ? `/api/matter/${matterId}/package/phase1/pdf` : undefined),
        variant: "primary",
      },
      { label: "Read signing tips", href: "/portal/help#signing", variant: "secondary" },
      { label: "Upload signed documents", href: "/portal/will-search", variant: "ghost" },
    ],
  },
  {
    id: "file-court",
    title: "File with the court",
    subtitle: "Deliver the packet and pay the filing fee.",
    description:
      "Once everything is signed, file the packet with the BC Supreme Court registry that matches the deceased’s residence. Keep courier tracking and note any grant numbers or defect letters.",
    whatYouDo: [
      "Assemble the packet in order with tabs and exhibits.",
      "Deliver it in person or send by tracked courier to the right registry.",
      "Record the courier tracking, payment receipt, and later the grant number or defect letter.",
    ],
    whatWeDo: [
      "Provide assembly instructions and filing checklists.",
      "Keep the documents handy in case the registry needs edits.",
      "Remind you of follow-up actions once you mark this as done.",
    ],
    actions: [
      { label: "See filing instructions", href: "/portal/help#filing", variant: "primary" },
      { label: "Review how to assemble", href: "/portal/how-to-assemble", variant: "secondary" },
    ],
  },
];

export function getJourneyStep(id: JourneyStepId) {
  return journeySteps.find((step) => step.id === id);
}

type JourneyStatusLike = JourneyStatus | { status: JourneyStatus };

export function getNextJourneyStep(
  statusMap: Partial<Record<JourneyStepId, JourneyStatusLike>>,
): JourneyStepDefinition | null {
  const entry = journeySteps.find((step) => {
    const current = statusMap[step.id];
    const statusValue = typeof current === "string" ? current : current?.status;
    return statusValue !== "done";
  });
  return entry ?? journeySteps[journeySteps.length - 1] ?? null;
}
