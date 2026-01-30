"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Lawyer receipt line items - totals to ~$9,000
const lawyerLineItems = [
  { description: "Initial consultation", amount: 750 },
  { description: "Document review", amount: 1200 },
  { description: "Phone conferences (8)", amount: 960 },
  { description: "Email correspondence", amount: 480 },
  { description: "Form preparation", amount: 1800 },
  { description: "Court filing service", amount: 600 },
  { description: "Administrative fees", amount: 450 },
  { description: "Photocopies & courier", amount: 185 },
  { description: "File management", amount: 350 },
  { description: "Research & due diligence", amount: 425 },
  { description: "Miscellaneous", amount: 800 },
];

const subtotal = lawyerLineItems.reduce((sum, item) => sum + item.amount, 0);
const gst = Math.round(subtotal * 0.05);
const pst = Math.round(subtotal * 0.07);
const lawyerTotal = subtotal + gst + pst;

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Floating background particles - always-on animation
function FloatingParticles() {
  const particles = [
    { size: 4, x: "10%", duration: 20, delay: 0 },
    { size: 3, x: "25%", duration: 25, delay: 2 },
    { size: 5, x: "40%", duration: 18, delay: 4 },
    { size: 3, x: "55%", duration: 22, delay: 1 },
    { size: 4, x: "70%", duration: 24, delay: 3 },
    { size: 3, x: "85%", duration: 19, delay: 5 },
    { size: 2, x: "15%", duration: 26, delay: 6 },
    { size: 4, x: "60%", duration: 21, delay: 7 },
    { size: 3, x: "80%", duration: 23, delay: 2 },
    { size: 2, x: "35%", duration: 27, delay: 4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/[0.03]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
          }}
          animate={{
            y: ["100vh", "-10vh"],
            opacity: [0, 0.5, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Animated line item component
function ReceiptLine({
  description,
  amount,
  delay,
  isBold = false,
  isTotal = false,
}: {
  description: string;
  amount: number;
  delay: number;
  isBold?: boolean;
  isTotal?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex justify-between font-mono text-sm ${
        isBold ? "font-bold" : ""
      } ${isTotal ? "text-base" : ""}`}
    >
      <span className="flex-1 overflow-hidden">
        {description}
        {!isTotal && (
          <span className="text-[color:var(--text-tertiary)]">
            {"".padEnd(30 - description.length, ".")}
          </span>
        )}
      </span>
      <span className={isTotal ? "text-red-600" : ""}>
        $ {formatCurrency(amount)}
      </span>
    </motion.div>
  );
}

// Lawyer Receipt Component
function LawyerReceipt({ isInView }: { isInView: boolean }) {
  const currentMonth = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -100, rotate: -5 }}
      animate={
        isInView
          ? { opacity: 1, x: 0, rotate: -2 }
          : { opacity: 0, x: -100, rotate: -5 }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, rotate: -3 }}
      className="relative w-full max-w-sm cursor-default"
    >
      {/* Paper effect */}
      <div
        className="relative rounded-sm bg-[#faf9f6] p-6 shadow-2xl"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Receipt content */}
        <div className="relative space-y-4 text-[color:var(--text-secondary)]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center border-b border-gray-300 border-dashed pb-4"
          >
            <h3 className="font-mono text-lg font-bold tracking-tight text-gray-800">
              SMITH & ASSOCIATES
            </h3>
            <p className="font-mono text-xs text-[color:var(--text-tertiary)]">
              Barristers & Solicitors
            </p>
          </motion.div>

          {/* Invoice info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="font-mono text-xs text-[color:var(--text-tertiary)] space-y-1"
          >
            <p>INVOICE #4892</p>
            <p>Date: {currentMonth}</p>
            <p className="pt-2 text-[color:var(--text-secondary)]">Estate of: Sample Client</p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-300 border-dashed" />

          {/* Line items */}
          <div className="space-y-1.5">
            {isInView &&
              lawyerLineItems.map((item, index) => (
                <ReceiptLine
                  key={item.description}
                  description={item.description}
                  amount={item.amount}
                  delay={0.5 + index * 0.12}
                />
              ))}
          </div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.8 }}
            className="border-t border-gray-300 border-dashed"
          />

          {/* Subtotals */}
          {isInView && (
            <div className="space-y-1">
              <ReceiptLine
                description="SUBTOTAL"
                amount={subtotal}
                delay={1.9}
              />
              <ReceiptLine description="GST (5%)" amount={gst} delay={2.0} />
              <ReceiptLine description="PST (7%)" amount={pst} delay={2.1} />
            </div>
          )}

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2 }}
            className="border-t-2 border-gray-400"
          />

          {/* Total */}
          {isInView && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, type: "spring", stiffness: 200 }}
              className="flex justify-between font-mono text-lg font-bold"
            >
              <span>TOTAL DUE:</span>
              <span className="text-red-600">$ {formatCurrency(lawyerTotal)}</span>
            </motion.div>
          )}

          {/* Fine print */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.5 }}
            className="pt-2 font-mono text-[10px] text-[color:var(--text-tertiary)] space-y-0.5"
          >
            <p>* Final amount may vary</p>
            <p>* Additional fees may apply</p>
            <p>* Payment due upon receipt</p>
          </motion.div>
        </div>

        {/* Torn edge effect at bottom */}
        <div
          className="absolute -bottom-2 left-0 right-0 h-4 bg-[#faf9f6]"
          style={{
            clipPath:
              "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
          }}
        />
      </div>
    </motion.div>
  );
}

// ProbateDesk Receipt Component
function ProbateDeskReceipt({ isInView }: { isInView: boolean }) {
  const currentDate = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  const receiptNumber = `PD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(5, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={
        isInView
          ? { opacity: 1, x: 0, scale: 1 }
          : { opacity: 0, x: 100, scale: 0.9 }
      }
      transition={{ duration: 0.6, delay: 2.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative w-full max-w-sm cursor-default"
    >
      {/* Breathing glow effect - always on */}
      <motion.div
        className="absolute -inset-4 rounded-2xl pointer-events-none"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-xl overflow-hidden bg-white"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Receipt content */}
        <div className="relative p-6 space-y-5">
          {/* Logo/Header - ProbateDesk.com */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ delay: 3.0 }}
            className="text-center pb-4 border-b border-[color:var(--border-subtle)]"
          >
            <div className="inline-block px-5 py-2.5 bg-[#0d1726] rounded-lg">
              <span className="text-white font-bold text-xl tracking-normal">
                ProbateDesk
              </span>
              <span className="text-emerald-400 font-medium text-base ml-1 opacity-90">.com</span>
            </div>
          </motion.div>

          {/* Receipt metadata */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.1 }}
            className="flex justify-between items-baseline"
          >
            <div>
              <p className="text-[10px] font-semibold text-[color:var(--text-tertiary)] tracking-[0.2em] uppercase">
                Receipt
              </p>
              <p className="text-[10px] text-[color:var(--text-tertiary)] mt-0.5 font-mono">
                {receiptNumber}
              </p>
            </div>
            <p className="text-[11px] text-[color:var(--text-tertiary)]">{currentDate}</p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-[color:var(--border-subtle)]" />

          {/* Main item */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 3.2 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-[color:var(--ink)]">
              BC Probate Document Package
            </h4>
            <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Court-ready probate application
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Specialist document review
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Step-by-step filing guidance
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Dedicated support included
              </li>
            </ul>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-[color:var(--border-subtle)]" />

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 3.4, type: "spring", stiffness: 200 }}
            className="flex justify-between items-center py-2"
          >
            <span className="text-sm font-medium text-[color:var(--text-tertiary)]">TOTAL</span>
            <span className="text-3xl font-bold text-[color:var(--ink)]">$799.00</span>
          </motion.div>

          {/* Paid indicator - simple checkmark style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 3.6 }}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-lg border border-emerald-100"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Check className="w-5 h-5 text-emerald-600" />
            </motion.div>
            <span className="font-semibold text-emerald-700 tracking-wide">
              PAID
            </span>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.8 }}
            className="text-center text-xs text-[color:var(--text-tertiary)] pt-2"
          >
            Thank you for choosing ProbateDesk.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

// Main Section Component
export function ReceiptComparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#0a0a0a] py-24 md:py-32"
    >
      {/* Floating particles - always-on background animation */}
      <FloatingParticles />

      {/* Gradient orbs - slow moving background */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Top fade from white */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, white 0%, transparent 100%)'
        }}
      />

      {/* Bottom fade to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, white 0%, transparent 100%)'
        }}
      />

      <div className="mx-auto max-w-6xl px-6 relative z-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[4px] mb-4" style={{ color: 'white' }}>
            The Real Cost
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'white' }}>
            Where does your money actually go?
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'white' }}>
            The same court forms. Very different bills.
          </p>
        </motion.div>

        {/* Receipts Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24">
          <LawyerReceipt isInView={isInView} />
          <ProbateDeskReceipt isInView={isInView} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 4.2, duration: 0.5 }}
          className="text-center mt-16"
        >
          <Button
            asChild
            size="lg"
            className="bg-emerald-500 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Link href="/onboard/executor">
              Get started today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 4.4 }}
          className="text-center text-xs mt-8 max-w-xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          *Lawyer fees based on industry surveys of BC probate services. Actual
          costs vary. ProbateDesk pricing is fixed with no hidden fees.
        </motion.p>
      </div>
    </section>
  );
}
