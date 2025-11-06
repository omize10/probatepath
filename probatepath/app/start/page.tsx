import type { Metadata } from "next";
import { StartForm } from "@/components/start-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Start intake",
  description:
    "Share your details to begin the ProbatePath intake. We confirm scope and follow up within one business day.",
};

export default function StartPage() {
  return (
    <div className="space-y-20 pb-16">
      <header className="space-y-6">
        <Badge variant="outline">Start</Badge>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Begin your ProbatePath intake</h1>
        <p className="max-w-3xl text-base text-slate-300">
          Share the basics about the estate and how to reach you. We confirm eligibility, outline next steps, and send the secure intake link.
        </p>
      </header>

      <StartForm />
    </div>
  );
}
