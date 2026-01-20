import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard (coming soon)",
  description: "Preview of the ProbateDesk client dashboard experience.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-[#0f172a]">Secure client area</h1>
        <p className="text-sm text-[#495067]">
          Coming soon: access your probate intake status, document downloads, and filing checklist in one place.
        </p>
      </header>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-[#0f172a]">Client portal in development</CardTitle>
          <CardDescription className="text-sm text-[#495067]">
            We&apos;re building a secure dashboard for executors to track progress, upload signed forms, and receive reminders.
            Until launch, our team provides updates directly over email.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
