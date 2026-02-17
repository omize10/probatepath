"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentConfig } from "@puckeditor/core";

export type HeroSectionProps = {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  backgroundImage: string;
  stat1Label: string;
  stat1Sub: string;
  stat2Label: string;
};

export function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage,
  stat1Label,
  stat1Sub,
  stat2Label,
}: HeroSectionProps) {
  return (
    <section className="relative isolate left-1/2 flex min-h-screen w-screen -translate-x-1/2 items-center overflow-hidden text-white -mt-12 sm:-mt-16">
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-right lg:object-right"
      />
      <div className="relative z-10 w-full px-6 py-16 sm:px-12 lg:px-[12%] lg:py-28">
        <div className="relative">
          <div className="max-w-[680px] text-center text-white lg:-translate-y-2 lg:text-left">
            <div className="space-y-6">
              <h1 className="font-serif text-5xl leading-tight !text-white drop-shadow-[0_14px_36px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl xl:text-[5rem]">
                {headline}
              </h1>
              <p className="text-xl !text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
                {subheadline}
              </p>
            </div>
            <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full !bg-white/15 text-white hover:!bg-white/25 sm:w-auto">
                <Link href={ctaLink}>
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {secondaryCtaText && (
                <Button asChild size="lg" variant="outline" className="w-full !border-white/80 !bg-transparent text-white hover:!bg-white/10 sm:w-auto">
                  <Link href={secondaryCtaLink}>{secondaryCtaText}</Link>
                </Button>
              )}
            </div>
            <div className="mt-8 flex flex-col gap-6 text-center text-sm text-white md:mt-10 md:flex-row md:items-start md:gap-12 md:text-left">
              {stat1Label && (
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">{stat1Label}</p>
                  {stat1Sub && <p className="!text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">{stat1Sub}</p>}
                </div>
              )}
              {stat2Label && (
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">{stat2Label}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const heroSectionConfig: ComponentConfig<HeroSectionProps> = {
  label: "Hero Section",
  fields: {
    headline: { type: "textarea", label: "Headline" },
    subheadline: { type: "textarea", label: "Subheadline" },
    ctaText: { type: "text", label: "CTA Button Text" },
    ctaLink: { type: "text", label: "CTA Button Link" },
    secondaryCtaText: { type: "text", label: "Secondary CTA Text" },
    secondaryCtaLink: { type: "text", label: "Secondary CTA Link" },
    backgroundImage: { type: "text", label: "Background Image Path" },
    stat1Label: { type: "text", label: "Stat 1 Label" },
    stat1Sub: { type: "text", label: "Stat 1 Subtitle" },
    stat2Label: { type: "text", label: "Stat 2 Label" },
  },
  defaultProps: {
    headline: "Probate, without the lawyer's bill.",
    subheadline: "BC probate and administration forms prepared by specialists.",
    ctaText: "Get started",
    ctaLink: "/onboard/executor",
    secondaryCtaText: "How it works",
    secondaryCtaLink: "#how-it-works",
    backgroundImage: "/images/Main_Image_Header.png",
    stat1Label: "Starting at $799",
    stat1Sub: "Flexible service tiers",
    stat2Label: "Court Ready in 3 Days",
  },
  render: (props) => <HeroSection {...props} />,
};
