"use client";

import { ReceiptComparison as OriginalReceiptComparison } from "@/components/marketing/ReceiptComparison";
import type { ComponentConfig } from "@puckeditor/core";

// The ReceiptComparison is a complex animated component.
// Rather than recreating it, we wrap the original component.
// The editor allows repositioning it on the page.

export type ReceiptComparisonProps = Record<string, never>;

export function PuckReceiptComparison() {
  return <OriginalReceiptComparison />;
}

export const receiptComparisonConfig: ComponentConfig<ReceiptComparisonProps> = {
  label: "Receipt Comparison",
  fields: {},
  defaultProps: {},
  render: () => <PuckReceiptComparison />,
};
