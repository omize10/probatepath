"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, BadgeCheck, ShieldCheck, X, AlertTriangle, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const comparisonOptions = [
  {
    title: "Hire a Lawyer",
    price: "$3,000–$8,000+",
    status: "expensive",
    icon: X,
    iconColor: "text-red-500",
    borderColor: "border-red-200",
    bgColor: "bg-red-50/50",
    titleColor: "text-red-900",
    points: [
      "Hourly billing adds up fast",
      "Weeks of back-and-forth",
      "Same forms we prepare",
      "Premium for the letterhead",
    ],
  },
  {
    title: "DIY with Court Forms",
    price: "$0",
    priceSubtext: "but at what cost?",
    status: "risky",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50/50",
    titleColor: "text-amber-900",
    points: [
      "200+ fields to complete",
      "One mistake = rejection",
      "No one to review your work",
      "Weeks lost if rejected",
    ],
  },
  {
    title: "ProbateDesk",
    price: "$799–$2,499",
    status: "recommended",
    icon: Check,
    iconColor: "text-green-600",
    borderColor: "border-green-300",
    bgColor: "bg-green-50/60",
    titleColor: "text-green-900",
    highlight: true,
    points: [
      "Court-ready in 3 days",
      "Reviewed by BC specialists",
      "Clear, fixed pricing",
      "Support when you need it",
    ],
  },
];

const trustItems = [
  {
    icon: Building2,
    title: "Operated by Court Line Law",
    subtitle: "BC-registered legal services",
  },
  {
    icon: ShieldCheck,
    title: "100% Canadian Infrastructure",
    subtitle: "Your data never leaves Canada",
  },
  {
    icon: BadgeCheck,
    title: "Specialist Reviewed",
    subtitle: "Every document checked",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const trustVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

export function PricingComparison() {
  return (
    <section className="space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
          Compare Your Options
        </p>
        <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
          The real cost of probate in BC
        </h2>
        <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
          Most executors overpay for help or risk costly mistakes going alone.
          There&apos;s a better way.
        </p>
      </div>

      {/* Comparison Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {comparisonOptions.map((option) => (
          <motion.div
            key={option.title}
            variants={cardVariants}
            className={`relative rounded-2xl border-2 ${option.borderColor} ${option.bgColor} p-6 transition-all duration-300 ${
              option.highlight
                ? "shadow-[0_8px_40px_-12px_rgba(34,197,94,0.25)] ring-2 ring-green-400/30"
                : "hover:shadow-lg"
            }`}
          >
            {option.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-green-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Recommended
                </span>
              </div>
            )}

            <div className="space-y-5">
              {/* Title & Price */}
              <div className="space-y-2 text-center">
                <h3 className={`text-lg font-semibold ${option.titleColor}`}>
                  {option.title}
                </h3>
                <div>
                  <p className={`text-2xl font-bold ${option.titleColor}`}>
                    {option.price}
                  </p>
                  {option.priceSubtext && (
                    <p className="text-sm text-amber-700">{option.priceSubtext}</p>
                  )}
                </div>
              </div>

              {/* Points */}
              <ul className="space-y-3">
                {option.points.map((point, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 text-sm ${
                      option.highlight ? "text-green-800" : option.titleColor
                    }`}
                  >
                    <option.icon
                      className={`mt-0.5 h-4 w-4 flex-none ${option.iconColor}`}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Status Icon */}
              <div className="flex justify-center pt-2">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    option.highlight
                      ? "bg-green-100"
                      : option.status === "expensive"
                      ? "bg-red-100"
                      : "bg-amber-100"
                  }`}
                >
                  <option.icon className={`h-6 w-6 ${option.iconColor}`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/onboard/name">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {/* Trust Bar */}
      <motion.div
        className="rounded-2xl border border-[color:var(--border-muted)] bg-gradient-to-r from-[#f8fafc] to-[#f0f4f8] p-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
      >
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              variants={trustVariants}
              className="flex items-center gap-4"
            >
              {index > 0 && (
                <div className="hidden h-8 w-px bg-[color:var(--border-muted)] md:block md:-ml-3 md:mr-3" />
              )}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <item.icon className="h-6 w-6 text-[color:var(--brand)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[color:var(--brand)]">
                  {item.title}
                </p>
                <p className="text-xs text-[color:var(--muted-ink)]">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
