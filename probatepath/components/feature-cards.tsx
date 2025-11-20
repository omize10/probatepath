import type { ComponentType } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

interface FeatureCardsProps {
  features: Feature[];
  className?: string;
}

export function FeatureCards({ features, className }: FeatureCardsProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {features.map(({ title, description, icon: Icon }) => (
        <Card key={title} className="h-full">
          <CardHeader className="space-y-5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--border-muted)] bg-[#f0f3f7] text-[color:var(--brand)]">
              <Icon className="h-5 w-5" />
            </span>
            <CardTitle className="text-xl text-[color:var(--brand)]">{title}</CardTitle>
            <CardDescription className="text-sm text-[#333333]">{description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
