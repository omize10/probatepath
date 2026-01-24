import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Turnaround times",
  description: "ProbateDesk turnaround time details and expectations.",
};

export default function TurnaroundPage() {
  return (
    <div className="space-y-12 pb-16">
      <header className="space-y-4">
        <Badge variant="outline">Turnaround</Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
          We take the time your estate needs
        </h1>
        <p className="max-w-3xl text-base text-[#333333]">
          3 days is our standard target after intake completion, but every estate is different. Some are straightforward; others involve complexities that require additional care. We will always prioritize accuracy and court-readiness over speed.
        </p>
      </header>

      <div className="max-w-3xl space-y-6 text-[#333333]">
        <p>
          Our specialists work through your documents methodically to ensure everything meets BC Supreme Court filing requirements. If your estate has unusual assets, multiple beneficiaries, or other complexities, we may take additional time to get it right.
        </p>
        <p>
          You will be kept informed of progress throughout. No rush job is worth a court rejection.
        </p>
      </div>

      <div>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
