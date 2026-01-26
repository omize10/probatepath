"use client";

import { motion } from "framer-motion";
import { ArrowRight, X, Check, Building2, ShieldCheck, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const lawyerPoints = [
  "Hourly billing adds up fast",
  "Weeks of back-and-forth emails",
  "You're paying for the letterhead",
  "Same court forms we prepare",
];

const probateDeskPoints = [
  "Court-ready in 3 days",
  "Reviewed by BC specialists",
  "Clear, fixed pricing",
  "Support when you need it",
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

// Animation variants
const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const leftCardVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const rightCardVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const bulletVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

export function PricingComparison() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headingVariants}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[3px] text-slate-500">
            Compare Your Options
          </p>
          <h2 className="mb-4 text-4xl font-light text-white md:text-5xl">
            The Real Cost of{" "}
            <span className="font-normal text-emerald-500">Probate in BC</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Most executors overpay for help or risk costly mistakes going alone.
            There&apos;s a better way.
          </p>
        </motion.div>

        {/* Cards Container */}
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Lawyer Card */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] md:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={leftCardVariants}
          >
            <h3 className="mb-2 text-xl font-semibold text-white">
              Hire a Lawyer
            </h3>
            <p className="mb-1 text-4xl font-bold text-white">
              $5,000–$10,000+
              <sup className="ml-1 text-sm text-slate-400">*</sup>
            </p>
            <div className="my-6 h-px bg-white/10" />

            <ul className="space-y-4">
              {lawyerPoints.map((point, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-slate-300"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={bulletVariants}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <X className="h-7 w-7 text-red-500" />
              </div>
            </div>
          </motion.div>

          {/* ProbateDesk Card */}
          <motion.div
            className="relative rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.08] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] md:scale-[1.02] md:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={rightCardVariants}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25">
                <Check className="h-3.5 w-3.5" />
                RECOMMENDED
              </span>
            </div>

            <h3 className="mb-2 mt-2 text-xl font-semibold text-white">
              ProbateDesk
            </h3>
            <p className="mb-1 text-4xl font-bold text-white">$799–$2,499</p>
            <p className="mb-2 text-sm text-slate-400">
              Fixed pricing. No surprises.
            </p>
            <div className="my-6 h-px bg-white/10" />

            <ul className="space-y-4">
              {probateDeskPoints.map((point, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-slate-300"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={bulletVariants}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-7 w-7 text-emerald-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-emerald-500 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Link href="/onboard/name">
              Get started today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center"
            >
              <item.icon className="mx-auto mb-3 h-6 w-6 text-emerald-500" />
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
            </div>
          ))}
        </motion.div>

        {/* Footnote */}
        <p className="mx-auto mt-12 max-w-xl text-center text-xs text-slate-500">
          *Based on aggregated data from BC probate fee surveys and legal
          industry reports. Actual fees vary by firm and estate complexity.
        </p>
      </div>
    </section>
  );
}
