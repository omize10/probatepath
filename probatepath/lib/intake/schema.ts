import { z } from "zod";
import type { IntakeDraft } from "@/lib/intake/types";

export const welcomeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address.")
    .email("Enter a valid email address."),
  consent: z.boolean().refine((value) => value, {
    message: "Please confirm you understand the service scope.",
  }),
});

export const executorSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter the executor’s full name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter the executor’s email.")
    .email("Enter a valid email address."),
  phone: z
    .union([
      z.string().trim().max(30, "Phone numbers look too long."),
      z.literal(""),
    ])
    .transform((value) => value.trim()),
  city: z
    .string()
    .trim()
    .min(1, "Enter the executor’s city."),
  relationToDeceased: z.enum(["spouse", "child", "relative", "friend", "other"]),
});

export const deceasedSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter the deceased’s full name."),
  dateOfDeath: z
    .string()
    .min(1, "Enter the date of death."),
  cityProvince: z
    .string()
    .trim()
    .min(1, "Enter the city and province."),
  hadWill: z.enum(["yes", "no"]),
});

export const willSchema = z.object({
  willLocation: z
    .string()
    .trim()
    .min(1, "Share where the original will is stored."),
  estateValueRange: z.enum(["<$100k", "$100k-$500k", "$500k-$1M", ">$1M"]),
  anyRealProperty: z.enum(["yes", "no"]),
  multipleBeneficiaries: z.enum(["yes", "no"]),
  specialCircumstances: z
    .union([
      z.string().trim().max(600, "Please keep details under 600 characters."),
      z.literal(""),
    ])
    .transform((value) => value.trim()),
});

export const confirmationSchema = z.object({
  confirmed: z.boolean().refine((value) => value, {
    message: "Please confirm the information is accurate.",
  }),
});

export const intakeDraftSchema = z.object({
  welcome: welcomeSchema,
  executor: executorSchema,
  deceased: deceasedSchema,
  will: willSchema,
  confirmation: confirmationSchema,
});

export type SectionKey = keyof IntakeDraft;

export const sectionSchemas: Record<SectionKey, z.ZodType<IntakeDraft[SectionKey]>> = {
  welcome: welcomeSchema,
  executor: executorSchema,
  deceased: deceasedSchema,
  will: willSchema,
  confirmation: confirmationSchema,
};

export type StepErrors = Record<string, string>;

export function extractErrors(error: z.ZodError): StepErrors {
  const fieldErrors: StepErrors = {};
  for (const issue of error.issues) {
    const pathKey = issue.path[0];
    if (typeof pathKey === "string" && !fieldErrors[pathKey]) {
      fieldErrors[pathKey] = issue.message;
    }
    if (!pathKey) {
      fieldErrors["_form"] = issue.message;
    }
  }
  return fieldErrors;
}

export function validateSection(section: SectionKey, draft: IntakeDraft): boolean {
  const schema = sectionSchemas[section];
  return schema.safeParse(draft[section]).success;
}

export function validateDraft(draft: IntakeDraft): boolean {
  return intakeDraftSchema.safeParse(draft).success;
}
