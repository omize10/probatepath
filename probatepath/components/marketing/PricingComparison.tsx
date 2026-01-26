"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Building2, BadgeCheck, ShieldCheck, X, AlertTriangle, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const comparisonOptions = [
  {
    title: "Hire a Lawyer",
    price: "$3,000–$8,000+",
    status: "expensive",
    icon: X,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    glowColor: "hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]",
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
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    glowColor: "hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]",
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
    iconBg: "bg-emerald-500/30",
    iconColor: "text-emerald-400",
    glowColor: "shadow-[0_0_60px_rgba(16,185,129,0.25)] hover:shadow-[0_0_80px_rgba(16,185,129,0.35)]",
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  },
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const shimmerVariants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
      repeatDelay: 2,
    },
  },
};

function GlassCard({ option, index }: { option: typeof comparisonOptions[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-5, 5]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: option.highlight ? rotateX : 0,
        rotateY: option.highlight ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: option.highlight ? 1.05 : 1.02,
        y: -8,
      }}
      className={`relative overflow-hidden rounded-3xl backdrop-blur-xl transition-all duration-500 ${
        option.highlight
          ? `bg-white/[0.12] border-2 border-emerald-400/50 ${option.glowColor} scale-105 z-10`
          : `bg-white/[0.08] border border-white/20 ${option.glowColor}`
      }`}
    >
      {/* Shimmer effect for highlighted card */}
      {option.highlight && (
        <motion.div
          className="absolute inset-0 z-0"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
        </motion.div>
      )}

      {/* Recommended badge */}
      {option.highlight && (
        <motion.div
          className="absolute -top-px left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-b-xl bg-emerald-500 blur-lg"
              variants={pulseVariants}
              initial="initial"
              animate="animate"
            />
            <span className="relative flex items-center gap-1.5 rounded-b-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Recommended
            </span>
          </div>
        </motion.div>
      )}

      <div className={`relative z-10 p-8 ${option.highlight ? "pt-12" : ""}`}>
        {/* Title & Price */}
        <motion.div
          className="space-y-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <h3 className={`font-serif text-xl font-semibold tracking-wide ${
            option.highlight ? "text-white" : "text-white/80"
          }`}>
            {option.title}
          </h3>
          <div className="space-y-1">
            <motion.p
              className={`text-4xl font-bold tracking-tight ${
                option.highlight
                  ? "bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent"
                  : "text-white/90"
              }`}
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4, type: "spring", stiffness: 200 }}
            >
              {option.price}
            </motion.p>
            {option.priceSubtext && (
              <p className="text-sm italic text-amber-300/80">{option.priceSubtext}</p>
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className={`my-6 h-px ${option.highlight ? "bg-emerald-400/30" : "bg-white/10"}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
        />

        {/* Points */}
        <ul className="space-y-4">
          {option.points.map((point, idx) => (
            <motion.li
              key={idx}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.6 + idx * 0.1 }}
            >
              <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${option.iconBg}`}>
                <option.icon className={`h-3 w-3 ${option.iconColor}`} />
              </span>
              <span className={`text-sm ${option.highlight ? "text-white/90" : "text-white/70"}`}>
                {point}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* Bottom Icon */}
        <motion.div
          className="mt-8 flex justify-center"
          variants={option.highlight ? floatingVariants : undefined}
          initial="initial"
          animate={option.highlight ? "animate" : undefined}
        >
          <motion.div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${option.iconBg} backdrop-blur-sm`}
            whileHover={{ scale: 1.1, rotate: option.highlight ? 0 : 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <option.icon className={`h-8 w-8 ${option.iconColor}`} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function PricingComparison() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/unwatermarked_Gemini_Generated_Image_4dme764dme764dme.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/95 via-[#0f1f35]/90 to-[#0a1628]/95" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
        {/* Header */}
        <motion.div
          className="space-y-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-400"
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Compare Your Options
          </motion.p>

          <motion.h2
            className="font-serif text-4xl font-light tracking-wide text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The Real Cost of{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300 bg-clip-text text-transparent">
                Probate in BC
              </span>
              <motion.span
                className="absolute -bottom-2 left-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </span>
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Most executors overpay for help or risk costly mistakes going alone.
            <br className="hidden sm:block" />
            There&apos;s a better way.
          </motion.p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3 md:items-center lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {comparisonOptions.map((option, index) => (
            <GlassCard key={option.title} option={option} index={index} />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-400 px-10 py-6 text-lg font-semibold shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]"
            >
              <Link href="/onboard/name">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Today
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.span
                  className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-400 to-emerald-300"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          className="mt-20 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {trustItems.map((item, index) => (
              <motion.div
                key={item.title}
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.15 }}
                whileHover={{ scale: 1.02 }}
              >
                {index > 0 && (
                  <div className="hidden h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent md:-ml-4 md:mr-4 md:block" />
                )}
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] backdrop-blur-sm"
                  whileHover={{
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <item.icon className="h-6 w-6 text-emerald-400" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-white/50">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          className="mt-12 text-center text-xs text-white/40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          ProbateDesk is not a law firm. We do not give legal advice.
        </motion.p>
      </div>
    </section>
  );
}
