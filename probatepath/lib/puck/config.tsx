import type { Config } from "@puckeditor/core";

import { heroSectionConfig } from "./components/HeroSection";
import { ctaSectionConfig } from "./components/CTASection";
import { faqSectionConfig } from "./components/FAQSection";
import { textBlockConfig } from "./components/TextBlock";
import { featureCardsConfig } from "./components/FeatureCards";
import { notLawFirmSectionConfig } from "./components/NotLawFirmSection";
import { testimonialsSectionConfig } from "./components/TestimonialsSection";
import { timelineSectionConfig } from "./components/TimelineSection";
import { pricingTiersConfig } from "./components/PricingTiers";
import { receiptComparisonConfig } from "./components/ReceiptComparison";
import { contactSectionConfig } from "./components/ContactSection";
import { legalTabsConfig } from "./components/LegalTabs";

export const puckConfig: Config = {
  components: {
    HeroSection: heroSectionConfig,
    CTASection: ctaSectionConfig,
    FAQSection: faqSectionConfig,
    TextBlock: textBlockConfig,
    FeatureCards: featureCardsConfig,
    NotLawFirmSection: notLawFirmSectionConfig,
    TestimonialsSection: testimonialsSectionConfig,
    TimelineSection: timelineSectionConfig,
    PricingTiers: pricingTiersConfig,
    ReceiptComparison: receiptComparisonConfig,
    ContactSection: contactSectionConfig,
    LegalTabs: legalTabsConfig,
  },
};
