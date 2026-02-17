import type { Data } from "@puckeditor/core";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export const seedData: Record<string, Data> = {
  home: {
    root: { props: {} },
    content: [
      {
        type: "HeroSection",
        props: {
          id: makeId(),
          headline: "Probate, without the lawyer\u2019s bill.",
          subheadline: "BC probate and administration forms prepared by specialists.",
          ctaText: "Get started",
          ctaLink: "/onboard/executor",
          secondaryCtaText: "How it works",
          secondaryCtaLink: "#how-it-works",
          backgroundImage: "/images/Main_Image_Header.png",
          stat1Label: "Starting at $799",
          stat1Sub: "Flexible service tiers",
          stat2Label: "Court Ready in 3 Days",
        },
      },
      {
        type: "ReceiptComparison",
        props: { id: makeId() },
      },
      {
        type: "TimelineSection",
        props: {
          id: makeId(),
          eyebrow: "How It Works",
          headline: "Three steps to your grant",
          steps: JSON.stringify([
            { num: "1", title: "Answer guided questions (15\u201325 min)", description: "Work through executor, deceased, and asset prompts with autosave and inline guidance." },
            { num: "2", title: "We assemble your package", description: "Specialists check for gaps, apply the latest BC forms, and add personalised instructions." },
            { num: "3", title: "You swear, mail, and track", description: "Attend notarisation, sign, and courier everything with the included labels." },
          ]),
        },
      },
      {
        type: "TestimonialsSection",
        props: {
          id: makeId(),
          eyebrow: "Testimonials",
          headline: "What executors say",
          items: JSON.stringify([
            { quote: "ProbateDesk made a stressful process manageable. Clear documents, fast turnaround.", name: "A. Thompson", role: "Vancouver executor" },
            { quote: "I was dreading probate. ProbateDesk made it straightforward.", name: "M. Chen", role: "Surrey executor" },
          ]),
        },
      },
      {
        type: "NotLawFirmSection",
        props: {
          id: makeId(),
          headlineLine1: "We\u2019re not a law firm.",
          headlineLine2: "And that\u2019s the point.",
          body: "No billable hours. No legal jargon. No $5,000 surprise invoices. Just specialists who know BC probate inside and out, preparing your documents for a fixed, transparent price.",
          ctaText: "Get Started Now",
          ctaLink: "/onboard/executor",
          subCtaText: "Join hundreds of BC executors who\u2019ve simplified their probate journey",
          disclaimer: "",
        },
      },
      {
        type: "FAQSection",
        props: {
          id: makeId(),
          eyebrow: "Questions",
          headline: "Answers executors ask before starting",
          description: "Visit the full FAQs for detailed policies, timelines, and document lists tailored to BC registries.",
          items: JSON.stringify([
            { question: "Who is ProbateDesk for?", answer: "Executors handling straightforward BC estates with a valid will, Canadian assets, and no ongoing disputes." },
            { question: "How quickly will documents arrive?", answer: "Our target is 3 days after intake completion. Complex estates may take longer \u2014 we prioritize accuracy over speed." },
            { question: "Is everything stored in Canada?", answer: "Yes. Intake data and documents are encrypted in transit and at rest on Canadian infrastructure." },
            { question: "What about court probate fees?", answer: "Court fees are set by the BC government and paid directly to the court when you file. These are separate from our service fees." },
          ]),
          showViewAll: true,
          viewAllLink: "/faqs",
          viewAllText: "View all FAQs",
        },
      },
    ],
  },

  pricing: {
    root: { props: {} },
    content: [
      {
        type: "TextBlock",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "Transparent pricing for BC probate",
          body: "Choose the service level that fits your needs. All tiers include secure Canadian data hosting, the latest BC Supreme Court forms, and guided intake. No hidden fees.",
          variant: "card",
          align: "center",
        },
      },
      {
        type: "PricingTiers",
        props: {
          id: makeId(),
          eyebrow: "Three service tiers",
          headline: "Pick what matches your comfort level",
          tiers: JSON.stringify([
            {
              name: "Basic", price: 799, description: "For tech-savvy executors with simple estates",
              recommended: false, cta: "Get started", href: "/create-account",
              features: [
                { name: "Online intake questionnaire", included: true },
                { name: "Automated probate form generation", included: true },
                { name: "PDF filing instructions", included: true },
                { name: "Email support (48-hour response)", included: true },
                { name: "Human document review", included: false },
                { name: "Phone/video support", included: false },
                { name: "Requisition assistance", included: false },
                { name: "Post-grant guidance", included: false },
              ],
            },
            {
              name: "Standard", price: 1499, description: "Most executors choose this for peace of mind",
              recommended: true, cta: "Get started", href: "/create-account",
              features: [
                { name: "Everything in Basic", included: true },
                { name: "Human review of all documents", included: true },
                { name: "Phone/video support (scheduled calls)", included: true },
                { name: "Free notarization in Vancouver", included: true, note: "or $50 credit elsewhere" },
                { name: "Post-grant checklist and templates", included: true },
                { name: "One requisition response included", included: true },
                { name: "Concierge support services", included: true },
                { name: "Priority same-day response", included: false },
              ],
            },
            {
              name: "Premium", price: 2499, description: "White-glove service for complex estates",
              recommended: false, cta: "Get started", href: "/create-account",
              features: [
                { name: "Everything in Standard", included: true },
                { name: "Priority support (same-day response)", included: true },
                { name: "Dedicated case coordinator", included: true },
                { name: "Unlimited requisition assistance", included: true },
                { name: "Post-grant administration guidance", included: true },
                { name: "Tax filing reminders and CRA clearance guidance", included: true },
                { name: "Distribution templates and calculations", included: true },
                { name: "Comparable to lawyer at discounted price", included: true },
              ],
            },
          ]),
        },
      },
      {
        type: "CTASection",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "Ready to get started?",
          description: "Begin your intake now. You\u2019ll select your service tier and any add-ons during the process. All pricing is transparent with no surprises.",
          ctaText: "Start intake",
          ctaLink: "/create-account",
          secondaryCtaText: "How it works",
          secondaryCtaLink: "/how-it-works",
          variant: "light",
        },
      },
    ],
  },

  faqs: {
    root: { props: {} },
    content: [
      {
        type: "TextBlock",
        props: {
          id: makeId(),
          eyebrow: "FAQs",
          headline: "Probate questions, answered plainly",
          body: "If you don\u2019t see your question below, email hello@probatedesk.com and we\u2019ll respond within one business day.",
          variant: "default",
          align: "center",
        },
      },
      {
        type: "FAQSection",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "",
          description: "",
          items: JSON.stringify([
            { question: "Who is ProbateDesk built for?", answer: "Executors of straightforward BC estates with a valid will, Canadian assets, and no active disputes." },
            { question: "How much does ProbateDesk cost?", answer: "We offer three service tiers: Basic ($799), Standard ($1,499), and Premium ($2,499). Choose based on the level of support you need." },
            { question: "What\u2019s the difference between the tiers?", answer: "Basic includes automated form generation and email support. Standard adds human document review, phone support, free notarization in Vancouver, and one requisition response. Premium includes everything plus priority same-day support and a dedicated coordinator." },
            { question: "Can I upgrade my tier later?", answer: "Yes. If you start with Basic or Standard and need additional support, contact us and we\u2019ll adjust your service level. You\u2019ll only pay the difference." },
            { question: "Do I still need to go to court?", answer: "You submit the application yourself. We prepare forms and instructions so your filing is organised." },
            { question: "How secure is my information?", answer: "Intake responses and documents are encrypted in transit and at rest, hosted in Canada, and never sold." },
            { question: "How quickly will I receive documents?", answer: "Standard and Basic tiers: 5-7 business days. Premium tier: 3-5 business days priority. Add Rush Processing ($299) for 48-hour delivery." },
            { question: "What if I need legal advice?", answer: "ProbateDesk provides document preparation and general information. For legal advice, contact independent counsel." },
            { question: "Is my data stored in Canada?", answer: "Yes\u2014Canadian cloud infrastructure." },
            { question: "How long does the overall process take?", answer: "Intake takes ~15\u201325 minutes. Wills Notice search ~20 business days. Court processing varies by registry (weeks\u2013months)." },
            { question: "What\u2019s not included in the service fees?", answer: "Court filing fees, postage/courier for notices, and BC probate fees are paid separately directly to the court." },
            { question: "Can multiple executors use ProbateDesk?", answer: "V1 supports a single executor. Multi-executor support is planned." },
          ]),
          showViewAll: false,
          viewAllLink: "",
          viewAllText: "",
        },
      },
    ],
  },

  "how-it-works": {
    root: { props: {} },
    content: [
      {
        type: "TextBlock",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "How ProbateDesk works",
          body: "Guided intake \u2192 specialist assembly \u2192 you file at the registry. Clear steps, saved progress, and Canadian hosting every step of the way.",
          variant: "card",
          align: "left",
        },
      },
      {
        type: "TimelineSection",
        props: {
          id: makeId(),
          eyebrow: "Three core stages",
          headline: "",
          steps: JSON.stringify([
            { num: "1", title: "Answer guided questions (15\u201325 min)", description: "Work through executor, deceased, and asset prompts with autosave and inline guidance. Pause anytime." },
            { num: "2", title: "We assemble your package", description: "Specialists check for gaps, apply the latest BC forms, and add personalised instructions with signing tabs." },
            { num: "3", title: "You swear, mail, and track", description: "Attend notarisation, sign, and courier everything with the included labels. Track responses and defects." },
          ]),
        },
      },
      {
        type: "FeatureCards",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "",
          cards: JSON.stringify([
            { title: "What you\u2019ll need", description: "Gather these items to breeze through intake.", bullets: ["Government-issued ID for the executor", "Original will + any codicils", "Death certificate copy", "Snapshot of assets & liabilities", "Beneficiary names and contact info"] },
            { title: "Service tiers", description: "Choose from Basic ($799), Standard ($1,499), or Premium ($2,499) based on your needs.", bullets: ["Guided intake with autosave + reminders", "BC court forms & notices", "PDF filing instructions", "Secure Canadian data hosting", "Flexible service tiers ($799 to $2,499)"] },
          ]),
          columns: "2",
        },
      },
      {
        type: "CTASection",
        props: {
          id: makeId(),
          eyebrow: "Ready to start?",
          headline: "Begin your intake in minutes",
          description: "We\u2019ll guide you through every field, confirm fit, and assemble your filing-ready package with Canadian-hosted security.",
          ctaText: "Start now",
          ctaLink: "/create-account",
          secondaryCtaText: "Talk to a specialist",
          secondaryCtaLink: "/contact",
          variant: "light",
        },
      },
    ],
  },

  "get-started": {
    root: { props: {} },
    content: [
      {
        type: "HeroSection",
        props: {
          id: makeId(),
          headline: "Probate, without the lawyer\u2019s bill.",
          subheadline: "Answer a few questions. We handle the paperwork.",
          ctaText: "Get Started",
          ctaLink: "/create-account?ref=landing",
          secondaryCtaText: "",
          secondaryCtaLink: "",
          backgroundImage: "/images/Main_Image_Header.png",
          stat1Label: "Starting at $799",
          stat1Sub: "Flexible service tiers",
          stat2Label: "Court Ready in 3 Days",
        },
      },
      {
        type: "TimelineSection",
        props: {
          id: makeId(),
          eyebrow: "How It Works",
          headline: "Three steps to your grant",
          steps: JSON.stringify([
            { num: "1", title: "Answer a few questions", description: "We check if your estate qualifies. Takes about 2 minutes." },
            { num: "2", title: "We prepare your forms", description: "Your full BC probate filing package, assembled and reviewed." },
            { num: "3", title: "You file with the court", description: "We walk you through signing, filing, and what comes after." },
          ]),
        },
      },
      {
        type: "FAQSection",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "",
          description: "",
          items: JSON.stringify([
            { question: "Is this a law firm?", answer: "No. ProbateDesk is a document preparation service for BC probate. We don\u2019t provide legal advice. For complex or contested estates, we\u2019ll tell you upfront and suggest you speak with a lawyer." },
            { question: "What if my estate doesn\u2019t qualify?", answer: "Our intake checks that in about 2 minutes. If it\u2019s not a fit, we\u2019ll explain why and point you in the right direction. No charge." },
            { question: "How long does this take?", answer: "Most clients finish intake in under 25 minutes. Your document package is typically ready within a few business days." },
          ]),
          showViewAll: false,
          viewAllLink: "",
          viewAllText: "",
        },
      },
      {
        type: "NotLawFirmSection",
        props: {
          id: makeId(),
          headlineLine1: "We\u2019re not a law firm.",
          headlineLine2: "And that\u2019s the point.",
          body: "No billable hours. No legal jargon. No $5,000 surprise invoices. Just specialists who know BC probate inside and out, preparing your documents for a fixed, transparent price.",
          ctaText: "Check If You Qualify",
          ctaLink: "/create-account?ref=landing",
          subCtaText: "No payment required to check eligibility.",
          disclaimer: "ProbateDesk is a document preparation service operated under Court Line Law. We are not a law firm and do not provide legal advice.",
        },
      },
    ],
  },

  contact: {
    root: { props: {} },
    content: [
      {
        type: "ContactSection",
        props: {
          id: makeId(),
          headline: "We\u2019re here to help executors stay calm",
          description: "Reach out if you have questions about eligibility, timelines, or how ProbateDesk fits your estate. We reply within one business day.",
          emailLabel: "Prefer email?",
          emailAddress: "hello@probatedesk.com",
          emailHint: "and include the estate name and where you\u2019ll be filing.",
        },
      },
    ],
  },

  testimonials: {
    root: { props: {} },
    content: [
      {
        type: "TextBlock",
        props: {
          id: makeId(),
          eyebrow: "Testimonials",
          headline: "Testimonials",
          body: "What past clients say about working with us. These are anonymised examples that reflect common experiences and do not replace tailored legal advice.\n\nProbate can feel opaque, so we focus on steady communication, complete document packages, and practical next steps.",
          variant: "default",
          align: "left",
        },
      },
      {
        type: "TestimonialsSection",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "",
          items: JSON.stringify([
            { quote: "ProbateDesk made a stressful process manageable. Clear documents, fast turnaround.", name: "A. Thompson", role: "Vancouver executor" },
            { quote: "I was dreading probate. ProbateDesk made it straightforward.", name: "M. Chen", role: "Surrey executor" },
            { quote: "The team was responsive, the documents were thorough, and the price was fair.", name: "S. Patel", role: "Burnaby executor" },
          ]),
        },
      },
    ],
  },

  legal: {
    root: { props: {} },
    content: [
      {
        type: "LegalTabs",
        props: {
          id: makeId(),
          headline: "Terms, privacy, and disclaimer",
          description: "Transparency matters. Review how ProbateDesk works, how we handle your information, and important disclaimers.",
          sections: JSON.stringify([
            {
              id: "terms", label: "Terms",
              body: [
                "ProbateDesk provides technology-enabled probate document preparation for British Columbia executors. By using this service you authorise us to collect the information required to generate filing-ready documents.",
                "You remain responsible for reviewing the materials, ensuring accuracy, signing, filing, and complying with the Supreme Court of British Columbia.",
                "Fees are fixed once scope is confirmed. We may decline or pause engagements that fall outside our process or introduce conflicts of interest.",
              ],
            },
            {
              id: "privacy", label: "Privacy",
              body: [
                "We collect only the personal information needed to deliver intake, drafting, and support. Data is encrypted in transit and at rest on Canadian infrastructure.",
                "When you sign in with Google or Microsoft, we collect your name, email address, and profile information to create and authenticate your account. We do not access any other data from your Google or Microsoft account.",
                "Access is limited to team members involved in preparing your documents. Files remain available in your secure vault for twelve months unless you request deletion sooner.",
                "Contact privacy@probatedesk.com to request access, correction, or deletion of your information.",
              ],
            },
            {
              id: "disclaimer", label: "Disclaimer",
              body: [
                "ProbateDesk provides document preparation support and general information. We do not provide legal advice or representation. Executors remain self-represented.",
                "Court rules and requirements may change; you are responsible for verifying current procedures with the Supreme Court of British Columbia.",
                "If your matter becomes complex or contested, we encourage you to seek independent legal counsel.",
              ],
            },
          ]),
          disclaimer: "ProbateDesk provides document preparation support and general information. We do not provide legal advice or representation. Executors remain self-represented.",
        },
      },
    ],
  },

  info: {
    root: { props: {} },
    content: [
      {
        type: "TextBlock",
        props: {
          id: makeId(),
          eyebrow: "Info Center",
          headline: "BC Probate Help",
          body: "Everything you need to understand probate in British Columbia. Clear guides, quick answers, and practical information for executors handling an estate.",
          variant: "default",
          align: "left",
        },
      },
      {
        type: "CTASection",
        props: {
          id: makeId(),
          eyebrow: "",
          headline: "Ready to get started?",
          description: "ProbateDesk prepares all your BC probate forms starting at $799, with flexible service tiers.",
          ctaText: "Start intake",
          ctaLink: "/create-account",
          secondaryCtaText: "See how it works",
          secondaryCtaLink: "/how-it-works",
          variant: "brand",
        },
      },
    ],
  },
};
