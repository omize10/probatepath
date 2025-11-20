import { z } from "zod";

export const executorSchema = z.object({
  email: z.string().email(),
  fullName: z.string().trim().min(1, "Full legal name is required"),
  phone: z.string().optional(),
  city: z.string().optional(),
  relationship: z.string().optional(),
});

export const deceasedSchema = z.object({
  fullName: z.string().trim().min(1, "Full legal name is required"),
  dateOfDeath: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  marriedSurname: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  hasWill: z.boolean().optional(),
});

export const willSearchSaveSchema = z.object({
  matterId: z.string().min(1).optional(),
  executor: executorSchema,
  deceased: deceasedSchema,
  deceasedExtraAliases: z.array(z.string().trim().min(1)).optional(),
  searchNotes: z.string().optional(),
  mailingPreference: z.enum(["service_bc_dropoff", "courier"]).optional(),
  courierAddress: z.string().optional(),
});

export type WillSearchSaveInput = z.infer<typeof willSearchSaveSchema>;
