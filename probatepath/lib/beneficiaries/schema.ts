import { z } from "zod";

export const beneficiaryTypeEnum = z.enum([
  "SPOUSE",
  "CHILD",
  "STEPCHILD",
  "GRANDCHILD",
  "PARENT",
  "SIBLING",
  "OTHER_FAMILY",
  "CHARITY",
  "OTHER",
]);

export const beneficiaryStatusEnum = z.enum([
  "ALIVE",
  "DECEASED_BEFORE_WILL",
  "DECEASED_AFTER_WILL",
  "UNKNOWN",
]);

export const beneficiaryInputSchema = z.object({
  id: z.string().cuid().optional(),
  type: beneficiaryTypeEnum,
  status: beneficiaryStatusEnum.optional(),
  fullName: z.string().min(1),
  relationshipLabel: z.string().trim().optional(),
  isMinor: z.boolean().optional(),
  dateOfBirth: z.string().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
  shareDescription: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  representedById: z.string().cuid().optional(),
});

export const beneficiaryBatchSchema = z.object({
  beneficiaries: z.array(beneficiaryInputSchema),
});
