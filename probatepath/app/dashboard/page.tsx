import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard (coming soon)",
  description: "Preview of the ProbatePath client dashboard experience.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-white">Secure client area</h1>
        <p className="text-sm text-slate-300">
          Coming soon: access your probate intake status, document downloads, and filing checklist in one place.
        </p>
      </header>

      <Card className="bg-[#111217]/85 p-8">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-white">Client portal in development</CardTitle>
          <CardDescription className="text-sm text-slate-300">
            We&apos;re building a secure dashboard for executors to track progress, upload signed forms, and receive reminders.
            Until launch, our team provides updates directly over email.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
