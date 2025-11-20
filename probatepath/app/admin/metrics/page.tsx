import React from "react";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MetricsPage() {
  const maybe = await requireAdminSession();
  if ((maybe as unknown as Response)?.status === 403) redirect(`/login?next=/admin/metrics`);

  const now = new Date();
  const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [users24h, users7d, logins24h, logins7d, failedLogins24h, intakesSaved24h, intakesSubmitted24h] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: d1 } } }),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.auditLog.count({ where: { action: "auth.sign_in", createdAt: { gte: d1 } } }),
    prisma.auditLog.count({ where: { action: "auth.sign_in", createdAt: { gte: d7 } } }),
    prisma.auditLog.count({ where: { action: "auth.login_failed", createdAt: { gte: d1 } } }),
    prisma.auditLog.count({ where: { action: "intake.save", createdAt: { gte: d1 } } }),
    prisma.auditLog.count({ where: { action: "intake.submit", createdAt: { gte: d1 } } }),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Metrics</h1>
      <ul>
        <li>Users (24h): {users24h}</li>
        <li>Users (7d): {users7d}</li>
        <li>Logins (24h): {logins24h}</li>
        <li>Logins (7d): {logins7d}</li>
        <li>Failed logins (24h): {failedLogins24h}</li>
        <li>Intake saved (24h): {intakesSaved24h}</li>
        <li>Intake submitted (24h): {intakesSubmitted24h}</li>
      </ul>
    </div>
  );
}
