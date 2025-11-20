import { z } from "zod";

export const executorInputSchema = z.object({
  id: z.string().cuid().optional(),
  isPrimary: z.boolean().optional(),
  isAlternate: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
  isRenouncing: z.boolean().optional(),
  isMinor: z.boolean().optional(),
  isDeceased: z.boolean().optional(),
});

export const executorBatchSchema = z.object({
  executors: z.array(executorInputSchema),
});
