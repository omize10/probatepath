"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Lawyer receipt line items
const lawyerLineItems = [
  { description: "Initial consultation", amount: 500 },
  { description: "Document review", amount: 850 },
  { description: "Phone conferences (6)", amount: 720 },
  { description: "Email correspondence", amount: 340 },
  { description: "Form preparation", amount: 1400 },
  { description: "Court filing service", amount: 450 },
  { description: "Administrative fees", amount: 380 },
  { description: "Photocopies & courier", amount: 165 },
  { description: "File management", amount: 275 },
  { description: "Miscellaneous", amount: 620 },
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
          <span className="text-gray-400">
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
        <div className="relative space-y-4 text-gray-700">
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
            <p className="font-mono text-xs text-gray-500">
              Barristers & Solicitors
            </p>
          </motion.div>

          {/* Invoice info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="font-mono text-xs text-gray-500 space-y-1"
          >
            <p>INVOICE #4892</p>
            <p>Date: {currentMonth}</p>
            <p className="pt-2 text-gray-600">Estate of: Sample Client</p>
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
            className="pt-2 font-mono text-[10px] text-gray-400 space-y-0.5"
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
      className="relative w-full max-w-sm cursor-pointer"
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-emerald-500/20 rounded-lg blur-xl opacity-60" />

      {/* Paper */}
      <div
        className="relative rounded-sm bg-white p-6 border border-gray-100"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)",
        }}
      >
        {/* Receipt content */}
        <div className="relative space-y-5 text-gray-900">
          {/* Logo/Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ delay: 3.0 }}
            className="text-center pb-4 border-b border-gray-200"
          >
            <div className="inline-block px-4 py-2 bg-slate-900 rounded-lg mb-2">
              <span className="text-white font-semibold text-lg">
                ProbateDesk
              </span>
              <span className="text-emerald-400">.ca</span>
            </div>
          </motion.div>

          {/* Receipt label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.1 }}
            className="text-xs font-semibold text-gray-500 tracking-widest uppercase"
          >
            Receipt
          </motion.p>

          {/* Main item */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 3.2 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-gray-900">
              BC Probate Document Package
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Court-ready P1, P2, P3 forms
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Specialist review
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Filing guidance included
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Support when you need it
              </li>
            </ul>
          </motion.div>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.4 }}
            className="text-right"
          >
            <span className="text-3xl font-bold text-gray-900">$799.00</span>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.5 }}
            className="flex justify-between items-center text-lg font-bold"
          >
            <span>TOTAL:</span>
            <span className="text-emerald-600">$799.00</span>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Paid stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -15 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 0, rotate: -15 }
            }
            transition={{
              delay: 3.7,
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border-2 border-emerald-500 border-dashed">
              <Check className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-600 tracking-wide">
                PAID
              </span>
            </div>
          </motion.div>

          {/* Thank you */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 3.9 }}
            className="text-center text-sm text-gray-500"
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
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[4px] text-slate-400 mb-4">
            The Real Cost
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Where does your money actually go?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
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
            <Link href="/onboard/name">
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
          className="text-center text-xs text-slate-500 mt-8 max-w-xl mx-auto"
        >
          *Lawyer fees based on industry surveys of BC probate services. Actual
          costs vary. ProbateDesk pricing is fixed with no hidden fees.
        </motion.p>
      </div>
    </section>
  );
}
