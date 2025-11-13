import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operations portal",
  description: "Placeholder for ProbatePath internal admin tools.",
};

export default function OpsPage() {
  return (
    <div className="space-y-6 pb-16">
      <h1 className="font-serif text-4xl text-[#0f172a]">Admin Portal</h1>
      <p className="max-w-2xl text-base text-[#495067]">
        Password-protected tools coming soon. This placeholder confirms the route exists while we build the secure experience.
      </p>
    </div>
  );
}
