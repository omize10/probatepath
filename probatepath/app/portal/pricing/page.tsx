import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PortalPricingClient from "./pricing-client";
import type { Tier } from "@/types/pricing";

export const metadata = {
  title: "Choose Your Tier | ProbateDesk",
  description: "Select the service tier that matches your needs",
};

export default async function PortalPricingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/portal/pricing");
  }

  // Fetch the most recent matter for this user to get tier recommendation
  const matter = await prisma.matter.findFirst({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      recommendedTier: true,
      tierRecommendationReason: true,
      rightFitStatus: true,
    },
  });

  return (
    <PortalPricingClient
      recommendedTier={matter?.recommendedTier as Tier | null}
      recommendationReason={matter?.tierRecommendationReason}
    />
  );
}
