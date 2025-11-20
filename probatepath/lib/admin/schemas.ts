import { z } from "zod";

const isoDate = z.string().optional().refine((d) => {
  if (!d) return true;
  const t = Date.parse(d);
  return !Number.isNaN(t);
}, { message: "Invalid ISO date" });

export const auditQuery = z.object({
  type: z.enum(["security", "auth", "all"]).optional().default("all"),
  limit: z
    .preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().int().min(1).max(100).optional().default(50)),
  cursor: z.string().optional(),
  action: z.string().optional(),
  user: z.string().optional(),
  from: isoDate,
  to: isoDate,
});

export const usersQuery = z.object({
  q: z.string().optional(),
  limit: z
    .preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().int().min(1).max(100).optional().default(50)),
  cursor: z.string().optional(),
});

export const roleBody = z.object({ role: z.enum(["USER", "ADMIN"]) });

export type AuditQuery = z.infer<typeof auditQuery>;
export type UsersQuery = z.infer<typeof usersQuery>;
export type RoleBody = z.infer<typeof roleBody>;
